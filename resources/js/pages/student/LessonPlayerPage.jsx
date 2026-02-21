import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLesson, extractYouTubeVideoId } from '../../api/student/lessons';
import { markLessonComplete } from '../../api/student/progress';
import Toast from '../../components/ui/Toast';

export default function LessonPlayerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const loadLesson = async () => {
      setLoading(true);
      try {
        const data = await fetchLesson(id);
        setLesson(data);
      } catch (error) {
        setToast({
          type: 'error',
          message: error.message || 'فشل تحميل الدرس'
        });
      } finally {
        setLoading(false);
      }
    };

    loadLesson();
  }, [id]);

  const handleMarkComplete = async () => {
    if (lesson?.is_completed) return;

    setMarking(true);
    try {
      await markLessonComplete(id);
      setToast({
        type: 'success',
        message: 'تم تحديث حالة المشاهدة'
      });
      // Update lesson state
      setLesson(prev => ({ ...prev, is_completed: true }));
    } catch (error) {
      setToast({
        type: 'error',
        message: error.message || 'فشل تحديث حالة المشاهدة'
      });
    } finally {
      setMarking(false);
    }
  };

  const navigateToPrevious = () => {
    if (lesson?.previous_lesson_id) {
      navigate(`/student/lessons/${lesson.previous_lesson_id}`);
    }
  };

  const navigateToNext = () => {
    if (lesson?.next_lesson_id) {
      navigate(`/student/lessons/${lesson.next_lesson_id}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-sm text-gray-600">جاري تحميل الدرس...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/student/courses')}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <span>←</span> العودة للكورسات
        </button>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900">لم يتم العثور على الدرس</h2>
        </div>
      </div>
    );
  }

  const videoId = extractYouTubeVideoId(lesson.youtube_url);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(`/student/courses/${lesson.course_id}`)}
          className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <span>←</span> العودة للكورس
        </button>

        <div className="flex items-start justify-between gap-4 text-right">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
            {lesson.course_title && (
              <p className="text-gray-600 mb-4">{lesson.course_title}</p>
            )}
            {lesson.description && (
              <p className="text-gray-700 mb-4">{lesson.description}</p>
            )}
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0">
            {lesson.is_completed ? (
              <span className="inline-block px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                ✓ تمت المشاهدة
              </span>
            ) : (
              <span className="inline-block px-4 py-2 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
                لم يشاهد
              </span>
            )}
          </div>
        </div>
      </div>

      {/* YouTube Player */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {videoId ? (
          <div className="aspect-video bg-black">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={lesson.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        ) : (
          <div className="aspect-video bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-3">🎬</div>
              <p className="text-gray-400 text-lg">رابط الفيديو غير متاح</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Navigation */}
        <div className="flex gap-2 order-2 md:order-1 w-full md:w-auto">
          <button
            onClick={navigateToPrevious}
            disabled={!lesson.previous_lesson_id}
            className="flex-1 md:flex-none px-6 py-3 flex items-center gap-2 rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <span>→</span>
            <span>الدرس السابق</span>
          </button>

          <button
            onClick={navigateToNext}
            disabled={!lesson.next_lesson_id}
            className="flex-1 md:flex-none px-6 py-3 flex items-center gap-2 rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            <span>الدرس التالي</span>
            <span>←</span>
          </button>
        </div>

        {/* Mark Complete Button */}
        <button
          onClick={handleMarkComplete}
          disabled={lesson.is_completed || marking}
          className={`flex-1 md:flex-none px-8 py-3 flex items-center justify-center gap-2 rounded-lg font-medium transition-colors order-1 md:order-2
            ${
              lesson.is_completed
                ? 'bg-green-100 text-green-800 cursor-default'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
            }
          `}
        >
          {marking ? (
            <>
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>جاري التحديث...</span>
            </>
          ) : lesson.is_completed ? (
            <>
              <span>✓</span>
              <span>تمت المشاهدة</span>
            </>
          ) : (
            <>
              <span>✓</span>
              <span>تم المشاهدة</span>
            </>
          )}
        </button>
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
