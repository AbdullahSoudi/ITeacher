# STEP 12 Testing Guide: Admin Courses + Lessons UI

## Setup

### 1. Ensure Backend is Running

```bash
cd e:\ITeacherApp\myapp
php artisan migrate:fresh --seed
php artisan serve
```

### 2. Start Frontend Dev Server

```bash
npm run dev
```

### 3. Login as Admin

Navigate to `http://localhost:5173`

Login with:
- **Identifier:** `admin@iteacher.test`
- **Password:** `Admin@123456`

---

## Test 1: Navigate to Courses Page

Click **الكورسات** (Courses) in the admin sidebar.

**Expected Result:**
- ✅ Navigate to `/admin/courses`
- ✅ Page title: "الكورسات" with subtitle "الكورسات والدروس"
- ✅ "إضافة كورس جديد" (Add New Course) button visible
- ✅ Empty state showing "لا توجد كورسات" (No courses yet)

---

## Test 2: Create First Course

### 2.1 Open Create Form

Click **+ إضافة كورس جديد** button

**Expected Result:**
- ✅ Modal opens with title "إضافة كورس جديد" (Add New Course)
- ✅ Form fields: "اسم الكورس" (Course Name) and "الوصف" (Description - optional)
- ✅ No "الكورس نشط" checkbox (only in edit mode)

### 2.2 Fill Course Form

Enter:
- **اسم الكورس:** Laravel Fundamentals (أساسيات Laravel)
- **الوصف:** Learn Laravel basics and structure (تعلم أساسيات Laravel والهيكل)

Click **إضافة الكورس** (Add Course)

**Expected Result:**
- ✅ API call to `POST /api/admin/courses`
- ✅ Modal closes
- ✅ Green toast: "تم إضافة الكورس بنجاح" (Course added successfully)
- ✅ Courses page reloads with new course visible

### 2.3 Verify Course Card

New course card should display:
- **Title:** Laravel Fundamentals
- **Description:** Learn Laravel basics... (truncated with line-clamp-2)
- **Status badge:** "نشط" (Active) - green
- **Stats:** "0 درس" (0 lessons), "0 طالب" (0 students)
- **Action buttons:** عرض الدروس (View Lessons), تعديل (Edit), حذف (Delete)

---

## Test 3: Create Multiple Courses

Repeat Test 2.1-2.3 with:

**Course 2:**
- Name: Advanced Laravel (Laravel متقدم)
- Description: Expert-level patterns (أنماط متقدمة)

**Course 3:**
- Name: React Basics (أساسيات React)
- Description: Frontend framework (إطار عمل الواجهة الأمامية)

**Expected Result after 3 courses:**
- ✅ All three courses display as grid cards
- ✅ Grid layout: 1 column mobile, 2-3 columns desktop
- ✅ No pagination controls (if 3 or fewer courses)
- ✅ Each card shows correct title, description, status, stats

---

## Test 4: Edit Course

### 4.1 Click Edit Button

On Laravel Fundamentals card, click **تعديل** (Edit) button

**Expected Result:**
- ✅ Modal opens with title "تعديل كورس" (Edit Course)
- ✅ Form fields pre-populated:
  - Title: "Laravel Fundamentals"
  - Description: "Learn Laravel basics..."
- ✅ New field appears: "الكورس نشط" (Course Active) checkbox - checked

### 4.2 Modify Course

Change:
- **Title:** Laravel Fundamentals - Complete Guide (가이드 المجموعة الكاملة)
- Keep description same
- Uncheck **الكورس نشط** checkbox

Click **حفظ التعديلات** (Save Changes)

**Expected Result:**
- ✅ API call to `PUT /api/admin/courses/{id}`
- ✅ Modal closes
- ✅ Green toast: "تم تحديث الكورس بنجاح" (Course updated)
- ✅ Course card updates:
  - Title: "Laravel Fundamentals - Complete Guide"
  - Status badge: "معطّل" (Inactive) - red background

### 4.3 Re-enable Course

Click **تعديل** again, check "الكورس نشط", save

**Expected Result:**
- ✅ Status badge returns to "نشط" (Active) - green
- ✅ Toast confirms update

---

## Test 5: Click "عرض الدروس" (View Lessons)

### 5.1 Navigate to Course Detail

On any course card, click **عرض الدروس** (View Lessons) button OR click the course title/description area

**Expected Result:**
- ✅ Navigate to `/admin/courses/{courseId}`
- ✅ Page shows:
  - Back arrow button linking to `/admin/courses`
  - Course title as main heading
  - Course description below title
  - Status badge (green/red)
  - "تعديل الكورس" (Edit Course) and "حذف الكورس" (Delete Course) buttons
- ✅ "الدروس" (Lessons) section with counter: "0 من الدروس" (0 lessons)
- ✅ "+ إضافة درس" (Add Lesson) button
- ✅ Empty state: "لا توجد دروس بعد" (No lessons yet)

---

## Test 6: Create First Lesson

### 6.1 Click Add Lesson

On course detail page, click **+ إضافة درس** button

**Expected Result:**
- ✅ Modal opens with title "إضافة درس جديد" (Add New Lesson)
- ✅ Form fields visible:
  - "عنوان الدرس" (Lesson Title) - required
  - "الوصف" (Description) - optional
  - "رابط YouTube" (YouTube URL) - required
- ✅ NO "ترتيب الدرس" (Lesson Order) field in create mode

### 6.2 Fill Lesson Form

Enter:
- **عنوان الدرس:** Getting Started with Laravel (البدء مع Laravel)
- **الوصف:** Introduction to Laravel basics (مقدمة لأساسيات Laravel)
- **رابط YouTube:** https://www.youtube.com/watch?v=3RUMf50-r8g

As you type YouTube URL:
- ✅ Real-time validation shows no error if URL is valid
- ✅ If URL is invalid, red error appears below field

Click **إضافة الدرس** (Add Lesson)

**Expected Result:**
- ✅ API call to `POST /api/admin/courses/{courseId}/lessons`
- ✅ Modal closes
- ✅ Green toast: "تم إضافة الدرس بنجاح" (Lesson added)
- ✅ Lessons section updates:
  - Counter: "1 من الدروس"
  - New lesson card appears with:
    - Order badge: "#1"
    - Title: "Getting Started with Laravel"
    - Description: "Introduction to..."
    - YouTube link: "🔗 عرض الفيديو" (View Video)
    - Edit and Delete buttons

---

## Test 7: YouTube URL Validation

### 7.1 Test Valid URLs

Create multiple lessons with different valid YouTube URL formats:

**URL 1 (Standard watch):**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
```
Expected: ✅ No error, lesson created

**URL 2 (youtu.be short):**
```
https://youtu.be/dQw4w9WgXcQ
```
Expected: ✅ No error, lesson created

**URL 3 (Embed):**
```
https://www.youtube.com/embed/dQw4w9WgXcQ
```
Expected: ✅ No error, lesson created

**URL 4 (YouTube Shorts):**
```
https://www.youtube.com/shorts/aqz-KE-bpKQ
```
Expected: ✅ No error, lesson created

### 7.2 Test Invalid URLs

Try to create lesson with:
- **URL:** https://example.com/video
- Expected: ❌ Red error: "رابط YouTube غير صحيح" (Invalid YouTube URL)
- ✅ Submit button disabled or prevents submission
- ✅ Form stays open for correction

Try to create lesson with:
- **URL:** (leave empty)
- Expected: ❌ Error: "رابط YouTube مطلوب" (YouTube URL required)

---

## Test 8: Create Multiple Lessons in Same Course

Add 2-3 more lessons to your course:

**Lesson 2:**
- Title: Routing and Controllers (التوجيه والتحكم)
- URL: https://www.youtube.com/watch?v=2dh6HmNPP-s
- Order auto-assigned as #2

**Lesson 3:**
- Title: Database and Models (قاعدة البيانات والنماذج)
- URL: https://youtu.be/YE3k27Heliw

**Expected Result:**
- ✅ All lessons appear in order (sorted by order field)
- ✅ Each lesson shows correct order badge (#1, #2, #3)
- ✅ Lessons section counter: "3 من الدروس"
- ✅ Lessons remain sorted by order ascending

---

## Test 9: Edit Lesson

### 9.1 Open Edit Form

On any lesson card, click **تعديل** (Edit) button

**Expected Result:**
- ✅ Modal opens with title "تعديل درس" (Edit Lesson)
- ✅ Form fields pre-populated:
  - Title: (current lesson title)
  - Description: (current description)
  - YouTube URL: (current URL)
- ✅ NEW field visible: "ترتيب الدرس" (Lesson Order) - required in edit mode, pre-filled with current order

### 9.2 Modify Lesson

Change lesson #2:
- **عنوان الدرس:** Advanced Routing and Middleware (التوجيه المتقدم والوسيط)
- **ترتيب الدرس:** 3 (change order to 3, pushing original #3 to fill gap)

Click **حفظ التعديلات** (Save Changes)

**Expected Result:**
- ✅ Validation: if order < 1, show error "الترتيب يجب أن يكون رقماً موجباً"
- ✅ API call to `PUT /api/admin/lessons/{id}`
- ✅ Green toast: "تم تحديث الدرس بنجاح" (Lesson updated)
- ✅ Lesson card updates:
  - Title: "Advanced Routing and Middleware"
  - Order updated to #3
- ✅ List re-sorts by order (may reorder if order numbers change)

---

## Test 10: Delete Lesson

### 10.1 Click Delete Button

On any lesson card, click **حذف** (Delete) button

**Expected Result:**
- ✅ Confirm Dialog appears with:
  - Title: "حذف الدرس"
  - Message: "هل تريد حذف هذا الدرس؟ لا يمكن التراجع..." (Do you want to delete this lesson? Cannot be undone.)
  - Cancel and Delete buttons

### 10.2 Cancel Delete

Click **إلغاء** (Cancel)

**Expected Result:**
- ✅ Dialog closes
- ✅ Lesson still visible in list
- ✅ No API call made

### 10.3 Confirm Delete

Click **حذف** again, then confirm with **حذف** button

**Expected Result:**
- ✅ Button shows loading "جاري..."
- ✅ API call to `DELETE /api/admin/lessons/{id}`
- ✅ Green toast: "تم حذف الدرس" (Lesson deleted)
- ✅ Lesson card disappears from list
- ✅ Counter updates (e.g., "1 من الدروس" if 1 lesson left)

---

## Test 11: Delete Course

### 11.1 From Course Detail Page

On course detail page, click **حذف الكورس** (Delete Course) button

**Expected Result:**
- ✅ Confirm Dialog with message including "سيتم حذف جميع الدروس المرتبطة به" (All lessons will be deleted)

Cancel the dialog.

### 11.2 Confirm Delete

Click **حذف الكورس** again, confirm with **حذف**

**Expected Result:**
- ✅ Green toast: "تم حذف الكورس" (Course deleted)
- ✅ Redirect to `/admin/courses` page
- ✅ Course no longer in list
- ✅ Remaining courses still visible

---

## Test 12: Form Validation

### 12.1 Missing Course Name

Try to create course with:
- **اسم الكورس:** (leave empty)
- **الوصف:** Some description

Click **إضافة الكورس**

**Expected Result:**
- ❌ Red error below title field: "اسم الكورس مطلوب" (Course name required)
- ✅ No API call
- ✅ Form stays open

### 12.2 Course Name Too Long

Try to create with:
- **اسم الكورس:** [200+ character string]

**Expected Result:**
- ❌ Error: "اسم الكورس لا يزيد عن 200 حرف" (Name max 200 chars)

### 12.3 Missing Lesson Title

Try to add lesson with:
- **عنوان الدرس:** (empty)
- **رابط YouTube:** https://www.youtube.com/watch?v=xyz

**Expected Result:**
- ❌ Error: "عنوان الدرس مطلوب" (Lesson title required)

### 12.4 Missing Lesson YouTube URL

Try to add lesson with:
- **عنوان الدرس:** Some Title
- **رابط YouTube:** (empty)

**Expected Result:**
- ❌ Error: "رابط YouTube مطلوب" (YouTube URL required)

### 12.5 Invalid Lesson Order (Edit Mode)

Edit a lesson and set:
- **ترتيب الدرس:** 0 or -1

**Expected Result:**
- ❌ Error: "الترتيب يجب أن يكون رقماً موجباً" (Order must be positive)

---

## Test 13: Error Handling

### 13.1 Network Error

Stop Laravel dev server

Try to create a course

**Expected Result:**
- ✅ Loading state shows
- ✅ Red toast: "فشل إضافة الكورس" (Failed to add course)
- ✅ Modal stays open for retry

Restart Laravel server

---

## Test 14: Pagination (if applicable)

Create 20+ courses (if possible for testing)

**Expected Result:**
- ✅ Only 15 courses show per page
- ✅ Pagination controls appear at bottom: "السابق" | "صفحة X من Y" | "التالي"
- ✅ Click "التالي" to load next page
- ✅ Click "السابق" to go back
- ✅ Buttons disabled on first/last page

---

## Test 15: Navigation and Back Button

### 15.1 From Courses List

Click on course "عرض الدروس" to go to detail page

**Expected Result:**
- ✅ Navigate to `/admin/courses/{id}`

Click back arrow button at top-left

**Expected Result:**
- ✅ Navigate back to `/admin/courses`
- ✅ Course list visible again

### 15.2 Direct URL Access

Manually navigate to `http://localhost:5173/admin/courses/999` (non-existent course)

**Expected Result:**
- ✅ Loading spinner shows briefly
- ✅ "لم يتم العثور على الكورس" (Course not found) message
- ✅ Link to return to courses

---

## Test 16: Responsive Design (Mobile)

Open DevTools, toggle device toolbar (Ctrl+Shift+M) to mobile size

**On Courses List Page:**
- ✅ Grid collapsed to 1 column
- ✅ Course cards full width
- ✅ Buttons stack properly
- ✅ Course title and description readable

**On Course Detail Page:**
- ✅ Header layout stacks properly
- ✅ Lesson list scrollable
- ✅ Action buttons accessible
- ✅ Modals center and are scrollable

---

## Test 17: RTL Alignment

Verify throughout:
- ✅ All Arabic text right-aligned
- ✅ Forms have proper RTL layout
- ✅ Buttons align correctly
- ✅ Icons positioned appropriately for RTL

---

## Success Criteria for Step 12

✅ **Courses List** - Display all courses in grid cards with title, description, status, stats
✅ **Create Course** - Form modal, validation, API integration
✅ **Edit Course** - Update fields, toggle active/inactive
✅ **Delete Course** - Confirmation dialog, soft delete, redirect
✅ **Course Detail** - View lessons page with back navigation
✅ **Create Lesson** - Form with YouTube URL field, real-time validation
✅ **Edit Lesson** - Update title/description/URL/order
✅ **Delete Lesson** - Confirmation and deletion
✅ **YouTube Validation** - Accept watch/youtu.be/embed/shorts URLs, reject invalid
✅ **Lesson Ordering** - Lessons display sorted by order ascending
✅ **Form Validation** - All required fields validated with Arabic messages
✅ **Error Handling** - Network errors show red toast notifications
✅ **Loading States** - Buttons show "جاري..." during API calls
✅ **Empty States** - Friendly messages when no courses/lessons
✅ **Toast Notifications** - Success/error messages with auto-dismiss
✅ **Pagination** - Works if courses > 15 per page
✅ **RTL UI** - Full right-to-left layout throughout
✅ **Responsive** - Mobile-friendly with proper scaling

---

## API Endpoints Called

All authenticated with Bearer token:

| Action | Method | Endpoint | Body | Response |
|--------|--------|----------|------|----------|
| List courses | GET | /api/admin/courses?page=X | - | Paginated courses |
| Get course | GET | /api/admin/courses/{id} | - | {course} |
| Create course | POST | /api/admin/courses | {title, description, is_active} | {course} |
| Update course | PUT | /api/admin/courses/{id} | {title, description, is_active} | {course} |
| Delete course | DELETE | /api/admin/courses/{id} | - | 204 |
| Get lessons | GET | /api/admin/courses/{courseId}/lessons | - | Lessons array |
| Create lesson | POST | /api/admin/courses/{courseId}/lessons | {title, description, youtube_url, order?} | {lesson} |
| Update lesson | PUT | /api/admin/lessons/{id} | {title, description, youtube_url, order} | {lesson} |
| Delete lesson | DELETE | /api/admin/lessons/{id} | - | 204 |

