// API for student lesson operations
import { apiRequest } from '../client';

// Fetch specific lesson (with is_completed, prev/next ids, course info)
export const fetchLesson = async (lessonId) => {
    return await apiRequest('GET', `/student/lessons/${lessonId}`);
};

// Extract YouTube video ID from various URL formats
export const extractYouTubeVideoId = (url) => {
    if (!url) return null;

    const patterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
};
