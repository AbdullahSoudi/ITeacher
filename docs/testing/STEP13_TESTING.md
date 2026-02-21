# STEP 13 Testing Guide: Admin Enrollments UI

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

## Test 1: Navigate to Students Page

Click **الطلاب** (Students) in the admin sidebar.

**Expected Result:**
- ✅ Navigate to `/admin/students`
- ✅ Page title: "الطلاب"
- ✅ Student list visible with columns: Name, Phone, Code, Courses, Status, Actions
- ✅ Actions column now includes new "تسجيل" (Enroll) button along with Edit, Reset, Delete

### 1.1 Verify Enrollments Button Position

In actions column, verify button order:
1. **تسجيل** (Enroll) - purple button
2. **تعديل** (Edit) - blue button
3. **إعادة تعيين** (Reset) - amber button
4. **حذف** (Delete) - red button

---

## Test 2: Open Enrollments Modal for Student with No Enrollment

### 2.1 Select Student with Zero Enrollments

Find a student showing "0" in the "الكورسات" (Courses) column.

Click the **تسجيل** (Enroll) button.

**Expected Result:**
- ✅ Modal opens with title: "تسجيل الكورسات - [Student Name]"
- ✅ Modal has close button (X) in top right
- ✅ Modal layout shows two sections:
  - "الكورسات المسجلة" (Enrolled Courses) section showing "0"
  - "الكورسات المتاحة" (Available Courses) section

### 2.2 Check Enrolled Courses Section

In "الكورسات المسجلة" section:

**Expected Result:**
- ✅ Counter shows "(0)"
- ✅ Empty state message: "لم يتم تسجيل الطالب في أي كورس بعد" (Student not enrolled in any course yet)
- ✅ No course cards visible

### 2.3 Check Available Courses Section

In "الكورسات المتاحة" section:

**Expected Result:**
- ✅ Counter shows number of available courses (e.g., "الكورسات المتاحة (3)")
- ✅ All active courses appear as checkboxes with:
  - Checkbox on left (RTL: not checked)
  - Course title
  - Course description (if exists, truncated with line-clamp-1)
- ✅ "تسجيل (0)" button at bottom (disabled - grayed out) because no courses selected
- ✅ Button text updates as you select courses

---

## Test 3: Select and Enroll in Single Course

### 3.1 Select One Course

In available courses, click the checkbox for any course (e.g., "Laravel Fundamentals").

**Expected Result:**
- ✅ Checkbox becomes checked
- ✅ Button text changes to "تسجيل (1)" showing count
- ✅ Button becomes enabled (blue, clickable)

### 3.2 Click Enroll Button

Click **تسجيل (1)** button.

**Expected Result:**
- ✅ Button shows loading state: "جاري التسجيل..."
- ✅ API call to `POST /api/admin/students/{studentId}/enroll`
- ✅ Green toast: "تم تسجيل الكورسات بنجاح" (Courses enrolled successfully)
- ✅ Modal automatically reloads data
- ✅ Course moves from "Available" to "Enrolled" section
- ✅ "الكورسات المسجلة" counter increases to "(1)"
- ✅ "الكورسات المتاحة" counter decreases accordingly
- ✅ Enrolled course now shows with "إلغاء التسجيل" (Revoke Enrollment) button

---

## Test 4: View Multiple Enrollments

### 4.1 Enroll in More Courses

Select and enroll in 2-3 more courses for the same student.

**Expected Result:**
- ✅ Each enrollment succeeds with green toast
- ✅ "الكورسات المسجلة" counter increases (e.g., "3")
- ✅ All 3-4 courses appear in enrolled section sorted as rows
- ✅ Each has "إلغاء التسجيل" button

### 4.2 Verify Enrolled Courses Display

For each enrolled course:

**Expected Result:**
- ✅ Course title visible
- ✅ Course description visible (truncated to 1 line max)
- ✅ Gray background with border for visual distinction
- ✅ "إلغاء التسجيل" button on right side (RTL layout)

---

## Test 5: Revoke Single Enrollment

### 5.1 Click Revoke Button

On an enrolled course, click **إلغاء التسجيل** (Revoke Enrollment) button.

**Expected Result:**
- ✅ Confirm dialog appears with:
  - Title: "إلغاء تسجيل كورس"
  - Message: "هل تريد إلغاء تسجيل الطالب من كورس "[Course Title]"؟"
  - Cancel and Revoke buttons (revoke is red/danger style)

### 5.2 Cancel Revocation

Click **إلغاء** (Cancel) button in dialog.

**Expected Result:**
- ✅ Dialog closes
- ✅ Enrollment still visible
- ✅ No API call made

### 5.3 Confirm Revocation

Click revoke button again, then click **إلغاء التسجيل** in confirm dialog.

**Expected Result:**
- ✅ API call to `DELETE /api/admin/students/{studentId}/enrollments/{courseId}`
- ✅ Green toast: "تم إلغاء التسجيل" (Enrollment revoked)
- ✅ Course disappears from "Enrolled Courses" section
- ✅ Course reappears in "Available Courses" section
- ✅ Counters update correctly

---

## Test 6: Bulk Enrollment

### 6.1 Select Multiple Courses

In available courses section, select 3+ courses at once by clicking multiple checkboxes.

**Expected Result:**
- ✅ Each checkbox toggles independently
- ✅ Button text matches selection: "تسجيل (3)"
- ✅ Button remains enabled

### 6.2 Click Enroll for All Selected

Click the button showing count of selected courses.

**Expected Result:**
- ✅ All selected courses enroll in single API call
- ✅ Single green toast: "تم تسجيل الكورسات بنجاح"
- ✅ All 3+ courses move to enrolled section
- ✅ Modal data reloads automatically
- ✅ Available courses update to exclude newly enrolled

---

## Test 7: No Selection Validation

### 7.1 Try Enroll Without Selection

When NO courses are selected:

**Expected Result:**
- ✅ Button "تسجيل (0)" is disabled (grayed out, not clickable)
- ✅ If somehow clicked, yellow toast: "اختر كورس واحد على الأقل" (Select at least one course)

---

## Test 8: All Courses Enrolled State

### 8.1 Enroll in All Available Courses

Keep enrolling until no courses left in "Available" section.

**Expected Result:**
- ✅ "الكورسات المتاحة" section shows message: "الطالب مسجل بالفعل في جميع الكورسات" (Student already enrolled in all courses)
- ✅ No checkboxes or enroll button visible in available section
- ✅ "الكورسات المسجلة" shows all courses with revoke options

---

## Test 9: Modal Navigation and Closing

### 9.1 Close Modal via Close Button

Click the **X** button in top-right corner.

**Expected Result:**
- ✅ Modal closes
- ✅ Returns to Students page
- ✅ Student list still visible

### 9.2 Close Modal via Overlay Click

Open modal, click outside the modal box (on the dark overlay).

**Expected Result:**
- ✅ Modal closes
- ✅ Returns to students list

### 9.3 Close Modal via Button

Click **إغلاق** (Close) button at bottom of modal.

**Expected Result:**
- ✅ Modal closes
- ✅ Returns to students list

---

## Test 10: Data Persistence Across Pages

### 10.1 Enroll Student and Close Modal

Enroll student in courses, then close modal.

**Expected Result:**
- ✅ Returned to Students page
- ✅ Enrollments count in student row updates
  - Example: Student "محمد أحمد" now shows "3" in الكورسات column instead of "0"

### 10.2 Open Enrollments Again

Click **تسجيل** button again for same student.

**Expected Result:**
- ✅ Modal opens with previously enrolled courses still showing as enrolled
- ✅ Available courses are updated (no longer showing enrolled ones)
- ✅ No duplicate enrollments

---

## Test 11: Multiple Students

### 11.1 Test Different Students

Open enrollments for different students:
- Student with no enrollments
- Student with some enrollments
- Student with all courses enrolled

**Expected Result for Each:**
- ✅ Modal shows correct enrolled/available courses for that student
- ✅ Enrollments are student-specific (not shared across students)

### 11.2 Enroll Two Students in Same Course

Enroll Student A in "Laravel Fundamentals"
Then enroll Student B in "Laravel Fundamentals"

**Expected Result:**
- ✅ Both students show course in their enrolled list
- ✅ Both can revoke independently
- ✅ No conflicts

---

## Test 12: Error Handling

### 12.1 Network Error During Enrollment

Stop Laravel dev server.

Try to enroll a student in courses.

**Expected Result:**
- ✅ Red toast appears: "فشل تسجيل الكورسات" (Failed to enroll courses)
- ✅ Modal stays open
- ✅ Student data is NOT changed
- ✅ User can retry after server is back

Restart Laravel server and retry.

### 12.2 Network Error During Revocation

Stop Laravel server.

Try to revoke enrollment.

**Expected Result:**
- ✅ Red toast: "فشل إلغاء التسجيل" (Failed to revoke)
- ✅ Modal stays open
- ✅ Enrollment NOT removed
- ✅ Can retry after restart

### 12.3 Student Not Found

Manually navigate with invalid student ID (if possible)

**Expected Result:**
- ✅ Error toast appears
- ✅ Modal closes or shows error state

---

## Test 13: Responsive Design (Mobile)

Toggle device toolbar to mobile size (Ctrl+Shift+M).

**On Students List:**
- ✅ "تسجيل" button visible in actions (may wrap due to multiple buttons)
- ✅ Table scrolls horizontally if needed

**In Enrollments Modal:**
- ✅ Modal fits screen on mobile
- ✅ Sections stack vertically
- ✅ Checkboxes large enough to click
- ✅ Buttons remain accessible
- ✅ Modal scrollable if content overflows

---

## Test 14: RTL Layout Verification

Verify throughout all tests:

**Students Page:**
- ✅ Table headers right-aligned
- ✅ Student names right-aligned
- ✅ Action buttons on right side of row
- ✅ "تسجيل" button shows as rightmost button

**Enrollments Modal:**
- ✅ Title right-aligned
- ✅ Section headings right-aligned
- ✅ Checkboxes on right side (checkbox comes before text in RTL)
- ✅ "إلغاء التسجيل" button on left side visually (but right in code flow)
- ✅ Modal centered properly

---

## Test 15: Integration with Student CRUD

### 15.1 Create Student Then Enroll

Create a new student via "الطلاب" button.

After student created:

**Expected Result:**
- ✅ Credentials modal shows
- ✅ After closing credentials, student appears in list with "0" enrollments
- ✅ Click "تسجيل" for new student
- ✅ Enrollments modal opens correctly
- ✅ Can immediately enroll new student in courses

### 15.2 Edit Student While Enrolled

Enroll a student in courses.

Click **تعديل** (Edit) button on that student.

Update student name.

**Expected Result:**
- ✅ Student name updates
- ✅ Enrollments are not affected
- ✅ Cooperation count still shows as enrolled

---

## Success Criteria for Step 13

✅ **Enrollments Button** - Visible in students list actions with purple styling
✅ **Modal Opens** - StudentEnrollmentsModal opens with correct student
✅ **Enrolled Section** - Shows currently enrolled courses with revoke buttons
✅ **Available Section** - Shows available courses with checkboxes
✅ **Bulk Select** - Can select multiple courses before enrolling
✅ **Bulk Enroll** - API call enrolls all selected courses at once
✅ **Button Count** - Button text shows count of selected courses
✅ **Button Disabled** - Button disabled when 0 courses selected
✅ **Single Revoke** - Can revoke individual enrollments with confirm dialog
✅ **Data Reload** - Modal reloads after enrollment/revocation
✅ **Counters Update** - Enrolled/Available course counters update correctly
✅ **Specificity** - Enrollments are per-student (no cross-student data)
✅ **Error Messages** - Arabic error toasts on network/API failures
✅ **Empty States** - Friendly messages when no enrollments or all enrolled
✅ **Loading States** - Spinners during data load, button shows "جاري التسجيل..."
✅ **Modal Closing** - Close via X, overlay click, or Close button
✅ **Data Persistence** - Enrollment count on student row updates after modal closes
✅ **Students List Refresh** - After enrolling, refreshing StudentsPage shows updated counts
✅ **RTL Layout** - Full right-to-left layout throughout modal and buttons
✅ **Responsive** - Modal works on mobile with proper sizing

---

## API Endpoints Called

All authenticated with Bearer token:

| Action | Method | Endpoint | Body | Response |
|--------|--------|----------|------|----------|
| List courses | GET | /api/admin/courses (paginated) | - | All courses (filtered in UI) |
| Get enrollments | GET | /api/admin/students/{id}/enrollments | - | Array of enrolled courses |
| Enroll bulk | POST | /api/admin/students/{id}/enroll | {course_ids: [1,2,3]} | {message: success} |
| Revoke enrollment | DELETE | /api/admin/students/{id}/enrollments/{courseId} | - | 204 No Content |

---

## Notes for Testers

- Each student can only be enrolled once per course (duplicate enrollments prevented)
- Soft-deleted courses should not appear in available list (backend gate filters)
- Inactive courses might appear but be marked accordingly (check backend behavior)
- Modal state is independent per student (closing and reopening shows fresh data)
- All course counts in "Courses" column of students table reflect true enrollment count

