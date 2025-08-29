export function HousesSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sigalit-50 to-sigalit-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="container mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3 mb-4 animate-pulse"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
        </div>

        {/* Houses Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* House 1 Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-sigalit-200 dark:border-gray-700">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6 animate-pulse"></div>
            
            {/* Weekly Schedule Skeleton */}
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 space-x-reverse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* House 2 Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-sigalit-200 dark:border-gray-700">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6 animate-pulse"></div>
            
            {/* Weekly Schedule Skeleton */}
            <div className="space-y-3">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 space-x-reverse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded flex-1 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions Skeleton */}
        <div className="flex justify-center space-x-4 space-x-reverse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-32 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}


