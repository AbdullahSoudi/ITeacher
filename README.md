# ITeacher

A private LMS (Learning Management System) for a single teacher to manage students, courses, and video-based lessons. The admin creates student accounts, organises courses with YouTube lessons, controls enrollments, and tracks lesson completion per student.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12 |
| Authentication | Laravel Sanctum 4.3 (Bearer token) |
| Frontend | React 19, React Router v7 |
| Styling | Tailwind CSS v4 |
| Database | SQLite |
| Build | Vite 7, laravel-vite-plugin |
| Runtime | PHP 8.2+ |

---

## Project Structure

```
app/
  Http/
    Controllers/Api/
      Auth/           AuthController (login, logout, me)
      Admin/          DashboardController, StudentController,
                      CourseController, LessonController,
                      EnrollmentController
      Student/        CourseController, LessonController,
                      ProgressController
    Middleware/
      EnsureUserIsAdmin.php
      EnsureUserIsStudent.php
  Models/
    User.php, Course.php, Lesson.php,
    Enrollment.php, LessonProgress.php

database/
  migrations/         Schema definitions for all tables
  seeders/
    AdminSeeder.php   Creates admin account from .env values
    DatabaseSeeder.php

routes/
  api.php             All API routes (auth, admin, student)

resources/
  css/app.css         Tailwind entry
  js/
    app.jsx           React entry — mounts AuthProvider + BrowserRouter + AppRoutes
    api/
      client.js       Shared fetch wrapper (Bearer token, 401 handling, 204 handling)
      auth.js         login, logout, fetchMe, token storage helpers
      admin/
        dashboard.js  fetchDashboard
        students.js   CRUD + resetPassword
        courses.js    CRUD + fetchCourseStudents
        lessons.js    CRUD + validateYouTubeUrl
        enrollments.js enroll, revoke, fetchStudentEnrollments
      student/
        courses.js    fetchMyCourses, fetchCourse
        lessons.js    fetchLesson, extractYouTubeVideoId
        progress.js   markLessonComplete
    context/
      AuthContext.jsx Global auth state (user, login, logout, loading)
    router/
      ProtectedRoute.jsx Role guard — redirects or renders AccessDeniedPage
      routes.jsx         All route definitions in one place
    components/
      layout/
        AppShell.jsx  Shared shell with nav and Outlet
      ui/             Button, Card, Badge, Toast, ConfirmDialog,
                      EmptyState, LoadingSkeleton
      admin/          StudentForm, CourseForm, LessonForm,
                      CredentialsModal, StudentEnrollmentsModal
    pages/
      shared/         LoginPage, AccessDeniedPage
      admin/          DashboardPage, StudentsPage, StudentDetailPage,
                      CoursesPage, CourseDetailPage
      student/        MyCoursesPage, CourseDetailPage, LessonPlayerPage
```

---

## Features (Phase 1)

- **Admin login** via email and password
- **Student login** via auto-generated student code and password
- **Student management** — create, view, update, soft delete, reset password
- **Course management** — create, view, update, soft delete, activate/deactivate
- **Lesson management** — create, view, update, soft delete, ordered within course
- **Enrollment management** — enroll student in one or more courses, revoke enrollment
- **Dashboard metrics** — active students, active courses, total lessons, total enrollments, total lesson completions
- **Lesson player** — embedded YouTube video with previous/next navigation
- **Lesson completion tracking** — student marks a lesson complete; progress shown per course

---

## Authentication

**Admin** logs in with an email address set in `.env`.

**Students** log in with a `student_code` (auto-generated, format `STU-0001`) and a system-generated password shown once at creation.

The login endpoint accepts a single `identifier` field and tries `student_code` first, then `email`.

On successful login the backend returns a Sanctum plain-text token. The frontend stores it in `localStorage` under the key `iteacher_auth` as `{ "token": "..." }`.

Every subsequent request attaches the token as `Authorization: Bearer <token>`.

On logout the backend deletes the token (`204 No Content`) and the frontend clears `localStorage`.

On `401` the API client clears the stored token automatically.

Tokens do not expire (Sanctum `expiration: null`).

Route protection is enforced on two levels:
- **Backend** — `auth:sanctum` + `admin` or `student` middleware on every protected route
- **Frontend** — `ProtectedRoute` component checks `user.role`; wrong role renders `AccessDeniedPage`

---

## API Overview

All routes are prefixed with `/api`.

### Auth

```
POST   /api/auth/login              Authenticate; returns token + user object
POST   /api/auth/logout             Delete current token (returns 204)
GET    /api/auth/me                 Return current authenticated user
```

Login is throttled to 5 requests per minute per IP.

### Admin

All routes require `auth:sanctum` + `EnsureUserIsAdmin`.

```
GET    /api/admin/dashboard                              Metrics summary

GET    /api/admin/students                               Paginated list; ?search= supported
POST   /api/admin/students                               Create student; returns generated_password
GET    /api/admin/students/{student}                     Student detail with enrollments
PUT    /api/admin/students/{student}                     Update name, phone, is_active
DELETE /api/admin/students/{student}                     Soft delete
POST   /api/admin/students/{student}/reset-password      Generate new password; returns it once

GET    /api/admin/students/{student}/enrollments         Enrolled courses for student
POST   /api/admin/students/{student}/enroll              Bulk enroll in courses (course_ids[])
DELETE /api/admin/students/{student}/enroll/{course}     Revoke one enrollment

GET    /api/admin/courses                                Paginated list with lesson/enrollment counts
POST   /api/admin/courses                                Create course
GET    /api/admin/courses/{course}                       Course detail with lessons
PUT    /api/admin/courses/{course}                       Update course
DELETE /api/admin/courses/{course}                       Soft delete
GET    /api/admin/courses/{course}/students              Enrolled students for course

GET    /api/admin/courses/{course}/lessons               Lessons for course (ordered)
POST   /api/admin/courses/{course}/lessons               Add lesson to course
PUT    /api/admin/lessons/{lesson}                       Update lesson
DELETE /api/admin/lessons/{lesson}                       Soft delete lesson
```

### Student

All routes require `auth:sanctum` + `EnsureUserIsStudent`.

```
GET    /api/student/courses                    Enrolled active courses with per-course progress
GET    /api/student/courses/{course}           Course detail with lessons and is_completed per lesson
GET    /api/student/lessons/{lesson}           Lesson detail with is_completed, prev/next lesson IDs
POST   /api/student/lessons/{lesson}/complete  Mark lesson complete (idempotent)
```

---

## Database Schema

### users
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| role | enum(admin, student) | default: student |
| name | string(150) | |
| phone | string(30) | nullable |
| email | string(150) | nullable; used for admin login |
| student_code | string(30) | nullable, unique; used for student login |
| password | string | bcrypt hashed |
| is_active | boolean | default: true |
| deleted_at | timestamp | soft delete |

### courses
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| title | string(200) | |
| description | text | nullable |
| is_active | boolean | default: true |
| deleted_at | timestamp | soft delete |

### lessons
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| course_id | FK → courses | cascade delete |
| title | string(200) | |
| description | text | nullable |
| youtube_url | text | full YouTube URL |
| order | integer | default: 1; indexed with course_id |
| deleted_at | timestamp | soft delete |

### enrollments
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| user_id | FK → users | cascade delete |
| course_id | FK → courses | cascade delete |
| | | unique(user_id, course_id) |

### lesson_progress
| Column | Type | Notes |
|---|---|---|
| id | bigint PK | |
| user_id | FK → users | cascade delete |
| lesson_id | FK → lessons | cascade delete |
| is_completed | boolean | default: false |
| completed_at | datetime | nullable |
| | | unique(user_id, lesson_id) |

---

## Local Setup

**Prerequisites:** PHP 8.2+, Composer, Node.js 18+, a local web server (Laravel Herd, Valet, or `php artisan serve`).

```bash
# 1. Install PHP dependencies
composer install

# 2. Copy and configure environment
cp .env.example .env
php artisan key:generate
```

Edit `.env`:

```env
APP_NAME=ITeacher
APP_URL=http://iteacher.test      # or http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
DB_FOREIGN_KEYS=true

SESSION_DRIVER=file
CACHE_STORE=file

ADMIN_EMAIL=admin@iteacher.test
ADMIN_PASSWORD=YourSecurePassword
```

```bash
# 3. Create the SQLite database file
touch database/database.sqlite

# 4. Run migrations and seed the admin account
php artisan migrate
php artisan db:seed

# 5. Install and build frontend assets
npm install
npm run build

# 6. Start the application
#    Option A — virtual host (Herd / Valet)
#    Point the vhost document root to: public/

#    Option B — built-in server
php artisan serve
# Visit http://localhost:8000
```

Alternatively, `composer setup` runs steps 1–5 in one command (see `composer.json`).

### Development mode

Run all services concurrently (server, queue worker, log viewer, Vite HMR):

```bash
composer dev
```

---

## Default Credentials

The admin account is created by `AdminSeeder` using the values in `.env`. No credentials are hardcoded in the codebase.

For a default local setup using the example values:

| Field | Value |
|---|---|
| Login identifier | `admin@iteacher.test` |
| Password | `Admin@123456` |

Change `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` before sharing the project or deploying.

---

## Development Notes

**Adding a new admin page**

1. Create the page component in `resources/js/pages/admin/`.
2. Add any API functions to the relevant module in `resources/js/api/admin/`.
3. Register the route in `resources/js/router/routes.jsx` inside the admin `ProtectedRoute` block.
4. Add the backend route in `routes/api.php` under the `admin` group.

**Adding a new student page**

Same pattern using `resources/js/pages/student/`, `resources/js/api/student/`, and the student route block in `routes.jsx`.

**Where API calls live**

All HTTP calls go through `resources/js/api/client.js` via `apiRequest`. Domain-specific modules in `api/admin/` and `api/student/` are the only files that call `apiRequest` directly. Pages import from these modules, never from `client.js` directly.

**Layout**

`components/layout/AppShell.jsx` wraps all authenticated pages. It reads the current user from `AuthContext` and renders a navigation bar above the page `<Outlet />`.

**Reusable UI components**

Generic components (Button, Card, Badge, Toast, ConfirmDialog, EmptyState, LoadingSkeleton) live in `components/ui/`. Admin-specific forms and modals live in `components/admin/`.

---

## Known Limitations (Phase 1)

- No payment or subscription system.
- No public student registration — the admin creates all student accounts.
- Single admin account only.
- Sanctum tokens never expire; there is no refresh token mechanism.
- Lessons support YouTube URLs only — no file uploads or other video providers.
- No email notifications (mailer is set to `log` driver).
- No student-facing search or filtering.
- Student progress is per-lesson only; there is no course-level certificate or completion record.

---

## Troubleshooting

**CORS or 419 errors**

Ensure `APP_URL` in `.env` exactly matches the domain you are accessing (including protocol and port). Sanctum derives stateful domains from this value.

**401 Unauthorized after login**

The stored token was deleted or invalidated. The API client clears `localStorage` automatically on `401`. Re-login to obtain a new token.

**SQLite "unable to open database file"**

The file `database/database.sqlite` does not exist. Create it:

```bash
touch database/database.sqlite
php artisan migrate
```

**Vite build errors**

Ensure `node_modules` is present (`npm install`), then run `npm run build`. The build entry points are `resources/js/app.jsx` and `resources/css/app.css`.

**Student cannot log in**

- Confirm the student's `is_active` is `true` (the admin can toggle this on the student detail page).
- The login identifier for students is the `student_code` (e.g. `STU-0001`), not an email address.
- The initial password is displayed once at creation and once on password reset — it is not stored in plain text and cannot be retrieved after closing the modal.
