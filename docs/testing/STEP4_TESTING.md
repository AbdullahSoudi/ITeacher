# STEP 4 — Admin Courses CRUD Testing Guide

## Overview
Implement admin course management endpoints per blueprint/04_API_CONTRACT.md.

## Prerequisites
1. Database initialized: `php artisan migrate:fresh --seed`
2. Laravel server running: `php artisan serve --port=8000`
3. Admin user seeded: `admin@iteacher.test` / `Admin@123456`

## Test Sequence

### Setup: Get Admin Token

```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@iteacher.test","password":"Admin@123456"}' | jq -r '.token')

echo "Token: $TOKEN"
```

---

## Test 1: Create Course (Active)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "أساسيات اللغة العربية",
    "description": "دورة شاملة في قواعد اللغة العربية للمبتدئين",
    "is_active": true
  }' | jq
```

Expected response (201):
```json
{
  "id": 1,
  "title": "أساسيات اللغة العربية",
  "description": "دورة شاملة في قواعد اللغة العربية للمبتدئين",
  "is_active": true,
  "created_at": "2026-02-19T...",
  "updated_at": "2026-02-19T..."
}
```

---

## Test 2: Create Another Course

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "الرياضيات المتقدمة",
    "description": "دورة متقدمة في الجبر والهندسة",
    "is_active": true
  }' | jq
```

---

## Test 3: Create Course (Inactive)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "الكيمياء العضوية",
    "description": "دورة في أساسيات الكيمياء العضوية",
    "is_active": false
  }' | jq
```

---

## Test 4: List All Courses (Paginated)

```bash
curl -X GET http://127.0.0.1:8000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" | jq
```

Expected response (200):
```json
{
  "data": [
    {
      "id": 3,
      "title": "الكيمياء العضوية",
      "description": "دورة في أساسيات الكيمياء العضوية",
      "is_active": false,
      "lessons_count": 0,
      "enrollments_count": 0,
      "created_at": "2026-02-19T...",
      "updated_at": "2026-02-19T..."
    },
    ...
  ],
  "links": {
    "first": "http://127.0.0.1:8000/api/admin/courses?page=1",
    "last": "http://127.0.0.1:8000/api/admin/courses?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 1,
    "links": [...],
    "path": "http://127.0.0.1:8000/api/admin/courses",
    "per_page": 15,
    "to": 3,
    "total": 3
  }
}
```

---

## Test 5: Get Individual Course Details

```bash
curl -X GET http://127.0.0.1:8000/api/admin/courses/1 \
  -H "Authorization: Bearer $TOKEN" | jq
```

Expected response (200) - includes lessons array:
```json
{
  "id": 1,
  "title": "أساسيات اللغة العربية",
  "description": "دورة شاملة في قواعد اللغة العربية للمبتدئين",
  "is_active": true,
  "lessons": [],
  "created_at": "2026-02-19T...",
  "updated_at": "2026-02-19T..."
}
```

---

## Test 6: Update Course Title & Description

```bash
curl -X PUT http://127.0.0.1:8000/api/admin/courses/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "أساسيات اللغة العربية - المستوى الأول",
    "description": "دورة شاملة في قواعد اللغة العربية للمبتدئين والمتوسطين",
    "is_active": true
  }' | jq
```

Expected response (200): Updated course object

---

## Test 7: Toggle Course Active Status (Deactivate)

```bash
curl -X PUT http://127.0.0.1:8000/api/admin/courses/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "أساسيات اللغة العربية - المستوى الأول",
    "description": "دورة شاملة في قواعد اللغة العربية للمبتدئين والمتوسطين",
    "is_active": false
  }' | jq
```

Expected response (200): Course with `"is_active": false`

---

## Test 8: Toggle Course Active Status (Reactivate)

```bash
curl -X PUT http://127.0.0.1:8000/api/admin/courses/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "أساسيات اللغة العربية - المستوى الأول",
    "description": "دورة شاملة في قواعد اللغة العربية للمبتدئين والمتوسطين",
    "is_active": true
  }' | jq
```

Expected response (200): Course with `"is_active": true`

---

## Test 9: Delete Course (Soft Delete)

```bash
curl -X DELETE http://127.0.0.1:8000/api/admin/courses/3 \
  -H "Authorization: Bearer $TOKEN"
```

Expected response (204): No Content

---

## Test 10: Verify Deleted Course is Hidden

```bash
curl -X GET http://127.0.0.1:8000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" | jq '.data | length'
```

Should return count of 2 (course with ID 3 should be hidden due to soft delete).

---

## Validation Tests

### Test V1: Missing Title (should fail)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "دورة بدون عنوان",
    "is_active": true
  }' | jq
```

Expected 422: `{"errors":{"title":["عنوان الدورة مطلوب."]}}`

---

### Test V2: Title Too Long (should fail)

```bash
LONG_TITLE=$(python3 -c "print('a' * 201)")

curl -X POST http://127.0.0.1:8000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"$LONG_TITLE\",
    \"description\": \"اختبار\",
    \"is_active\": true
  }" | jq
```

Expected 422: Title must not exceed 200 characters

---

### Test V3: Invalid is_active Value (should fail)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "دورة",
    "description": "اختبار",
    "is_active": "maybe"
  }' | jq
```

Expected 422: is_active must be boolean

---

### Test V4: Update Without is_active (should fail)

```bash
curl -X PUT http://127.0.0.1:8000/api/admin/courses/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "الرياضيات",
    "description": "دورة الرياضيات المتقدمة"
  }' | jq
```

Expected 422: `{"errors":{"is_active":["حالة الدورة مطلوبة."]}}`

(is_active is required in update, optional in create with default true)

---

### Test V5: Unauthorized Access (no token)

```bash
curl -X GET http://127.0.0.1:8000/api/admin/courses
```

Expected 401: Unauthorized

---

## Response Format Summary

### Create/Store (201):
```json
{
  "id": 1,
  "title": "string",
  "description": "string|null",
  "is_active": boolean,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### List/Index (200):
```json
{
  "data": [{ id, title, description, is_active, lessons_count, enrollments_count, created_at, updated_at }, ...],
  "links": { first, last, prev, next },
  "meta": { current_page, from, to, total, per_page, last_page }
}
```

### Show (200):
```json
{
  "id": 1,
  "title": "string",
  "description": "string|null",
  "is_active": boolean,
  "lessons": [{ id, title, description, youtube_url, order, ... }, ...],
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### Update (200):
Same as show (includes lessons)

### Delete (204):
No content

---

## Key Implementation Details

✅ **Title:** Required, max 200 characters, string  
✅ **Description:** Optional, can be null, string  
✅ **is_active:** Boolean (required on update, optional on create with default true)  
✅ **Pagination:** 15 courses per page  
✅ **Soft Delete:** Deleted courses hidden from list but data preserved  
✅ **Relationships:** Includes lessons_count and enrollments_count in list  
✅ **Sorting:** Latest courses first  
✅ **Validation:** Form Request with Arabic messages  
✅ **Admin-Only:** Middleware protection on all endpoints  

---

## Important Notes

**Inactive Courses:**
- When `is_active = false`, students cannot access them (enforced in student course endpoints)
- Admin can still view and edit inactive courses
- Can be reactivated anytime

**Soft Deletes:**
- Deleted courses are hidden from admin list
- Relationships (lessons, enrollments) remain intact
- Can be recovered if needed in future

**Pagination:**
- All lists return paginated results
- Default 15 items per page
- Includes full pagination metadata in response

**Course Relationships:**
- Each course can have many lessons
- Each course can have many student enrollments
- Counts are eagerly loaded for performance
