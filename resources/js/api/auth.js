// API utility for Sanctum authentication and requests
import { apiRequest } from './client';

const STORAGE_KEY = 'iteacher_auth';

/**
 * Get stored auth token from localStorage
 */
export function getStoredToken() {
    try {
        const auth = localStorage.getItem(STORAGE_KEY);
        return auth ? JSON.parse(auth).token : null;
    } catch {
        return null;
    }
}

/**
 * Store auth token to localStorage
 */
export function storeToken(token) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token }));
}

/**
 * Remove stored auth token
 */
export function removeStoredToken() {
    localStorage.removeItem(STORAGE_KEY);
}

/**
 * Login with identifier (student_code/email) and password
 * Returns { user, token }
 */
export async function login(identifier, password) {
    const response = await apiRequest('POST', '/auth/login', {
        identifier,
        password,
    });

    if (response.token) {
        storeToken(response.token);
    }

    return response;
}

/**
 * Logout (delete current token)
 */
export async function logout() {
    try {
        await apiRequest('POST', '/auth/logout');
    } finally {
        removeStoredToken();
    }
}

/**
 * Get current authenticated user
 */
export async function fetchMe() {
    return await apiRequest('GET', '/auth/me');
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
    return getStoredToken() !== null;
}

export default {
    getStoredToken,
    storeToken,
    removeStoredToken,
    login,
    logout,
    fetchMe,
    isAuthenticated,
};
