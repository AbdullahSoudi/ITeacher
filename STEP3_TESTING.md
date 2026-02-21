# STEP 3 — Admin Students CRUD Testing Guide

## Overview
This guide provides curl commands to test all Step 3 endpoints.

## Prerequisites
1. Database initialized: `php artisan migrate:fresh --seed`
2. Laravel server running: `php artisan serve --port=8000`
3. Admin user seeded with credentials:
   - Email: `admin@iteacher.test`
   - Password: `Admin@123456`

## Test Sequence

### 1. Login as Admin
Get an auth token for subsequent requests:

```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@iteacher.test",
    "password": "Admin@123456"
  }' | jq -r '.token')

echo "Token: $TOKEN"
```

Or using Windows PowerShell:
```powershell
$response = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"identifier":"admin@iteacher.test","password":"Admin@123456"}'

$TOKEN = ($response.Content | ConvertFrom-Json).token
Write-Host "Token: $TOKEN"
```

### 2. Create a Student (with one-time password)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "أحمد محمد",
    "phone": "0501234567"
  }' | jq
```

Expected response (201):
```json
{
  "student": {
    "id": 2,
    "name": "أحمد محمد",
    "phone": "0501234567",
    "student_code": "STU-0001",
    "is_active": true,
    "role": "student"
  },
  "generated_password": "AbCdEf1234"
}
```

**IMPORTANT:** Save the `generated_password` — it's shown only once!

### 3. Create Another Student

```bash
curl -X POST http://127.0.0.1:8000/api/admin/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "فاطمة علي",
    "phone": "0509876543"
  }' | jq
```

### 4. List All Students (with pagination)

```bash
curl -X GET "http://127.0.0.1:8000/api/admin/students" \
  -H "Authorization: Bearer $TOKEN" | jq
```

Expected: Paginated list with `data` array and `pagination` info

### 5. Search Students by Name

```bash
curl -X GET "http://127.0.0.1:8000/api/admin/students?search=أحمد" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 6. Search Students by Phone

```bash
curl -X GET "http://127.0.0.1:8000/api/admin/students?search=0501234567" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 7. Search Students by Student Code

```bash
curl -X GET "http://127.0.0.1:8000/api/admin/students?search=STU-0001" \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 8. Get Student Details

```bash
curl -X GET http://127.0.0.1:8000/api/admin/students/2 \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 9. Update Student (name and/or phone)

```bash
curl -X PUT http://127.0.0.1:8000/api/admin/students/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "أحمد محمد علي",
    "phone": "0505555555",
    "is_active": true
  }' | jq
```

### 10. Deactivate Student (disable login)

```bash
curl -X PUT http://127.0.0.1:8000/api/admin/students/2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "أحمد محمد علي",
    "phone": "0505555555",
    "is_active": false
  }' | jq
```

### 11. Reset Student Password

```bash
curl -X POST http://127.0.0.1:8000/api/admin/students/2/reset-password \
  -H "Authorization: Bearer $TOKEN" | jq
```

Expected response (200):
```json
{
  "generated_password": "NewPassword123"
}
```

**IMPORTANT:** Provide this new password to the student securely!

### 12. Delete Student (Soft Delete)

```bash
curl -X DELETE http://127.0.0.1:8000/api/admin/students/2 \
  -H "Authorization: Bearer $TOKEN" 
```

Expected: 204 No Content

### 13. Verify Deleted Student is Hidden

```bash
curl -X GET "http://127.0.0.1:8000/api/admin/students" \
  -H "Authorization: Bearer $TOKEN" | jq
```

Student with ID 2 should no longer appear in the list (soft delete).

---

## Validation Tests

### Test 1: Duplicate Phone Number (should fail)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "طالب جديد",
    "phone": "0501234567"
  }' | jq
```

Expected: 422 Unprocessable Entity with error about phone being unique

### Test 2: Missing Required Field (should fail)

```bash
curl -X POST http://127.0.0.1:8000/api/admin/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "طالب بدون رقم"
  }' | jq
```

Expected: 422 with validation error about phone being required

### Test 3: Unauthorized Access (no token)

```bash
curl -X GET http://127.0.0.1:8000/api/admin/students
```

Expected: 401 Unauthorized

### Test 4: Wrong Role (student trying to access admin endpoint)

First login as a student, then try to access admin students endpoint:
```bash
# This would require creating a student with a password, but in Step 3
# we only created them with one-time passwords
# Skip this test for now (will be tested in Step 7)
```

---

## Key Implementation Details

✅ **Student Code Generation:** `STU-` + 4-digit zero-padded number  
✅ **One-Time Password:** 10 random alphanumeric characters  
✅ **Pagination:** 15 students per page  
✅ **Search:** Searches name, phone, or student_code simultaneously  
✅ **Soft Delete:** Deleted students don't appear in list but can be recovered  
✅ **Validation:** Phone unique per existing and deleted students  
✅ **Rate Limiting:** Login endpoint has throttle:5,1  

---

## Response Format (All Students Endpoints)

**Create/Store (201):**
```json
{
  "student": { id, name, phone, student_code, is_active, role },
  "generated_password": "plaintext (one-time)"
}
```

**List/Index (200):**
```json
{
  "data": [{ id, name, phone, student_code, is_active, role, enrollments_count }, ...],
  "links": { first, last, prev, next },
  "meta": { current_page, from, to, total, per_page, last_page, path }
}
```

**Show (200):**
```json
{
  "id": 2,
  "name": "أحمد محمد",
  "phone": "0501234567",
  "student_code": "STU-0001",
  "is_active": true,
  "enrollments": [{ id, course: { id, title, is_active } }, ...],
  "enrollments_count": 0
}
```

**Update (200):**
Same as show

**Delete (204):**
No content

**Reset Password (200):**
```json
{
  "generated_password": "plaintext (one-time)"
}
```
