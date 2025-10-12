// /programs/[category]/[programSlug]/[sessionOrder]/loading.tsx - Session player loading
export default function SessionPlayerLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div>
                <div className="h-5 w-48 bg-gray-200 rounded mb-1 animate-pulse"></div>
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Progress Bar Skeleton */}
              <div className="hidden md:flex items-center gap-3">
                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-32 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
              
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Media Navigation Skeleton */}
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
            
            {/* Media Player Skeleton */}
            <div className="bg-black rounded-xl overflow-hidden">
              <div className="aspect-video bg-gray-800 relative">
                {/* Play button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-gray-600 rounded-full animate-pulse"></div>
                </div>
                
                {/* Controls overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="mb-4 h-1 bg-gray-600 rounded animate-pulse"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="w-8 h-8 bg-gray-600 rounded animate-pulse"></div>
                      ))}
                      <div className="h-4 w-24 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-4 w-20 bg-gray-600 rounded animate-pulse"></div>
                      <div className="w-8 h-8 bg-gray-600 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Info Skeleton */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="h-8 w-80 bg-gray-200 rounded mb-4 animate-pulse"></div>
              
              <div className="space-y-3 mb-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
              
              <div className="flex items-center gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Media List Skeleton */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse"></div>
              
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <MediaItemSkeleton key={i} isActive={i === 0} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Session Navigation Skeleton */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              {/* Current Session Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-64 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  
                  <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
              
              {/* Navigation Controls */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Program Info Skeleton */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="h-5 w-24 bg-gray-200 rounded mb-4 animate-pulse"></div>
              
              {/* Image */}
              <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 animate-pulse"></div>
              
              <div className="h-5 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
              
              {/* Stats */}
              <div className="space-y-2 mb-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
              
              {/* CTA Button */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>

            {/* Quick Actions Skeleton */}
            <div className="bg-white rounded-xl p-6 border border-gray-100">
              <div className="h-5 w-16 bg-gray-200 rounded mb-4 animate-pulse"></div>
              
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-10 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Media Item Skeleton
const MediaItemSkeleton = ({ isActive = false }: { isActive?: boolean }) => (
  <div className={`flex items-center gap-4 p-4 rounded-lg border transition ${
    isActive ? 'border-gray-300 bg-gray-50' : 'border-gray-100'
  }`}>
    <div className={`w-10 h-10 rounded-full animate-pulse ${
      isActive ? 'bg-gray-300' : 'bg-gray-200'
    }`}></div>
    
    <div className="flex-1">
      <div className={`h-4 rounded mb-2 animate-pulse ${
        isActive ? 'bg-gray-300 w-3/4' : 'bg-gray-200 w-2/3'
      }`}></div>
      
      <div className="flex items-center gap-4">
        <div className="h-3 w-12 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
      </div>
    </div>
    
    <div className={`w-4 h-4 rounded animate-pulse ${
      isActive ? 'bg-gray-300' : 'bg-gray-200'
    }`}></div>
  </div>
);