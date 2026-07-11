from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from utils import auth
from services import application_service

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
    dependencies=[Depends(auth.get_current_user)]
)

@router.get("", response_model=List[schemas.ApplicationResponse])
def get_applications(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return application_service.get_applications(db, current_user, skip, limit)

@router.get("/{application_id}", response_model=schemas.ApplicationResponse)
def get_application(
    application_id: int, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return application_service.get_application(db, application_id, current_user)

@router.put("/{application_id}", response_model=schemas.ApplicationResponse)
def update_application(
    application_id: int,
    app_update: schemas.ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return application_service.update_application(db, application_id, app_update, current_user)

@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return application_service.delete_application(db, application_id, current_user)
