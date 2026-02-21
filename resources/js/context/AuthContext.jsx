import { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize auth state on mount
    useEffect(() => {
        const token = authApi.getStoredToken();
        if (token) {
            // Verify token is still valid by fetching user
            authApi.fetchMe()
                .then(response => {
                    setUser(response.user || response);
                    setError(null);
                })
                .catch(() => {
                    // Token invalid, clear it
                    authApi.removeStoredToken();
                    setUser(null);
                    setError(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (identifier, password) => {
        setLoading(true);
        setError(null);
        try {
            const response = await authApi.login(identifier, password);
            setUser(response.user || response);
            return response.user || response;
        } catch (err) {
            let errorMessage = 'فشل تسجيل الدخول';
            if (err.status === 401) {
                errorMessage = 'بيانات الدخول غير صحيحة';
            } else if (err.data?.message) {
                // Backend returns { message: '...' } for invalid credentials / inactive account
                errorMessage = err.data.message;
            } else if (err.status === 422 && err.data?.errors) {
                errorMessage = Object.values(err.data.errors).flat().join(', ');
            }
            setError(errorMessage);
            setUser(null);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await authApi.logout();
            setUser(null);
            setError(null);
        } catch (err) {
            // Even if logout fails, clear local state
            setUser(null);
            setError(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, error }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
