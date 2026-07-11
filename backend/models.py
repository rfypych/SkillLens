from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    users = relationship("User", back_populates="company", cascade="all, delete-orphan")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="candidate") # "admin", "recruiter", "candidate"
    full_name = Column(String, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    company = relationship("Company", back_populates="users")
    jobs = relationship("Job", back_populates="owner", cascade="all, delete-orphan")
    profile = relationship("CandidateProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")

    @property
    def company_name(self) -> str:
        return self.company.name if self.company else None

class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    bio = Column(Text, nullable=True)
    experience = Column(Text, nullable=True)
    resume_url = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="profile")

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String, index=True)
    description = Column(Text)
    expected_outcomes = Column(Text)
    specific_skills = Column(Text)
    compliance_criteria = Column(Text)
    language = Column(String, default="English")
    location = Column(String, nullable=True)
    salary_range = Column(String, nullable=True)
    job_type = Column(String, default="Full-time")
    status = Column(String, default="open") # "open", "closed"
    magic_link_token = Column(String, unique=True, index=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    owner = relationship("User", back_populates="jobs")
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="job", cascade="all, delete-orphan")

    @property
    def candidate_count(self) -> int:
        return len(self.applications)

class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"))
    status = Column(String, default="applied") # applied, testing, evaluated, interview, hired, rejected
    hidden_prompt = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)
    resume_text = Column(Text, nullable=True)
    access_token = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    assessment_results = relationship("AssessmentResult", back_populates="application", cascade="all, delete-orphan")

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"))
    scenario_prompt = Column(Text)
    hidden_prompt = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    job = relationship("Job", back_populates="assessments")

class AssessmentResult(Base):
    __tablename__ = "assessment_results"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"))
    candidate_answer = Column(Text)
    score_problem_understanding = Column(Float)
    score_solution_approach = Column(Float)
    score_logic_execution = Column(Float)
    score_communication = Column(Float)
    score_response_quality = Column(Float)
    overall_score = Column(Float)
    ai_cheating_detected = Column(Boolean, default=False)
    tab_switches = Column(Integer, default=0)
    copy_paste_attempts = Column(Integer, default=0)
    time_taken_seconds = Column(Integer, default=0)
    keystroke_metrics = Column(Text, nullable=True)
    replay_history = Column(Text, nullable=True)
    claim_vs_evidence_label = Column(String) 
    evaluation_feedback = Column(Text)
    interview_questions = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    application = relationship("Application", back_populates="assessment_results")
