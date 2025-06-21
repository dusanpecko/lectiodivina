"use client";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import "../../globals.css";

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 relative overflow-hidden flex flex-col">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-teal-400/10 to-green-400/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
        
        {/* Geometric pattern overlay */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        {/* Floating shapes */}
        <div className="absolute top-32 right-32 w-4 h-4 bg-green-400/40 rounded-full animate-bounce animation-delay-1000"></div>
        <div className="absolute bottom-32 left-32 w-6 h-6 bg-emerald-400/40 rounded-full animate-bounce animation-delay-3000"></div>
        <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-teal-400/40 rounded-full animate-bounce animation-delay-5000"></div>
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
            
            {/* Left side - Security Information */}
            <div className="hidden lg:block space-y-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    Bezpečné heslo
                  </span>
                </div>
                
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    Vytvorte si silné
                    <span className="block bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      a bezpečné heslo
                    </span>
                  </h1>
                  
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Vaše nové heslo bude chránené najmodernejšími bezpečnostnými štandardmi.
                    Vytvorme spoločne heslo, ktoré bude silné a ľahko zapamätateľné.
                  </p>
                </div>
                
                {/* Security features */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">256-bit AES šifrovanie</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">Bcrypt hash algoritmus</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">Žiadne uloženie v plain texte</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">GDPR compliant</span>
                  </div>
                </div>
              </div>
              
              {/* Password Tips */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg">
                <div className="flex items-center space-x-3 mb-4">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">Tipy pre silné heslo</span>
                </div>
                <div className="text-sm text-gray-700 space-y-2">
                  <p>💡 Použite kombináciu slov, ktoré si ľahko zapamätáte</p>
                  <p>🔢 Pridajte číslice a špeciálne znaky</p>
                  <p>📏 Minimálne 8 znakov, ideálne 12+</p>
                  <p>🚫 Nepoužívajte osobné údaje (meno, dátum narodenia)</p>
                  <p>🔄 Nepoužívajte rovnaké heslo na iných stránkach</p>
                </div>
              </div>

              {/* Examples */}
              <div className="bg-emerald-50/60 backdrop-blur-sm rounded-2xl p-6 border border-emerald-200/30">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-emerald-800 mb-2">Príklady dobrých hesiel:</p>
                    <div className="text-sm text-emerald-700 space-y-1 font-mono">
                      <p>• Slnko&Mesiac2024!</p>
                      <p>• Kavicka_123_Rano</p>
                      <p>• Moja$Najleps1a_Aplikacia</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security reminder */}
              <div className="bg-amber-50/60 backdrop-blur-sm rounded-2xl p-6 border border-amber-200/30">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-amber-800 mb-1">Bezpečnostné upozornenie</p>
                    <p className="text-sm text-amber-700">
                      Po zmene hesla budete automaticky odhlásení. Prihláste sa znovu 
                      s novým heslom v aplikácii.
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