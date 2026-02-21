import { useState, useEffect } from 'react';
import {
  fetchAvailableCourses,
  fetchStudentEnrollments,
  enrollStudentInCourses,
  revokeEnrollment
} from '../../api/admin/enrollments';
import Toast from '../ui/Toast';
import ConfirmDialog from '../ui/ConfirmDialog';

export default function StudentEnrollmentsModal({ student, isOpen, onClose, onEnrollmentChange }) {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEnroll, setLoadingEnroll] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Load enrollments and available courses
  useEffect(() => {
    if (isOpen && student?.id) {
      loadData();
    }
  }, [isOpen, student?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [enrolled, available] = await Promise.all([
        fetchStudentEnrollments(student.id),
        fetchAvailableCourses()
      ]);
      setEnrolledCourses(enrolled);

      // Filter available courses - exclude already enrolled
      const enrolledIds = enrolled.map(e => e.id);
      const filteredAvailable = available.filter(c => !enrolledIds.includes(c.id));
      setAvailableCourses(filteredAvailable);
      setSelectedCourseIds([]);
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message || 'فشل تحميل البيانات'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = (courseId) => {
    setSelectedCourseIds(prev =>
      prev.includes(courseId)
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleEnrollCourses = async () => {
    if (selectedCourseIds.length === 0) {
      setToast({
        type: 'warning',
        message: 'اختر كورس واحد على الأقل'
      });
      return;
    }

    setLoadingEnroll(true);
    try {
      await enrollStudentInCourses(student.id, selectedCourseIds);
      setToast({
        type: 'success',
        message: 'تم تسجيل الكورسات بنجاح'
      });
      // Reload enrollments
      await loadData();
      if (onEnrollmentChange) {
        onEnrollmentChange();
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message || 'فشل تسجيل الكورسات'
      });
    } finally {
      setLoadingEnroll(false);
    }
  };

  const handleRevokeEnrollment = (course) => {
    setConfirmDialog({
      title: 'إلغاء تسجيل كورس',
      message: `هل تريد إلغاء تسجيل الطالب من كورس "${course.title}"؟`,
      onConfirm: async () => {
        try {
          await revokeEnrollment(student.id, course.id);
          setToast({
            type: 'success',
            message: 'تم إلغاء التسجيل'
          });
          await loadData();
          if (onEnrollmentChange) {
            onEnrollmentChange();
          }
          setConfirmDialog(null);
        } catch (error) {
          setToast({
            type: 'error',
            message: error.message || 'فشل إلغاء التسجيل'
          });
        }
      },
      onCancel: () => setConfirmDialog(null),
      isDanger: true
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900 text-right">
              تسجيل الكورسات - {student?.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : (
              <>
                {/* Enrolled Courses Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">
                    الكورسات المسجلة ({enrolledCourses.length})
                  </h3>
                  {enrolledCourses.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      لم يتم تسجيل الطالب في أي كورس بعد
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {enrolledCourses.map(course => (
                        <div
                          key={course.id}
                          className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200"
                        >
                          <button
                            onClick={() => handleRevokeEnrollment(course)}
                            className="px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm font-medium"
                          >
                            إلغاء التسجيل
                          </button>
                          <div className="text-right flex-1 mr-4">
                            <p className="font-medium text-gray-900">{course.title}</p>
                            {course.description && (
                              <p className="text-sm text-gray-600 line-clamp-1">
                                {course.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Available Courses Section */}
                <div className="border-t pt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 text-right">
                    الكورسات المتاحة ({availableCourses.length})
                  </h3>
                  {availableCourses.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      الطالب مسجل بالفعل في جميع الكورسات
                    </p>
                  ) : (
                    <>
                      <div className="space-y-2 mb-4">
                        {availableCourses.map(course => (
                          <label
                            key={course.id}
                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCourseIds.includes(course.id)}
                              onChange={() => handleSelectCourse(course.id)}
                              className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div className="text-right flex-1 mr-4">
                              <p className="font-medium text-gray-900">{course.title}</p>
                              {course.description && (
                                <p className="text-sm text-gray-600 line-clamp-1">
                                  {course.description}
                                </p>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>

                      {/* Bulk Enroll Button */}
                      <button
                        onClick={handleEnrollCourses}
                        disabled={selectedCourseIds.length === 0 || loadingEnroll}
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-right"
                      >
                        {loadingEnroll ? 'جاري التسجيل...' : `تسجيل (${selectedCourseIds.length})`}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog && <ConfirmDialog {...confirmDialog} />}
    </>
  );
}
