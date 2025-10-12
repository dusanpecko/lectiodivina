// src/app/lectio/layout.tsx
// Layout pre lectio sekciu

"use client";

import NavBar from '@/app/components/NavBar';

interface LectioLayoutProps {
  children: React.ReactNode;
}

export default function LectioLayout({ children }: LectioLayoutProps) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      
      {/* Navigation Bar - sticky */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NavBar />
        </div>
      </div>

      {/* Hlavný obsah */}
      <main className="relative">
        {children}
      </main>
    </div>
  );
}