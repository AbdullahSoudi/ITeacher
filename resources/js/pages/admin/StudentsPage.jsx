import { useState, useEffect } from 'react';
import * as studentApi from '../../api/admin/students';
import Toast, { useToast } from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CredentialsModal from '../../components/admin/CredentialsModal';
import StudentForm from '../../components/admin/StudentForm';
import StudentEnrollmentsModal from '../../components/admin/StudentEnrollmentsModal';

export default function StudentsPage() {
    // State
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');

    // Modal states
    const [formOpen, setFormOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [credentialsOpen, setCredentialsOpen] = useState(false);
    const [credentialsData, setCredentialsData] = useState({ student: null, password: null, isReset: false });
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, targetId: null });
    const [enrollmentsOpen, setEnrollmentsOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Loading states
    const [formLoading, setFormLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    // Toast
    const { toasts, show: showToast, remove: removeToast } = useToast();

    // Fetch students
    const fetchData = async (page = 1, searchQuery = '') => {
        setLoading(true);
        try {
            const response = await studentApi.fetchStudents(page, searchQuery);
            setStudents(response.data || []);
            setCurrentPage(response.current_page || 1);
            setTotalPages(response.last_page || 1);
        } catch (err) {
            showToast('فشل تحميل الطلاب', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Load students on mount
    useEffect(() => {
        fetchData(1, search);
    }, []);

    // Search handler
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        setSearch(searchInput);
        fetchData(1, searchInput);
    };

    // Create student
    const handleCreateStudent = async (formData) => {
        setFormLoading(true);
        try {
            const response = await studentApi.createStudent(formData.name, formData.phone);
            setFormOpen(false);
            setEditingStudent(null);
            setCredentialsData({
                student: response.student,
                password: response.generated_password,
                isReset: false,
            });
            setCredentialsOpen(true);
            await fetchData(currentPage, search);
            showToast('تم إضافة الطالب بنجاح', 'success');
        } catch (err) {
            if (err.status === 422 && err.data?.errors) {
                const messages = Object.values(err.data.errors).flat().join(', ');
                showToast(messages, 'error');
            } else {
                showToast('فشل إضافة الطالب', 'error');
            }
        } finally {
            setFormLoading(false);
        }
    };

    // Update student
    const handleUpdateStudent = async (formData) => {
        setFormLoading(true);
        try {
            await studentApi.updateStudent(editingStudent.id, formData);
            setFormOpen(false);
            setEditingStudent(null);
            await fetchData(currentPage, search);
            showToast('تم تحديث الطالب بنجاح', 'success');
        } catch (err) {
            if (err.status === 422 && err.data?.errors) {
                const messages = Object.values(err.data.errors).flat().join(', ');
                showToast(messages, 'error');
            } else {
                showToast('فشل تحديث الطالب', 'error');
            }
        } finally {
            setFormLoading(false);
        }
    };

    // Reset password
    const handleResetPassword = async (studentId) => {
        setConfirmLoading(true);
        try {
            const response = await studentApi.resetStudentPassword(studentId);
            const student = students.find(s => s.id === studentId);
            setCredentialsData({
                student,
                password: response.generated_password,
                isReset: true,
            });
            setCredentialsOpen(true);
            setConfirmDialog({ isOpen: false, action: null, targetId: null });
            showToast('تم إعادة تعيين كلمة المرور', 'success');
        } catch (err) {
            showToast('فشل إعادة تعيين كلمة المرور', 'error');
        } finally {
            setConfirmLoading(false);
        }
    };

    // Delete student
    const handleDeleteStudent = async (studentId) => {
        setConfirmLoading(true);
        try {
            await studentApi.deleteStudent(studentId);
            await fetchData(currentPage, search);
            setConfirmDialog({ isOpen: false, action: null, targetId: null });
            showToast('تم حذف الطالب', 'success');
        } catch (err) {
            showToast('فشل حذف الطالب', 'error');
        } finally {
            setConfirmLoading(false);
        }
    };

    // Confirm dialog handler
    const handleConfirmAction = async () => {
        if (confirmDialog.action === 'reset-password') {
            await handleResetPassword(confirmDialog.targetId);
        } else if (confirmDialog.action === 'delete') {
            await handleDeleteStudent(confirmDialog.targetId);
        }
    };

    const openEditForm = (student) => {
        setEditingStudent(student);
        setFormOpen(true);
    };

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">إدارة الطلاب</h1>
                    <p className="text-sm text-gray-600 mt-1">إدراج وتعديل بيانات الطلاب</p>
                </div>
                <button
                    onClick={() => {
                        setEditingStudent(null);
                        setFormOpen(true);
                    }}
                    className="px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-medium
                        hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    + إضافة طالب جديد
                </button>
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} className="flex gap-2">
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="ابحث بالاسم أو الهاتف أو الكود..."
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-sm
                        focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
                        transition-all"
                />
                <button
                    type="submit"
                    className="px-6 py-3 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium
                        hover:bg-gray-200 transition-colors"
                >
                    بحث
                </button>
            </form>

            {/* Loading state */}
            {loading && (
                <div className="flex justify-center py-12">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="text-sm text-gray-600 mt-2">جاري تحميل الطلاب...</p>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!loading && students.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">لا توجد طلاب</h3>
                    <p className="text-sm text-gray-600">ابدأ بإضافة الطالب الأول</p>
                </div>
            )}

            {/* Students table */}
            {!loading && students.length > 0 && (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">الاسم</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">الهاتف</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">الكود</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">الكورسات</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">الحالة</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {students.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{student.phone}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{student.student_code}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="px-2 py-1 rounded-full bg-gray-100 text-xs font-medium">
                                                {student.enrollments_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                student.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {student.is_active ? 'نشط' : 'معطّل'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudent(student);
                                                        setEnrollmentsOpen(true);
                                                    }}
                                                    className="text-xs px-3 py-2 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100
                                                        transition-colors"
                                                >
                                                    تسجيل
                                                </button>
                                                <button
                                                    onClick={() => openEditForm(student)}
                                                    className="text-xs px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100
                                                        transition-colors"
                                                >
                                                    تعديل
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDialog({
                                                        isOpen: true,
                                                        action: 'reset-password',
                                                        targetId: student.id,
                                                    })}
                                                    className="text-xs px-3 py-2 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100
                                                        transition-colors"
                                                >
                                                    إعادة تعيين
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDialog({
                                                        isOpen: true,
                                                        action: 'delete',
                                                        targetId: student.id,
                                                    })}
                                                    className="text-xs px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100
                                                        transition-colors"
                                                >
                                                    حذف
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-center gap-2">
                            <button
                                onClick={() => {
                                    if (currentPage > 1) {
                                        setCurrentPage(currentPage - 1);
                                        fetchData(currentPage - 1, search);
                                    }
                                }}
                                disabled={currentPage === 1}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700
                                    hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                السابق
                            </button>
                            <span className="text-sm text-gray-600 mx-2">
                                صفحة {currentPage} من {totalPages}
                            </span>
                            <button
                                onClick={() => {
                                    if (currentPage < totalPages) {
                                        setCurrentPage(currentPage + 1);
                                        fetchData(currentPage + 1, search);
                                    }
                                }}
                                disabled={currentPage === totalPages}
                                className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700
                                    hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                التالي
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Modals and Dialogs */}
            <StudentForm
                isOpen={formOpen}
                student={editingStudent}
                isLoading={formLoading}
                onSubmit={editingStudent ? handleUpdateStudent : handleCreateStudent}
                onCancel={() => {
                    setFormOpen(false);
                    setEditingStudent(null);
                }}
            />

            <CredentialsModal
                isOpen={credentialsOpen}
                student={credentialsData.student}
                password={credentialsData.password}
                isPasswordReset={credentialsData.isReset}
                onClose={() => setCredentialsOpen(false)}
            />

            <StudentEnrollmentsModal
                student={selectedStudent}
                isOpen={enrollmentsOpen}
                onClose={() => {
                    setEnrollmentsOpen(false);
                    setSelectedStudent(null);
                }}
                onEnrollmentChange={() => fetchData(currentPage, search)}
            />

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={confirmDialog.action === 'delete' ? 'حذف الطالب' : 'إعادة تعيين كلمة المرور'}
                message={
                    confirmDialog.action === 'delete'
                        ? 'هل تريد حذف هذا الطالب؟ لا يمكن التراجع عن هذا الإجراء.'
                        : 'سيتم إرسال كلمة مرور جديدة. تأكد من أن الطالب قادر على حفظها.'
                }
                confirmText={confirmDialog.action === 'delete' ? 'حذف' : 'نعم، أعد التعيين'}
                isDangerous={confirmDialog.action === 'delete'}
                isLoading={confirmLoading}
                onConfirm={handleConfirmAction}
                onCancel={() => setConfirmDialog({ isOpen: false, action: null, targetId: null })}
            />

            {/* Toast notifications */}
            <Toast toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
