# blueprint/04_API_CONTRACT.md

## Conventions
- JSON API under /api
- Sanctum auth required.
- Admin endpoints prefix: /api/admin
- Student endpoints prefix: /api/student

## Auth
POST /api/auth/login
Request:
{
  "identifier": "string",  // student_code for students, email/username for admin
  "password": "string"
}
Response 200:
{
  "user": { "id": 1, "role": "admin|student", "name": "...", "student_code": "..." }
}

POST /api/auth/logout → 204
GET /api/auth/me → 200 user object

## Admin — Students
GET /api/admin/students?search=
POST /api/admin/students
Request: { "name": "string", "phone": "string" }
Response 201:
{
  "student": { "id": 10, "name": "...", "phone": "...", "student_code": "STU-0001", "is_active": true },
  "generated_password": "ONE_TIME"
}

PUT /api/admin/students/{id}
DELETE /api/admin/students/{id} → 204

POST /api/admin/students/{id}/reset-password
Response 200: { "generated_password": "ONE_TIME" }

## Admin — Courses
GET /api/admin/courses
POST /api/admin/courses
PUT /api/admin/courses/{id}
DELETE /api/admin/courses/{id} → 204

## Admin — Lessons
GET /api/admin/courses/{courseId}/lessons
POST /api/admin/courses/{courseId}/lessons
PUT /api/admin/lessons/{lessonId}
DELETE /api/admin/lessons/{lessonId} → 204

## Admin — Enrollment
GET /api/admin/students/{id}/enrollments
POST /api/admin/students/{id}/enroll
Request: { "course_ids": [1,2,3] }
DELETE /api/admin/students/{id}/enroll/{courseId} → 204

## Admin — Dashboard
GET /api/admin/dashboard
Response:
{
  "students": 0,
  "courses": 0,
  "lessons": 0,
  "enrollments": 0,
  "completions": 0
}

## Student — Courses
GET /api/student/courses
GET /api/student/courses/{courseId}

## Student — Lessons & Progress
GET /api/student/lessons/{lessonId}
POST /api/student/lessons/{lessonId}/complete

## Authorization rules
- Admin routes: admin role only
- Student routes: student role only
- Student access to course/lesson requires:
  - enrollment exists
  - course is_active = true
  - course/lesson not deleted
