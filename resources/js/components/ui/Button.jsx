const variants = {
    primary:     'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary:   'bg-gray-100 hover:bg-gray-200 text-gray-700',
    ghost:       'bg-transparent hover:bg-gray-100 text-gray-600',
    destructive: 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200',
};

export default function Button({
    children,
    variant = 'primary',
    className = '',
    type = 'button',
    ...props
}) {
    return (
        <button
            type={type}
            className={`
                inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                ${variants[variant]} ${className}
            `}
            {...props}
        >
            {children}
        </button>
    );
}
