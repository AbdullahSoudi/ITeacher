# STEP 9 Testing Guide: Admin Dashboard Metrics

## Setup

Ensure database is ready with migration + seed:

```bash
php artisan migrate:fresh --seed
```

This creates:
- 1 admin user (email: `admin@iteacher.test`, password: `Admin@123456`)
- Database ready for testing

## Authentication

All dashboard tests require authentication. Get admin token first:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@iteacher.test",
    "password": "Admin@123456"
  }'
```

Store the returned `token` from the response. Use it for all subsequent requests:

```bash
TOKEN="your_token_here"
```

## Test 1: Get Dashboard (Empty Database)

After fresh migration, dashboard should show all zeros (only admin user exists).

```bash
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response 200:**
```json
{
  "students": 0,
  "courses": 0,
  "lessons": 0,
  "enrollments": 0,
  "completions": 0
}
```

**Notes:**
- `students`: Count of users with role='student' AND is_active=true (admin excluded)
- `courses`: Count of all non-deleted courses (is_active=true)
- `lessons`: Count of all non-deleted lessons
- `enrollments`: Count of all enrollment records
- `completions`: Count of lesson_progress records where is_completed=true

---

## Test 2: Create Test Data and Verify Counts

Create sample data and verify counts update correctly.

### 2.1 Create a Course

```bash
curl -X POST http://localhost:8000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Laravel Fundamentals",
    "description": "Learn Laravel basics",
    "is_active": true
  }'
```

**Response Course ID:** Note the returned `id` (e.g., `1`)

### 2.2 Create Two Lessons in Course

```bash
COURSE_ID=1

# Lesson 1
curl -X POST http://localhost:8000/api/admin/courses/$COURSE_ID/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Getting Started",
    "description": "Introduction to Laravel",
    "youtube_url": "https://www.youtube.com/watch?v=3RUMf50-r8g"
  }'

# Lesson 2
curl -X POST http://localhost:8000/api/admin/courses/$COURSE_ID/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Routing Deep Dive",
    "description": "Understanding Laravel routing",
    "youtube_url": "https://www.youtube.com/watch?v=2dh6HmNPP-s"
  }'
```

### 2.3 Create Two Students

```bash
# Student 1
curl -X POST http://localhost:8000/api/admin/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmed Hassan",
    "phone": "966501234567"
  }'

# Student 2
curl -X POST http://localhost:8000/api/admin/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fatima Al-Rashid",
    "phone": "966509876543"
  }'
```

**Note Student IDs:** Store the returned `id` values (e.g., `1` and `2`)

### 2.4 Enroll Students in Course

```bash
STUDENT1_ID=1
STUDENT2_ID=2
COURSE_ID=1

# Enroll Student 1
curl -X POST http://localhost:8000/api/admin/students/$STUDENT1_ID/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course_ids": [1]
  }'

# Enroll Student 2
curl -X POST http://localhost:8000/api/admin/students/$STUDENT2_ID/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course_ids": [1]
  }'
```

### 2.5 Get Dashboard After Creating Data

```bash
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response 200:**
```json
{
  "students": 2,
  "courses": 1,
  "lessons": 2,
  "enrollments": 2,
  "completions": 0
}
```

**Explanation:**
- `students`: 2 (Ahmed + Fatima, both active)
- `courses`: 1 (Laravel Fundamentals)
- `lessons`: 2 (Getting Started + Routing Deep Dive)
- `enrollments`: 2 (Student 1 enrolled in Course 1, Student 2 enrolled in Course 1)
- `completions`: 0 (no lessons marked complete yet)

---

## Test 3: Mark Lessons Complete and Verify

Login as one of the students and mark lessons complete, then verify completion count in dashboard.

### 3.1 Login as First Student

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "STU-0001",
    "password": "generated_password_from_creation"
  }'
```

**Note:** Replace `generated_password_from_creation` with the one-time password shown when student was created, or use reset-password endpoint to get new password.

Alternatively, use student phone to login:

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "966501234567",
    "password": "new_password"
  }'
```

Store the returned student token: `STUDENT_TOKEN="..."`

### 3.2 Get Lessons for Student (to find Lesson IDs)

```bash
curl -X GET http://localhost:8000/api/student/courses/1 \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response includes lessons array with lesson IDs.** Note the IDs (e.g., `1` and `2`)

### 3.3 Mark First Lesson Complete

```bash
LESSON1_ID=1

curl -X POST http://localhost:8000/api/student/lessons/$LESSON1_ID/complete \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response 200:**
```json
{
  "id": 1,
  "lesson_id": 1,
  "user_id": 1,
  "is_completed": true,
  "completed_at": "2026-02-19T12:34:56.000000Z"
}
```

### 3.4 Check Dashboard Again (as admin)

```bash
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response 200:**
```json
{
  "students": 2,
  "courses": 1,
  "lessons": 2,
  "enrollments": 2,
  "completions": 1
}
```

**Note:** `completions` increased to 1 because one lesson_progress record has `is_completed=true`

### 3.5 Mark Second Lesson Complete (as same student)

```bash
LESSON2_ID=2

curl -X POST http://localhost:8000/api/student/lessons/$LESSON2_ID/complete \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json"
```

Check dashboard again (still as admin):

```bash
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response 200:**
```json
{
  "students": 2,
  "courses": 1,
  "lessons": 2,
  "enrollments": 2,
  "completions": 2
}
```

**Note:** `completions` increased to 2

---

## Test 4: Complex Scenario - Multiple Courses and Enrollments

### 4.1 Create Second Course

```bash
curl -X POST http://localhost:8000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Advanced Laravel",
    "description": "Expert-level Laravel patterns",
    "is_active": true
  }'
```

**Note Course ID:** Store the returned `id` (e.g., `2`)

### 4.2 Create Lessons in Second Course

```bash
COURSE2_ID=2

# Lesson 1
curl -X POST http://localhost:8000/api/admin/courses/$COURSE2_ID/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Packages and Service Providers",
    "description": "Building reusable Laravel packages",
    "youtube_url": "https://youtu.be/9YewMCh3_IM"
  }'

# Lesson 2
curl -X POST http://localhost:8000/api/admin/courses/$COURSE2_ID/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Testing Best Practices",
    "description": "Writing testable Laravel code",
    "youtube_url": "https://www.youtube.com/watch?v=tTpZhRPkzc4"
  }'
```

### 4.3 Enroll Second Student in Second Course

```bash
STUDENT2_ID=2
COURSE2_ID=2

curl -X POST http://localhost:8000/api/admin/students/$STUDENT2_ID/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "course_ids": [2]
  }'
```

### 4.4 Check Dashboard

```bash
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response 200:**
```json
{
  "students": 2,
  "courses": 2,
  "lessons": 4,
  "enrollments": 3,
  "completions": 2
}
```

**Breakdown:**
- `students`: 2 (Ahmed + Fatima)
- `courses`: 2 (Laravel Fundamentals + Advanced Laravel)
- `lessons`: 4 (2 in course 1 + 2 in course 2)
- `enrollments`: 3 (Student 1 in Course 1, Student 2 in Courses 1 and 2)
- `completions`: 2 (still only 2 lessons marked complete)

---

## Test 5: Inactive Courses Excluded from Count

### 5.1 Deactivate Course 1

```bash
COURSE_ID=1

curl -X PUT http://localhost:8000/api/admin/courses/$COURSE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Laravel Fundamentals",
    "description": "Learn Laravel basics",
    "is_active": false
  }'
```

### 5.2 Check Dashboard

```bash
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response 200:**
```json
{
  "students": 2,
  "courses": 1,
  "lessons": 4,
  "enrollments": 3,
  "completions": 2
}
```

**Key Insight:**
- `courses` decreased to 1 (only active courses counted)
- `lessons` still 4 (lessons are counted regardless; the query logic does NOT filter by course active status)
- `enrollments` and `completions` unchanged (they are absolute counts)

---

## Test 6: Authorization - Only Admin Can Access Dashboard

### 6.1 Try Dashboard as Student

Login as student and attempt dashboard access:

```bash
# Login as student
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "STU-0001",
    "password": "student_password"
  }'

# Get student token and try dashboard
STUDENT_TOKEN="returned_token"

curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer $STUDENT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response 403:**
```json
{
  "message": "غير مصرح"
}
```

**Explanation:** Student role cannot access /api/admin/* routes. Response is 403 Forbidden with Arabic message "غير مصرح" (Unauthorized).

### 6.2 Try Dashboard Without Token

```bash
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Content-Type: application/json"
```

**Expected Response 401:**
```json
{
  "message": "Unauthenticated."
}
```

**Explanation:** Missing authentication token results in 401 Unauthenticated.

---

## Test 7: Soft Delete Behavior

Soft-deleted records should NOT be counted (users, courses, lessons).

### 7.1 Soft Delete a Course

```bash
COURSE_ID=2

curl -X DELETE http://localhost:8000/api/admin/courses/$COURSE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

### 7.2 Check Dashboard

```bash
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response 200:**
```json
{
  "students": 2,
  "courses": 0,
  "lessons": 4,
  "enrollments": 3,
  "completions": 2
}
```

**Key Insight:**
- `courses` is now 0 (both courses deleted or inactive)
- `lessons` still 4 (lessons soft-deleted with course, but query doesn't filter by course soft delete)
- `enrollments` and `completions` unchanged

### 7.2 Soft Delete a Student

```bash
STUDENT_ID=1

curl -X DELETE http://localhost:8000/api/admin/students/$STUDENT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

Check dashboard:

```bash
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response 200:**
```json
{
  "students": 1,
  "courses": 0,
  "lessons": 4,
  "enrollments": 3,
  "completions": 2
}
```

**Key Insight:**
- `students` is now 1 (only Fatima remaining, Ahmed soft-deleted)
- `enrollments` unchanged (soft delete of user doesn't cascade delete enrollments; they exist as historical records)
- `completions` unchanged

---

## Response Format

All responses are JSON with these fields:

```json
{
  "students": 0,           // Integer: count of non-deleted students with role='student' AND is_active=true
  "courses": 0,            // Integer: count of non-deleted courses with is_active=true
  "lessons": 0,            // Integer: count of non-deleted lessons
  "enrollments": 0,        // Integer: count of all enrollment records (no deletion check)
  "completions": 0         // Integer: count of lesson_progress records where is_completed=true
}
```

### Field Definitions

- **students**: `SELECT COUNT(*) FROM users WHERE role='student' AND is_active=true AND deleted_at IS NULL`
- **courses**: `SELECT COUNT(*) FROM courses WHERE is_active=true AND deleted_at IS NULL`
- **lessons**: `SELECT COUNT(*) FROM lessons WHERE deleted_at IS NULL`
- **enrollments**: `SELECT COUNT(*) FROM enrollments` (absolute count, no filters)
- **completions**: `SELECT COUNT(*) FROM lesson_progress WHERE is_completed=true`

---

## Summary

✅ GET /api/admin/dashboard returns correct counts based on database state
✅ Counts update accurately as data is created/deleted/soft-deleted
✅ Authorization enforced (admin-only, requires Sanctum token)
✅ Soft deletes properly excluded from student and course counts
✅ Inactive courses excluded from course count
✅ Enrollments and completions are absolute counts (no filtering)

