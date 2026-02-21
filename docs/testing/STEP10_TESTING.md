# STEP 10 Testing Guide: Frontend Auth Integration with Sanctum

## Setup

### 1. Ensure Backend is Running

Start the Laravel dev server on port 8000:

```bash
cd e:\ITeacherApp\myapp
php artisan migrate:fresh --seed
php artisan serve
```

Expected output:
```
Laravel development server started: http://127.0.0.1:8000
```

The database is now seeded with:
- 1 admin user: email `admin@iteacher.test`, password `Admin@123456`

### 2. Start React Development Server

In a new terminal:

```bash
cd e:\ITeacherApp\myapp
npm run dev
```

Expected output shows Vite dev server on port 5173 (or similar):
```
VITE v5.x.x built in 234ms

➜ Local:   http://localhost:5173/
```

### 3. Access Frontend

Open browser to: **http://localhost:5173**

You should see the **ITeacher** login page in Arabic with:
- "الكود / البريد الإلكتروني" (Identifier) field
- "كلمة المرور" (Password) field
- "دخول" (Login) button
- ⚠️ NO role selector (previously removed in Step 10)

---

## Test 1: Login as Admin

### 1.1 Enter Admin Credentials

On the login page:
- **Identifier:** `admin@iteacher.test`
- **Password:** `Admin@123456`
- Click **دخول** (Login)

### 1.2 Expected Behavior

✅ Login succeeds with API call to `POST /api/auth/login`
✅ Token stored in localStorage under key `iteacher_auth`
✅ Redirected to `/admin/dashboard` (admin home page)
✅ Dashboard displays "المدير" (Admin) in user area
✅ Sidebar shows admin navigation: الرئيسية (Home), الطلاب (Students), الكورسات (Courses)

### 1.3 Verify Token Storage

Open browser **Developer Tools** (F12) → **Application** → **Local Storage**

You should see:
- Key: `iteacher_auth`
- Value: `{"token":"generated_token_here"}`

Example token format: Long string of alphanumeric characters and dashes (Sanctum token pattern)

### 1.4 Verify User Info

Check the top-right corner (desktop) or sidebar (mobile):
- User name displays as whatever was returned by `/api/auth/me`
- Role shows as "مدير" (Admin)

---

## Test 2: Create Test Student for Login

Before testing student login, create a student via the admin interface.

### 2.1 Navigate to Students Page

After logging in as admin, click **الطلاب** (Students) in sidebar.

### 2.2 Create Student

Click **إنشاء طالب جديد** (Create New Student) button.

Fill in:
- **الاسم**: Ahmed Hassan (أحمد حسن)
- **الهاتف**: 966501234567

Submit the form.

### 2.3 Note Credentials

The response shows:
```json
{
  "student": {
    "id": 1,
    "name": "Ahmed Hassan",
    "phone": "966501234567",
    "student_code": "STU-0001",
    "is_active": true
  },
  "generated_password": "RANDOM_PASSWORD_HERE"
}
```

**Store the generated_password** — you'll need it for login.

---

## Test 3: Login as Student

### 3.1 Logout as Admin

On the dashboard, locate the user info section (bottom of sidebar or top-right):
- Find the **خروج** (Logout) button
- Click it

Expected: Redirected to `/login`, localStorage cleared (no `iteacher_auth` key)

### 3.2 Login as Student

Back on login page, enter:
- **Identifier**: `STU-0001` (student code) OR `966501234567` (phone)
- **Password**: Use the `generated_password` from student creation

Click **دخول** (Login)

### 3.3 Expected Behavior

✅ Login succeeds
✅ Token stored in localStorage
✅ Redirected to `/student/courses` (student home page)
✅ Sidebar shows student navigation: كورساتي (My Courses)
✅ User name and "طالب" (Student) role displayed

### 3.4 Verify Student Isolation

Student should NOT be able to:
- See admin sidebar items (الطلاب, الكورسات)
- Access `/admin/*` routes directly
- If student tries to visit `/admin/dashboard`, they get "Access Denied" page

Test by:
1. Open browser console
2. Try to navigate to `http://localhost:5173/admin/dashboard` directly
3. Should redirect to `/login` or show Access Denied after auth check

---

## Test 4: Token Persistence

### 4.1 Refresh Page While Logged In

After logging in as admin:
1. Refresh the page (F5 or Ctrl+R)
2. Should NOT see login page
3. Should remain on current page with user data still displayed

**Why**: Token in localStorage is checked on app startup, `/api/auth/me` validates it, user state restored.

### 4.2 Close Tab and Reopen

1. Keep the dev server running
2. Close the browser tab (don't close browser)
3. Open new tab and go to `http://localhost:5173`
4. Should be logged in (localStorage persists across tabs)

**Why**: Tokens are domain-scoped in localStorage.

### 4.3 Simulate New Browser Session (Clear Storage)

1. Open DevTools → Application → Local Storage
2. Delete the `iteacher_auth` entry
3. Refresh page
4. Should be redirected to `/login`

**Why**: Without token, app redirects to login on startup.

---

## Test 5: Error Handling

### 5.1 Invalid Credentials

On login page:
- **Identifier**: `admin@iteacher.test`
- **Password**: `WrongPassword123`

Expected:
- ❌ Error message: "بيانات الدخول غير صحيحة" (Invalid credentials)
- ❌ User NOT logged in
- ❌ Remain on login page
- ❌ No token stored

### 5.2 Non-existent User

On login page:
- **Identifier**: `STU-9999` (doesn't exist)
- **Password**: `anything`

Expected:
- ❌ Error message: "بيانات الدخول غير صحيحة" (Invalid credentials)
- ❌ Remain on login page

### 5.3 Empty Fields

On login page:
- Leave Identifier blank
- Click **دخول** (Login)

Expected:
- ❌ Error message: "الرجاء إدخال بيانات الدخول" (Please enter credentials)
- ❌ No API call made

### 5.4 Network Error (Backend Down)

1. Stop the Laravel dev server
2. Try to login
3. Browser will show connection error

Expected:
- ❌ Error message like "فشل تسجيل الدخول" (Login failed)
- ❌ No token stored
- ❌ Remain on login page

Restart Laravel server afterward.

---

## Test 6: Logout Flow

### 6.1 Login as Admin or Student

Follow Test 1 or Test 3 to get authenticated.

### 6.2 Logout

Find logout button:
- **Desktop**: Bottom of sidebar
- **Mobile**: Click hamburger menu, scroll to user section, click **خروج**

Click it.

Expected:
- ✅ API call to `POST /api/auth/logout` (may not show in Network tab if 204 response)
- ✅ Token deleted from localStorage (check DevTools → Application → Local Storage)
- ✅ Redirected to `/login` page
- ✅ User state cleared
- ✅ Can login again with different user

### 6.3 Verify Logout Side Effects

After logout:
1. Try to refresh the page
2. Should stay on `/login` (not redirect)
3. Try to access `/admin/dashboard` or `/student/courses`
4. Should redirect to `/login`

**Why**: Without token, routes are protected.

---

## Test 7: Invalid/Expired Token Handling

### 7.1 Simulate Expired Token

1. Login as admin (get token in localStorage)
2. Open DevTools → Application → Local Storage
3. Manually edit `iteacher_auth` to invalid token:
   ```json
   {"token": "invalid_token_12345"}
   ```
4. Refresh page

Expected:
- ❌ App detects invalid token via `/api/auth/me` call
- ❌ Token cleared from localStorage
- ❌ Redirected to `/login`
- ❌ "Unauthenticated" or similar error may appear briefly

### 7.2 Verify Recovery

After redirecting to login:
- Login again with correct credentials
- Should work normally (no residual errors)

---

## Test 8: Role-Based Access Control

### 8.1 Student Cannot Access Admin Routes

1. Login as student
2. Try to access `http://localhost:5173/admin/dashboard`

Expected:
- ❌ May redirect to `/student/courses` OR
- ❌ Show "Access Denied" page with Arabic message "غير مصرح"

3. Try to access `http://localhost:8000/api/admin/students` (direct to backend)

Expected:
- ❌ 403 Forbidden response from API
- Backend returns: `{"message": "غير مصرح"}`

### 8.2 Admin Cannot Access Student Routes

1. Logout and login as admin
2. Try to access `http://localhost:5173/student/courses`

Expected:
- ❌ May redirect to `/admin/dashboard` OR
- ❌ Show "Access Denied" page

### 8.3 Middleware Enforcement Paths

Test these endpoints directly via curl:

```bash
# Get admin token (from login)
TOKEN="your_admin_token"

# Try to access admin endpoint as admin → 200 OK
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Logout and get student token
STUDENT_TOKEN="your_student_token"

# Try same endpoint as student → 403 Forbidden
curl -X GET http://localhost:8000/api/admin/dashboard \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Try with no token → 401 Unauthorized
curl -X GET http://localhost:8000/api/admin/dashboard
```

---

## Test 9: Multiple Tabs/Windows

### 9.1 Login in Tab 1

1. Open `http://localhost:5173` in **Tab 1**
2. Login as admin
3. Note token in localStorage

### 9.2 Logout in Tab 2

1. Open `http://localhost:5173` in **Tab 2** (same domain)
2. Also logged in automatically (shared localStorage)
3. Click logout

### 9.3 Verify Logout in Tab 1

1. Switch to **Tab 1**
2. Refresh page
3. Should redirect to `/login` (token was deleted in Tab 2)

**Why**: localStorage is shared across tabs in same domain.

---

## Test 10: Loading State

### 10.1 Monitor Network During Login

1. Open DevTools → **Network** tab
2. On login page, enter credentials slowly
3. Click **دخول** (Login)
4. Button should show "جاري تسجيل الدخول..." (Logging in...) during request
5. After response, button returns to "دخول"

### 10.2 Monitor Network During Page Load with Valid Token

1. Login successfully
2. Close DevTools
3. Open DevTools → **Network** tab
4. Refresh page
5. Should see:
   - Page request (app.css, app.js, etc.)
   - API call to `/api/auth/me` to validate token
   - If valid, renders app; if invalid, redirects to login

### 10.3 Slow Connection Test (Chrome DevTools)

1. Open DevTools → **Network** tab
2. Set throttle to "Slow 3G" (simulates slow network)
3. Try to login
4. Should see:
   - Button disabled during request
   - Loading state visible
   - Proper error handling if request fails

---

## API Endpoints Called During Test

| Endpoint              | Method | Called When           | Response                      |
|-----------------------|--------|:----------------------|:------------------------------|
| `/api/auth/login`     | POST   | Login form submit      | `{user, token}`               |
| `/api/auth/me`        | GET    | App startup (if token) | `{user}`                      |
| `/api/auth/logout`    | POST   | Logout button          | `204 No Content`              |
| `/api/admin/students` | POST   | Create student (admin) | `{student, generated_password}` |

---

## Success Criteria for Step 10

✅ Login with real Sanctum API (not fake auth)
✅ Token stored in localStorage and reused across page refreshes
✅ Role selector removed from login page (role determined by API)
✅ Error handling with Arabic messages
✅ Loading states during API calls
✅ Logout clears token and redirects to login
✅ Protected routes enforce role-based access (admin/student)
✅ Token validation on app startup via `/api/auth/me`
✅ Graceful handling of invalid/expired tokens
✅ Proper CORS/preflight handling (Sanctum ready)

---

## Architecture Summary

### AuthContext (resources/js/context/AuthContext.jsx)
- Manages user state and auth flow
- Exposes: `user`, `login()`, `logout()`, `loading`, `error`
- Validates token on mount via `fetchMe()`

### Auth API Module (resources/js/api/auth.js)
- Centralizes all auth-related API calls
- Handles token storage/retrieval/deletion
- Manages request headers (Authorization)
- Handles error responses (401, 422, etc.)

### LoginPage (resources/js/pages/auth/LoginPage.jsx)
- Collects identifier + password
- Calls `login()` from AuthContext
- Shows error messages
- Shows loading state during authentication

### ProtectedRoute (resources/js/router/ProtectedRoute.jsx)
- Guards routes by role
- Shows loading spinner during auth initialization
- Redirects unauthenticated users to `/login`
- Block wrong role with Access Denied page

### AppShell (resources/js/components/AppShell.jsx)
- Renders authenticated layout (sidebar + main)
- Displays user info and logout button
- Handles logout navigation

---

## Troubleshooting

### Issue: CORS errors
**Solution**: Ensure Laravel is running on `http://localhost:8000`. React dev server on `http://localhost:5173` must be able to fetch from Laravel endpoint.

### Issue: Blank login page
**Solution**: Check if React dev server is running (`npm run dev`). Check browser console (F12) for errors.

### Issue: "Unauthenticated" after login
**Solution**: Ensure `/api/auth/login` returns a `token` field. Check backend DatabaseSeeder and admin credentials in .env match.

### Issue: Token not persisting across refresh
**Solution**: Check if localStorage is enabled in browser. Check DevTools → Application → Local Storage for `iteacher_auth` key.

### Issue: "صفحة غير متاحة" (Access Denied) for correct role
**Solution**: Ensure user role from API matches the route's expected role (admin/student). Check `/api/auth/me` response has correct `role` field.

---

## Sample curl Tests (Backend Verification)

These verify the API is returning correct data for frontend to consume:

### Test Admin Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@iteacher.test",
    "password": "Admin@123456"
  }'
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "role": "admin",
    "name": "Admin User",
    "email": "admin@iteacher.test"
  },
  "token": "generated_token_string"
}
```

### Verify Token Works
```bash
TOKEN="returned_token_from_above"

curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "role": "admin",
    "name": "Admin User",
    "email": "admin@iteacher.test"
  }
}
```

