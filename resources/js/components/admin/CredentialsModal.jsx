import { useState } from 'react';

export default function CredentialsModal({
    isOpen,
    student,
    password,
    onClose,
    isPasswordReset = false,
}) {
    const [copiedField, setCopiedField] = useState(null);

    if (!isOpen) return null;

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/30"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-lg p-8 max-w-sm mx-4">
                <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {isPasswordReset ? 'كلمة مرور جديدة' : 'بيانات الدخول'}
                    </h2>
                    <p className="text-sm text-amber-600 flex items-center justify-center gap-1">
                        <span>⚠️</span>
                        <span>مرة واحدة فقط</span>
                    </p>
                </div>

                <div className="space-y-4 mb-8">
                    {!isPasswordReset && (
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                                كود الطالب (Student Code)
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={student?.student_code || ''}
                                    className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm font-mono text-gray-700"
                                />
                                <button
                                    onClick={() => handleCopy(student?.student_code || '', 'code')}
                                    className="px-3 py-3 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100
                                        transition-colors text-sm font-medium"
                                >
                                    {copiedField === 'code' ? '✓ نسخ' : 'نسخ'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-2">
                            كلمة المرور (Password)
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                readOnly
                                value={password || ''}
                                className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm font-mono text-gray-700"
                            />
                            <button
                                onClick={() => handleCopy(password || '', 'password')}
                                className="px-3 py-3 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100
                                    transition-colors text-sm font-medium"
                            >
                                {copiedField === 'password' ? '✓ نسخ' : 'نسخ'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 rounded-lg bg-red-50 border border-red-200 mb-6">
                    <p className="text-xs text-red-800 text-center">
                        احفظ هذه البيانات في مكان آمن. لن تظهر مجددًا.
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="w-full px-4 py-3 rounded-lg bg-indigo-600 text-white text-sm font-medium
                        hover:bg-indigo-700 transition-colors"
                >
                    فهمت
                </button>
            </div>
        </div>
    );
}
