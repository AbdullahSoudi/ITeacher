import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as courseApi from '../../api/admin/courses';
import Toast, { useToast } from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CourseForm from '../../components/admin/CourseForm';

export default function AdminCoursesPage() {
    // State
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modal states
    const [formOpen, setFormOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, targetId: null });

    // Loading states
    const [formLoading, setFormLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    // Toast
    const { toasts, show: showToast, remove: removeToast } = useToast();

    // Fetch courses
    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const response = await courseApi.fetchCourses(page);
            setCourses(response.data || []);
            setCurrentPage(response.current_page || 1);
            setTotalPages(response.last_page || 1);
        } catch (err) {
            showToast('فشل تحميل الكورسات', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Load courses on mount
    useEffect(() => {
        fetchData(1);
    }, []);

    // Create course
    const handleCreateCourse = async (formData) => {
        setFormLoading(true);
        try {
            await courseApi.createCourse(formData.title, formData.description, formData.is_active);
            setFormOpen(false);
            setEditingCourse(null);
            await fetchData(currentPage);
            showToast('تم إضافة الكورس بنجاح', 'success');
        } catch (err) {
            if (err.status === 422 && err.data?.errors) {
                const messages = Object.values(err.data.errors).flat().join(', ');
                showToast(messages, 'error');
            } else {
                showToast('فشل إضافة الكورس', 'error');
            }
        } finally {
            setFormLoading(false);
        }
    };

    // Update course
    const handleUpdateCourse = async (formData) => {
        setFormLoading(true);
        try {
            await courseApi.updateCourse(editingCourse.id, formData);
            setFormOpen(false);
            setEditingCourse(null);
            await fetchData(currentPage);
            showToast('تم تحديث الكورس بنجاح', 'success');
        } catch (err) {
            if (err.status === 422 && err.data?.errors) {
                const messages = Object.values(err.data.errors).flat().join(', ');
                showToast(messages, 'error');
            } else {
                showToast('فشل تحديث الكورس', 'error');
            }
        } finally {
            setFormLoading(false);
        }
    };

    // Delete course
    const handleDeleteCourse = async (courseId) => {
        setConfirmLoading(true);
        try {
            await courseApi.deleteCourse(courseId);
            await fetchData(currentPage);
            setConfirmDialog({ isOpen: false, targetId: null });
            showToast('تم حذف الكورس', 'success');
        } catch (err) {
            showToast('فشل حذف الكورس', 'error');
        } finally {
            setConfirmLoading(false);
        }
    };

    const openEditForm = (course) => {
        setEditingCourse(course);
        setFormOpen(true);
    };

    const openCourseDetail = (courseId) => {
        navigate(`/admin/courses/${courseId}`);
    };

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">الكورسات</h1>
                    <p className="text-sm text-gray-600 mt-1">الكورسات والدروس</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCourse(null);
                        setFormOpen(true);
                    }}
                    className="px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-medium
                        hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    + إضافة كورس جديد
                </button>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="flex justify-center py-12">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <p className="text-sm text-gray-600 mt-2">جاري تحميل الكورسات...</p>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!loading && courses.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">لا توجد كورسات</h3>
                    <p className="text-sm text-gray-600">ابدأ بإضافة الكورس الأول</p>
                </div>
            )}

            {/* Courses grid */}
            {!loading && courses.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div
                            key={course.id}
                            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg
                                transition-shadow cursor-pointer group"
                        >
                            {/* Card header */}
                            <div
                                onClick={() => openCourseDetail(course.id)}
                                className="p-6 group-hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-lg font-bold text-gray-900 flex-1">
                                        {course.title}
                                    </h3>
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap
                                        ${course.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {course.is_active ? 'نشط' : 'معطّل'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                    {course.description || 'بدون وصف'}
                                </p>

                                {/* Course stats */}
                                <div className="flex gap-4 text-xs text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <span>📹</span>
                                        <span>{course.lessons_count || 0} درس</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span>👥</span>
                                        <span>{course.enrollments_count || 0} طالب</span>
                                    </div>
                                </div>
                            </div>

                            {/* Card footer - actions */}
                            <div className="px-6 py-4 border-t border-gray-200 flex gap-2">
                                <button
                                    onClick={() => openCourseDetail(course.id)}
                                    className="flex-1 text-xs px-3 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100
                                        transition-colors"
                                >
                                    عرض الدروس
                                </button>
                                <button
                                    onClick={() => openEditForm(course)}
                                    className="flex-1 text-xs px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100
                                        transition-colors"
                                >
                                    تعديل
                                </button>
                                <button
                                    onClick={() => setConfirmDialog({
                                        isOpen: true,
                                        targetId: course.id,
                                    })}
                                    className="flex-1 text-xs px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100
                                        transition-colors"
                                >
                                    حذف
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && courses.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4">
                    <button
                        onClick={() => {
                            if (currentPage > 1) {
                                setCurrentPage(currentPage - 1);
                                fetchData(currentPage - 1);
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
                                fetchData(currentPage + 1);
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

            {/* Modals */}
            <CourseForm
                isOpen={formOpen}
                course={editingCourse}
                isLoading={formLoading}
                onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse}
                onCancel={() => {
                    setFormOpen(false);
                    setEditingCourse(null);
                }}
            />

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title="حذف الكورس"
                message="هل تريد حذف هذا الكورس؟ سيتم حذف جميع الدروس المرتبطة به. لا يمكن التراجع عن هذا الإجراء."
                confirmText="حذف"
                isDangerous={true}
                isLoading={confirmLoading}
                onConfirm={() => handleDeleteCourse(confirmDialog.targetId)}
                onCancel={() => setConfirmDialog({ isOpen: false, targetId: null })}
            />

            {/* Toast notifications */}
            <Toast toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
