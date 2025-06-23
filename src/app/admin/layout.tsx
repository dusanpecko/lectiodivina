//admin/layout.tsx

"use client";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NavBar from "../components/NavBar";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed to prevent mismatch
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // session === undefined na začiatku -> čakáme na načítanie
    if (session !== undefined) {
      setLoading(false);
      if (session === null) {
        router.replace("/login");
      }
    }
  }, [session, router]);

  // Handle mobile detection and sidebar state - ONLY after mount
  useEffect(() => {
    setMounted(true);
    
    // Mobile detection function
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // Set sidebar state based on screen size - but only after mount
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Only set initial state after mount
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center">
          <div className="relative">
            {/* Animated loading rings */}
            <div className="w-16 h-16 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-purple-600 animate-spin"></div>
              <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-pink-600 animate-spin"></div>
            </div>
            
            {/* Loading text with gradient */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Načítavam administráciu
              </h2>
              <p className="text-gray-600 text-sm">Pripravujem admin rozhranie...</p>
            </div>
            
            {/* Animated dots */}
            <div className="flex justify-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // CRITICAL: Show consistent static layout until mounted (prevents hydration mismatch)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <div className="sticky top-0 z-50">
            <NavBar />
          </div>
          
          <div className="flex flex-1 relative">
            {/* Static sidebar - always show consistent state */}
            <AdminSidebar 
              isCollapsed={true}  // Always collapsed during SSR/hydration
              onToggle={() => {}} // No-op during hydration
              isMobile={false}    // Consistent default
            />
            
            <main className="flex-1 min-w-0">
              <div className="p-4 lg:p-8">
                <div className="max-w-none">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  // After mount - fully interactive version
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <div className="sticky top-0 z-50">
          <NavBar />
        </div>
        
        <div className="flex flex-1 relative">
          {/* Sidebar */}
          <AdminSidebar 
            isCollapsed={!sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            isMobile={isMobile}
          />
          
          {/* Mobile overlay */}
          {sidebarOpen && isMobile && (
            <div 
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Main Content */}
          <main className={`
            flex-1 min-w-0 transition-all duration-300 ease-in-out
            ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}
          `}>
            {/* Content wrapper with proper spacing */}
            <div className="relative">
              {/* Floating action elements container - len na mobile ak je sidebar zatvorený */}
              {isMobile && !sidebarOpen && (
                <div className="absolute top-4 right-4 z-20">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-3 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 hover:bg-white/90 transition-all duration-200"
                    aria-label="Open menu"
                  >
                    <svg
                      className="w-5 h-5 text-gray-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              )}
              
              {/* Page content */}
              <div className="p-4 lg:p-8">
                {/* Content container */}
                <div className="max-w-none">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}