import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchMyCourses } from '../../api/student/courses';
import Toast from '../../components/ui/Toast';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        const data = await fetchMyCourses();
        setCourses(data);
      } catch (error) {
        setToast({
          type: 'error',
          message: error.message || 'فشل تحميل الكورسات'
        });
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const calculateProgress = (course) => {
    if (!course.lessons || course.lessons.length === 0) return 0;
    const completed = course.lessons.filter(l => l.is_completed).length;
    return Math.round((completed / course.lessons.length) * 100);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-right">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">دوراتي</h1>
        <p className="text-gray-600">الكورسات التي تعلمت فيها</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-sm text-gray-600">جاري تحميل الكورسات...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && courses.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">لم تسجل بعد في أي كورس</h3>
          <p className="text-gray-600">تواصل مع الإدارة لتسجيلك في الكورسات</p>
        </div>
      )}

      {/* Courses Grid */}
      {!loading && courses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => {
            const progress = calculateProgress(course);
            const lessonsCount = course.lessons?.length || 0;
            const completedCount = course.lessons?.filter(l => l.is_completed).length || 0;

            return (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/student/courses/${course.id}`)}
              >
                {/* Card Header - Gradient Background */}
                <div className="h-24 bg-gradient-to-l from-blue-600 to-blue-500" />

                {/* Card Body */}
                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 text-right">
                    {course.title}
                  </h3>

                  {/* Description */}
                  {course.description && (
                    <p className="text-sm text-gray-600 mb-4 text-right line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  {/* Lessons Count */}
                  <div className="text-sm text-gray-700 mb-4 text-right">
                    <span className="font-medium">{lessonsCount}</span>
                    <span className="text-gray-600"> درس</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-gray-600 font-medium">
                        {completedCount} / {lessonsCount}
                      </span>
                      <span className="text-xs text-gray-600 font-medium">
                        {progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="text-right">
                    {progress === 100 ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                        ✓ اكتمل
                      </span>
                    ) : progress > 0 ? (
                      <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                        جاري الدراسة
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
                        لم يبدأ
                      </span>
                    )}
                  </div>
                </div>

                {/* Click Hint */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-right">
                  <p className="text-xs text-gray-500">انقر لعرض الدروس →</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
