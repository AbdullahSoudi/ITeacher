import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';

export default function LoginPage() {
    const { user, loading, error, login } = useAuth();
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword]     = useState('');
    const [localError, setLocalError] = useState('');

    // Already authenticated → redirect to correct home
    if (user) {
        return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/courses'} replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (!identifier.trim() || !password.trim()) {
            setLocalError('الرجاء إدخال بيانات الدخول');
            return;
        }

        try {
            const userData = await login(identifier, password);
            navigate(userData.role === 'admin' ? '/admin/dashboard' : '/student/courses', { replace: true });
        } catch (err) {
            setLocalError(err.message);
        }
    };

    const displayError = localError || error;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
            <div className="w-full max-w-sm">

                {/* Brand */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-indigo-600">ITeacher</h1>
                    <p className="text-sm text-gray-400 mt-1">منصة التعليم الخاصة</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">تسجيل الدخول</h2>

                    {displayError && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                            {displayError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                الكود / البريد الإلكتروني
                            </label>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                placeholder="أدخل الكود أو البريد"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                                    focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
                                    transition-all placeholder:text-gray-400"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                كلمة المرور
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="أدخل كلمة المرور"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm
                                    focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
                                    transition-all placeholder:text-gray-400"
                                required
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full justify-center py-3 mt-2"
                            disabled={loading}
                        >
                            {loading ? 'جاري تسجيل الدخول...' : 'دخول'}
                        </Button>
                    </form>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        لا يوجد تسجيل ذاتي — يتم إنشاء الحسابات من المدير
                    </p>
                </div>
            </div>
        </div>
    );
}
