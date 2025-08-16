// /programs/loading.tsx - Hlavná stránka programov loading
export default function ProgramsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="h-16 bg-white/20 rounded-lg mb-6 animate-pulse"></div>
            <div className="h-8 bg-white/15 rounded-lg mb-8 max-w-2xl mx-auto animate-pulse"></div>
            
            {/* Search Bar Skeleton */}
            <div className="relative max-w-2xl mx-auto">
              <div className="h-16 bg-white/20 rounded-2xl animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Section Skeleton */}
      <div className="bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-10 w-16 bg-gray-200 rounded mx-auto mb-2 animate-pulse"></div>
                <div className="h-4 w-20 bg-gray-200 rounded mx-auto animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Main Content Skeleton */}
      <div className="container mx-auto px-6 py-12">
        {/* Filters Skeleton */}
        <div className="mb-12">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 w-32 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
            ))}
          </div>
        </div>

        {/* Featured Programs Skeleton */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProgramCardSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* All Programs Skeleton */}
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProgramCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Program Card Skeleton
const ProgramCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    {/* Image Skeleton */}
    <div className="h-48 bg-gray-200"></div>
    
    {/* Content Skeleton */}
    <div className="p-6">
      {/* Category Badge */}
      <div className="h-6 w-24 bg-gray-200 rounded-full mb-3"></div>
      
      {/* Title */}
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      
      {/* Author */}
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
      
      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      
      {/* Stats */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="h-4 w-16 bg-gray-200 rounded"></div>
          <div className="h-4 w-12 bg-gray-200 rounded"></div>
        </div>
        <div className="h-4 w-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);