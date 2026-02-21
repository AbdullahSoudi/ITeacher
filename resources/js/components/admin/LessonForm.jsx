import { useState, useEffect } from 'react';
import { validateYouTubeUrl } from '../../api/admin/lessons';

export default function LessonForm({
    isOpen,
    lesson = null,
    isLoading = false,
    onSubmit,
    onCancel,
    isEdit = false,
}) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        youtube_url: '',
        order: null,
    });
    const [errors, setErrors] = useState({});
    const [youtubeUrlError, setYoutubeUrlError] = useState('');

    useEffect(() => {
        if (lesson) {
            setFormData({
                title: lesson.title || '',
                description: lesson.description || '',
                youtube_url: lesson.youtube_url || '',
                order: lesson.order || null,
            });
        } else {
            setFormData({
                title: '',
                description: '',
                youtube_url: '',
                order: null,
            });
        }
        setErrors({});
        setYoutubeUrlError('');
    }, [lesson, isOpen]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const newValue = type === 'number' ? (value ? parseInt(value) : null) : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue,
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }

        // Validate YouTube URL in real-time
        if (name === 'youtube_url') {
            if (value && !validateYouTubeUrl(value)) {
                setYoutubeUrlError('رابط YouTube غير صحيح. تأكد من صيغة الرابط');
            } else {
                setYoutubeUrlError('');
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'عنوان الدرس مطلوب';
        }

        if (formData.title.trim().length > 200) {
            newErrors.title = 'العنوان لا يزيد عن 200 حرف';
        }

        if (!formData.youtube_url.trim()) {
            newErrors.youtube_url = 'رابط YouTube مطلوب';
        } else if (!validateYouTubeUrl(formData.youtube_url)) {
            newErrors.youtube_url = 'رابط YouTube غير صحيح';
        }

        if (isEdit && formData.order === null) {
            newErrors.order = 'ترتيب الدرس مطلوب';
        } else if (formData.order !== null && formData.order < 1) {
            newErrors.order = 'الترتيب يجب أن يكون رقماً موجباً';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/30"
                onClick={onCancel}
            />

            {/* Form */}
            <div className="relative bg-white rounded-xl shadow-lg p-8 max-w-sm mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {isEdit ? 'تعديل درس' : 'إضافة درس جديد'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            عنوان الدرس
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="أدخل عنوان الدرس"
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm
                                focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
                                disabled:bg-gray-50 disabled:opacity-50 transition-all"
                        />
                        {errors.title && (
                            <p className="text-xs text-red-600 mt-1">{errors.title}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            الوصف (اختياري)
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="أدخل وصف الدرس"
                            disabled={isLoading}
                            rows={2}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm
                                focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
                                disabled:bg-gray-50 disabled:opacity-50 transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            رابط YouTube
                        </label>
                        <input
                            type="text"
                            name="youtube_url"
                            value={formData.youtube_url}
                            onChange={handleChange}
                            placeholder="https://www.youtube.com/watch?v=..."
                            disabled={isLoading}
                            className={`w-full px-4 py-3 rounded-lg border text-sm
                                focus:outline-none focus:ring-2 focus:border-indigo-400
                                disabled:bg-gray-50 disabled:opacity-50 transition-all
                                ${youtubeUrlError ? 'border-red-300 focus:ring-red-300' : 'border-gray-200 focus:ring-indigo-300'}`}
                        />
                        {youtubeUrlError && (
                            <p className="text-xs text-red-600 mt-1">{youtubeUrlError}</p>
                        )}
                        {errors.youtube_url && (
                            <p className="text-xs text-red-600 mt-1">{errors.youtube_url}</p>
                        )}
                    </div>

                    {isEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                ترتيب الدرس
                            </label>
                            <input
                                type="number"
                                name="order"
                                value={formData.order || ''}
                                onChange={handleChange}
                                placeholder="أدخل رقم الترتيب"
                                disabled={isLoading}
                                min="1"
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm
                                    focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
                                    disabled:bg-gray-50 disabled:opacity-50 transition-all"
                            />
                            {errors.order && (
                                <p className="text-xs text-red-600 mt-1">{errors.order}</p>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium
                                hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 text-white text-sm font-medium
                                hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? 'جاري...' : isEdit ? 'حفظ التعديلات' : 'إضافة الدرس'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
