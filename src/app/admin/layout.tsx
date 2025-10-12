//admin/layout.tsx

"use client";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserRole } from "../../hooks/useUserRole";
import NavBar from "../components/NavBar";
import AdminSidebar from "../components/AdminSidebar";
import "./admin-edit.css";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { session } = useSupabase();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Default closed to prevent mismatch
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Čakáme na načítanie session a roly
    if (session !== undefined && !roleLoading) {
      setLoading(false);
      
      if (session === null) {
        // Uložíme aktuálnu URL pre redirect po prihlásení
        const currentPath = window.location.pathname + window.location.search;
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }
      
      // Kontrola admin roly - error screen sa zobrazí automaticky ak nie je admin
    }
  }, [session, router, isAdmin, roleLoading]);

  // Handle mobile detection and sidebar state - ONLY after mount
  useEffect(() => {
    setMounted(true);
    
    // Mobile detection function
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      
      // OPRAVA: Na mobile vždy zavrieme sidebar pri resize
      if (mobile) {
        setSidebarOpen(false);
      } else {
        // Na desktop môžeme nechať otvorený
        setSidebarOpen(true);
      }
    };

    // Only set initial state after mount
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // NOVÉ: Funkcia na zatvorenie sidebaru (pre overlay a escape key)
  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // NOVÉ: Escape key handler pre zatvorenie sidebaru
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen && isMobile) {
        closeSidebar();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [sidebarOpen, isMobile]);

  // Ak má session ale nie je admin, zobraz error
  if (session && !roleLoading && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-12 text-center max-w-md">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Prístup zamietnutý
            </h2>
            <p className="text-gray-600 mb-6">
              Nemáte oprávnenie na prístup do administračného rozhrania. Iba administrátori môžu pristupovať k tejto sekcii.
            </p>
            <button
              onClick={() => router.replace("/")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Späť na hlavnú stránku
            </button>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="h-screen overflow-hidden" style={{ backgroundColor: '#f8f9fa' }}>
        {/* Background pattern - removed for clean background */}
        
        <div className="relative z-10 h-screen flex flex-col">
          <div className="fixed top-0 left-0 right-0 z-50">
            <NavBar />
          </div>
          
          <div className="flex flex-1 pt-16">
            {/* Static sidebar - always show consistent state */}
            <AdminSidebar 
              isCollapsed={true}  // Always collapsed during SSR/hydration
              onToggle={() => {}} // No-op during hydration
              isMobile={false}    // Consistent default
            />
            
            <main className="flex-1 min-w-0 overflow-y-auto">
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
      <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Background pattern - removed for clean background */}      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top Navigation - Fixed */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <NavBar />
        </div>
        
        {/* Main content with padding for fixed navbar */}
        <div className="flex flex-1 pt-16">
          {/* Sidebar - OPRAVA: Na mobile sa zobrazuje len keď je otvorený */}
          {(!isMobile || sidebarOpen) && (
            <div className={`
              ${isMobile 
                ? 'fixed top-16 bottom-0 left-0 z-40 w-64 max-w-[80vw] overflow-y-auto overscroll-contain' 
                : 'sticky top-16 h-[calc(100vh-4rem)] flex-shrink-0'
              }
            `}>
              <AdminSidebar 
                isCollapsed={isMobile ? false : !sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                isMobile={isMobile}
              />
            </div>
          )}
          
          {/* Mobile overlay - OPRAVA: Jednoduchší overlay */}
          {sidebarOpen && isMobile && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
              onClick={closeSidebar}
              aria-label="Close menu"
            />
          )}
          
          {/* Main Content - OPRAVA: Na mobile vždy celá šírka */}
          <main className={`
            flex-1 min-w-0 transition-all duration-300 ease-in-out
            ${isMobile 
              ? 'w-full ml-0' // Na mobile vždy celá šírka bez margin
              : (sidebarOpen ? 'lg:ml-0' : 'lg:ml-0') // Na desktop
            }
          `}>
            {/* Content wrapper with proper spacing */}
            <div className="relative">
              {/* Floating menu button - OPRAVA: Vždy viditeľný na mobile */}
              {isMobile && (
                <div className="fixed top-20 left-4 z-40">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className={`
                      p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 
                      hover:bg-white transition-all duration-200
                      ${sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}
                    `}
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