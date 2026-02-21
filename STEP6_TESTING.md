# STEP 6 — Admin Enrollments Testing Guide

## Overview
Implement admin enrollment management endpoints for assigning/revoking course access to students.

## Prerequisites
1. Database initialized: `php artisan migrate:fresh --seed`
2. Laravel server running: `php artisan serve --port=8000`
3. Admin user seeded: `admin@iteacher.test` / `Admin@123456`
4. At least 2 students and 2 courses created (use previous steps)

## Setup

### Create Test Students

```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@iteacher.test","password":"Admin@123456"}' | jq -r '.token')

# Create student 1
STUDENT1=$(curl -s -X POST http://127.0.0.1:8000/api/admin/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"أحمد محمد","phone":"0501234567"}' | jq -r '.student.id')

# Create student 2
STUDENT2=$(curl -s -X POST http://127.0.0.1:8000/api/admin/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"فاطمة علي","phone":"0509876543"}' | jq -r '.student.id')

echo "Student 1: $STUDENT1, Student 2: $STUDENT2"
```

### Create Test Courses

```bash
# Create course 1
COURSE1=$(curl -s -X POST http://127.0.0.1:8000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"اللغة العربية","is_active":true}' | jq -r '.id')

# Create course 2
COURSE2=$(curl -s -X POST http://127.0.0.1:8000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"الرياضيات","is_active":true}' | jq -r '.id')

# Create course 3 (inactive)
COURSE3=$(curl -s -X POST http://127.0.0.1:8000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"الكيمياء","is_active":false}' | jq -r '.id')

echo "Course 1: $COURSE1, Course 2: $COURSE2, Course 3: $COURSE3"
```

---

## Test 1: Get Enrollments (Initially Empty)

```bash
curl -X GET http://127.0.0.1:8000/api/admin/students/$STUDENT1/enrollments \
  -H "Authorization: Bearer $TOKEN" | jq
```

Expected response (200):
```json
[
]
```

Empty array when student has no enrollments

---

## Test 2: Enroll Student in Single Course

```bash
curl -X POST http://127.0.0.1:8000/api/admin/students/$STUDENT1/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"course_ids\": [$COURSE1]
  }" | jq
```

Expected response (201):
```json
{
  "enrolled": [
    {
      "id": 1,
      "user_id": 1,
      "course_id": 1,
      "created_at": "2026-02-19T...",
      "updated_at": "2026-02-19T..."
    }
  ]
}
```

---

## Test 3: Get Enrollments After Assignment

```bash
curl -X GET http://127.0.0.1:8000/api/admin/students/$STUDENT1/enrollments \
  -H "Authorization: Bearer $TOKEN" | jq
```

Expected response (200):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "course_id": 1,
    "created_at": "2026-02-19T...",
    "updated_at": "2026-02-19T...",
    "course": {
      "id": 1,
      "title": "اللغة العربية",
      "is_active": true
    }
  }
]
```

Note: Includes course details (id, title, is_active)

---

## Test 4: Enroll Student in Multiple Courses

```bash
curl -X POST http://127.0.0.1:8000/api/admin/students/$STUDENT1/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"course_ids\": [$COURSE2, $COURSE3]
  }" | jq
```

Expected response (201):
```json
{
  "enrolled": [
    { id: 2, user_id: 1, course_id: 2, ... },
    { id: 3, user_id: 1, course_id: 3, ... }
  ]
}
```

Now student 1 is enrolled in 3 courses

---

## Test 5: Verify Multiple Enrollments

```bash
curl -X GET http://127.0.0.1:8000/api/admin/students/$STUDENT1/enrollments \
  -H "Authorization: Bearer $TOKEN" | jq '. | length'
```

Expected: 3 (all three courses)

---

## Test 6: Idempotent Enrollment (Re-enroll Same Course)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/students/$STUDENT1/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"course_ids\": [$COURSE1]
  }" | jq '.enrolled[0].id'
```

Expected response (201):
- Returns the existing enrollment ID (firstOrCreate behavior)
- No duplicate is created

---

## Test 7: Verify No Duplicates Created

```bash
curl -X GET http://127.0.0.1:8000/api/admin/students/$STUDENT1/enrollments \
  -H "Authorization: Bearer $TOKEN" | jq '. | length'
```

Expected: Still 3 (no new duplicates added)

---

## Test 8: Enroll Second Student

```bash
curl -X POST http://127.0.0.1:8000/api/admin/students/$STUDENT2/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"course_ids\": [$COURSE1, $COURSE2]
  }" | jq
```

Expected response (201): Student 2 may enroll in same courses (different user_id)

---

## Test 9: Revoke Single Enrollment

```bash
curl -X DELETE http://127.0.0.1:8000/api/admin/students/$STUDENT1/enroll/$COURSE1 \
  -H "Authorization: Bearer $TOKEN"
```

Expected response (204): No Content

---

## Test 10: Verify Revocation

```bash
curl -X GET http://127.0.0.1:8000/api/admin/students/$STUDENT1/enrollments \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | .course_id'
```

Expected: Only course IDs 2 and 3 (course 1 removed)

---

## Test 11: Enroll Same Student in More Courses

```bash
curl -X POST http://127.0.0.1:8000/api/admin/students/$STUDENT1/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"course_ids\": [$COURSE1]
  }" | jq
```

Expected response (201): Student 1 re-enrolled in course 1

---

## Validation Tests

### Test V1: Missing course_ids (should fail)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/students/$STUDENT1/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' | jq
```

Expected 422: `{"errors":{"course_ids":["يجب اختيار دورة واحدة على الأقل."]}}`

---

### Test V2: Empty course_ids Array (should fail)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/students/$STUDENT1/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"course_ids":[]}' | jq
```

Expected 422: course_ids array cannot be empty

---

### Test V3: Non-existent Course ID (should fail)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/students/$STUDENT1/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"course_ids":[9999]}' | jq
```

Expected 422: `{"errors":{"course_ids.0":["The selected course_ids.0 is invalid."]}}`

---

### Test V4: Enroll Non-Student User (should fail)

Try to enroll an admin user (ID 1):

```bash
curl -X POST http://127.0.0.1:8000/api/admin/students/1/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"course_ids\":[$COURSE1]}" | jq
```

Expected 404: "Not Found" (admin users cannot be enrolled)

---

### Test V5: Get Enrollments for Non-Student (should fail)

```bash
curl -X GET http://127.0.0.1:8000/api/admin/students/1/enrollments \
  -H "Authorization: Bearer $TOKEN" | jq
```

Expected 404: Not Found

---

### Test V6: Revoke Non-Existent Enrollment

```bash
curl -X DELETE http://127.0.0.1:8000/api/admin/students/$STUDENT2/enroll/$COURSE3 \
  -H "Authorization: Bearer $TOKEN"
```

Expected 204: No Content (silently succeeds even if enrollment didn't exist)

---

### Test V7: Unauthorized Access (no token)

```bash
curl -X GET http://127.0.0.1:8000/api/admin/students/$STUDENT1/enrollments
```

Expected 401: Unauthorized

---

## Complex Scenarios

### Scenario 1: Manage Multiple Students' Enrollments

```bash
# Enroll student 1 in courses 1, 2
curl -s -X POST http://127.0.0.1:8000/api/admin/students/$STUDENT1/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"course_ids\":[$COURSE1,$COURSE2]}"

# Enroll student 2 in courses 2, 3
curl -s -X POST http://127.0.0.1:8000/api/admin/students/$STUDENT2/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"course_ids\":[$COURSE2,$COURSE3]}"

# Check student 1's enrollments
curl -s -X GET http://127.0.0.1:8000/api/admin/students/$STUDENT1/enrollments \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | .course_id'

# Check student 2's enrollments
curl -s -X GET http://127.0.0.1:8000/api/admin/students/$STUDENT2/enrollments \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | .course_id'
```

Expected:
- Student 1: [1, 2]
- Student 2: [2, 3]

---

### Scenario 2: Revoke All Courses for a Student

```bash
# Get all enrollments
ENROLLMENTS=$(curl -s -X GET http://127.0.0.1:8000/api/admin/students/$STUDENT1/enrollments \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | .course_id')

# Revoke each enrollment
for COURSE_ID in $ENROLLMENTS; do
  curl -s -X DELETE http://127.0.0.1:8000/api/admin/students/$STUDENT1/enroll/$COURSE_ID \
    -H "Authorization: Bearer $TOKEN"
done

# Verify all revoked
curl -s -X GET http://127.0.0.1:8000/api/admin/students/$STUDENT1/enrollments \
  -H "Authorization: Bearer $TOKEN" | jq '. | length'
```

Expected: 0 (all enrollments removed)

---

### Scenario 3: Bulk Enroll in All Active Courses

```bash
# Get all active course IDs
COURSE_IDS=$(curl -s -X GET http://127.0.0.1:8000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" | jq '[.data[] | select(.is_active==true) | .id] | @json' | tr -d '"')

# Enroll in all active
curl -X POST http://127.0.0.1:8000/api/admin/students/$STUDENT1/enroll \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"course_ids\":$COURSE_IDS}" | jq '.enrolled | length'
```

Expected: Number of active courses

---

## Response Format Summary

### Get Enrollments (200):
```json
[
  {
    "id": 1,
    "user_id": 1,
    "course_id": 1,
    "created_at": "datetime",
    "updated_at": "datetime",
    "course": {
      "id": 1,
      "title": "string",
      "is_active": boolean
    }
  },
  ...
]
```

### Enroll Student (201):
```json
{
  "enrolled": [
    {
      "id": 1,
      "user_id": 1,
      "course_id": 1,
      "created_at": "datetime",
      "updated_at": "datetime"
    },
    ...
  ]
}
```

### Revoke Enrollment (204):
No content

---

## Key Implementation Details

✅ **Unique Constraint:** Database enforces UNIQUE(user_id, course_id)  
✅ **Idempotent Create:** firstOrCreate prevents duplicates  
✅ **Student Validation:** Only users with role='student' can be enrolled  
✅ **Course Validation:** Course IDs must exist in database  
✅ **Relationship Eager Loading:** Course details included in get enrollments  
✅ **Soft Deletion Handling:** Soft-deleted courses still associable (blueprint allows)  
✅ **Bulk Operations:** Can enroll in multiple courses in single request  
✅ **Revoke Flexibility:** Can revoke individual enrollments  
✅ **Admin-Only Access:** Middleware protects endpoint  

---

## Important Notes

**Inactive Courses:**
- Inactive courses can still be assigned to students
- Students won't see them in /api/student/courses endpoint (enforced on student side)
- Admin can revoke access if needed

**Soft Deletes:**
- Deleted courses can still appear in enrollments list (but marked deleted_at)
- Soft-deleted enrollments still exist in database

**Idempotency:**
- Creating same enrollment twice returns same enrollment ID (no duplicate)
- Useful for re-running assignment scripts

**Cascading Deletes:**
- If a course is deleted, its enrollments may cascade (depending on migration)
- If a student is deleted, their enrollments cascade

**Bulk Operations:**
- course_ids must be an array of integers
- Each ID must exist as a valid course
- All IDs in array are processed atomically (all or error)

---

## Database Constraints

**Table: enrollments**
```
Columns:
  id (PK)
  user_id (FK → users.id) NOT NULL
  course_id (FK → courses.id) NOT NULL
  created_at
  updated_at

Constraints:
  UNIQUE(user_id, course_id)
  FK user_id on delete cascade
  FK course_id on delete cascade
```

This ensures:
- Each student can enroll in each course only once
- Deleting a student cascades to remove enrollments
- Deleting a course cascades to remove enrollments
