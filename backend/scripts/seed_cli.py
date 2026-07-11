import os
import sys
from sqlalchemy.orm import Session
from database import SessionLocal
import models

def add_dummy_data():
    db = SessionLocal()
    try:
        # Get the first recruiter or admin
        user = db.query(models.User).filter(models.User.role.in_(["recruiter", "admin"])).first()
        if not user:
            print("Error: No recruiter or admin user found to assign the dummy data to.")
            return

        print(f"Adding dummy data for user: {user.email}")

        # Create dummy jobs
        job1 = models.Job(
            owner_id=user.id,
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
            owner_id=user.id,
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
            c_user = db.query(models.User).filter(models.User.email == c["email"]).first()
            if not c_user:
                c_user = models.User(
                    email=c["email"],
                    hashed_password="guest_user",
                    full_name=c["name"],
                    role="candidate"
                )
                db.add(c_user)
                db.commit()
                db.refresh(c_user)

            # Apply to job1
            app = models.Application(
                user_id=c_user.id,
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

        print("Successfully added dummy data!")
    finally:
        db.close()

def clear_dummy_data():
    db = SessionLocal()
    try:
        dummy_emails = ["alice@dummy.com", "bob@dummy.com", "charlie@dummy.com"]
        
        # Delete candidates and their stuff
        users = db.query(models.User).filter(models.User.email.in_(dummy_emails)).all()
        for u in users:
            apps = db.query(models.Application).filter(models.Application.user_id == u.id).all()
            for app in apps:
                db.query(models.AssessmentResult).filter(models.AssessmentResult.application_id == app.id).delete()
                db.delete(app)
            db.delete(u)
        
        db.commit()
        
        # Also clean up dummy jobs for safety (we can identify by titles)
        dummy_titles = ["Senior Frontend Developer", "Backend Engineer"]
        jobs = db.query(models.Job).filter(models.Job.title.in_(dummy_titles)).all()
        for job in jobs:
            db.query(models.Assessment).filter(models.Assessment.job_id == job.id).delete()
            db.delete(job)
            
        db.commit()
        print("Successfully cleared dummy data!")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python seed_cli.py [add|clear]")
        sys.exit(1)
        
    command = sys.argv[1].lower()
    if command == "add":
        add_dummy_data()
    elif command == "clear":
        clear_dummy_data()
    else:
        print(f"Unknown command: {command}")
        print("Usage: python seed_cli.py [add|clear]")
