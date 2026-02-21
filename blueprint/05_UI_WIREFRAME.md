# blueprint/05_UI_WIREFRAME.md

## Visual Goal
Professional Arabic RTL SaaS dashboard:
- Soft borders
- Rounded cards
- Clear typography
- Clean spacing
- Mobile-first

## AppShell (RTL)
- Sidebar on RIGHT
- Topbar with brand "ITeacher"
- Content area centered, max width ~1200px

## Pages

### Login
Card centered:
- Title: "تسجيل الدخول"
- Inputs: "الكود / البريد" + "كلمة المرور"
- Button: "دخول"
- Helper: "لا يوجد تسجيل ذاتي"

### Admin Dashboard
Cards grid:
- الطلاب / الكورسات / الدروس / الاشتراكات / (إكمال الدروس)
Quick buttons:
- إضافة طالب
- إنشاء كورس

### Admin Students
- Search bar
- Add student button
List/table:
- الاسم | الهاتف | الكود | الحالة | إجراءات
Create student:
- Name + Phone
After create modal:
- Show student_code + generated_password with copy buttons + warning "مرة واحدة"

Student profile:
- Info card
- Reset password button
- Enrollment multi-select + save
- Enrolled courses list with revoke button

### Admin Courses
Course cards:
- title + description + status badge
Course detail:
- lessons list ordered
- add/edit/delete lesson
- fields: title/desc/youtube_url/order

### Student My Courses
Course cards (only enrolled & active):
- title + lessons count
- open button

### Student Course
Lesson list ordered:
- completed badge
- open lesson

### Student Lesson Player
- Title
- Responsive YouTube embed
- "تمت المشاهدة" button
- Optional next/prev
