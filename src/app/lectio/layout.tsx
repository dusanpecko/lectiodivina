// src/app/lectio/layout.tsx
// Layout pre lectio sekciu

"use client";

import { usePathname } from 'next/navigation';
import { useLanguage } from '@/app/components/LanguageProvider';
import { translations } from '@/app/i18n';
import NavBar from '@/app/components/NavBar';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Home, 
  ChevronRight, 
  BookOpen,
  Calendar
} from 'lucide-react';

interface LectioLayoutProps {
  children: React.ReactNode;
}

export default function LectioLayout({ children }: LectioLayoutProps) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const t = translations[lang];

  // Helper funkcia pre získanie návratovej URL
  const getBackUrl = (currentPath: string): string => {
    const pathParts = currentPath.split('/').filter(Boolean);
    
    if (pathParts.length <= 1) {
      return '/';
    }
    
    // Pre lectio sekciu ideme na hlavnú stránku
    return '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      
      {/* Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm relative z-[100]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <NavBar />
        </div>
      </div>
      
      {/* Breadcrumbs header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Breadcrumbs */}
            <nav className="flex items-center space-x-2 text-sm">
              <Link 
                href="/" 
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Home size={16} className="mr-1" />
                {t.home || 'Domov'}
              </Link>
              
              <div className="flex items-center">
                <ChevronRight size={16} className="text-gray-400 mx-2" />
                <Link 
                  href="/lectio"
                  className="flex items-center transition-colors text-blue-600 font-medium"
                >
                  Lectio Divina
                </Link>
              </div>
            </nav>

            {/* Návrat späť button */}
            <div className="flex items-center space-x-4">
              <Link
                href={getBackUrl(pathname)}
                className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                <span className="hidden sm:inline">Späť</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hlavný obsah */}
      <main className="relative">
        {children}
      </main>
    </div>
  );
}