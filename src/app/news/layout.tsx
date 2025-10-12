// app/news/layout.tsx
"use client";
import NavBar from "@/app/components/NavBar";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl shadow-xl">
          <NavBar />
        </div>
        
        <main className="flex-1 w-full px-2 sm:px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gradient-to-r from-slate-300 to-slate-200 rounded-full w-64 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/80 rounded-3xl p-6 shadow-lg">
                  <div className="h-48 bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl mb-4"></div>
                  <div className="h-6 bg-gradient-to-r from-slate-300 to-slate-200 rounded-full mb-2"></div>
                  <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full mb-2"></div>
                  <div className="h-4 bg-gradient-to-r from-slate-300 to-slate-200 rounded-full w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 z-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-orange-400/5 to-pink-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Additional floating elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-yellow-300/8 to-orange-300/8 rounded-full blur-2xl" style={{ animation: 'float 8s ease-in-out infinite' }}></div>
        <div className="absolute bottom-1/4 left-1/4 w-56 h-56 bg-gradient-to-br from-pink-300/8 to-purple-300/8 rounded-full blur-2xl" style={{ animation: 'float 6s ease-in-out infinite', animationDelay: '3s' }}></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        {/* Parallax elements */}
        <motion.div
          style={{ y: scrollY * 0.3 }}
          className="absolute top-40 right-40 w-32 h-32 bg-gradient-to-br from-blue-300/15 to-indigo-300/15 rounded-full blur-2xl"
        ></motion.div>
        
        <motion.div
          style={{ y: scrollY * -0.2 }}
          className="absolute bottom-40 left-40 w-40 h-40 bg-gradient-to-br from-purple-300/15 to-pink-300/15 rounded-full blur-2xl"
        ></motion.div>
      </div>
      
      {/* Enhanced Sticky Navbar */}
      <motion.div 
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrollY > 20 
            ? 'bg-white/98 backdrop-blur-2xl shadow-2xl border-b border-white/30' 
            : 'bg-white/95 backdrop-blur-xl shadow-xl'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
      >
        <NavBar />
      </motion.div>
      
      {/* Enhanced Main Content */}
      <main className="flex-1 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full px-2 sm:px-4 lg:px-6"
        >
          {/* Content container with enhanced styling */}
          <div className="relative">
            {children}
          </div>
        </motion.div>
      </main>
      
      {/* Custom animations styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #3b82f6, #8b5cf6);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #2563eb, #7c3aed);
        }
        
        /* Enhanced focus styles */
        *:focus {
          outline: none;
        }
        
        input:focus, select:focus, textarea:focus, button:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}