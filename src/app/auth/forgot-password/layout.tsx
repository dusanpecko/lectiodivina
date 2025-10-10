"use client";
import NavBar from "../../components/NavBar";
import { useLanguage } from "../../components/LanguageProvider";
import { forgotPasswordTranslations } from "./translations";
import "../../globals.css";

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage();
  const t = forgotPasswordTranslations[lang];
  return (
    <div 
      className="min-h-screen relative"
      style={{ backgroundColor: '#40467b' }}
    >
      {/* Background decorative pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Navigation */}
      <NavBar />

      {/* Main content */}
      <main className="relative z-10 flex items-center justify-center px-4 py-8 min-h-[calc(100vh-64px)]">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Information */}
            <div className="hidden lg:block space-y-6 text-white">
              <h1 className="text-5xl font-bold leading-tight">
                {t.passwordReset}
              </h1>
              <p className="text-xl text-white/80 leading-relaxed">
                {t.forgotPasswordInfo}
              </p>
              <div className="space-y-4 pt-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                    <span className="text-2xl">1️⃣</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t.processStep1}</h3>
                    <p className="text-white/70">{t.processStep1}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                    <span className="text-2xl">2️⃣</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t.processStep2}</h3>
                    <p className="text-white/70">{t.processStep2}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                    <span className="text-2xl">3️⃣</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t.processStep3}</h3>
                    <p className="text-white/70">{t.processStep3}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                    <span className="text-2xl">✅</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{t.processStep4}</h3>
                    <p className="text-white/70">{t.processStep4}</p>
                  </div>
                </div>
              </div>
            </div>
              
              {/* Right side - Form */}
            <div 
              className="backdrop-blur-md rounded-2xl shadow-2xl p-6 border"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderColor: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              {children}
            </div>
          </div>
        </main>
    </div>
  );
}