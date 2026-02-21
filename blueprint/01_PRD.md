# blueprint/01_PRD.md

## Product Name
ITeacher

## 1) Summary
ITeacher is a local Arabic RTL lightweight LMS for a single teacher (Admin) to manage students and deliver course lessons via YouTube embeds.

## 2) Roles
### Admin (Teacher)
Permissions:
- Full control over students, courses, lessons, enrollments, and basic metrics.

### Student
Permissions:
- View only assigned courses and lessons.
- Mark lessons completed.

## 3) Core Constraints (Phase 1)
- Local only (no deployment)
- No payments/subscriptions
- No public registration
- YouTube video links only
- Course → Lessons only (no sections)

## 4) Features & Acceptance Criteria

### 4.1 Authentication
- Single login page for both roles.
- Login identifier:
  - Student uses `student_code` + password
  - Admin uses seeded admin credentials (email/username) + password
- Logout
- Session/token handling per Sanctum best practices.

Acceptance:
- Unauthorized users redirected to login.
- Student cannot access admin routes.
- Admin cannot be treated as student.

### 4.2 Student Management (Admin)
Student fields:
- name (required)
- phone (required, unique)
- student_code (system-generated, unique)
- password (system-generated; shown once; reset possible)

Admin actions:
- Create student (name + phone)
- Edit student (name/phone/active)
- Soft delete student
- Search/filter by name/phone/student_code
- Reset student password (generate new; show once)

Acceptance:
- On create/reset, API returns one-time password once.
- Phone unique enforced.
- Inactive student cannot login.

### 4.3 Course Management (Admin)
Course fields:
- title (required)
- description (optional)
- is_active (default true)

Admin actions:
- Create/Edit/Soft delete course
- Toggle active/inactive

Acceptance:
- Inactive course hidden from students even if enrolled.

### 4.4 Lesson Management (Admin)
Lesson fields:
- course_id (required)
- title (required)
- description (optional)
- youtube_url (required)
- order (required integer, determines sorting)

Admin actions:
- Create/Edit/Soft delete lesson
- Reorder by changing `order`

Acceptance:
- Student sees lessons sorted by order ascending.
- YouTube embed responsive and works.

### 4.5 Enrollment (Admin)
- A student can be enrolled in multiple courses.
- A course can have multiple students.
- Admin can revoke course access at any time.

Acceptance:
- Student sees only enrolled active courses.
- After revoke, course disappears immediately.

### 4.6 Progress Tracking (Student)
- Student can mark a lesson as completed.
- Completion persists.

Acceptance:
- Completed badge is shown in course lesson list.
- Re-marking completed is idempotent (no duplicates).

### 4.7 Basic Metrics (Admin)
Dashboard shows:
- Total students
- Total courses
- Total lessons
- Total enrollments
- Total completions (optional but preferred)

Acceptance:
- Metrics load under 1 second locally.

## 5) UX Requirements
- Arabic RTL-first.
- Professional SaaS look:
  - Clean spacing, cards, subtle borders
  - Clear typography hierarchy
- Mobile-first responsive.
- Consistent components and states.

## 6) Security Requirements (Minimum)
- Role-based access control.
- Enrollment-based authorization for student course access.
- Rate limit login attempts.
- Validate and sanitize inputs.

## 7) Out of Scope
(Anything not explicitly described above is out of scope for Phase 1.)
