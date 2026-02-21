const variants = {
    active:    'bg-green-50 text-green-700 border border-green-200',
    inactive:  'bg-gray-100 text-gray-600 border border-gray-200',
    completed: 'bg-blue-50 text-blue-700 border border-blue-200',
    pending:   'bg-amber-50 text-amber-700 border border-amber-200',
    danger:    'bg-red-50 text-red-600 border border-red-200',
};

export default function Badge({ children, variant = 'active' }) {
    return (
        <span className={`
            inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${variants[variant] ?? variants.inactive}
        `}>
            {children}
        </span>
    );
}
