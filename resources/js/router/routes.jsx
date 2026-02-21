import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppShell from '../components/layout/AppShell';

// Pages
import LoginPage from '../pages/shared/LoginPage';
import DashboardPage from '../pages/admin/DashboardPage';
import StudentsPage from '../pages/admin/StudentsPage';
import StudentDetailPage from '../pages/admin/StudentDetailPage';
import AdminCoursesPage from '../pages/admin/CoursesPage';
import AdminCourseDetailPage from '../pages/admin/CourseDetailPage';
import MyCoursesPage from '../pages/student/MyCoursesPage';
import StudentCourseDetailPage from '../pages/student/CourseDetailPage';
import LessonPlayerPage from '../pages/student/LessonPlayerPage';

export default function AppRoutes() {
    return (
        <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin routes */}
            <Route element={<ProtectedRoute role="admin" />}>
                <Route element={<AppShell />}>
                    <Route path="/admin/dashboard"   element={<DashboardPage />} />
                    <Route path="/admin/students"     element={<StudentsPage />} />
                    <Route path="/admin/students/:id" element={<StudentDetailPage />} />
                    <Route path="/admin/courses"      element={<AdminCoursesPage />} />
                    <Route path="/admin/courses/:id"  element={<AdminCourseDetailPage />} />
                </Route>
            </Route>

            {/* Student routes */}
            <Route element={<ProtectedRoute role="student" />}>
                <Route element={<AppShell />}>
                    <Route path="/student/courses"     element={<MyCoursesPage />} />
                    <Route path="/student/courses/:id" element={<StudentCourseDetailPage />} />
                    <Route path="/student/lessons/:id" element={<LessonPlayerPage />} />
                </Route>
            </Route>

            {/* Catch-all → login */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
