// API for student course operations
import { apiRequest } from '../client';

// Fetch list of enrolled active courses
export const fetchMyCourses = async () => {
    return await apiRequest('GET', '/student/courses');
};

// Fetch specific course with lessons
export const fetchCourse = async (courseId) => {
    return await apiRequest('GET', `/student/courses/${courseId}`);
};
