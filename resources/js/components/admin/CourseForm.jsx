import { useState, useEffect } from 'react';

export default function CourseForm({
    isOpen,
    course = null,
    isLoading = false,
    onSubmit,
    onCancel,
}) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        is_active: true,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || '',
                description: course.description || '',
                is_active: course.is_active ?? true,
            });
        } else {
            setFormData({
                title: '',
                description: '',
                is_active: true,
            });
        }
        setErrors({});
    }, [course, isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'اسم الكورس مطلوب';
        }

        if (formData.title.trim().length > 200) {
            newErrors.title = 'اسم الكورس لا يزيد عن 200 حرف';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(formData);
    };

    if (!isOpen) return null;

    const isEditMode = !!course;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/30"
                onClick={onCancel}
            />

            {/* Form */}
            <div className="relative bg-white rounded-xl shadow-lg p-8 max-w-sm mx-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    {isEditMode ? 'تعديل كورس' : 'إضافة كورس جديد'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            اسم الكورس
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="أدخل اسم الكورس"
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
                            placeholder="أدخل وصف الكورس"
                            disabled={isLoading}
                            rows={3}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm
                                focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
                                disabled:bg-gray-50 disabled:opacity-50 transition-all resize-none"
                        />
                    </div>

                    {isEditMode && (
                        <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 border border-gray-200">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                disabled={isLoading}
                                className="cursor-pointer"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-700 cursor-pointer flex-1">
                                الكورس نشط
                            </label>
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
                            {isLoading ? 'جاري...' : isEditMode ? 'حفظ التعديلات' : 'إضافة الكورس'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
