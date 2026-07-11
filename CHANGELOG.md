# Changelog

All notable changes to the AI-Powered Skill Validation & Pre-Screening Platform will be documented in this file.

## [1.2.0] - 2026-07-07

### Added
- **God-Tier Anti-Cheat: Micro-Interview Chatbot:**
  - Redesigned the candidate assessment UI from a static textarea into a dynamic, multi-turn chat interface.
  - Deployed an AI Interviewer endpoint (`POST /assessment/{app_id}/chat`) that streams highly specific, context-aware follow-up questions based on the candidate's initial answers.
- **God-Tier Anti-Cheat: Keystroke Dynamics Biometrics:**
  - Implemented rhythmic telemetric tracking by capturing `onKeyDown` and `onKeyUp` events on the chat input.
  - Added backend heuristics (`apply_telemetry_penalties`) to calculate backspace-to-character ratios. Automatically flags "Transcription Cheating" if a candidate types rapidly but with <2% structural backspaces.
- **God-Tier Anti-Cheat: Time-Travel Replay:**
  - Added periodic state snapshotting (`replay_history`) during the assessment to capture the exact chronology of the candidate's input.
  - Built a video-player-like scrubbing slider in the HR Dashboard, allowing recruiters to visually replay a candidate's keystroke process (highlighting natural thought pauses vs robotic transcription).
- **God-Tier Anti-Cheat: The Chameleon Method (Semantic Injection):**
  - Replaced legacy Base64 and Unicode Tag prompt smuggling with Social Engineering prompt injection.
  - Intercepts `onCopy` events to dynamically disguise the ATS trap word as a legitimate "Automated Grading format check", effortlessly tricking techy candidates into feeding the trap to ChatGPT.

## [1.1.0] - 2026-07-05
### Added
- **Real PDF Resume Parser & Alignment Engine:**
  - Added support for PDF uploads during the candidate application phase.
  - Implemented automatic text extraction from uploaded PDF resumes using `pypdf` in the backend.
  - Exposed `resume_url` and `resume_text` columns in the `applications` database schema.
- **AI Interview Copilot:**
  - Created a generator in `ai_evaluator.py` that crafts 3 targeted follow-up technical interview questions tailored to the candidate's weakest scoring criteria.
  - Saved copilot questions inside the `interview_questions` column in `assessment_results` database schema.
  - Rendered a premium-styled **AI Interview Copilot** card in the Recruiter Candidate Report.
- **Premium Telemetry Proctoring Dashboard:**
  - Designed an SVG-based **Safety Index circular gauge** (combining tab switches and copy-paste events) to provide recruiter with instant, graphical anti-cheat confidence.
  - Created styled horizontal progress bars for *Focus Persistence*, *Input Authenticity*, and *Speed Pacing*.
  - Added a download CV button in the recruiter Candidate Report.

### Fixed
- **Standardized Anti-Cheat Trap Word:**
  - Decoupled application creation from arbitrary trap-word randomization. Candidates now inherit the job's `Assessment.hidden_prompt` directly.
  - Aligned Recruiter Dashboard setup details, Candidate test page prompt injection, and the background AI evaluation process to use the same identical trap word (no more mismatches!).
  - Exposed the exact "Armed Trap Word" in the Recruiter Candidate Report for transparency.
- **Guest Apply & Test Flow:**
  - Decoupled the apply form (`candidate/apply/[job_id]`), test page (`candidate/[job_id]`), and submission endpoint from requiring a logged-in user session.
  - Handled automated guest profile creation inside `assessment_service.py` to support Magic Link testing.
  - Refactored `api.post` and `api.get` calls in guest pages to pass `{ requireAuth: false }`.
  - Allowed FastAPI `/apply` endpoint to receive empty JSON bodies (converting path-based parameters appropriately) to prevent 422 errors on dashboard applications.
- **AI JSON Reliability:**
  - Enforced strict `response_format={"type": "json_object"}` in Groq and OpenAI completions to prevent markdown block leaks or conversational filler from entering the database.
- **FastAPI Uvicorn Deadlock:**
  - Resolved Windows Uvicorn reload loop issues by purging lingering processes and restarting a clean FastAPI daemon.

### Cleaned
- Removed all dummy candidate accounts (`copilot_verify@test.com`, `test_candidate@test.com`) and associated applications, results, and mock PDF files from the database and filesystem.
