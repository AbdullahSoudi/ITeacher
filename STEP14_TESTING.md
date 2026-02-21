# STEP 14 Testing Guide: Student Portal UI

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

### 3. Login as Student

Navigate to `http://localhost:5173`

This will redirect to `/login`. You need a student account. Use the admin panel to:
1. Login as admin with `admin@iteacher.test` / `Admin@123456`
2. Create a student (Students page)
3. Enroll that student in courses (via Enroll button)

Or check the database seeder to see if test student accounts exist.

**Alternative: Check database for test student**

If seeder created students, their credentials would be:
- Check database for `students` table
- Use one of the seeded student emails/phone numbers

For testing, you may need to create your own student account or check if the seeder creates them.

---

## Test 1: Navigate to Student Portal from Sidebar

### 1.1 Login as Student

Login with student credentials (adjust based on created students).

**Expected Result:**
- ✅ Redirected to `/student/courses` (MyCoursesPage)
- ✅ Sidebar shows "دوراتي" (My Courses) link highlighted
- ✅ No admin links visible (Students, Courses, Enrollments, Dashboard are hidden)

---

## Test 2: My Courses Page - No Enrollments

### 2.1 View Empty State

If student has 0 enrolled courses:

**Expected Result:**
- ✅ Page title: "دوراتي" with subtitle "الكورسات التي تعلمت فيها"
- ✅ Empty state shows:
  - 📚 emoji
  - Text: "لم تسجل بعد في أي كورس"
  - Subtitle: "تواصل مع الإدارة لتسجيلك في الكورسات"
- ✅ No course cards visible
- ✅ No loading spinner

---

## Test 3: Enroll Student in Courses (via Admin)

### 3.1 Switch to Admin and Enroll

Using admin account:
1. Go to **الطلاب** (Students)
2. Find student used for testing
3. Click **تسجيل** (Enroll)
4. Select 3+ courses
5. Click enroll button
6. Return to student portal

---

## Test 4: My Courses Page - With Enrollments

### 4.1 View Course Cards

After enrolling student in 3+ courses:

**Expected Result:**
- ✅ Page shows grid of course cards (1 col mobile, 2-3 cols desktop)
- ✅ Each card displays:
  - Blue gradient header (h-24)
  - Course title (large, bold)
  - Course description (line-clamp-2 if long)
  - Number of lessons: "X درس"
  - Progress bar below lessons count
  - Progress counter: "X / Y"
  - Progress percentage: "Z%"
  - Status badge: "لم يبدأ" (gray) for 0% progress
  - Click hint at bottom: "انقر لعرض الدروس →"

### 4.2 Verify Progress Indicators

If student hasn't started any lessons:

**Expected Result:**
- ✅ All progress bars at 0%
- ✅ All status badges show "لم يبدأ" (Not Started) in gray

### 4.3 Verify Card Styling

- ✅ Cards have shadow that increases on hover
- ✅ Cursor changes to pointer on hover
- ✅ Card styled with white background and gray border
- ✅ Bottom hint text visible in gray background

---

## Test 5: Click Course Card to View Lessons

### 5.1 Click on Course

Click anywhere on a course card (or the course title).

**Expected Result:**
- ✅ Navigate to `/student/courses/{courseId}`
- ✅ Page shows course detail with lessons list

---

## Test 6: Course Detail Page - View Lessons

### 6.1 View Course Header

Page displays:
- **Back Button**: "← العودة للكورسات"
- **Course Title**: Large, bold heading
- **Course Description**: Below title (if exists)
- **Progress Bar**: Shows X/Y lessons completed and percentage

**Expected Result:**
- ✅ All elements visible and aligned right (RTL)
- ✅ Back button navigates to `/student/courses`
- ✅ Progress updates if lessons are completed

### 6.2 View Lessons List

Below header, section titled "الدروس (X)" shows:

**Expected Result:**
- ✅ List of lessons in a white card container
- ✅ Each lesson row displays:
  - Order badge: Blue circle with "#1", "#2", etc.
  - Lesson title (right-aligned)
  - Lesson description (truncated to 1 line if long)
  - Status badge: "لم يشاهد" (gray) or "✓ تمت المشاهدة" (green)
  - Arrow: "←" on the left side (RTL)
- ✅ Cursor is pointer (clickable)
- ✅ Hover effect: slight background color change

### 6.3 All Lessons Shown

For course with 5 lessons:

**Expected Result:**
- ✅ Counter shows "الدروس (5)"
- ✅ All 5 lesson rows visible in correct order
- ✅ Order badges: #1, #2, #3, #4, #5 sequential

---

## Test 7: Click Lesson to Open Player

### 7.1 Click any Lesson Row

Click on any lesson in the list.

**Expected Result:**
- ✅ Navigate to `/student/lessons/{lessonId}`
- ✅ Page loads lesson player

---

## Test 8: Lesson Player Page - Layout

### 8.1 View Header Section

Page displays:
- **Back Button**: "← العودة للكورس"
- **Lesson Title**: Large heading
- **Course Name**: Smaller text below title
- **Lesson Description**: If exists
- **Status Badge**: "لم يشاهد" (gray) or "✓ تمت المشاهدة" (green)

**Expected Result:**
- ✅ All elements visible
- ✅ Back button navigates to `/student/courses/{courseId}`
- ✅ Status badge shows current state
- ✅ RTL layout aligns all text to right

### 8.2 View YouTube Player

Below header:

**Expected Result:**
- ✅ YouTube embed iframe displays (if valid URL)
- ✅ Player is responsive (aspect-video, full width)
- ✅ Video controls visible (play, pause, volume, fullscreen)
- ✅ Player has black background
- ✅ On mobile, player scales properly

---

## Test 9: YouTube Player Functionality

### 9.1 Play Video

Click play button on YouTube player.

**Expected Result:**
- ✅ Video plays in iframe
- ✅ Audio/video synchronized
- ✅ Scrub bar allows seeking
- ✅ Volume control works
- ✅ Fullscreen button available

### 9.2 Invalid or Missing Video URL

If lesson has no valid YouTube URL:

**Expected Result:**
- ✅ Placeholder shows: 🎬 emoji
- ✅ Text: "رابط الفيديو غير متاح"
- ✅ Player container still visible but non-functional

---

## Test 10: Mark Lesson as Complete

### 10.1 Click "تم المشاهدة" Button

On lesson player, click the **تم المشاهدة** (Mark Complete) button.

**Expected Result:**
- ✅ Button shows loading state: "جاري التحديث..." with spinner
- ✅ API call to `POST /api/student/lessons/{id}/complete`
- ✅ Green toast: "تم تحديث حالة المشاهدة" (Status updated)
- ✅ Button changes appearance:
  - Background: Green
  - Text: "✓ تمت المشاهدة"
  - Becomes disabled/non-clickable

### 10.2 Already Completed Lesson

Visit lesson that's already marked complete:

**Expected Result:**
- ✅ Button shows "✓ تمت المشاهدة" in green
- ✅ Button is disabled (grayed out, no hover effect)
- ✅ Clicking button does nothing

---

## Test 11: Progress Updates After Completion

### 11.1 Mark Lesson and Return to Course Detail

1. On lesson player, mark lesson as complete
2. Click back button to return to course detail
3. Observe progress bar

**Expected Result:**
- ✅ Course detail page reloaded with updated progress
- ✅ Progress bar percentage increased (e.g., 20% → 40%)
- ✅ Lessons completed counter increased
- ✅ Lesson row now shows "✓ تمت المشاهدة" badge in green

### 11.2 Return to My Courses Page

Click back button again to My Courses.

**Expected Result:**
- ✅ Course card progress bar updated
- ✅ Progress percentage shows new value
- ✅ If all lessons complete:
  - Progress: 100%
  - Status badge: "✓ اكتمل" (green)

---

## Test 12: Lesson Navigation (Prev/Next)

### 12.1 View Navigation Buttons

On lesson player, below video, check buttons:
- "الدرس السابق" (Previous) - right side
- "الدرس التالي" (Next) - left side

**Expected Result:**
- ✅ Both buttons visible if lesson has previous/next
- ✅ Buttons are gray background with gray text
- ✅ Buttons disabled (grayed + no-cursor) if no prev/next
- ✅ Buttons are full-width on mobile, auto-width on desktop

### 12.2 Navigate to Previous Lesson

If current lesson is #2+, click "الدرس السابق" button.

**Expected Result:**
- ✅ Navigate to previous lesson
- ✅ URL changes to `/student/lessons/{previousLessonId}`
- ✅ Page loads previous lesson player
- ✅ All content updates to previous lesson

### 12.3 Navigate to Next Lesson

Click "الدرس التالي" button.

**Expected Result:**
- ✅ Navigate to next lesson
- ✅ URL changes to `/student/lessons/{nextLessonId}`
- ✅ Page loads next lesson player
- ✅ All content updates to next lesson

### 12.4 First Lesson "Previous" Button

On lesson #1:

**Expected Result:**
- ✅ "الدرس السابق" button is disabled (grayed, no cursor)
- ✅ Clicking does nothing

### 12.5 Last Lesson "Next" Button

On last lesson in course:

**Expected Result:**
- ✅ "الدرس التالي" button is disabled (grayed, no cursor)
- ✅ Clicking does nothing

---

## Test 13: Error Handling

### 13.1 Network Error on My Courses

Stop Laravel server.

Reload My Courses page.

**Expected Result:**
- ✅ Red toast: "فشل تحميل الكورسات" (Failed to load courses)
- ✅ Page shows loading spinner or error state
- ✅ User can navigate elsewhere or retry

### 13.2 Network Error on Course Detail

Stop Laravel server.

Try to load course detail via URL or click.

**Expected Result:**
- ✅ Red toast: "فشل تحميل الكورس" (Failed to load course)
- ✅ Back button still navigates to courses

### 13.3 Network Error on Mark Complete

Stop Laravel server while on lesson player.

Click mark complete button.

**Expected Result:**
- ✅ Red toast: "فشل تحديث حالة المشاهدة" (Failed to update status)
- ✅ Button state reverts to "تم المشاهدة" (not completed)
- ✅ User can retry after server restarts

Restart server and retry.

### 13.4 Invalid Lesson ID

Navigate to `/student/lessons/999999` (non-existent).

**Expected Result:**
- ✅ Lesson not found message displayed
- ✅ Back button to courses available
- ✅ No errors in console

---

## Test 14: Responsive Design (Mobile)

Toggle device toolbar to mobile size (Ctrl+Shift+M).

### 14.1 My Courses Page on Mobile

**Expected Result:**
- ✅ Grid collapsed to 1 column
- ✅ Course cards full width
- ✅ Title and all content readable
- ✅ Progress bar visible
- ✅ Status badge clearly shown

### 14.2 Course Detail Page on Mobile

**Expected Result:**
- ✅ Back button accessible
- ✅ Course title readable
- ✅ Progress bar visible
- ✅ Lessons list scrollable
- ✅ Each lesson row wraps properly (order badge, content, status)

### 14.3 Lesson Player on Mobile

**Expected Result:**
- ✅ Video player responsive (full width, maintains aspect ratio)
- ✅ Controls visible and tappable
- ✅ Back button accessible
- ✅ Navigation buttons stack properly (full width on mobile)
- ✅ Mark complete button full width
- ✅ All text readable without horizontal scroll

---

## Test 15: RTL Layout Verification

Throughout all pages, verify:

**My Courses:**
- ✅ Page title right-aligned
- ✅ Course cards center-aligned in grid
- ✅ Text within cards right-aligned
- ✅ Progress bars LTR (left-to-right is correct for progress)

**Course Detail:**
- ✅ Back button left visual position
- ✅ Course title right-aligned
- ✅ Progress info right-aligned with percentage on right
- ✅ Lessons list:
  - Order badges on right
  - Content text right-aligned
  - Status badges on right
  - Arrow on far left

**Lesson Player:**
- ✅ Back button left position
- ✅ Lesson title right-aligned
- ✅ Course name right-aligned
- ✅ Description right-aligned
- ✅ Status badge on right
- ✅ Navigation buttons:
  - "الدرس السابق" on left visually (right-to-left reading)
  - "الدرس التالي" on right visually
  - "تم المشاهدة" button centered or right-aligned

---

## Test 16: Full Student Journey (Integration)

### 16.1 Complete Multi-Lesson Course

1. Login as student
2. Navigate to a course with 3+ lessons
3. Watch and mark each lesson complete in order
4. Return to My Courses
5. Verify course progress shows 100% and "اكتمل"

**Expected Results per step:**
- ✅ Step 2: Course card shows progress per lessons
- ✅ Step 3: Navigation flows smoothly between lessons
- ✅ Step 4: Progress bar increases with each completion
- ✅ Step 5: Course marked as complete in grid

### 16.2 Partial Course Progress

1. Enroll in 2 courses
2. Complete some lessons in Course A
3. Complete all lessons in Course B
4. Return to My Courses

**Expected Result:**
- ✅ Course A shows partial progress (e.g., 50%) with "جاري الدراسة" badge
- ✅ Course B shows 100% progress with "اكتمل" badge
- ✅ Course C (if any unstarted) shows 0% with "لم يبدأ" badge

---

## Test 17: Data Persistence Across Sessions

### 17.1 Mark Lessons and Reload Page

1. Mark lesson as complete
2. Press F5 or Ctrl+R to reload page
3. Check if status persisted

**Expected Result:**
- ✅ Button still shows "✓ تمت المشاهدة" in green
- ✅ Progress bar still shows updated percentage
- ✅ No double-marking when page reloads

### 17.2 Navigate Between Pages and Return

1. From lesson player, go back to course detail
2. Then back to My Courses
3. Click same course again
4. Scroll to same lesson

**Expected Result:**
- ✅ All progress data consistent
- ✅ Lesson still shows as completed
- ✅ Course progress still accurate

---

## Test 18: Multiple Students (Isolation)

If testing with multiple student accounts:

### 18.1 Student A and B Same Course

1. Enroll Student A in Course X
2. Enroll Student B in Course X
3. Student A completes 2/3 lessons
4. Student B completes 1/3 lessons
5. Check both students' progress independently

**Expected Result:**
- ✅ Student A shows 67% progress
- ✅ Student B shows 33% progress
- ✅ No cross-contamination of data

---

## Success Criteria for Step 14

✅ **My Courses Page** - Grid display with progress bars, status badges, responsive layout
✅ **Course Detail Page** - List lessons with order badges, completion status, progress bar
✅ **Lesson Player Page** - YouTube embed, mark complete button, navigation
✅ **YouTube Integration** - Multiple URL formats supported, responsive embed
✅ **Mark Complete** - Button changes state, API call successful, toast shows
✅ **Progress Calculation** - Accurate X/Y counter and percentage
✅ **Lesson Navigation** - Prev/Next buttons work correctly, disabled at ends
✅ **Error Messages** - Arabic error toasts on API failures
✅ **Loading States** - Spinners during data fetch and mark complete
✅ **Empty States** - Friendly message when student has no courses
✅ **RTL Layout** - Full right-to-left layout throughout
✅ **Mobile Responsive** - 1-column grid, full-width videos, readable on all sizes
✅ **Data Persistence** - Progress survives page reloads
✅ **Student Isolation** - Each student sees only their enrolled courses and progress
✅ **Navigation** - Back buttons work, routes flow logically
✅ **Badges** - Status indicators show correct state (Not Started/In Progress/Completed)
✅ **Status Updates** - Course progress updates after lesson completion
✅ **Video Controls** - YouTube player fully functional with standard controls

---

## API Endpoints Called

All authenticated with Bearer token:

| Action | Method | Endpoint | Body | Response |
|--------|--------|----------|------|----------|
| List courses | GET | /api/student/courses | - | Array of enrolled active courses |
| Get course | GET | /api/student/courses/{id} | - | {course with lessons array} |
| Get lesson | GET | /api/student/lessons/{id} | - | {lesson with navigation IDs} |
| Mark complete | POST | /api/student/lessons/{id}/complete | - | {message: success} |

---

## Notes for Testers

- Student should only see **active** enrolled courses (is_active=true)
- Soft-deleted courses should not appear in list
- Lesson navigation IDs (previous_lesson_id, next_lesson_id) come from backend
- Progress calculation is client-side: completed lessons / total lessons * 100
- All student pages require authentication (redirect to login if not logged in)
- Switching to different user accounts should show completely different course lists
- YouTube embed respects all standard controls (play, pause, seek, fullscreen, speed, captions if available)

