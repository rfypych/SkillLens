import os
import json
import logging
from sqlalchemy.orm import Session
from openai import AsyncOpenAI
import models
from database import SessionLocal
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

def format_interview_questions(questions):
    if not questions:
        return ""
    if isinstance(questions, list):
        return "\n".join(questions)
    if isinstance(questions, str):
        try:
            import json
            parsed = json.loads(questions)
            if isinstance(parsed, list):
                return "\n".join(parsed)
        except Exception:
            pass
        
        cleaned = questions.strip('[]{}() ')
        if '\n' not in cleaned and '","' in cleaned:
            parts = [p.strip('" ') for p in cleaned.split('","')]
            return "\n".join(parts)
        elif '\n' not in cleaned and '", "' in cleaned:
            parts = [p.strip('" ') for p in cleaned.split('", "')]
            return "\n".join(parts)
        
        lines = [line.strip('"\' ') for line in questions.split('\n')]
        return "\n".join(lines)
    return str(questions)

def apply_telemetry_penalties(result, eval_data, candidate_answer):
    score_problem_understanding = eval_data.get("score_problem_understanding", 0)
    score_solution_approach = eval_data.get("score_solution_approach", 0)
    score_logic_execution = eval_data.get("score_logic_execution", 0)
    score_communication = eval_data.get("score_communication", 0)
    score_response_quality = eval_data.get("score_response_quality", 0)
    
    ai_cheating_detected = eval_data.get("ai_cheating_detected", False)
    claim_vs_evidence_label = eval_data.get("claim_vs_evidence_label", "Mismatch")
    evaluation_feedback = eval_data.get("evaluation_feedback", "")
    
    time_taken = max(result.time_taken_seconds or 1, 1)
    
    # Extract total_chars from keystroke_metrics instead of len(candidate_answer)
    total_chars = 0
    backspace_ratio = 100.0 # Default safe
    if result.keystroke_metrics:
        try:
            metrics = json.loads(result.keystroke_metrics)
            total_chars = metrics.get("total_chars", 0)
            backspace_ratio = metrics.get("backspace_ratio", 100.0)
        except:
            pass
            
    # Fallback just in case metrics failed
    if total_chars == 0 and result.candidate_answer:
        total_chars = len(result.candidate_answer) // 3
        
    cps = total_chars / time_taken
            
    # Proctoring Criteria:
    # A professional human typing speed limit is ~10 CPS. 
    # If CPS > 12 for answers > 150 chars, they injected/pasted text.
    is_superhuman_speed = cps > 12.0 and total_chars > 150
    is_suspicious_paste = (result.copy_paste_attempts > 0 or result.tab_switches > 2) and time_taken < 90 and total_chars > 200
    is_transcribing = (backspace_ratio < 0.02) and cps > 4.0 and total_chars > 300 # <2% backspaces while typing fast = transcription
    
    if is_superhuman_speed or is_suspicious_paste or is_transcribing:
        ai_cheating_detected = True
        claim_vs_evidence_label = "Likely Fabricated"
        score_problem_understanding = min(score_problem_understanding, 10)
        score_solution_approach = min(score_solution_approach, 10)
        score_logic_execution = min(score_logic_execution, 10)
        score_communication = min(score_communication, 10)
        score_response_quality = min(score_response_quality, 10)
        
        if is_superhuman_speed:
            evaluation_feedback = f"Telemetry override: Superhuman typing speed detected ({cps:.1f} chars/sec). The candidate injected or pasted text using a tool that bypasses browser paste event listeners."
        elif is_transcribing:
            evaluation_feedback = f"Telemetry override: Transcription Rhythm Detected. The candidate typed {total_chars} characters with an unnaturally low backspace ratio ({(backspace_ratio*100):.1f}%), indicating they were directly transcribing text from a secondary device/AI."
        else:
            evaluation_feedback = "Telemetry override: Suspicious paste/switch pattern detected. The candidate submitted a pre-written answer in a duration too short for manual entry."

    result.score_problem_understanding = score_problem_understanding
    result.score_solution_approach = score_solution_approach
    result.score_logic_execution = score_logic_execution
    result.score_communication = score_communication
    result.score_response_quality = score_response_quality
    
    result.overall_score = (
        (score_problem_understanding * 0.30) + 
        (score_solution_approach * 0.25) + 
        (score_logic_execution * 0.20) + 
        (score_communication * 0.15) +
        (score_response_quality * 0.10)
    )
    
    result.ai_cheating_detected = ai_cheating_detected
    result.claim_vs_evidence_label = claim_vs_evidence_label
    result.evaluation_feedback = evaluation_feedback

async def evaluate_candidate_answer_task(application_id: int, result_id: int):
    # This task runs in the background
    db: Session = SessionLocal()
    try:
        app = db.query(models.Application).filter(models.Application.id == application_id).first()
        result = db.query(models.AssessmentResult).filter(models.AssessmentResult.id == result_id).first()
        
        if not app or not result:
            logger.error("Missing application or result data for evaluation.")
            return

        job = app.job
        
        api_key = os.getenv("OPENAI_API_KEY")
        base_url = os.getenv("OPENAI_API_BASE")
        model_name = os.getenv("LLM_MODEL_NAME")
        
        client = AsyncOpenAI(
            api_key=api_key, 
            base_url=base_url,
            default_headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"},
            timeout=30.0
        )
        
        trap_word = app.hidden_prompt or "mentimun"
        
        # Build the system prompt
        system_prompt = f"""You are an expert technical interviewer and AI anti-cheat detector.
Your job is to evaluate a candidate's performance in a Micro-Interview (a multi-turn chat transcript) for a specific job role. Ensure that you evaluate in {job.language}.

Job Title: {job.title}
Job Outcomes (Expectations): {job.expected_outcomes}
Specific Skills Required: {job.specific_skills}

Anti-Cheat & Telemetry Rules (CRITICAL):
You will be provided with the chat transcript of the candidate's interview, and their telemetry data (tab switches, copy-paste attempts, time taken).
If any of the candidate's messages contain the word "{trap_word}" or act completely irrelevant by explicitly ignoring the task, you MUST flag `ai_cheating_detected` as true.
Furthermore, if the telemetry indicates suspicious copy-pasting (e.g., large transcript but very short time <120s):
1. You MUST flag `ai_cheating_detected` as true.
2. You MUST set `claim_vs_evidence_label` to "Likely Fabricated".
3. You MUST lower all evaluation scores to a maximum of 10/100 (overall score must be <= 10).
4. The `evaluation_feedback` MUST state that the candidate copy-pasted/cheated.

Stylistic AI Signature Analysis:
Analyze the formatting, grammar, and syntax of the candidate's messages. If their chat messages have perfect markdown headers, lists with bold summaries (e.g., "**Key Concept:** explanation"), perfect Mermaid diagrams, zero typos, and read exactly like a standard LLM output (ChatGPT/Claude) rather than a human typing in a chat box, you should flag `ai_cheating_detected` as true and label them as "Likely Fabricated".

Claim vs Evidence Alignment (For candidates who passed proctoring):
Compare their CV claims (experience duration, skills, seniorities) with the depth and quality of their answers.
If their CV claims high seniority/expert skills but their answer shows superficial understanding, label them as "Mismatch".
If their CV is modest/junior but their answer is brilliant, label them as a "Hidden Gem".
If the claims align with the performance, label them as "Highly Validated".

Output Format: You MUST reply ONLY in raw JSON format with the following keys:
{{
    "score_problem_understanding": 0-100,
    "score_solution_approach": 0-100,
    "score_logic_execution": 0-100,
    "score_communication": 0-100,
    "score_response_quality": 0-100,
    "ai_cheating_detected": true/false,
    "claim_vs_evidence_label": "Highly Validated" or "Mismatch" or "Likely Fabricated" or "Hidden Gem",
    "evaluation_feedback": "A short 2-3 sentence explanation of the evaluation.",
    "interview_questions": "3 customized, targeted technical interview questions (in {job.language}) to probe the candidate's weak points (the skills where they scored lowest) during a face-to-face interview."
}}
Do NOT output markdown (like ```json), just the raw JSON object.
"""

        resume_text = app.resume_text if app.resume_text else "No resume uploaded."
        user_prompt = f"Candidate Resume/CV Content:\n{resume_text}\n\nTelemetry Data:\n- Tab Switches: {result.tab_switches}\n- Copy-Paste Attempts: {result.copy_paste_attempts}\n- Time Taken: {result.time_taken_seconds} seconds\n\nCandidate Answer:\n{result.candidate_answer}"

        response = await client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            max_tokens=500,
            temperature=0.2
        )
        
        raw_json = response.choices[0].message.content.strip()
        
        import re
        match = re.search(r'\{.*\}', raw_json, re.DOTALL)
        if match:
            eval_data = json.loads(match.group(0))
        else:
            eval_data = json.loads(raw_json)
            
        apply_telemetry_penalties(result, eval_data, result.candidate_answer)
        result.interview_questions = format_interview_questions(eval_data.get("interview_questions", ""))
        
        db.commit()
        logger.info(f"Successfully evaluated application {application_id}")
        
    except Exception as e:
        logger.error(f"Primary API error evaluating application {application_id}: {str(e)}. Falling back to Groq.")
        try:
            groq_client = AsyncOpenAI(
                api_key=os.getenv("GROQ_API_KEY"),
                base_url="https://api.groq.com/openai/v1",
                timeout=10.0
            )
            response = await groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                response_format={"type": "json_object"},
                max_tokens=500,
                temperature=0.2
            )
            raw_json = response.choices[0].message.content.strip()
            
            import re
            match = re.search(r'\{.*\}', raw_json, re.DOTALL)
            if match:
                eval_data = json.loads(match.group(0))
            else:
                eval_data = json.loads(raw_json)
                
            result = db.query(models.AssessmentResult).filter(models.AssessmentResult.id == result_id).first()
            if result:
                apply_telemetry_penalties(result, eval_data, result.candidate_answer)
                result.interview_questions = format_interview_questions(eval_data.get("interview_questions", ""))
                db.commit()
                logger.info(f"Successfully evaluated application {application_id} using Groq fallback.")
        except Exception as fallback_e:
            logger.error(f"Fallback error evaluating application {application_id}: {str(fallback_e)}")
            try:
                result = db.query(models.AssessmentResult).filter(models.AssessmentResult.id == result_id).first()
                if result:
                    result.claim_vs_evidence_label = "Error"
                    result.evaluation_feedback = f"Evaluation failed: {str(e)} | Fallback: {str(fallback_e)}"
                    db.commit()
            except:
                pass
    finally:
        db.close()
