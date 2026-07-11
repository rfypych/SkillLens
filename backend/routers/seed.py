from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from utils import auth
import models
import random

router = APIRouter(
    prefix="/seed",
    tags=["Seed"]
)

@router.post("/add")
def seed_data(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Create dummy jobs
    job1 = models.Job(
        owner_id=current_user.id,
        title="Senior Frontend Developer",
        description="We are looking for a senior frontend developer with React experience.",
        expected_outcomes="Build responsive UIs.",
        specific_skills="React, TypeScript, Tailwind",
        compliance_criteria="5+ years experience",
        language="English",
        location="Remote",
        salary_range="$100k - $120k",
        job_type="Full-time",
        status="open"
    )
    job2 = models.Job(
        owner_id=current_user.id,
        title="Backend Engineer",
        description="Looking for a Python/FastAPI expert.",
        expected_outcomes="Build scalable APIs.",
        specific_skills="Python, FastAPI, PostgreSQL",
        compliance_criteria="3+ years experience",
        language="English",
        location="Remote",
        salary_range="$90k - $110k",
        job_type="Full-time",
        status="open"
    )
    db.add(job1)
    db.add(job2)
    db.commit()
    db.refresh(job1)
    db.refresh(job2)

    # Create Assessments
    assessment1 = models.Assessment(job_id=job1.id, scenario_prompt="Build a React component...", hidden_prompt="kulkas")
    assessment2 = models.Assessment(job_id=job2.id, scenario_prompt="Build a FastAPI endpoint...", hidden_prompt="sepeda")
    db.add(assessment1)
    db.add(assessment2)
    db.commit()

    # Create Candidates & Applications
    candidates = [
        {"name": "Alice Smith", "email": "alice@dummy.com", "label": "Hidden Gem", "score": 95},
        {"name": "Bob Johnson", "email": "bob@dummy.com", "label": "Solid Match", "score": 85},
        {"name": "Charlie Brown", "email": "charlie@dummy.com", "label": "Fabricated", "score": 40},
    ]

    for c in candidates:
        user = db.query(models.User).filter(models.User.email == c["email"]).first()
        if not user:
            user = models.User(
                email=c["email"],
                hashed_password="guest_user",
                full_name=c["name"],
                role="candidate"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Apply to job1
        app = models.Application(
            user_id=user.id,
            job_id=job1.id,
            status="evaluated",
            hidden_prompt="kulkas"
        )
        db.add(app)
        db.commit()
        db.refresh(app)

        # Add Result
        result = models.AssessmentResult(
            application_id=app.id,
            candidate_answer="This is a dummy answer.",
            overall_score=c["score"],
            ai_cheating_detected=(c["label"] == "Fabricated"),
            claim_vs_evidence_label=c["label"]
        )
        db.add(result)
        db.commit()

    return {"message": "Dummy data added successfully."}

@router.post("/clear")
def clear_data(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(auth.get_current_user)
):
    if current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Delete all dummy data owned by the current user
    jobs = db.query(models.Job).filter(models.Job.owner_id == current_user.id).all()
    for job in jobs:
        # Applications
        apps = db.query(models.Application).filter(models.Application.job_id == job.id).all()
        for app in apps:
            db.query(models.AssessmentResult).filter(models.AssessmentResult.application_id == app.id).delete()
            db.delete(app)
        
        # Assessments
        db.query(models.Assessment).filter(models.Assessment.job_id == job.id).delete()
        db.delete(job)
        
    db.commit()
    
    # Optionally delete dummy candidates
    dummy_emails = ["alice@dummy.com", "bob@dummy.com", "charlie@dummy.com"]
    db.query(models.User).filter(models.User.email.in_(dummy_emails)).delete(synchronize_session=False)
    db.commit()

    return {"message": "Dummy data cleared successfully."}
