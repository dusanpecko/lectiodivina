"use client";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import "../../globals.css";

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden flex flex-col">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-red-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-pink-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
        
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f97316' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Floating shapes */}
        <div className="absolute top-32 right-32 w-4 h-4 bg-orange-400/40 rounded-full animate-bounce animation-delay-1000"></div>
        <div className="absolute bottom-32 left-32 w-6 h-6 bg-red-400/40 rounded-full animate-bounce animation-delay-3000"></div>
        <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-pink-400/40 rounded-full animate-bounce animation-delay-5000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation */}
        <div className="relative z-20">
          <div className="bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <NavBar />
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left side - Information */}
            <div className="hidden lg:block space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-3.586l5.879-5.879A6 6 0 0118 9z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Obnovenie hesla
                  </span>
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    Bezpečné obnovenie
                    <span className="block bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      prístupových údajov
                    </span>
                  </h1>
                  
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Zabudli ste heslo? Žiadny problém! Pošleme vám bezpečný odkaz 
                    na obnovenie hesla priamo do vašej emailovej schránky.
                  </p>
                </div>
                
                {/* Process steps */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-sm">
                      1
                    </div>
                    <span className="text-gray-700 font-medium">Zadajte svoj email</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-sm">
                      2
                    </div>
                    <span className="text-gray-700 font-medium">Skontrolujte emailovú schránku</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-sm">
                      3
                    </div>
                    <span className="text-gray-700 font-medium">Kliknite na odkaz a nastavte nové heslo</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm">
                      ✓
                    </div>
                    <span className="text-gray-700 font-medium">Prihláste sa s novým heslom</span>
                  </div>
                </div>
              </div>
              
              {/* Security info */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">Bezpečnosť na prvom mieste</span>
                </div>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>• Odkaz je platný iba 1 hodinu</p>
                  <p>• Zabezpečené SSL šifrovanie</p>
                  <p>• Žiadne uloženie hesiel v plain texte</p>
                  <p>• Automatické odhlásenie po zmene</p>
                </div>
              </div>

              {/* Help section */}
              <div className="bg-blue-50/60 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/30">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">Potrebujete pomoc?</p>
                    <p className="text-sm text-blue-700">
                      Ak máte problémy s obnovením hesla, kontaktujte nášho správcu systému 
                      alebo IT podporu vašej organizácie.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Form */}
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 p-8">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <div className="relative z-20 mt-auto">
          <Footer />
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-5000 {
          animation-delay: 5s;
        }
      `}</style>
    </div>
  );
}