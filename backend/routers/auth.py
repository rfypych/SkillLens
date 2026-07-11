from fastapi import APIRouter, Depends, Request, Response
from limiter import limiter
from config import settings
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
    from utils.auth import create_refresh_token
    refresh_token = create_refresh_token(data={"sub": form_data.username})
    
    # We must construct a JSONResponse so we can set cookies on it
    # We return the token in body as well for backward compatibility
    res = JSONResponse(content={"access_token": token_data.access_token, "token_type": token_data.token_type})
    res.set_cookie(
        key="access_token",
        value=token_data.access_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=1800
    )
    res.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=7 * 24 * 3600
    )
    return res

@router.post("/refresh")
def refresh_token_route(request: Request, db: Session = Depends(get_db)):
    from fastapi import HTTPException
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token")
    try:
        from utils.auth import SECRET_KEY, ALGORITHM, jwt, create_access_token, create_refresh_token
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid refresh token")
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        new_access_token = create_access_token(data={"sub": email})
        new_refresh_token = create_refresh_token(data={"sub": email})
        
        res = JSONResponse(content={"access_token": new_access_token, "token_type": "bearer"})
        res.set_cookie(
            key="access_token", value=new_access_token, httponly=True, 
            secure=settings.ENVIRONMENT == "production", samesite="lax", max_age=1800
        )
        res.set_cookie(
            key="refresh_token", value=new_refresh_token, httponly=True, 
            secure=settings.ENVIRONMENT == "production", samesite="lax", max_age=7*24*3600
        )
        return res
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.post("/logout")
def logout():
    res = JSONResponse(content={"message": "Logged out successfully"})
    res.delete_cookie("access_token")
    res.delete_cookie("refresh_token")
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
