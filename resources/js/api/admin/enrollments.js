// API for admin enrollment operations
import { apiRequest } from '../client';

// Fetch all courses for enrollment purposes (page 1)
export const fetchAvailableCourses = async () => {
    const data = await apiRequest('GET', '/admin/courses?page=1');
    return data.data || [];
};

// Fetch enrollments for a specific student — backend returns course objects
export const fetchStudentEnrollments = async (studentId) => {
    return await apiRequest('GET', `/admin/students/${studentId}/enrollments`);
};

// Enroll a student in courses (bulk)
export const enrollStudentInCourses = async (studentId, courseIds) => {
    return await apiRequest('POST', `/admin/students/${studentId}/enroll`, {
        course_ids: courseIds,
    });
};

// Revoke enrollment — backend route: DELETE /api/admin/students/{student}/enroll/{course}
export const revokeEnrollment = async (studentId, courseId) => {
    return await apiRequest('DELETE', `/admin/students/${studentId}/enroll/${courseId}`);
};
