// /programs/[category]/[programSlug]/loading.tsx - Program detail loading
export default function ProgramDetailLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button Skeleton */}
      <div className="container mx-auto px-6 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <div className="relative h-96 lg:h-[500px] bg-gray-300 animate-pulse">
        {/* Content overlay skeleton */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-6 pb-12">
            <div className="max-w-4xl">
              {/* Category Badge */}
              <div className="h-8 w-32 bg-white/20 rounded-full mb-4"></div>
              
              {/* Title */}
              <div className="space-y-3 mb-4">
                <div className="h-12 bg-white/20 rounded-lg"></div>
                <div className="h-12 bg-white/20 rounded-lg w-3/4"></div>
              </div>
              
              {/* Author */}
              <div className="h-6 w-48 bg-white/15 rounded mb-4"></div>
              
              {/* Stats */}
              <div className="flex items-center gap-6 mb-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-5 w-24 bg-white/15 rounded"></div>
                ))}
              </div>
              
              {/* Description */}
              <div className="space-y-2 mb-8 max-w-3xl">
                <div className="h-5 bg-white/15 rounded"></div>
                <div className="h-5 bg-white/15 rounded w-5/6"></div>
                <div className="h-5 bg-white/15 rounded w-4/6"></div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-40 bg-white/20 rounded-xl"></div>
                <div className="h-14 w-32 bg-white/15 rounded-xl"></div>
                <div className="h-14 w-32 bg-white/15 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Program Info Section Skeleton */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="h-8 w-64 bg-gray-200 rounded mb-6 animate-pulse"></div>
              <div className="space-y-3 mb-8">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
              
              {/* What to expect box */}
              <div className="p-6 bg-gray-100 rounded-xl border">
                <div className="h-6 w-32 bg-gray-200 rounded mb-3 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Quick Stats Sidebar */}
            <div className="bg-gray-50 rounded-2xl p-8">
              <div className="h-6 w-32 bg-gray-200 rounded mb-6 animate-pulse"></div>
              <div className="space-y-6">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
              
              {/* Progress Section */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="h-5 w-24 bg-gray-200 rounded mb-3 animate-pulse"></div>
                <div className="bg-gray-200 rounded-full h-2 mb-2 animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sessions List Skeleton */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-12 w-40 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-xl p-6 border border-gray-100 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 w-16 bg-gray-200 rounded mx-auto mb-1 animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded mx-auto animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Sessions List */}
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SessionCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Related Programs Skeleton */}
      <div className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-5xl mx-auto">
            <div className="h-8 w-48 bg-gray-200 rounded mb-8 animate-pulse"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-gray-50 rounded-xl p-8 text-center border border-gray-100">
                  <div className="w-12 h-12 bg-gray-200 rounded mx-auto mb-4 animate-pulse"></div>
                  <div className="h-5 w-24 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                  <div className="h-4 w-20 bg-gray-200 rounded mx-auto animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-8 w-80 bg-white/20 rounded mx-auto mb-4 animate-pulse"></div>
            <div className="h-6 w-96 bg-white/15 rounded mx-auto mb-8 animate-pulse"></div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="h-14 w-40 bg-white/20 rounded-xl animate-pulse"></div>
              <div className="h-14 w-40 bg-white/15 rounded-xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Session Card Skeleton
const SessionCardSkeleton = () => (
  <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 animate-pulse">
    {/* Session Number */}
    <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
    
    {/* Session Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-5 bg-gray-200 rounded w-48"></div>
        <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="flex items-center gap-4">
        <div className="h-3 w-12 bg-gray-200 rounded"></div>
        <div className="h-3 w-16 bg-gray-200 rounded"></div>
        <div className="h-3 w-20 bg-gray-200 rounded"></div>
      </div>
    </div>
    
    {/* Arrow */}
    <div className="w-5 h-5 bg-gray-200 rounded flex-shrink-0"></div>
  </div>
);