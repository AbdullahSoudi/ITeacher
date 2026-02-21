function SkeletonLine({ className = '' }) {
    return (
        <div className={`h-4 bg-gray-200 rounded-lg animate-pulse ${className}`} />
    );
}

function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            <SkeletonLine className="w-1/3" />
            <SkeletonLine className="w-full" />
            <SkeletonLine className="w-2/3" />
        </div>
    );
}

export default function LoadingSkeleton({ count = 3 }) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonCard key={i} />
            ))}
        </div>
    );
}
