export default function ConfirmDialog({
    isOpen,
    title,
    message,
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
    isDangerous = false,
    isLoading = false,
    onConfirm,
    onCancel,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/30"
                onClick={onCancel}
            />

            {/* Dialog */}
            <div className="relative bg-white rounded-xl shadow-lg p-6 max-w-sm mx-4">
                <h2 className="text-lg font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-sm text-gray-600 mb-6">{message}</p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium
                            hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50
                            ${isDangerous
                                ? 'bg-red-500 hover:bg-red-600'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                    >
                        {isLoading ? 'جاري...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
