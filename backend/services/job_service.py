from sqlalchemy.orm import Session
from fastapi import HTTPException, BackgroundTasks
from typing import List
import uuid
import models, schemas
from tasks import generate_assessment_for_job

def create_job(db: Session, job: schemas.JobCreate, current_user: models.User) -> models.Job:
    if current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Only recruiters can create jobs")
        
    magic_token = str(uuid.uuid4())
    db_job = models.Job(
        owner_id=current_user.id,
        title=job.title,
        description=job.description,
        expected_outcomes=job.expected_outcomes,
        specific_skills=job.specific_skills,
        compliance_criteria=job.compliance_criteria,
        language=job.language,
        location=job.location,
        salary_range=job.salary_range,
        job_type=job.job_type,
        status="open",
        magic_link_token=magic_token
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    
    generate_assessment_for_job.delay(db_job.id)
    
    return db_job

def get_jobs(db: Session, skip: int = 0, limit: int = 100) -> List[models.Job]:
    jobs = db.query(models.Job).filter(models.Job.status == "open").offset(skip).limit(limit).all()
    return jobs

def get_my_jobs(db: Session, current_user: models.User, skip: int = 0, limit: int = 100) -> List[models.Job]:
    if current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Only recruiters can view their managed jobs")
    jobs = db.query(models.Job).filter(models.Job.owner_id == current_user.id).offset(skip).limit(limit).all()
    return jobs

def get_job(db: Session, job_id: int) -> models.Job:
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

def update_job(db: Session, job_id: int, job_update: schemas.JobUpdate, current_user: models.User) -> models.Job:
    if current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.owner_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    update_data = job_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(job, key, value)
        
    db.commit()
    db.refresh(job)
    return job

def delete_job(db: Session, job_id: int, current_user: models.User):
    if current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    job = db.query(models.Job).filter(models.Job.id == job_id, models.Job.owner_id == current_user.id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job.status = "closed"
    db.commit()
    return {"message": "Job successfully closed"}
