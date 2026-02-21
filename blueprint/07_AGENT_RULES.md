# blueprint/07_AGENT_RULES.md

## Mission
Implement ITeacher exactly as specified in /blueprint.
Never go outside scope.

## Critical: Always re-check blueprint
Before every change, re-read:
- 01_PRD.md
- 04_API_CONTRACT.md
- 05_UI_WIREFRAME.md
- 06_DESIGN_SYSTEM.md

## Phase 1 Scope Lock
- Local only
- No payments/subscriptions
- No public registration
- Roles: Admin + Student only
- Course → Lessons only
- Videos: YouTube embeds only
- Enrollment: many-to-many
- Progress: completed lessons

## Engineering Rules
- Build incrementally: one feature per step.
- Do not delete working code.
- Keep UI professional and RTL-correct.
- Add validation, loading, empty states.
- Enforce authorization strictly.

## Backend Rules (Laravel)
- Sanctum auth.
- Soft deletes.
- Use Form Requests validation.
- Use policies/gates for access enforcement.
- Rate-limit login endpoint.

## Frontend Rules (React)
- AppShell with RTL sidebar on right.
- Mobile-first (sidebar becomes drawer).
- Use consistent components, spacing, typography.
- Implement EXACT pages from 05_UI_WIREFRAME.md.

## Output format (every step when coding)
- Changed files list
- How to run
- What to test vs acceptance criteria
