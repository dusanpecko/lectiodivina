// src/app/rosary/layout.tsx
// Layout pre rosary sekciu s navigáciou a breadcrumbs

"use client";

import { usePathname } from 'next/navigation';
import { useLanguage } from '@/app/components/LanguageProvider';
import { translations } from '@/app/i18n';
import NavBar from '@/app/components/NavBar';
import { 
  generateBreadcrumbs, 
  isValidCategory, 
  isValidDecadeNumber,
  isValidStep,
  getCategoryInfo,
  getStepInfo
} from '@/app/lib/rosary-utils';
import { RosaryCategory, LectioDivinaStep } from '@/app/types/rosary';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Home, 
  ChevronRight, 
  BookOpen
} from 'lucide-react';

interface RosaryLayoutProps {
  children: React.ReactNode;
}

export default function RosaryLayout({ children }: RosaryLayoutProps) {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const t = translations[lang];

  // Parsovanie cesty pre breadcrumbs
  const pathParts = pathname.split('/').filter(Boolean);
  const currentCategory = pathParts[1] as RosaryCategory;
  const currentDecade = pathParts[2] ? parseInt(pathParts[2]) : undefined;
  const currentStep = pathParts[3] as LectioDivinaStep;

  // Validácia URL parametrov
  const isValidPath = 
    (!currentCategory || isValidCategory(currentCategory)) &&
    (!currentDecade || isValidDecadeNumber(currentDecade)) &&
    (!currentStep || isValidStep(currentStep));

  // Generovanie breadcrumbs
  const breadcrumbs = generateBreadcrumbs(
    currentCategory && isValidCategory(currentCategory) ? currentCategory : undefined,
    currentDecade && isValidDecadeNumber(currentDecade) ? currentDecade : undefined,
    currentStep && isValidStep(currentStep) ? currentStep : undefined
  );

  // Získanie info pre aktuálny kontext
  const categoryInfo = currentCategory && isValidCategory(currentCategory) 
    ? getCategoryInfo(currentCategory) 
    : null;
  const stepInfo = currentStep && isValidStep(currentStep) 
    ? getStepInfo(currentStep) 
    : null;

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
              
              {breadcrumbs.map((breadcrumb, index) => (
                <div key={index} className="flex items-center">
                  <ChevronRight size={16} className="text-gray-400 mx-2" />
                  <Link 
                    href={breadcrumb.href}
                    className={`flex items-center transition-colors ${
                      breadcrumb.isActive 
                        ? 'text-blue-600 font-medium' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {breadcrumb.label}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Návrat späť button */}
            <div className="flex items-center space-x-4">
              {pathname !== '/rosary' && (
                <Link
                  href={getBackUrl(pathname)}
                  className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  <span className="hidden sm:inline">Späť</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Kontextová hlavička */}
      {(categoryInfo || stepInfo || pathname === '/rosary') && (
        <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              
              {/* Kategória info */}
              {categoryInfo && (
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shadow-lg"
                    style={{ backgroundColor: categoryInfo.color }}
                  >
                    {categoryInfo.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      {categoryInfo.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {categoryInfo.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Krok info */}
              {stepInfo && (
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-md"
                    style={{ backgroundColor: stepInfo.color }}
                  >
                    {stepInfo.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {stepInfo.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {stepInfo.duration} minút
                    </p>
                  </div>
                </div>
              )}

              {/* Ruženec info pre úvodnú stránku */}
              {pathname === '/rosary' && (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Lectio Divina Ruženec
                    </h2>
                    <p className="text-sm text-gray-600">
                      Duchovná cesta cez svätý ruženec
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

// Helper funkcia pre získanie návratovej URL
function getBackUrl(currentPath: string): string {
  const pathParts = currentPath.split('/').filter(Boolean);
  
  if (pathParts.length <= 1) {
    return '/';
  }
  
  // Odstránenie poslednej časti cesty
  const backPath = '/' + pathParts.slice(0, -1).join('/');
  
  // Ak sme na detaile desiatka, ideme späť na kategóriu
  if (pathParts.length === 3) {
    return backPath;
  }
  
  // Ak sme na kategórii, ideme späť na ruženec
  if (pathParts.length === 2) {
    return '/rosary';
  }
  
  return backPath;
}

// Error komponent pre neplatné URL
function ErrorContent() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Stránka nenájdená
        </h2>
        <p className="text-gray-600 mb-8">
          Požadovaná stránka ruženec neexistuje alebo bola presunutá.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/rosary"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BookOpen size={20} className="mr-2" />
            Všetky ruženec
          </Link>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home size={20} className="mr-2" />
            Domovská stránka
          </Link>
        </div>
      </div>
    </div>
  );
}