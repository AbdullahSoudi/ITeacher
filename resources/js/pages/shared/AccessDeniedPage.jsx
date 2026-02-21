import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

export default function AccessDeniedPage() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleReturn = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
            <div className="text-center max-w-sm">
                <div className="text-6xl mb-6">🚫</div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح</h1>
                <p className="text-sm text-gray-500 mb-8">
                    ليس لديك صلاحية للوصول لهذه الصفحة
                </p>
                <Button onClick={handleReturn}>
                    العودة لتسجيل الدخول
                </Button>
            </div>
        </div>
    );
}
