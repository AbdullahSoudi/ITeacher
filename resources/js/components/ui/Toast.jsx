import { useState, useEffect } from 'react';

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const show = (message, type = 'success', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, duration);
        }

        return id;
    };

    const remove = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return { toasts, show, remove };
}

export default function Toast({ toasts, onRemove }) {
    return (
        <div className="fixed top-4 left-4 z-50 space-y-2 max-w-sm">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`p-4 rounded-lg shadow-lg text-white text-sm animate-slide-in-left ${
                        toast.type === 'success' ? 'bg-green-500' :
                        toast.type === 'error' ? 'bg-red-500' :
                        toast.type === 'info' ? 'bg-blue-500' :
                        'bg-amber-500'
                    }`}
                >
                    <div className="flex items-start justify-between gap-2">
                        <span>{toast.message}</span>
                        <button
                            onClick={() => onRemove(toast.id)}
                            className="mt-0.5 text-lg hover:opacity-75"
                        >
                            ×
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
