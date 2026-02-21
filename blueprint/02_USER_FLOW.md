# blueprint/02_USER_FLOW.md

## Admin Journey
1) Login → Admin Dashboard
2) Students → Add Student → receive student_code + one-time password
3) Courses → Create Course
4) Course Details → Add Lessons (YouTube URL)
5) Student Profile → Enroll courses (multi-select)
6) Revoke enrollment anytime
7) Dashboard metrics

## Student Journey
1) Login with student_code + password
2) "كورساتي" shows only enrolled active courses
3) Open course → list lessons ordered
4) Open lesson → watch YouTube embed
5) Click "تمت المشاهدة" → mark completed
6) Back to list shows completion badge

## Key Edge Cases
- Student tries to access non-enrolled course → 403 with Arabic message
- Course inactive → hidden even if enrolled
- Student inactive → cannot login
- Deleted lesson → disappears from student view
