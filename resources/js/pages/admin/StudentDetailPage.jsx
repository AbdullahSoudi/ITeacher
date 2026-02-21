import { useParams, Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function StudentDetailPage() {
    const { id } = useParams();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Link
                    to="/admin/students"
                    className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="رجوع"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">ملف الطالب</h1>
            </div>

            {/* Info card */}
            <Card className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <h2 className="text-xl font-bold text-gray-900">اسم الطالب</h2>
                        <p className="text-sm text-gray-500">الكود: <span className="font-mono font-medium">STU-0001</span></p>
                        <p className="text-sm text-gray-500">الهاتف: —</p>
                    </div>
                    <Badge variant="active">نشط</Badge>
                </div>

                <div className="mt-5 pt-5 border-t border-gray-100 flex gap-3 flex-wrap">
                    <Button variant="secondary">إعادة تعيين كلمة المرور</Button>
                    <Button variant="destructive">تعطيل الحساب</Button>
                </div>
            </Card>

            {/* Enrollment section */}
            <Card className="p-6">
                <h3 className="text-base font-semibold text-gray-800 mb-4">تسجيل في كورسات</h3>
                <div className="p-4 rounded-xl bg-gray-50 text-sm text-gray-400 text-center border border-dashed border-gray-200">
                    اختر الكورسات لتسجيل الطالب فيها
                </div>
                <div className="mt-4 flex gap-3">
                    <Button>حفظ التسجيل</Button>
                    <Button variant="ghost">إلغاء</Button>
                </div>
            </Card>

            {/* Enrolled courses list */}
            <Card className="p-6">
                <h3 className="text-base font-semibold text-gray-800 mb-4">الكورسات المسجل بها</h3>
                <p className="text-sm text-gray-400 text-center py-8">
                    لا يوجد تسجيل في أي كورس حالياً
                </p>
            </Card>
        </div>
    );
}
