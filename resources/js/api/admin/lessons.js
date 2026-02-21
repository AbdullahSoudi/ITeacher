// API for admin lesson CRUD operations
import { apiRequest } from '../client';

/**
 * Get lessons for a course
 */
export async function fetchLessons(courseId) {
    return await apiRequest('GET', `/admin/courses/${courseId}/lessons`);
}

/**
 * Create new lesson for a course
 */
export async function createLesson(courseId, title, description, youtubeUrl, order = null) {
    const body = {
        title,
        description,
        youtube_url: youtubeUrl,
    };

    if (order !== null && order !== undefined) {
        body.order = order;
    }

    return await apiRequest('POST', `/admin/courses/${courseId}/lessons`, body);
}

/**
 * Update lesson
 */
export async function updateLesson(id, data) {
    return await apiRequest('PUT', `/admin/lessons/${id}`, data);
}

/**
 * Delete lesson (soft delete)
 */
export async function deleteLesson(id) {
    return await apiRequest('DELETE', `/admin/lessons/${id}`);
}

/**
 * Validate YouTube URL (basic client-side check)
 * Returns true if URL matches YouTube patterns
 */
export function validateYouTubeUrl(url) {
    if (!url) return false;
    
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)[a-zA-Z0-9_\-]+/;
    return youtubeRegex.test(url);
}

export default {
    fetchLessons,
    createLesson,
    updateLesson,
    deleteLesson,
    validateYouTubeUrl,
};
