from fastapi import APIRouter, Depends, BackgroundTasks, File, UploadFile, Form
from sqlalchemy.orm import Session
from database import get_db
import models, schemas
from utils import auth
from services import assessment_service
from typing import Optional
from config import settings

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
    app_data = assessment_service.apply_for_job(db, job_id, payload, file, current_user)
    
    # We must return a JSONResponse to set the cookie
    from fastapi.responses import JSONResponse
    from fastapi.encoders import jsonable_encoder
    
    res = JSONResponse(content=jsonable_encoder(app_data))
    if hasattr(app_data, "access_token") and app_data.access_token:
        res.set_cookie(
            key="access_token",
            value=app_data.access_token,
            httponly=True,
            secure=settings.ENVIRONMENT == "production",
            samesite="lax",
            max_age=1800
        )
        from utils.auth import create_refresh_token
        refresh_token = create_refresh_token(data={"sub": payload.email})
        res.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=settings.ENVIRONMENT == "production",
            samesite="lax",
            max_age=7 * 24 * 3600
        )
    return res

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
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return assessment_service.get_assessment_prompt(db, application_id, current_user)

@router.post("/{application_id}/submit")
def submit_assessment(
    application_id: int, 
    payload: schemas.AssessmentSubmit,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return assessment_service.submit_assessment(db, application_id, payload, current_user)

@router.post("/{application_id}/chat")
async def chat_assessment(
    application_id: int,
    payload: schemas.ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return await assessment_service.chat_assessment(db, application_id, payload, current_user)
