# blueprint/00_README_START_HERE.md

## ITeacher — Blueprint (Local MVP, Arabic RTL)

### What we are doing now
Planning only. This /blueprint folder is the ONLY source of truth for the coding agent.
No code is written manually now. The AI agent will implement later.

### Phase 1 Goal (Local MVP)
A local-only lightweight LMS for ONE teacher (Admin) to:
- Create students manually (no public registration)
- Create courses and lessons
- Lessons are YouTube embeds only
- Enroll students into multiple courses (many-to-many)
- Revoke course access from a student
- Track lesson completion (completed / not completed)
- Show basic admin metrics

### Phase 1 Explicit Non-Goals
- NO payments, NO subscriptions, NO invoices
- NO assistant role, NO multiple teachers
- NO sections/modules (Course → Lessons only)
- NO PDFs/files
- NO advanced video protection/DRM/watermark
- NO public registration page

### Phase 2 (Future, not in scope now)
- Payments/subscriptions
- Multi-teacher
- Advanced analytics
- Video protection enhancements

### Fixed Tech Stack (for later implementation)
- Backend: Laravel (API)
- Frontend: React (SPA)
- Auth: Laravel Sanctum
- DB: SQLite local (preferred) or MySQL local
- UI Styling: Tailwind CSS (preferred)

### Agent operating rule (must)
Before implementing any change, the agent MUST re-read:
- 01_PRD.md
- 04_API_CONTRACT.md
- 05_UI_WIREFRAME.md
- 06_DESIGN_SYSTEM.md
- 07_AGENT_RULES.md

### MVP Success Criteria
- Admin can create a student and obtain generated credentials (student_code + one-time password)
- Admin can create course + lessons (YouTube URL)
- Admin can enroll/revoke course access per student
- Student can login and see ONLY enrolled active courses
- Student can mark a lesson completed and it persists
- UI is professional, clean, RTL-correct, mobile-first
