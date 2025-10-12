// src/app/rosary/layout.tsx
// Layout pre rosary sekciu s NavBar

"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import NavBar from '@/app/components/NavBar';
import { useLanguage } from '@/app/components/LanguageProvider';
import { rosaryTranslations } from './translations';
import { Home, BookOpen } from 'lucide-react';

interface RosaryLayoutProps {
  children: React.ReactNode;
}

export default function RosaryLayout({ children }: RosaryLayoutProps) {
  const pathname = usePathname();

  // Validácia URL parametrov (základná)
  const isValidPath = pathname.startsWith('/rosary');

  return (
    <div className="min-h-screen">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NavBar />
        </div>
      </div>

      {/* Hlavný obsah */}
      <main className="relative">
        {isValidPath ? (
          children
        ) : (
          <ErrorContent />
        )}
      </main>
    </div>
  );
}

// Error komponent pre neplatné URL
function ErrorContent() {
  const { lang } = useLanguage();
  const t = rosaryTranslations[lang];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-8 px-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
        <div className="text-6xl mb-6">🔍</div>
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#40467b' }}>
          {t.pageNotFound}
        </h2>
        <p className="text-gray-600 mb-8">
          {t.pageNotFoundDesc}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/rosary"
            className="inline-flex items-center justify-center px-6 py-3 text-white font-medium rounded-lg transition-all hover:opacity-90 shadow-md"
            style={{ backgroundColor: '#40467b' }}
          >
            <BookOpen size={20} className="mr-2" />
            {t.allCategories}
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border-2 font-medium rounded-lg transition-all hover:bg-gray-50 shadow-md"
            style={{ borderColor: '#40467b', color: '#40467b' }}
          >
            <Home size={20} className="mr-2" />
            {t.home}
          </Link>
        </div>
      </div>
    </div>
  );
}
