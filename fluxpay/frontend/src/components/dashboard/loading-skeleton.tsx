export default function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-4 md:p-6 lg:p-8">
      {/* Welcome header skeleton */}
      <div className="space-y-3">
        <div className="h-8 w-72 bg-gray-200 dark:bg-white/[0.06] rounded-lg" />
        <div className="h-4 w-96 bg-gray-200 dark:bg-white/[0.06] rounded-lg" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="border border-gray-200 dark:border-white/[0.06] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 bg-gray-200 dark:bg-white/[0.06] rounded-xl" />
              <div className="h-5 w-14 bg-gray-200 dark:bg-white/[0.06] rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-24 bg-gray-200 dark:bg-white/[0.06] rounded" />
              <div className="h-7 w-20 bg-gray-200 dark:bg-white/[0.06] rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-gray-200 dark:bg-white/[0.06] rounded" />
              <div className="h-3 w-20 bg-gray-200 dark:bg-white/[0.06] rounded" />
            </div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-white/[0.06] rounded-xl" />
        </div>
        <div className="border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
          <div className="space-y-2 mb-6">
            <div className="h-5 w-40 bg-gray-200 dark:bg-white/[0.06] rounded" />
            <div className="h-3 w-24 bg-gray-200 dark:bg-white/[0.06] rounded" />
          </div>
          <div className="h-48 bg-gray-200 dark:bg-white/[0.06] rounded-full w-40 mx-auto" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="border border-gray-200 dark:border-white/[0.06] rounded-xl p-6">
        <div className="h-5 w-40 bg-gray-200 dark:bg-white/[0.06] rounded mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-24 bg-gray-200 dark:bg-white/[0.06] rounded" />
              <div className="h-4 w-20 bg-gray-200 dark:bg-white/[0.06] rounded" />
              <div className="h-4 w-16 bg-gray-200 dark:bg-white/[0.06] rounded" />
              <div className="h-4 w-16 bg-gray-200 dark:bg-white/[0.06] rounded-full" />
              <div className="h-4 flex-1 bg-gray-200 dark:bg-white/[0.06] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
