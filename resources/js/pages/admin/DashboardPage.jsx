import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { fetchDashboard } from '../../api/admin/dashboard';

export default function DashboardPage() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboard()
            .then(data => setMetrics(data))
            .catch(() => setMetrics(null))
            .finally(() => setLoading(false));
    }, []);

    const cards = [
        {
            label: 'الطلاب',
            value: loading ? '...' : (metrics?.students ?? '—'),
            icon: '👥',
            color: 'text-indigo-600',
            link: '/admin/students',
        },
        {
            label: 'الكورسات',
            value: loading ? '...' : (metrics?.courses ?? '—'),
            icon: '📚',
            color: 'text-emerald-600',
            link: '/admin/courses',
        },
    ];

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
            </div>

            {/* Stats grid — students + courses only */}
            <div className="grid grid-cols-2 gap-4 max-w-sm">
                {cards.map((card) => (
                    <Link key={card.label} to={card.link}>
                        <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                            <div className="text-2xl mb-3">{card.icon}</div>
                            <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
                            <div className="text-sm text-gray-500 mt-1 font-medium">{card.label}</div>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Quick actions */}
            <Card className="p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">إجراءات سريعة</h2>
                <div className="flex gap-3 flex-wrap">
                    <Link to="/admin/students">
                        <Button>+ إضافة طالب</Button>
                    </Link>
                    <Link to="/admin/courses">
                        <Button variant="secondary">+ إنشاء كورس</Button>
                    </Link>
                </div>
            </Card>
        </div>
    );
}
