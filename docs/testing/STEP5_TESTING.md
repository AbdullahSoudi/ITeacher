# STEP 5 — Admin Lessons CRUD Testing Guide

## Overview
Implement admin lesson management endpoints per blueprint/04_API_CONTRACT.md with YouTube URL validation and order-based sorting.

## Prerequisites
1. Database initialized: `php artisan migrate:fresh --seed`
2. Laravel server running: `php artisan serve --port=8000`
3. Admin user seeded: `admin@iteacher.test` / `Admin@123456`
4. At least one course created (use Step 4 endpoints first)

## Test Sequence

### Setup: Get Admin Token

```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin@iteacher.test","password":"Admin@123456"}' | jq -r '.token')

echo "Token: $TOKEN"
```

### Setup: Create a Test Course

```bash
COURSE=$(curl -s -X POST http://127.0.0.1:8000/api/admin/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "أساسيات اللغة العربية",
    "description": "دورة شاملة",
    "is_active": true
  }' | jq -r '.id')

echo "Course ID: $COURSE"
```

---

## Test 1: Add Lesson with YouTube Link (auto order)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "الدرس الأول - مقدمة",
    "description": "مقدمة عن مبادئ اللغة العربية",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }' | jq
```

Expected response (201):
```json
{
  "id": 1,
  "course_id": 1,
  "title": "الدرس الأول - مقدمة",
  "description": "مقدمة عن مبادئ اللغة العربية",
  "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "order": 1,
  "created_at": "2026-02-19T...",
  "updated_at": "2026-02-19T..."
}
```

Note: `order` auto-incremented to 1 (course's max order + 1)

---

## Test 2: Add Second Lesson with YouTube Short Link

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "الدرس الثاني - الأساسيات",
    "description": "أساسيات النحو",
    "youtube_url": "https://youtu.be/dQw4w9WgXcQ"
  }' | jq
```

Expected: `order` should be 2 (auto-incremented)

---

## Test 3: Add Third Lesson with Custom Order (out of sequence)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "الدرس الثالث",
    "description": "درس متقدم",
    "youtube_url": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "order": 5
  }' | jq
```

Expected: `order` should be 5 (explicitly set, not auto-incremented)

---

## Test 4: List Lessons (sorted by order ASC)

```bash
curl -X GET http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" | jq
```

Expected response (200):
```json
[
  {
    "id": 1,
    "course_id": 1,
    "title": "الدرس الأول - مقدمة",
    "description": "مقدمة عن مبادئ اللغة العربية",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "order": 1,
    "created_at": "2026-02-19T...",
    "updated_at": "2026-02-19T..."
  },
  {
    "id": 2,
    "course_id": 1,
    "title": "الدرس الثاني - الأساسيات",
    "description": "أساسيات النحو",
    "youtube_url": "https://youtu.be/dQw4w9WgXcQ",
    "order": 2,
    "created_at": "2026-02-19T...",
    "updated_at": "2026-02-19T..."
  }
]
```

**Key observation:** Lessons sorted by `order` ascending (lesson with order=1, then order=2)

---

## Test 5: Update Lesson Title and Order

```bash
curl -X PUT http://127.0.0.1:8000/api/admin/lessons/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "الدرس الأول - المقدمة المحدثة",
    "description": "مقدمة محدثة",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "order": 1
  }' | jq
```

Expected response (200): Updated lesson object

---

## Test 6: Reorder Lesson (Change Position)

```bash
curl -X PUT http://127.0.0.1:8000/api/admin/lessons/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "الدرس الثاني - الأساسيات",
    "description": "أساسيات النحو",
    "youtube_url": "https://youtu.be/dQw4w9WgXcQ",
    "order": 10
  }' | jq
```

Expected: Lesson order updated to 10

After this update, when listing lessons, lesson 2 should appear last (order 10 > order 1, 5)

---

## Test 7: List Lessons Again (verify reordering)

```bash
curl -X GET http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | {id, title, order}'
```

Expected: Lessons now in order: 1, 5, 10 (sorted by order field)

---

## Test 8: Update YouTube URL

```bash
curl -X PUT http://127.0.0.1:8000/api/admin/lessons/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "الدرس الأول - المقدمة",
    "description": "مقدمة عن اللغة",
    "youtube_url": "https://www.youtube.com/watch?v=XxXxXxXxXxX",
    "order": 1
  }' | jq '.youtube_url'
```

Expected: New URL returned (https://www.youtube.com/watch?v=XxXxXxXxXxX)

---

## Test 9: Delete Lesson (Soft Delete)

```bash
curl -X DELETE http://127.0.0.1:8000/api/admin/lessons/3 \
  -H "Authorization: Bearer $TOKEN"
```

Expected response (204): No Content

---

## Test 10: Verify Deleted Lesson is Hidden

```bash
curl -X GET http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" | jq '.[] | .id'
```

Expected: Only IDs 1 and 2 returned (lesson 3 soft-deleted)

---

## YouTube URL Validation Tests

### Test V1: Valid YouTube Watch URL

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "درس",
    "description": "اختبار",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }' | jq '.id'
```

Expected: 201 Created (ID returned)

---

### Test V2: Valid YouTube Short URL

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "درس",
    "description": "اختبار",
    "youtube_url": "https://youtu.be/dQw4w9WgXcQ"
  }' | jq '.id'
```

Expected: 201 Created

---

### Test V3: Valid YouTube Embed URL

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "درس",
    "description": "اختبار",
    "youtube_url": "https://www.youtube.com/embed/dQw4w9WgXcQ"
  }' | jq '.id'
```

Expected: 201 Created

---

### Test V4: Valid YouTube Shorts URL

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "درس",
    "description": "اختبار",
    "youtube_url": "https://www.youtube.com/shorts/dQw4w9WgXcQ"
  }' | jq '.id'
```

Expected: 201 Created

---

### Test V5: Invalid URL (should fail)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "درس",
    "description": "اختبار",
    "youtube_url": "https://vimeo.com/123456"
  }' | jq
```

Expected 422: `{"errors":{"youtube_url":["يجب أن يكون الرابط رابط YouTube صحيحاً."]}}`

---

### Test V6: Non-HTTPS YouTube URL (should fail)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "درس",
    "description": "اختبار",
    "youtube_url": "http://youtube.com/watch?v=dQw4w9WgXcQ"
  }' | jq
```

Expected 422: YouTube URL validation error

---

### Test V7: HTTP YouTube URL (should succeed)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "درس",
    "description": "اختبار",
    "youtube_url": "http://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }' | jq '.id'
```

Expected: 201 Created (both http and https are valid)

---

## Order Validation Tests

### Test O1: Valid Order (integer)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "درس",
    "description": "اختبار",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "order": 100
  }' | jq '.order'
```

Expected: 100

---

### Test O2: Invalid Order (zero, should fail on update)

```bash
curl -X PUT http://127.0.0.1:8000/api/admin/lessons/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "درس",
    "description": "اختبار",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "order": 0
  }' | jq
```

Expected 422: Order must be at least 1

---

### Test O3: Invalid Order (negative, should fail)

```bash
curl -X PUT http://127.0.0.1:8000/api/admin/lessons/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "درس",
    "description": "اختبار",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "order": -5
  }' | jq
```

Expected 422: Order must be at least 1

---

### Test O4: Order on Create (optional)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "درس",
    "description": "اختبار",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }' | jq '.order'
```

Expected: Auto-assigned order (max existing order + 1)

---

### Test O5: Order on Update (required)

```bash
curl -X PUT http://127.0.0.1:8000/api/admin/lessons/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "درس",
    "description": "اختبار",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }' | jq
```

Expected 422: `{"errors":{"order":["ترتيب الدرس مطلوب."]}}`

---

## Field Validation Tests

### Test F1: Missing Title (should fail)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "بدون عنوان",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }' | jq
```

Expected 422: Title validation error

---

### Test F2: Missing YouTube URL (should fail)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "درس",
    "description": "بدون رابط"
  }' | jq
```

Expected 422: `{"errors":{"youtube_url":["رابط YouTube مطلوب."]}}`

---

### Test F3: Title Too Long (should fail)

```bash
LONG_TITLE=$(python3 -c "print('a' * 201)")

curl -X POST http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"$LONG_TITLE\",
    \"description\": \"اختبار\",
    \"youtube_url\": \"https://www.youtube.com/watch?v=dQw4w9WgXcQ\"
  }" | jq
```

Expected 422: Title must not exceed 200 characters

---

### Test F4: Optional Description

```bash
curl -X POST http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "درس بدون وصف",
    "youtube_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
  }' | jq '.description'
```

Expected: null (description is optional)

---

## Authorization Test

### Test A1: Unauthorized Access (no token)

```bash
curl -X GET http://127.0.0.1:8000/api/admin/courses/$COURSE/lessons
```

Expected 401: Unauthenticated

---

### Test A2: Wrong Role (student trying to create lesson)

Will be tested in later steps when student token is available

---

## Response Format Summary

### Create/Store (201):
```json
{
  "id": 1,
  "course_id": 1,
  "title": "string",
  "description": "string|null",
  "youtube_url": "string",
  "order": integer,
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

### List/Index (200):
```json
[
  { id, course_id, title, description, youtube_url, order, created_at, updated_at },
  ...
]
```

Note: Array (not paginated), sorted by order ASC

### Update (200):
Same as create response

### Delete (204):
No content

---

## Key Implementation Details

✅ **YouTube URL Validation:**
- Accepts: watch URLs (`youtube.com/watch?v=`), shorts (`youtube.com/shorts/`), embeds (`youtube.com/embed/`), youtu.be links
- Regex pattern validates both http and https
- Custom validation rule `ValidYouTubeUrl`
- Error message: "يجب أن يكون الرابط رابط YouTube صحيحاً."

✅ **Order Field:**
- Auto-incremented on create if not provided (max existing order + 1)
- Required on update (must explicitly set)
- Minimum value: 1
- Used for sorting lessons within a course

✅ **Lesson Sorting:**
- Lessons returned sorted by order ASC
- Course::lessons() relationship uses orderBy('order')

✅ **Soft Deletes:**
- Deleted lessons hidden from list
- Data preserved for recovery

✅ **Course Relationship:**
- Lessons always created under a specific course
- Course ID determined from route parameter, not from request

✅ **Validation:**
- Title: required, max 200 characters
- Description: optional string
- YouTube URL: required, must pass custom validation rule
- Order: optional on create, required on update, min 1

---

## Important Notes

**Order Gaps:**
Lessons can have non-sequential order values (e.g., 1, 5, 10). This allows for easy insertion:
- To insert between order 1 and 5, use order 3
- No need to renumber existing lessons

**Auto-Order on Create:**
When creating a lesson without specifying order, it gets next sequential order:
- If course has lessons with order [1, 2, 5], new lesson gets order 6
- Uses `max('order')` approach, not sequential count

**YouTube URL Flexibility:**
Accepts all common YouTube URL formats:
- Long watch URLs: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Short URLs: `https://youtu.be/dQw4w9WgXcQ`
- Embed URLs: `https://www.youtube.com/embed/dQw4w9WgXcQ`
- Shorts: `https://www.youtube.com/shorts/dQw4w9WgXcQ`
- HTTP versions: `http://...` also valid

**Lesson Mutation:**
All fields can be updated except course_id (lessons don't change courses)
