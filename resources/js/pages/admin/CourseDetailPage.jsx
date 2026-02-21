import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import * as courseApi from '../../api/admin/courses';
import * as lessonApi from '../../api/admin/lessons';
import { revokeEnrollment } from '../../api/admin/enrollments';
import Toast, { useToast } from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import CourseForm from '../../components/admin/CourseForm';
import LessonForm from '../../components/admin/LessonForm';

export default function AdminCourseDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [courseFormOpen, setCourseFormOpen] = useState(false);
    const [lessonFormOpen, setLessonFormOpen] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, action: null, targetId: null });

    // Loading states
    const [courseFormLoading, setCourseFormLoading] = useState(false);
    const [lessonFormLoading, setLessonFormLoading] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);

    // Toast
    const { toasts, show: showToast, remove: removeToast } = useToast();

    // Fetch course (lessons embedded) + enrolled students
    const fetchData = async () => {
        setLoading(true);
        try {
            // fetchCourse already loads lessons (ordered by `order`) in the response
            const courseData = await courseApi.fetchCourse(id);
            setCourse(courseData);
            setLessons(courseData.lessons || []);

            // Fetch enrolled students for this course
            const students = await courseApi.fetchCourseStudents(id);
            setEnrolledStudents(students || []);
        } catch (err) {
            showToast('فشل تحميل الكورس', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Load on mount
    useEffect(() => {
        fetchData();
    }, [id]);

    // Update course
    const handleUpdateCourse = async (formData) => {
        setCourseFormLoading(true);
        try {
            await courseApi.updateCourse(id, formData);
            setCourseFormOpen(false);
            await fetchData();
            showToast('تم تحديث الكورس بنجاح', 'success');
        } catch (err) {
            showToast('فشل تحديث الكورس', 'error');
        } finally {
            setCourseFormLoading(false);
        }
    };

    // Create lesson
    const handleCreateLesson = async (formData) => {
        setLessonFormLoading(true);
        try {
            await lessonApi.createLesson(
                id,
                formData.title,
                formData.description,
                formData.youtube_url,
                formData.order
            );
            setLessonFormOpen(false);
            setEditingLesson(null);
            await fetchData();
            showToast('تم إضافة الدرس بنجاح', 'success');
        } catch (err) {
            if (err.status === 422 && err.data?.errors) {
                const messages = Object.values(err.data.errors).flat().join(', ');
                showToast(messages, 'error');
            } else {
                showToast('فشل إضافة الدرس', 'error');
            }
        } finally {
            setLessonFormLoading(false);
        }
    };

    // Update lesson
    const handleUpdateLesson = async (formData) => {
        setLessonFormLoading(true);
        try {
            await lessonApi.updateLesson(editingLesson.id, formData);
            setLessonFormOpen(false);
            setEditingLesson(null);
            await fetchData();
            showToast('تم تحديث الدرس بنجاح', 'success');
        } catch (err) {
            showToast('فشل تحديث الدرس', 'error');
        } finally {
            setLessonFormLoading(false);
        }
    };

    // Delete lesson
    const handleDeleteLesson = async (lessonId) => {
        setConfirmLoading(true);
        try {
            await lessonApi.deleteLesson(lessonId);
            await fetchData();
            setConfirmDialog({ isOpen: false, action: null, targetId: null });
            showToast('تم حذف الدرس', 'success');
        } catch (err) {
            showToast('فشل حذف الدرس', 'error');
        } finally {
            setConfirmLoading(false);
        }
    };

    // Delete course
    const handleDeleteCourse = async () => {
        setConfirmLoading(true);
        try {
            await courseApi.deleteCourse(id);
            setConfirmDialog({ isOpen: false, action: null, targetId: null });
            showToast('تم حذف الكورس', 'success');
            navigate('/admin/courses');
        } catch (err) {
            showToast('فشل حذف الكورس', 'error');
        } finally {
            setConfirmLoading(false);
        }
    };

    // Revoke student enrollment from this course
    const handleRevokeStudent = async (studentId) => {
        setConfirmLoading(true);
        try {
            await revokeEnrollment(studentId, Number(id));
            await fetchData();
            setConfirmDialog({ isOpen: false, action: null, targetId: null });
            showToast('تم إلغاء تسجيل الطالب', 'success');
        } catch (err) {
            showToast('فشل إلغاء التسجيل', 'error');
        } finally {
            setConfirmLoading(false);
        }
    };

    // Confirm action dispatcher
    const handleConfirmAction = () => {
        if (confirmDialog.action === 'delete-lesson') {
            handleDeleteLesson(confirmDialog.targetId);
        } else if (confirmDialog.action === 'delete-course') {
            handleDeleteCourse();
        } else if (confirmDialog.action === 'revoke-student') {
            handleRevokeStudent(confirmDialog.targetId);
        }
    };

    const openEditLesson = (lesson) => {
        setEditingLesson(lesson);
        setLessonFormOpen(true);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="text-sm text-gray-600 mt-2">جاري التحميل...</p>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center py-12">
                <h2 className="text-lg font-bold text-gray-900">لم يتم العثور على الكورس</h2>
                <Link to="/admin/courses" className="text-indigo-600 hover:underline mt-2 inline-block">
                    العودة للكورسات
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header with back button */}
            <div className="flex items-center gap-3">
                <Link
                    to="/admin/courses"
                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="رجوع"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                    <p className="text-sm text-gray-600 mt-1">{course.description || 'بدون وصف'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    course.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                }`}>
                    {course.is_active ? 'نشط' : 'معطّل'}
                </span>
            </div>

            {/* Course actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => setCourseFormOpen(true)}
                    className="px-4 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100
                        text-sm font-medium transition-colors"
                >
                    تعديل الكورس
                </button>
                <button
                    onClick={() => setConfirmDialog({
                        isOpen: true,
                        action: 'delete-course',
                        targetId: id,
                    })}
                    className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100
                        text-sm font-medium transition-colors"
                >
                    حذف الكورس
                </button>
            </div>

            {/* Lessons section */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">الدروس</h2>
                        <p className="text-sm text-gray-600 mt-1">{lessons.length} درس</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingLesson(null);
                            setLessonFormOpen(true);
                        }}
                        className="px-6 py-3 rounded-lg bg-indigo-600 text-white text-sm font-medium
                            hover:bg-indigo-700 transition-colors"
                    >
                        + إضافة درس
                    </button>
                </div>

                {/* Empty state */}
                {lessons.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <div className="text-4xl mb-4">🎬</div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">لا توجد دروس بعد</h3>
                        <p className="text-sm text-gray-600">أضف أول درس لهذا الكورس</p>
                    </div>
                )}

                {/* Lessons list */}
                {lessons.length > 0 && (
                    <div className="space-y-3">
                        {lessons.map(lesson => (
                            <div
                                key={lesson.id}
                                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2 py-1 rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                                #{lesson.order}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-900">{lesson.title}</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                            {lesson.description || 'بدون وصف'}
                                        </p>
                                        <a
                                            href={lesson.youtube_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-indigo-600 hover:underline mt-2 inline-block"
                                        >
                                            🔗 عرض الفيديو
                                        </a>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button
                                            onClick={() => openEditLesson(lesson)}
                                            className="px-3 py-2 rounded-lg text-sm bg-blue-50 text-blue-600 hover:bg-blue-100
                                                transition-colors"
                                        >
                                            تعديل
                                        </button>
                                        <button
                                            onClick={() => setConfirmDialog({
                                                isOpen: true,
                                                action: 'delete-lesson',
                                                targetId: lesson.id,
                                            })}
                                            className="px-3 py-2 rounded-lg text-sm bg-red-50 text-red-600 hover:bg-red-100
                                                transition-colors"
                                        >
                                            حذف
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Enrolled Students section */}
            <div>
                <div className="mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">الطلاب المسجلون</h2>
                    <p className="text-sm text-gray-600 mt-1">{enrolledStudents.length} طالب</p>
                </div>

                {enrolledStudents.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
                        <div className="text-4xl mb-3">👥</div>
                        <h3 className="text-base font-semibold text-gray-900">لا يوجد طلاب مسجلون بعد</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            سجّل طلاباً من صفحة{' '}
                            <Link to="/admin/students" className="text-indigo-600 hover:underline">
                                إدارة الطلاب
                            </Link>
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">الاسم</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">الكود</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">الهاتف</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">الحالة</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700">إجراء</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {enrolledStudents.map(student => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{student.name}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-mono">{student.student_code}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-mono">{student.phone}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    student.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {student.is_active ? 'نشط' : 'معطّل'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setConfirmDialog({
                                                        isOpen: true,
                                                        action: 'revoke-student',
                                                        targetId: student.id,
                                                    })}
                                                    className="px-3 py-1 rounded-lg text-xs bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                >
                                                    إلغاء التسجيل
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Modals */}
            <CourseForm
                isOpen={courseFormOpen}
                course={course}
                isLoading={courseFormLoading}
                onSubmit={handleUpdateCourse}
                onCancel={() => setCourseFormOpen(false)}
            />

            <LessonForm
                isOpen={lessonFormOpen}
                lesson={editingLesson}
                isLoading={lessonFormLoading}
                isEdit={!!editingLesson}
                onSubmit={editingLesson ? handleUpdateLesson : handleCreateLesson}
                onCancel={() => {
                    setLessonFormOpen(false);
                    setEditingLesson(null);
                }}
            />

            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                title={
                    confirmDialog.action === 'delete-course'
                        ? 'حذف الكورس'
                        : confirmDialog.action === 'delete-lesson'
                        ? 'حذف الدرس'
                        : 'إلغاء تسجيل الطالب'
                }
                message={
                    confirmDialog.action === 'delete-course'
                        ? 'هل تريد حذف هذا الكورس؟ سيتم حذف جميع الدروس المرتبطة. لا يمكن التراجع.'
                        : confirmDialog.action === 'delete-lesson'
                        ? 'هل تريد حذف هذا الدرس؟ لا يمكن التراجع عن هذا الإجراء.'
                        : 'هل تريد إلغاء تسجيل هذا الطالب من الكورس؟'
                }
                confirmText={confirmDialog.action === 'revoke-student' ? 'إلغاء التسجيل' : 'حذف'}
                isDangerous={true}
                isLoading={confirmLoading}
                onConfirm={handleConfirmAction}
                onCancel={() => setConfirmDialog({ isOpen: false, action: null, targetId: null })}
            />

            {/* Toast notifications */}
            <Toast toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
