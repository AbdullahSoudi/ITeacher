export default function EmptyState({
    title = 'لا توجد بيانات',
    description = '',
    icon = '📭',
    action = null,
}) {
    return (
        <div className="flex flex-col items-center justify-center py-14 text-center px-4">
            <div className="text-5xl mb-4">{icon}</div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-gray-400 mb-4 max-w-xs">{description}</p>
            )}
            {action && <div className="mt-2">{action}</div>}
        </div>
    );
}
