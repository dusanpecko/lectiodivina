// /programs/[category]/loading.tsx - Category stránka loading
export default function CategoryLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category Hero Skeleton */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Category Icon & Title */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl animate-pulse"></div>
              <div className="h-12 w-64 bg-white/20 rounded-lg animate-pulse"></div>
            </div>
            
            {/* Category Description */}
            <div className="space-y-3 mb-8">
              <div className="h-6 bg-white/15 rounded max-w-3xl mx-auto animate-pulse"></div>
              <div className="h-6 bg-white/15 rounded max-w-2xl mx-auto animate-pulse"></div>
            </div>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 w-12 bg-white/20 rounded mx-auto mb-2 animate-pulse"></div>
                  <div className="h-4 w-16 bg-white/15 rounded mx-auto animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Breadcrumb Skeleton */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-1 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-1 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Filter & Sort Controls Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
        
        {/* Programs Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <CategoryProgramCardSkeleton key={i} />
          ))}
        </div>
        
        {/* Pagination Skeleton */}
        <div className="flex justify-center mt-12">
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
            <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Category-specific Program Card Skeleton
const CategoryProgramCardSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    {/* Image with overlay */}
    <div className="relative h-48 bg-gray-200">
      {/* Featured badge skeleton */}
      <div className="absolute top-3 right-3 h-6 w-20 bg-gray-300 rounded-full"></div>
    </div>
    
    {/* Content */}
    <div className="p-6">
      {/* Title */}
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      
      {/* Author */}
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
      
      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-4/5"></div>
      </div>
      
      {/* Stats & CTA */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
          <div className="h-3 w-16 bg-gray-200 rounded"></div>
        </div>
        <div className="h-8 w-16 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);