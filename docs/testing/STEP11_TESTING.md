# STEP 11 Testing Guide: Admin Students CRUD UI

## Setup

### 1. Start Backend Server

```bash
cd e:\ITeacherApp\myapp
php artisan migrate:fresh --seed
php artisan serve
```

### 2. Start Frontend Dev Server

In a new terminal:

```bash
npm run dev
```

### 3. Access Frontend

Open browser: **http://localhost:5173**

Login as admin:
- **Identifier:** `admin@iteacher.test`
- **Password:** `Admin@123456`

You should be redirected to `/admin/dashboard` with sidebar visible.

---

## Test 1: Navigate to Students Page

### 1.1 Click "الطلاب" in Sidebar

On the admin dashboard, click the **الطلاب** (Students) link in the left sidebar.

**Expected Result:**
- ✅ Navigated to `/admin/students`
- ✅ Page shows heading "إدارة الطلاب" with subtitle
- ✅ "إضافة طالب جديد" (Add New Student) button visible in top-right
- ✅ Search bar visible with placeholder "ابحث بالاسم أو الهاتف أو الكود..."
- ✅ Empty state message: "لا توجد طلاب" (No students yet)

---

## Test 2: Create First Student

### 2.1 Click "إضافة طالب جديد" Button

In the Students page, click the blue **+ إضافة طالب جديد** button.

**Expected Result:**
- ✅ Modal opens with title "إضافة طالب جديد" (Add New Student)
- ✅ Form has two fields: "الاسم" (Name) and "رقم الهاتف" (Phone)
- ✅ Cancel and "إضافة الطالب" (Add Student) buttons at bottom

### 2.2 Fill Student Form

Enter:
- **الاسم:** Ahmed Hassan (أحمد حسن)
- **رقم الهاتف:** 966501234567

Click **إضافة الطالب**

**Expected Result:**
- ✅ Modal shows loading state
- ✅ Button text changes to "جاري..." (pending)
- ✅ API call to `POST /api/admin/students` succeeds

### 2.3 Credentials Modal Appears

Modal closes and **Credentials Modal** opens showing:

**Layout:**
- Title: "بيانات الدخول" (Credentials)
- Warning badge: "⚠️ مرة واحدة فقط" (One time only)

**Fields:**
- **كود الطالب:** Shows "STU-0001" with "نسخ" (Copy) button
- **كلمة المرور:** Shows a random 10-character password with "نسخ" button
- Red warning box: "احفظ هذه البيانات في مكان آمن. لن تظهر مجددًا." (Save in secure location. Won't appear again.)
- Blue button: "فهمت" (Got it)

### 2.4 Test Copy Buttons

Click **نسخ** button next to student code:
- ✅ Button text changes to "✓ نسخ" (copied)
- ✅ After 2 seconds, reverts to "نسخ"
- ✅ Student code is copied to clipboard (can paste if tested)

Click **نسخ** button next to password:
- ✅ Same copy behavior
- ✅ Password is copied to clipboard

### 2.5 Close Credentials Modal

Click **فهمت** button

**Expected Result:**
- ✅ Modal closes
- ✅ Students list page reloads with new student visible
- ✅ Green toast notification: "تم إضافة الطالب بنجاح" (Student added successfully)
- ✅ Toast disappears after 3 seconds

---

## Test 3: Verify Student in List

After creating first student, you should see:

**Table Row for Ahmed Hassan:**
| الاسم | الهاتف | الكود | الكورسات | الحالة | الإجراءات |
|------|-------|------|---------|--------|---------|
| Ahmed Hassan | 966501234567 | STU-0001 | 0 | نشط (green) | تعديل / إعادة تعيين / حذف |

**Verify:**
- ✅ Name displays correctly
- ✅ Phone displays correctly (should be formatted)
- ✅ Student code shows "STU-0001"
- ✅ Courses count shows "0" (not enrolled yet)
- ✅ Status badge shows "نشط" (Active) with green background
- ✅ Three action buttons: تعديل (Edit), إعادة تعيين (Reset), حذف (Delete)

---

## Test 4: Create Multiple Students

Repeat Test 2 and 2.5 with different data:

**Student 2:**
- Name: Fatima Al-Rashid (فاطمة الراشد)
- Phone: 966509876543

**Student 3:**
- Name: Mohammed Ali (محمد علي)
- Phone: 966545678901

**Expected Result after all three created:**
- ✅ All three students appear in table
- ✅ Student codes are STU-0001, STU-0002, STU-0003
- ✅ Pagination shows "صفحة 1 من 1" (Page 1 of 1)

---

## Test 5: Search Functionality

### 5.1 Search by Name

In the search bar, type "Ahmed"

Click **بحث** (Search) button

**Expected Result:**
- ✅ Table reloads showing only "Ahmed Hassan"
- ✅ Other students hidden
- ✅ Pagination resets to page 1

### 5.2 Search by Phone

Clear search bar and type "966509876543" (Fatima's phone)

Click **بحث** (Search)

**Expected Result:**
- ✅ Table shows only Fatima Al-Rashid
- ✅ Name and phone match search term

### 5.3 Search by Student Code

Clear and type "STU-0002"

Click **بحث** (Search)

**Expected Result:**
- ✅ Table shows matching student (Fatima)
- ✅ Code field displays "STU-0002"

### 5.4 Clear Search

Clear search bar (leave empty)

Click **بحث** (Search)

**Expected Result:**
- ✅ All students displayed again (if 3 or fewer per page)
- ✅ Pagination shows correct page info

---

## Test 6: Edit Student

### 6.1 Click Edit Button

In the Ahmed Hassan row, click **تعديل** (Edit) button

**Expected Result:**
- ✅ Modal opens with title "تعديل طالب" (Edit Student)
- ✅ Form fields are pre-filled:
  - Name: "Ahmed Hassan"
  - Phone: "966501234567"
- ✅ New field appears: "الطالب نشط" checkbox (checked)
- ✅ Button text: "حفظ التعديلات" (Save Changes)

### 6.2 Modify Student Data

Change:
- **الاسم:** Ahmed Mohammed Hassan (أحمد محمد حسن)
- Keep phone same

Uncheck the **الطالب نشط** (Active) checkbox

Click **حفظ التعديلات** (Save Changes)

**Expected Result:**
- ✅ API call to `PUT /api/admin/students/1`
- ✅ Modal closes
- ✅ Green toast: "تم تحديث الطالب بنجاح" (Student updated successfully)
- ✅ Table updates:
  - Name now shows "Ahmed Mohammed Hassan"
  - Status badge shows "معطّل" (Inactive) with red background

### 6.3 Re-enable Student

Click **تعديل** for Ahmed again

Check the **الطالب نشط** checkbox

Click **حفظ التعديلات**

**Expected Result:**
- ✅ Status badge reverts to "نشط" with green background
- ✅ Success toast appears

---

## Test 7: Reset Student Password

### 7.1 Click Reset Button

For any student row, click **إعادة تعيين** (Reset) button

**Expected Result:**
- ✅ Confirm Dialog appears with:
  - Title: "إعادة تعيين كلمة المرور"
  - Message: "سيتم إرسال كلمة مرور جديدة. تأكد من أن الطالب قادر على حفظها."
  - Buttons: "إلغاء" (Cancel) and "نعم، أعد التعيين" (Yes, Reset)

### 7.2 Confirm Reset

Click **نعم، أعد التعيين** button

**Expected Result:**
- ✅ Dialog shows loading state (button text → "جاري...")
- ✅ API call to `POST /api/admin/students/{id}/reset-password`
- ✅ Dialog closes

### 7.3 New Password Modal Appears

**Credentials Modal shows:**
- Title: "كلمة مرور جديدة" (New Password)
- Warning: "⚠️ مرة واحدة فقط"
- Only **كلمة المرور** field visible (no student code)
- New 10-character password displayed
- Green toast notification: "تم إعادة تعيين كلمة المرور" (Password reset)

### 7.4 Copy and Close

Click **نسخ** button next to password, then **فهمت**

**Expected Result:**
- ✅ Password copied
- ✅ Modal closes
- ✅ Back to students list

---

## Test 8: Delete Student

### 8.1 Click Delete Button

For Ahmed Hassan row, click **حذف** (Delete) button

**Expected Result:**
- ✅ Confirm Dialog appears with:
  - Title: "حذف الطالب"
  - Message: "هل تريد حذف هذا الطالب؟ لا يمكن التراجع عن هذا الإجراء." (Do you want to delete this student? This action cannot be undone.)
  - Cancel button: "إلغاء"
  - Danger button (red): "حذف"

### 8.2 Cancel Delete

Click **إلغاء** (Cancel)

**Expected Result:**
- ✅ Dialog closes
- ✅ Student still in list
- ✅ No API call made

### 8.3 Confirm Delete

Click **حذف** (Delete) button again, then click **حذف** to confirm

**Expected Result:**
- ✅ Button shows loading state "جاري..."
- ✅ API call to `DELETE /api/admin/students/{id}`
- ✅ Student row disappears from table
- ✅ Green toast: "تم حذف الطالب" (Student deleted)
- ✅ Remaining students still visible

---

## Test 9: Form Validation

### 9.1 Missing Name

Click **+ إضافة طالب جديد**

Leave **الاسم** empty

Enter phone: 966500000001

Click **إضافة الطالب**

**Expected Result:**
- ✅ Red error message below name field: "الاسم مطلوب" (Name required)
- ✅ No API call
- ✅ Form stays open

### 9.2 Missing Phone

Clear phone field

Fill name: "Test Student"

Click **إضافة الطالب**

**Expected Result:**
- ✅ Red error below phone field: "الهاتف مطلوب" (Phone required)
- ✅ No API call

### 9.3 Duplicate Phone

Close modal (cancel)

Create a new student with:
- Name: "Duplicate Test"
- Phone: 966509876543 (Fatima's phone)

Click **إضافة الطالب**

**Expected Result:**
- ✅ Loading state shows
- ✅ API returns 422 validation error
- ✅ Red toast: "الهاتف محجوز بالفعل" (Phone already taken) or similar error message
- ✅ Modal stays open for correction

---

## Test 10: Pagination (if applicable)

Create 20 more students (if needed to exceed page limit of 15):

After creating 16+ students, check table:

**Expected Result:**
- ✅ Only 15 students show per page
- ✅ At bottom, pagination controls appear:
  - "السابق" (Previous) button - disabled on page 1
  - "صفحة 1 من 2" (Page 1 of 2)
  - "التالي" (Next) button - enabled
- ✅ Click "التالي" to view remaining students
- ✅ "السابق" becomes enabled on page 2
- ✅ "التالي" becomes disabled on last page

---

## Test 11: Error Handling

### 11.1 Network Error During Create

Stop the Laravel dev server (Ctrl+C in backend terminal)

Try to create new student:
- Name: "Test"
- Phone: 966500001111

Click **إضافة الطالب**

**Expected Result:**
- ✅ Loading continues for a moment
- ✅ Red toast: "فشل إضافة الطالب" (Failed to add student)
- ✅ Modal closes (or stays open)
- ✅ Student NOT added to list

Restart Laravel server:
```bash
php artisan serve
```

### 11.2 Verify Refresh Works

After error, refresh the page (F5)

**Expected Result:**
- ✅ Still on Students page
- ✅ Can search/create again normally
- ✅ Previously created students still visible

---

## Test 12: Toast Notifications

Throughout the tests above, verify toast notifications:

**Success toasts (green):**
- "تم إضافة الطالب بنجاح"
- "تم تحديث الطالب بنجاح"
- "تم إعادة تعيين كلمة المرور"
- "تم حذف الطالب"

**Error toasts (red):**
- "فشل تحميل الطلاب"
- "فشل إضافة الطالب"
- Validation messages

**Toast behavior:**
- ✅ Appear at top-left corner
- ✅ Automatically disappear after 3 seconds
- ✅ Can be dismissed by clicking ×
- ✅ Multiple toasts stack vertically

---

## Test 13: Modal Interactions

### 13.1 Form Modal - Click Outside to Cancel

Open create student form by clicking **+ إضافة طالب جديد**

Click the dark overlay area outside the modal

**Expected Result:**
- ✅ Modal closes
- ✅ Form data cleared
- ✅ No API call

### 13.2 Form Modal - Cancel Button

Open form again

Click **إلغاء** (Cancel) button

**Expected Result:**
- ✅ Modal closes
- ✅ Same as above

### 13.3 Credentials Modal - Click Outside Does NOT Close

Open create form and complete student creation to show Credentials Modal

Try clicking the dark overlay

**Expected Result:**
- ✅ Modal does NOT close (user must click فهمت)
- (This is intentional - ensures passwords are acknowledged)

---

## Test 14: RTL Alignment

Check UI throughout is properly right-to-left:

**Expected:**
- ✅ Sidebar is on the RIGHT side
- ✅ Table headers align RIGHT
- ✅ Form inputs have RTL alignment
- ✅ Buttons on forms align RTL
- ✅ Arabic text renders correctly
- ✅ Icons on right side of buttons

---

## Test 15: Responsive Design (Mobile)

Open Developer Tools (F12) → Toggle Device Toolbar (Ctrl+Shift+M)

Set to iPhone 12 / Mobile size

On Students Page:

**Expected:**
- ✅ Sidebar collapses - hamburger menu appears
- ✅ Click hamburger to open sidebar
- ✅ Table is horizontally scrollable
- ✅ Header title and button stack vertically
- ✅ Modals are max-width responsive
- ✅ Form inputs full width and touch-friendly

Try create/edit/delete on mobile:

**Expected:**
- ✅ All operations work same as desktop
- ✅ Modals properly centered
- ✅ Keyboard doesn't hide critical elements

---

## Test 16: Load From URL

After creating students, manually navigate:

`http://localhost:5173/admin/students?search=ahmed`

**Expected Result:**
- ✅ Students page loads
- ✅ Search parameter applied (shows filtered results)

Navigate to:
`http://localhost:5173/admin/students/99999`

**Expected:**
- ✅ Stays on page (no such route)
- ✅ OR automatically goes to students list

---

## Success Criteria for Step 11

✅ **Create:** Admin can add student with name + phone, get one-time credentials in modal with copy buttons
✅ **List:** Students display in table with all fields, pagination if >15
✅ **Search:** Filter by name/phone/student_code in real-time
✅ **Edit:** Update name/phone/active status
✅ **Reset Password:** Generate new one-time password shown in modal
✅ **Delete:** Soft delete with confirmation dialog
✅ **Validation:** Form validates required fields, shows error messages in Arabic
✅ **Error Handling:** Network errors show red toast notifications
✅ **Loading States:** Buttons show "جاري..." during API calls
✅ **Empty State:** Shows friendly message when no students
✅ **Toast Notifications:** Success/error messages appear and auto-dismiss
✅ **RTL UI:** All Arabic text and layout fully RTL compliant
✅ **Responsive:** Works on mobile with hamburger menu and scrollable table
✅ **Credentials Modal:** Shows "مرة واحدة فقط" warning, copy buttons work

---

## Summary of Components Involved

| Component | File | Purpose |
|-----------|------|---------|
| **StudentForm** | resources/js/components/StudentForm.jsx | Create/Edit form modal |
| **CredentialsModal** | resources/js/components/CredentialsModal.jsx | Display one-time credentials with copy |
| **ConfirmDialog** | resources/js/components/ConfirmDialog.jsx | Delete/Reset confirmation dialogs |
| **Toast** | resources/js/components/Toast.jsx | Success/error notifications |
| **StudentsPage** | resources/js/pages/admin/StudentsPage.jsx | Main students CRUD page |
| **Student API** | resources/js/api/admin/students.js | API calls (fetchStudents, createStudent, etc.) |

---

## Sample Data Table

After completing all tests, you should have created students like:

| Aname | Phone | Code | Courses | Status |
|-------|-------|------|---------|--------|
| Ahmed Hassan | 966501234567 | STU-0001 | 0 | نشط |
| Fatima Al-Rashid | 966509876543 | STU-0002 | 0 | نشط |
| Mohammed Ali | 966545678901 | STU-0003 | 0 | نشط |
| ... | ... | ... | ... | ... |

---

## API Endpoint Reference

All calls use Authorization header: `Bearer {token}`

| Method | Endpoint | Request | Response |
|--------|----------|---------|----------|
| GET | /api/admin/students?page=1&search=... | - | Paginated list |
| POST | /api/admin/students | {name, phone} | {student, generated_password} |
| PUT | /api/admin/students/{id} | {name, phone, is_active} | {student} |
| DELETE | /api/admin/students/{id} | - | 204 No Content |
| POST | /api/admin/students/{id}/reset-password | - | {generated_password} |

