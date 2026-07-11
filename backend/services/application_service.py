from sqlalchemy.orm import Session, joinedload
from fastapi import HTTPException
from typing import List
import models, schemas

def get_applications(db: Session, current_user: models.User, skip: int = 0, limit: int = 100) -> List[models.Application]:
    if current_user.role == "candidate":
        # Candidates see their own applications (excluding archived)
        applications = db.query(models.Application)\
            .options(joinedload(models.Application.assessment_results), joinedload(models.Application.job))\
            .filter(models.Application.user_id == current_user.id, models.Application.status != "archived")\
            .offset(skip).limit(limit).all()
        return applications
    elif current_user.role in ["recruiter", "admin"]:
        # Recruiters see applications for their jobs (excluding archived)
        jobs = db.query(models.Job.id).filter(models.Job.owner_id == current_user.id).subquery()
        applications = db.query(models.Application)\
            .options(joinedload(models.Application.assessment_results), joinedload(models.Application.user))\
            .filter(models.Application.job_id.in_(jobs), models.Application.status != "archived")\
            .offset(skip).limit(limit).all()
        return applications
    return []

def get_application(db: Session, application_id: int, current_user: models.User) -> models.Application:
    app = db.query(models.Application)\
        .options(joinedload(models.Application.assessment_results), joinedload(models.Application.user))\
        .filter(models.Application.id == application_id)\
        .first()
        
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if current_user.role == "candidate" and app.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if current_user.role == "recruiter":
        job = db.query(models.Job).filter(models.Job.id == app.job_id).first()
        if job.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized")
            
    return app

def update_application(db: Session, application_id: int, app_update: schemas.ApplicationUpdate, current_user: models.User) -> models.Application:
    if current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    job = db.query(models.Job).filter(models.Job.id == app.job_id).first()
    if job.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    app.status = app_update.status
    db.commit()
    db.refresh(app)
    return app

def delete_application(db: Session, application_id: int, current_user: models.User):
    if current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    job = db.query(models.Job).filter(models.Job.id == app.job_id).first()
    if job.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    app.status = "archived"
    db.commit()
    return {"message": "Application archived successfully"}
