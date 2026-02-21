// API for student lesson progress
import { apiRequest } from '../client';

// Mark a lesson as complete (idempotent)
export const markLessonComplete = async (lessonId) => {
    return await apiRequest('POST', `/student/lessons/${lessonId}/complete`);
};
