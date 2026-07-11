from fastapi import APIRouter, Depends, BackgroundTasks, File, UploadFile, Form
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from utils import auth
from services import assessment_service
from typing import Optional

router = APIRouter(
    prefix="/assessment",
    tags=["Assessment"]
)

@router.post("/{job_id}/apply", response_model=schemas.ApplicationApplyResponse)
def apply_for_job(
    job_id: int,
    name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth.get_current_user_optional)
):
    payload = schemas.ApplicationCreate(name=name, email=email)
    return assessment_service.apply_for_job(db, job_id, payload, file, current_user)

@router.get("/job/{job_id}")
def get_job_assessment(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return assessment_service.get_job_assessment(db, job_id, current_user)

@router.put("/job/{job_id}")
def update_job_assessment(
    job_id: int,
    payload: schemas.AssessmentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return assessment_service.update_job_assessment(db, job_id, payload, current_user)

@router.get("/{application_id}/prompt")
def get_assessment_prompt(
    application_id: int,
    db: Session = Depends(get_db)
):
    return assessment_service.get_assessment_prompt(db, application_id)

@router.post("/{application_id}/submit")
def submit_assessment(
    application_id: int, 
    payload: schemas.AssessmentSubmit,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return assessment_service.submit_assessment(db, application_id, payload)

@router.post("/{application_id}/chat")
async def chat_assessment(
    application_id: int,
    payload: schemas.ChatRequest,
    db: Session = Depends(get_db)
):
    return await assessment_service.chat_assessment(db, application_id, payload)
