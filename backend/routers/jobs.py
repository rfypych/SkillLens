from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from utils import auth
from services import job_service

router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)

@router.post("", response_model=schemas.JobResponseDetailed)
def create_job(
    job: schemas.JobCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    return job_service.create_job(db, job, current_user)

@router.get("", response_model=List[schemas.JobResponse])
def get_jobs(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    return job_service.get_jobs(db, skip, limit)

@router.get("/my-jobs", response_model=List[schemas.JobResponseDetailed])
def get_my_jobs(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return job_service.get_my_jobs(db, current_user, skip, limit)

@router.get("/{job_id}", response_model=schemas.JobResponse)
def get_job(
    job_id: int, 
    db: Session = Depends(get_db)
):
    return job_service.get_job(db, job_id)

@router.put("/{job_id}", response_model=schemas.JobResponseDetailed)
def update_job(
    job_id: int,
    job_update: schemas.JobUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return job_service.update_job(db, job_id, job_update, current_user)

@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return job_service.delete_job(db, job_id, current_user)
