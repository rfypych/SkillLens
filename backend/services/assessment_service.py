from sqlalchemy.orm import Session
from fastapi import HTTPException, BackgroundTasks
import models, schemas
import random
import asyncio
from services.ai_evaluator import evaluate_candidate_answer_task

def run_ai_eval_sync(application_id: int, result_id: int):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(evaluate_candidate_answer_task(application_id, result_id))
    loop.close()

import uuid
import os
from fastapi import UploadFile
from pypdf import PdfReader
from typing import Optional
from utils.auth import create_access_token

def apply_for_job(
    db: Session, 
    job_id: int, 
    payload: schemas.ApplicationCreate, 
    file: Optional[UploadFile] = None,
    current_user: Optional[models.User] = None
) -> models.Application:
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    if current_user:
        user = current_user
    else:
        if not payload.name or not payload.email:
            raise HTTPException(status_code=400, detail="Name and email are required for guest applications")
        user = db.query(models.User).filter(models.User.email == payload.email).first()
        if not user:
            import secrets
            from utils.auth import get_password_hash
            dummy_hash = get_password_hash(secrets.token_urlsafe(32))
            user = models.User(
                email=payload.email,
                hashed_password=dummy_hash,
                full_name=payload.name,
                role="candidate"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    assessment = db.query(models.Assessment).filter(models.Assessment.job_id == job.id).first()
    hidden_prompt = assessment.hidden_prompt if assessment else "mentimun"

    resume_url = None
    resume_text = None

    if file and file.filename:
        if file.content_type != "application/pdf" or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF resumes are supported")
        if file.size and file.size > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 5MB.")
        
        unique_filename = f"{uuid.uuid4()}.pdf"
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, unique_filename)
        
        try:
            with open(file_path, "wb") as buffer:
                buffer.write(file.file.read())
            
            resume_url = f"/uploads/{unique_filename}"
            
            # Extract text using pypdf
            reader = PdfReader(file_path)
            extracted_pages = []
            for page in reader.pages:
                text_content = page.extract_text()
                if text_content:
                    extracted_pages.append(text_content)
            resume_text = "\n".join(extracted_pages)
            
        except Exception as e:
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(status_code=500, detail=f"Failed to process PDF resume: {str(e)}")

    new_app = models.Application(
        user_id=user.id,
        job_id=job.id,
        hidden_prompt=hidden_prompt,
        status="testing",
        resume_url=resume_url,
        resume_text=resume_text
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    
    # Generate token so guest candidate can access interactive assessment
    access_token = create_access_token(data={"sub": user.email})
    new_app.access_token = access_token
    
    return new_app

def get_job_assessment(db: Session, job_id: int, current_user: models.User):
    if current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.owner_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    assessment = db.query(models.Assessment).filter(models.Assessment.job_id == job_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not ready")
    return {"scenario_prompt": assessment.scenario_prompt, "hidden_prompt": assessment.hidden_prompt}

def update_job_assessment(db: Session, job_id: int, payload: schemas.AssessmentUpdate, current_user: models.User):
    if current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.owner_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    assessment = db.query(models.Assessment).filter(models.Assessment.job_id == job_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    
    assessment.scenario_prompt = payload.scenario_prompt
    db.commit()
    return {"message": "Assessment updated successfully"}

def get_assessment_prompt(db: Session, application_id: int, current_user: models.User):
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if app.user_id != current_user.id and current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    assessment = db.query(models.Assessment).filter(models.Assessment.job_id == app.job_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not ready")
    return {"scenario_prompt": assessment.scenario_prompt, "hidden_prompt": app.hidden_prompt or assessment.hidden_prompt}

def submit_assessment(db: Session, application_id: int, payload: schemas.AssessmentSubmit, current_user: models.User):
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if app.user_id != current_user.id and current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to submit this assessment")
        
    app.status = "evaluated"
    
    result = models.AssessmentResult(
        application_id=app.id,
        candidate_answer=payload.answer,
        claim_vs_evidence_label="Pending AI Evaluation",
        overall_score=0,
        tab_switches=payload.tab_switches,
        copy_paste_attempts=payload.copy_paste_attempts,
        time_taken_seconds=payload.time_taken_seconds,
        keystroke_metrics=payload.keystroke_metrics,
        replay_history=payload.replay_history
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    
    from tasks import run_ai_eval_sync_task
    run_ai_eval_sync_task.delay(app.id, result.id)
    return {"message": "Assessment submitted successfully. AI evaluation started."}

from openai import AsyncOpenAI

async def chat_assessment(db: Session, application_id: int, payload: schemas.ChatRequest, current_user: models.User):
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if app.user_id != current_user.id and current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    job = app.job
    
    api_key = os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_API_BASE")
    model_name = os.getenv("LLM_MODEL_NAME")
    
    client = AsyncOpenAI(
        api_key=api_key, 
        base_url=base_url,
        default_headers={"User-Agent": "Mozilla/5.0"}
    )
    
    system_prompt = f"""You are an expert technical interviewer conducting a Micro-Interview.
You are evaluating a candidate for the following role:
Job Title: {job.title}
Job Outcomes (Expectations): {job.expected_outcomes}
Specific Skills Required: {job.specific_skills}

Instructions:
1. Review the conversation history. The first message is the scenario prompt.
2. Ask a short, highly specific, and challenging technical follow-up question based on the candidate's last answer.
3. If their last answer was vague, ask them to explain a specific concept they mentioned in detail.
4. If their answer was comprehensive, introduce a new constraint (e.g., "What if the database goes down?" or "How would you scale this to 10x traffic?").
5. Keep your response brief (max 2-3 sentences). Do NOT provide the answer. ONLY ask the question.
6. Speak in {job.language}.
"""
    
    messages = [{"role": "system", "content": system_prompt}]
    for msg in payload.messages:
        messages.append({"role": msg.role, "content": msg.content})
        
    try:
        response = await client.chat.completions.create(
            model=model_name,
            messages=messages,
            temperature=0.7,
            max_tokens=150
        )
        reply = response.choices[0].message.content.strip()
    except Exception as e:
        # Fallback handling for RateLimits or other API errors
        error_msg = str(e)
        print(f"LLM API Error: {error_msg}")
        raise HTTPException(status_code=503, detail="AI Service is currently unavailable (Rate limit or provider error). Please try again later.")
        
    return {"reply": reply}
