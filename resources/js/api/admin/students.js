// API for admin student CRUD operations
import { apiRequest } from '../client';

/**
 * Get paginated list of students with optional search
 */
export async function fetchStudents(page = 1, search = '') {
    let endpoint = `/admin/students?page=${page}`;
    if (search) {
        endpoint += `&search=${encodeURIComponent(search)}`;
    }
    return await apiRequest('GET', endpoint);
}

/**
 * Get single student by ID
 */
export async function fetchStudent(id) {
    return await apiRequest('GET', `/admin/students/${id}`);
}

/**
 * Create new student
 * Returns { student, generated_password }
 */
export async function createStudent(name, phone) {
    return await apiRequest('POST', '/admin/students', {
        name,
        phone,
    });
}

/**
 * Update student
 */
export async function updateStudent(id, data) {
    return await apiRequest('PUT', `/admin/students/${id}`, data);
}

/**
 * Delete student (soft delete)
 */
export async function deleteStudent(id) {
    return await apiRequest('DELETE', `/admin/students/${id}`);
}

/**
 * Reset student password
 * Returns { generated_password }
 */
export async function resetStudentPassword(id) {
    return await apiRequest('POST', `/admin/students/${id}/reset-password`);
}

export default {
    fetchStudents,
    fetchStudent,
    createStudent,
    updateStudent,
    deleteStudent,
    resetStudentPassword,
};
