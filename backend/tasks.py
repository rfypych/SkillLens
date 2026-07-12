import os
import sys
import time
import logging
from celery_app import celery
from database import SessionLocal
import models
from openai import OpenAI
from dotenv import load_dotenv

# Ensure the backend directory is in the path for celery workers
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()
logger = logging.getLogger(__name__)

@celery.task(bind=True, max_retries=3, default_retry_delay=10)
def generate_assessment_for_job(self, job_id: int):
    db = SessionLocal()
    try:
        job = db.query(models.Job).filter(models.Job.id == job_id).first()
        if not job:
            return
            
        system_prompt = f"""You are an expert HR and technical interviewer.
Your task is to generate a highly complex, contextual, and realistic case study scenario for a job application.
The scenario must test the candidate's skills, logic, and problem-solving abilities.
Language: {job.language}

Job Title: {job.title}
Job Description: {job.description}
Expected Outcome: {job.expected_outcomes}
Specific Skills: {job.specific_skills}

Output Format: You MUST reply ONLY in raw JSON format with a single key "scenario".
CRITICAL INSTRUCTION FOR SCENARIO CONTENT: The scenario text must be beautifully formatted in Markdown. 
Use clear H3 headers (###), bullet points, and bold text for emphasis. 
Include sections for '### The Scenario', '### Key Objectives', and then clearly list the 4 questions/tasks for the candidate. 
Make it look professional, structured, and easy to read. Do NOT output markdown code blocks (like ```json), just the raw JSON object.
"""
        
        scenario_prompt = ""
        import json
        import re
        
        def extract_json_scenario(raw_text):
            match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            text_to_parse = match.group(0) if match else raw_text
            try:
                data = json.loads(text_to_parse)
                return data.get("scenario", "Failed to extract scenario from JSON.")
            except:
                return raw_text # Fallback to raw text if JSON parsing completely fails
        
        try:
            client = OpenAI(
                api_key=os.getenv("OPENAI_API_KEY"),
                base_url=os.getenv("OPENAI_API_BASE"),
                default_headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"},
                timeout=30.0
            )
            response = client.chat.completions.create(
                model=os.getenv("LLM_MODEL_NAME", "qwen3.7-plus"),
                messages=[{"role": "user", "content": system_prompt}],
                response_format={"type": "json_object"},
                temperature=0.7,
                max_tokens=1500
            )
            scenario_prompt = extract_json_scenario(response.choices[0].message.content.strip())
        except Exception as e:
            logger.error(f"OpenAI error in task {self.request.id}: {str(e)}. Falling back to Groq.")
            try:
                groq_client = OpenAI(
                    api_key=os.getenv("GROQ_API_KEY"),
                    base_url="https://api.groq.com/openai/v1",
                    timeout=30.0
                )
                response = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[{"role": "user", "content": system_prompt}],
                    response_format={"type": "json_object"},
                    temperature=0.7,
                    max_tokens=1500
                )
                scenario_prompt = extract_json_scenario(response.choices[0].message.content.strip())
            except Exception as e2:
                logger.error(f"Fallback Groq failed: {e2}")
                raise self.retry(exc=e2)
        
        import random
        trap_words = ["mentimun", "jerapah", "kulkas", "sepeda", "semangka", "kalkulator", "lemari", "jendela", "bantal", "gajah", "durian", "payung", "sepatu", "sendok", "garpu"]
        hidden_prompt = random.choice(trap_words)
        
        new_assessment = models.Assessment(
            job_id=job.id,
            scenario_prompt=scenario_prompt,
            hidden_prompt=hidden_prompt
        )
        
        db.add(new_assessment)
        db.commit()
    finally:
        db.close()
        
    return {"status": "success", "job_id": job_id}

@celery.task(bind=True, max_retries=3, default_retry_delay=10)
def run_ai_eval_sync_task(self, application_id: int, result_id: int):
    import asyncio
    from services.ai_evaluator import evaluate_candidate_answer_task
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        loop.run_until_complete(evaluate_candidate_answer_task(application_id, result_id))
    except Exception as e:
        logger.error(f"AI Eval failed for application {application_id}: {str(e)}")
        raise self.retry(exc=e)
    finally:
        loop.close()
    return {"status": "success", "application_id": application_id}
