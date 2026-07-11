from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import database
import models
from routers import jobs, auth, applications, assessment

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="SkillLens API",
    description="Backend API for SkillLens Pre-Screening Platform",
    version="0.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
import os

app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(assessment.router)
from routers import seed
app.include_router(seed.router)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to SkillLens API"}
