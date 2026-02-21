import { useState, useEffect } from 'react';

export default function StudentForm({
    isOpen,
    student = null,
    isLoading = false,
    onSubmit,
    onCancel,
}) {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        is_active: true,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (student) {
            setFormData({
                name: student.name || '',
                phone: student.phone || '',
                is_active: student.is_active ?? true,
            });
        } else {
            setFormData({
                name: '',
                phone: '',
                is_active: true,
            });
        }
        setErrors({});
    }, [student, isOpen]);

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

        if (!formData.name.trim()) {
            newErrors.name = 'الاسم مطلوب';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'الهاتف مطلوب';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(formData);
    };

    if (!isOpen) return null;

    const isEditMode = !!student;

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
                    {isEditMode ? 'تعديل طالب' : 'إضافة طالب جديد'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            الاسم
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="أدخل اسم الطالب"
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm
                                focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
                                disabled:bg-gray-50 disabled:opacity-50 transition-all"
                        />
                        {errors.name && (
                            <p className="text-xs text-red-600 mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            رقم الهاتف
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="مثال: 966501234567"
                            disabled={isLoading}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm
                                focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400
                                disabled:bg-gray-50 disabled:opacity-50 transition-all"
                        />
                        {errors.phone && (
                            <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                        )}
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
                                الطالب نشط
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
                            {isLoading ? 'جاري...' : isEditMode ? 'حفظ التعديلات' : 'إضافة الطالب'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
