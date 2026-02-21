// Shared API fetch wrapper
// Base: /api — all callers pass the full path from /api onward (e.g. /admin/courses)

const API_BASE = '/api';
const STORAGE_KEY = 'iteacher_auth';

function getToken() {
    try {
        const auth = localStorage.getItem(STORAGE_KEY);
        return auth ? JSON.parse(auth).token : null;
    } catch {
        return null;
    }
}

function clearToken() {
    localStorage.removeItem(STORAGE_KEY);
}

export async function apiRequest(method, endpoint, body = null) {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = { method, headers };

    if (body && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, options);

    if (response.status === 401) {
        clearToken();
        const error = new Error('Unauthorized');
        error.status = 401;
        error.data = null;
        throw error;
    }

    if (!response.ok) {
        const error = new Error('API request failed');
        error.status = response.status;
        try {
            error.data = await response.json();
        } catch {
            error.data = null;
        }
        throw error;
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}
