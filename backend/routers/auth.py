from fastapi import APIRouter, Depends, Request, Response
from limiter import limiter
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
import models, schemas
from database import get_db
from utils import auth
from services import auth_service

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/signup", response_model=schemas.UserResponse)
@limiter.limit("5/minute")
def signup(request: Request, user: schemas.UserCreate, db: Session = Depends(get_db)):
    return auth_service.signup_user(db, user)

from fastapi.responses import JSONResponse

@router.post("/login", response_model=schemas.Token)
@limiter.limit("5/minute")
def login(request: Request, response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    token_data = auth_service.authenticate_user(db, form_data.username, form_data.password)
    
    # We must construct a JSONResponse so we can set cookies on it
    # We return the token in body as well for backward compatibility
    res = JSONResponse(content={"access_token": token_data.access_token, "token_type": token_data.token_type})
    res.set_cookie(
        key="access_token",
        value=token_data.access_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=1800
    )
    return res

@router.post("/logout")
def logout():
    res = JSONResponse(content={"message": "Logged out successfully"})
    res.delete_cookie("access_token")
    return res

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.UserResponse)
def update_user_me(
    user_update: schemas.UserUpdate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    return auth_service.update_current_user(db, current_user, user_update)
