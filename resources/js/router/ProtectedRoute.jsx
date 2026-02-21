import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AccessDeniedPage from '../pages/shared/AccessDeniedPage';

export default function ProtectedRoute({ role }) {
    const { user, loading } = useAuth();

    // Still loading auth state → show loading indicator or just wait
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="text-sm text-gray-600 mt-2">جاري التحقق من الصلاحيات...</p>
                </div>
            </div>
        );
    }

    // Not logged in → send to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Wrong role → hard block with Access Denied page
    if (user.role !== role) {
        return <AccessDeniedPage />;
    }

    return <Outlet />;
}
