from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class CompanyBase(BaseModel):
    name: str
    description: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class CandidateProfileBase(BaseModel):
    bio: Optional[str] = None
    experience: Optional[str] = None
    resume_url: Optional[str] = None

class CandidateProfileCreate(CandidateProfileBase):
    pass

class CandidateProfileUpdate(CandidateProfileBase):
    pass

class CandidateProfileResponse(CandidateProfileBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "candidate"
    full_name: Optional[str] = None
    company_name: Optional[str] = None # Used during signup to create a company if recruiter

class UserResponse(BaseModel):
    id: int
    email: str
    role: str
    full_name: Optional[str] = None
    company_id: Optional[int] = None
    company_name: Optional[str] = None
    created_at: datetime
    profile: Optional[CandidateProfileResponse] = None
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    profile: Optional[CandidateProfileUpdate] = None

class JobBase(BaseModel):
    title: str
    description: str
    expected_outcomes: str
    specific_skills: str
    compliance_criteria: str
    language: str = "English"
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: str = "Full-time"

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    expected_outcomes: Optional[str] = None
    specific_skills: Optional[str] = None
    compliance_criteria: Optional[str] = None
    language: Optional[str] = None
    location: Optional[str] = None
    salary_range: Optional[str] = None
    job_type: Optional[str] = None
    status: Optional[str] = None

class JobResponse(JobBase):
    id: int
    status: str
    magic_link_token: Optional[str] = None
    created_at: datetime
    candidate_count: int = 0
    
    class Config:
        from_attributes = True

class AssessmentUpdate(BaseModel):
    scenario_prompt: str

class AssessmentSubmit(BaseModel):
    answer: str
    tab_switches: int = 0
    copy_paste_attempts: int = 0
    time_taken_seconds: int = 0
    keystroke_metrics: Optional[str] = None
    replay_history: Optional[str] = None

class AssessmentResultResponse(BaseModel):
    id: int
    candidate_answer: str
    score_problem_understanding: Optional[float] = None
    score_solution_approach: Optional[float] = None
    score_logic_execution: Optional[float] = None
    score_communication: Optional[float] = None
    score_response_quality: Optional[float] = None
    overall_score: Optional[float] = None
    ai_cheating_detected: bool
    tab_switches: Optional[int] = 0
    copy_paste_attempts: Optional[int] = 0
    time_taken_seconds: Optional[int] = 0
    keystroke_metrics: Optional[str] = None
    replay_history: Optional[str] = None
    claim_vs_evidence_label: Optional[str] = None
    evaluation_feedback: Optional[str] = None
    interview_questions: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ApplicationBase(BaseModel):
    job_id: int

class ApplicationCreate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None

class ApplicationUpdate(BaseModel):
    status: str

class ApplicationResponse(ApplicationBase):
    id: int
    user_id: int
    status: str
    hidden_prompt: Optional[str] = None
    resume_url: Optional[str] = None
    resume_text: Optional[str] = None
    created_at: datetime
    assessment_results: List[AssessmentResultResponse] = []
    user: Optional[UserResponse] = None # Including user info to show in dashboard
    job: Optional[JobResponse] = None # Including job info to show in dashboard
    
    class Config:
        from_attributes = True

class ApplicationApplyResponse(ApplicationResponse):
    access_token: Optional[str] = None
