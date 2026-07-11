from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import database
import models
from routers import jobs, auth, applications, assessment

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


app = FastAPI(
    title="SkillLens API",
    description="Backend API for SkillLens Pre-Screening Platform",
    version="0.1.0"
)

from limiter import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."}
    )

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://skilllens.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
)

from fastapi.staticfiles import StaticFiles
import os

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(assessment.router)

os.makedirs("uploads", exist_ok=True)

from fastapi.responses import FileResponse
import os as os_mod
from utils import auth
from fastapi import Depends, HTTPException

@app.get("/uploads/{filename}")
def get_upload_file(filename: str, current_user: models.User = Depends(auth.get_current_user)):
    # Restrict file access to recruiters and admins (or you can allow candidates to see their own)
    if current_user.role not in ["recruiter", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized to access files")
    
    file_path = os_mod.path.join("uploads", filename)
    if not os_mod.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(file_path)

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}

@app.get("/")
def read_root():
    return {"message": "Welcome to SkillLens API"}
