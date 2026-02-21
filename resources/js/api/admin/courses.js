// API for admin course CRUD operations
import { apiRequest } from '../client';

/**
 * Get paginated list of courses
 */
export async function fetchCourses(page = 1) {
    return await apiRequest('GET', `/admin/courses?page=${page}`);
}

/**
 * Get single course by ID with lessons
 */
export async function fetchCourse(id) {
    return await apiRequest('GET', `/admin/courses/${id}`);
}

/**
 * Create new course
 */
export async function createCourse(title, description, is_active = true) {
    return await apiRequest('POST', '/admin/courses', {
        title,
        description,
        is_active,
    });
}

/**
 * Update course
 */
export async function updateCourse(id, data) {
    return await apiRequest('PUT', `/admin/courses/${id}`, data);
}

/**
 * Delete course (soft delete)
 */
export async function deleteCourse(id) {
    return await apiRequest('DELETE', `/admin/courses/${id}`);
}

/**
 * Get enrolled students for a course
 * Returns array of { id, name, phone, student_code, is_active }
 */
export async function fetchCourseStudents(courseId) {
    return await apiRequest('GET', `/admin/courses/${courseId}/students`);
}

export default {
    fetchCourses,
    fetchCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    fetchCourseStudents,
};
