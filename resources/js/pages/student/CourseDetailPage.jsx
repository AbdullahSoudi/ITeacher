import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCourse } from '../../api/student/courses';
import Toast from '../../components/ui/Toast';

export default function StudentCourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true);
      try {
        const data = await fetchCourse(id);
        setCourse(data);
      } catch (error) {
        setToast({
          type: 'error',
          message: error.message || 'فشل تحميل الكورس'
        });
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-sm text-gray-600">جاري تحميل الكورس...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/student/courses')}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <span>←</span> العودة للكورسات
        </button>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900">لم يتم العثور على الكورس</h2>
        </div>
      </div>
    );
  }

  const lessonsCount = course.lessons?.length || 0;
  const completedCount = course.lessons?.filter(l => l.is_completed).length || 0;
  const progress = lessonsCount > 0 ? Math.round((completedCount / lessonsCount) * 100) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/student/courses')}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <span>←</span> العودة للكورسات
        </button>

        <div className="text-right">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
          {course.description && (
            <p className="text-gray-600 mb-4">{course.description}</p>
          )}

          {/* Progress Bar */}
          <div className="max-w-sm ms-auto">
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
        </div>
      </div>

      {/* Lessons List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Section Header */}
        <div className="px-6 py-4 border-b border-gray-200 text-right">
          <h2 className="text-lg font-semibold text-gray-900">
            الدروس ({lessonsCount})
          </h2>
        </div>

        {/* Empty State */}
        {lessonsCount === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-lg font-semibold text-gray-900">لا توجد دروس</h3>
            <p className="text-sm text-gray-600 mt-1">سيتم إضافة الدروس قريباً</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {course.lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="p-6 hover:bg-gray-50 transition-colors flex items-center gap-4 cursor-pointer"
                onClick={() => navigate(`/student/lessons/${lesson.id}`)}
              >
                {/* Order Badge */}
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                    #{index + 1}
                  </div>
                </div>

                {/* Lesson Content */}
                <div className="flex-grow text-right">
                  <h3 className="font-semibold text-gray-900 text-right">
                    {lesson.title}
                  </h3>
                  {lesson.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1 text-right">
                      {lesson.description}
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="flex-shrink-0 text-right">
                  {lesson.is_completed ? (
                    <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                      ✓ تمت المشاهدة
                    </span>
                  ) : (
                    <span className="inline-block px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
                      لم يشاهد
                    </span>
                  )}
                </div>

                {/* Arrow */}
                <div className="text-gray-400 text-xl flex-shrink-0">←</div>
              </div>
            ))}
          </div>
        )}
      </div>

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
