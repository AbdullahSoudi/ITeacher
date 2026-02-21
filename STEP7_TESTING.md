# STEP 7 — Student Courses + Lesson Access Testing Guide

## Overview
Implement student-facing endpoints for accessing enrolled active courses and lessons with proper authorization enforcement.

## Prerequisites
1. Database initialized: `php artisan migrate:fresh --seed`
2. Laravel server running: `php artisan serve --port=8000`
3. Admin user: `admin@iteacher.test` / `Admin@123456`
4. Students, courses, and lessons created and enrolled (use Steps 3-6)

## Setup

### Create Test Data

```bash
# Login as admin
ADMIN_TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@iteacher.test","password":"Admin@123456"}' | jq -r '.token')

# Create student
STUDENT_DATA=$(curl -s -X POST http://127.0.0.1:8000/api/admin/students \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"طالب اختبار","phone":"0501234567"}')

STUDENT_ID=$(echo $STUDENT_DATA | jq -r '.student.id')
STUDENT_CODE=$(echo $STUDENT_DATA | jq -r '.student.student_code')
STUDENT_PASSWORD=$(echo $STUDENT_DATA | jq -r '.generated_password')

echo "Student ID: $STUDENT_ID, Code: $STUDENT_CODE, Password: $STUDENT_PASSWORD"

# Create courses (1 active, 1 inactive)
ACTIVE_COURSE=$(curl -s -X POST http://127.0.0.1:8000/api/admin/courses \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"دورة مفعّلة","is_active":true}' | jq -r '.id')

INACTIVE_COURSE=$(curl -s -X POST http://127.0.0.1:8000/api/admin/courses \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"دورة معطّلة","is_active":false}' | jq -r '.id')

# Create lessons
LESSON1=$(curl -s -X POST http://127.0.0.1:8000/api/admin/courses/$ACTIVE_COURSE/lessons \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"الدرس الأول","youtube_url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}' | jq -r '.id')

LESSON2=$(curl -s -X POST http://127.0.0.1:8000/api/admin/courses/$ACTIVE_COURSE/lessons \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"الدرس الثاني","youtube_url":"https://youtu.be/dQw4w9WgXcQ"}' | jq -r '.id')

LESSON_INACTIVE=$(curl -s -X POST http://127.0.0.1:8000/api/admin/courses/$INACTIVE_COURSE/lessons \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"درس في دورة معطّلة","youtube_url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}' | jq -r '.id')

# Enroll student: in active course BUT NOT in inactive course
curl -s -X POST http://127.0.0.1:8000/api/admin/students/$STUDENT_ID/enroll \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"course_ids\":[$ACTIVE_COURSE]}"

echo "Active Course: $ACTIVE_COURSE, Inactive Course: $INACTIVE_COURSE"
echo "Lesson1: $LESSON1, Lesson2: $LESSON2, Lesson_Inactive: $LESSON_INACTIVE"
```

### Login as Student

```bash
STUDENT_TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"identifier\":\"$STUDENT_CODE\",\"password\":\"$STUDENT_PASSWORD\"}" | jq -r '.token')

echo "Student Token: $STUDENT_TOKEN"
```

---

## Test 1: List Enrolled Courses (Only Active)

```bash
curl -X GET http://127.0.0.1:8000/api/student/courses \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq
```

Expected response (200):
```json
[
  {
    "id": 1,
    "title": "دورة مفعّلة",
    "description": null,
    "is_active": true,
    "lessons_count": 2,
    "progress": {
      "completed": 0,
      "total": 2
    },
    "created_at": "2026-02-19T...",
    "updated_at": "2026-02-19T..."
  }
]
```

Key observations:
- Only active enrolled course shown (inactive course NOT shown even if later enrolled)
- Includes progress object with completed/total lessons
- Includes lessons_count

---

## Test 2: Get Course Details with Lessons

```bash
curl -X GET http://127.0.0.1:8000/api/student/courses/$ACTIVE_COURSE \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq
```

Expected response (200):
```json
{
  "id": 1,
  "title": "دورة مفعّلة",
  "description": null,
  "is_active": true,
  "lessons": [
    {
      "id": 1,
      "course_id": 1,
      "title": "الدرس الأول",
      "description": null,
      "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "order": 1,
      "is_completed": false,
      "created_at": "2026-02-19T...",
      "updated_at": "2026-02-19T..."
    },
    {
      "id": 2,
      "course_id": 1,
      "title": "الدرس الثاني",
      "description": null,
      "youtube_url": "https://youtu.be/dQw4w9WgXcQ",
      "order": 2,
      "is_completed": false,
      "created_at": "2026-02-19T...",
      "updated_at": "2026-02-19T..."
    }
  ]
}
```

Key observations:
- Lessons sorted by order ASC
- Each lesson has is_completed field (false because not marked yet)
- Includes all lesson fields (title, description, youtube_url, order)

---

## Test 3: Get Lesson Details with Navigation

```bash
curl -X GET http://127.0.0.1:8000/api/student/lessons/$LESSON1 \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq
```

Expected response (200):
```json
{
  "id": 1,
  "course_id": 1,
  "title": "الدرس الأول",
  "description": null,
  "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "order": 1,
  "is_completed": false,
  "prev_lesson_id": null,
  "next_lesson_id": 2,
  "created_at": "2026-02-19T...",
  "updated_at": "2026-02-19T..."
}
```

Key observations:
- is_completed: false (not marked yet)
- prev_lesson_id: null (first lesson)
- next_lesson_id: 2 (navigates to lesson 2)

---

## Test 4: Get Second Lesson (with prev/next navigation)

```bash
curl -X GET http://127.0.0.1:8000/api/student/lessons/$LESSON2 \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.prev_lesson_id, .next_lesson_id'
```

Expected response (200):
```json
[
  1,
  null
]
```

- prev_lesson_id: 1 (previous lesson)
- next_lesson_id: null (last lesson)

---

## Test 5: Mark Lesson as Completed

```bash
curl -X POST http://127.0.0.1:8000/api/student/lessons/$LESSON1/complete \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq
```

Expected response (200):
```json
{
  "message": "تم تسجيل الدرس كمكتمل.",
  "is_completed": true,
  "completed_at": "2026-02-19T12:34:56.000000Z"
}
```

---

## Test 6: Verify Completion Persists

```bash
curl -X GET http://127.0.0.1:8000/api/student/lessons/$LESSON1 \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.is_completed'
```

Expected response (200): `true`

---

## Test 7: Mark Second Lesson as Completed

```bash
curl -X POST http://127.0.0.1:8000/api/student/lessons/$LESSON2/complete \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq
```

Expected response (200): Success with is_completed=true

---

## Test 8: Verify Progress Updated in Course List

```bash
curl -X GET http://127.0.0.1:8000/api/student/courses \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.[] | .progress'
```

Expected response (200):
```json
{
  "completed": 2,
  "total": 2
}
```

Both lessons now marked as completed.

---

## Test 9: Re-complete Lesson (Idempotent)

```bash
curl -X POST http://127.0.0.1:8000/api/student/lessons/$LESSON1/complete \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq
```

Expected response (200): Success (no error, updateOrCreate handles idempotency)

```bash
curl -X GET http://127.0.0.1:8000/api/student/lessons/$LESSON1 \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.is_completed'
```

Expected: `true` (no change)

---

## Authorization Tests

### Test A1: Access Non-Enrolled Course (should fail)

```bash
# First, create another course and don't enroll
OTHER_COURSE=$(curl -s -X POST http://127.0.0.1:8000/api/admin/courses \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"دورة أخرى","is_active":true}' | jq -r '.id')

# Try to access as student
curl -X GET http://127.0.0.1:8000/api/student/courses/$OTHER_COURSE \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq
```

Expected 403: Forbidden (user not authorized)

---

### Test A2: Access Lesson in Non-Enrolled Course (should fail)

```bash
# Create a lesson in the non-enrolled course
OTHER_LESSON=$(curl -s -X POST http://127.0.0.1:8000/api/admin/courses/$OTHER_COURSE/lessons \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"درس في دورة أخرى","youtube_url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ"}' | jq -r '.id')

# Try to access as student
curl -X GET http://127.0.0.1:8000/api/student/lessons/$OTHER_LESSON \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq
```

Expected 403: Forbidden

---

### Test A3: Cannot Access Inactive Course Even if Enrolled

```bash
# Re-enroll student in inactive course via admin
curl -s -X POST http://127.0.0.1:8000/api/admin/students/$STUDENT_ID/enroll \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"course_ids\":[$INACTIVE_COURSE]}"

# Try to list courses (should still not show inactive)
curl -X GET http://127.0.0.1:8000/api/student/courses \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq '.[] | .title'
```

Expected: Only "دورة مفعّلة" (inactive course hidden)

```bash
# Try to access inactive course directly
curl -X GET http://127.0.0.1:8000/api/student/courses/$INACTIVE_COURSE \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq
```

Expected 403: Forbidden (course not active)

---

### Test A4: Cannot Access Lesson in Inactive Course

```bash
# Try to access lesson in inactive course
curl -X GET http://127.0.0.1:8000/api/student/lessons/$LESSON_INACTIVE \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq
```

Expected 403: Forbidden (course not active)

---

### Test A5: Cannot Create Progress for Non-Accessed Lesson

```bash
# Try to mark lesson complete in non-enrolled course
curl -X POST http://127.0.0.1:8000/api/student/lessons/$OTHER_LESSON/complete \
  -H "Authorization: Bearer $STUDENT_TOKEN" | jq
```

Expected 403: Forbidden

---

### Test A6: No Token (should fail)

```bash
curl -X GET http://127.0.0.1:8000/api/student/courses
```

Expected 401: Unauthorized

---

## Response Format Summary

### List Courses (200):
```json
[
  {
    "id": 1,
    "title": "string",
    "description": "string|null",
    "is_active": true,
    "lessons_count": integer,
    "progress": {
      "completed": integer,
      "total": integer
    },
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  ...
]
```

### Get Course Details (200):
```json
{
  "id": 1,
  "title": "string",
  "description": "string|null",
  "is_active": true,
  "lessons": [
    {
      "id": 1,
      "course_id": 1,
      "title": "string",
      "description": "string|null",
      "youtube_url": "string",
      "order": integer,
      "is_completed": boolean,
      "created_at": "datetime",
      "updated_at": "datetime"
    },
    ...
  ]
}
```

### Get Lesson Details (200):
```json
{
  "id": 1,
  "course_id": 1,
  "title": "string",
  "description": "string|null",
  "youtube_url": "string",
  "order": integer,
  "is_completed": boolean,
  "prev_lesson_id": integer|null,
  "next_lesson_id": integer|null,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Mark Complete (200):
```json
{
  "message": "تم تسجيل الدرس كمكتمل.",
  "is_completed": true,
  "completed_at": "datetime"
}
```

### Unauthorized (403):
```json
"غير مصرح"
```

---

## Key Implementation Details

✅ **Enrollment Check:** Student must have active enrollment in course  
✅ **Active Course Filter:** Only is_active=true courses visible  
✅ **Course Access:** Gate authorization on show endpoint  
✅ **Lesson Access:** Gate authorization on show endpoint  
✅ **Progress Tracking:** is_completed field added to lessons  
✅ **Progress Metadata:** Courses include completed/total count  
✅ **Navigation:** Prev/next lesson IDs for UI navigation  
✅ **Idempotent Complete:** Can mark complete multiple times  
✅ **Soft Deletes:** Deleted courses/lessons not accessible  
✅ **Student-Only:** Middleware restricts to student role  

---

## Authorization Gates

```php
Gate::define('view-course', function (User $user, Course $course) {
    return $user->enrollments()->where('course_id', $course->id)->exists()
        && $course->is_active;
});

Gate::define('access-lesson', function (User $user, Lesson $lesson) {
    return $user->enrollments()->where('course_id', $lesson->course_id)->exists()
        && $lesson->course->is_active;
});

Gate::define('complete-lesson', function (User $user, Lesson $lesson) {
    return $user->enrollments()->where('course_id', $lesson->course_id)->exists()
        && $lesson->course->is_active;
});
```

---

## Important Notes

**Course Visibility:**
- Only enrolled courses shown
- Only active courses shown
- Inactive courses hidden even if enrolled
- Soft-deleted courses not shown

**Lesson Access:**
- Only accessible if enrolled in course
- Only accessible if course is active
- Soft-deleted lessons not shown
- Lessons sorted by order ASC

**Progress:**
- Tracked per student/lesson pair
- is_completed and completed_at fields
- updateOrCreate ensures idempotency
- Can mark complete multiple times

**Navigation:**
- prev_lesson_id: ID of previous lesson (by order), null if first
- next_lesson_id: ID of next lesson (by order), null if last
- Based on course's lesson ordering
