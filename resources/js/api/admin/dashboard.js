// API for admin dashboard metrics
import { apiRequest } from '../client';

export async function fetchDashboard() {
    return apiRequest('GET', '/admin/dashboard');
}
