from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import timedelta
import models, schemas
from utils import auth

def signup_user(db: Session, user: schemas.UserCreate) -> models.User:
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    company_id = None
    if user.role == "recruiter" and user.company_name:
        # Create company if not exists or just create a new one for simplicity
        company = db.query(models.Company).filter(models.Company.name == user.company_name).first()
        if not company:
            company = models.Company(name=user.company_name)
            db.add(company)
            db.commit()
            db.refresh(company)
        company_id = company.id

    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        role=user.role,
        full_name=user.full_name,
        company_id=company_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    if user.role == "candidate":
        # Create an empty profile for candidates
        profile = models.CandidateProfile(user_id=new_user.id)
        db.add(profile)
        db.commit()
        
    return new_user

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not auth.verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

def update_current_user(db: Session, current_user: models.User, user_update: schemas.UserUpdate) -> models.User:
    update_data = user_update.dict(exclude_unset=True)
    
    if "full_name" in update_data:
        current_user.full_name = update_data["full_name"]
        
    if "company_name" in update_data and current_user.company_id:
        company = db.query(models.Company).filter(models.Company.id == current_user.company_id).first()
        if company:
            company.name = update_data["company_name"]
            
    if user_update.profile and current_user.profile:
        profile_data = user_update.profile.dict(exclude_unset=True)
        for key, value in profile_data.items():
            setattr(current_user.profile, key, value)
            
    db.commit()
    db.refresh(current_user)
    return current_user
