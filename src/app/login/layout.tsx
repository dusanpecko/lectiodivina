"use client";
import NavBar from "../components/NavBar";
import { useLanguage } from "../components/LanguageProvider";
import { loginTranslations } from "./translations";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  const { lang } = useLanguage();
  const t = loginTranslations[lang];
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

      {/* Login content */}
      <main className="relative z-10 flex items-center justify-center px-4 py-8 min-h-[calc(100vh-64px)]">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Welcome message */}
          <div className="hidden lg:block space-y-6 text-white">
            <h1 className="text-5xl font-bold leading-tight">
              {t.welcomeBackTo} <span className="text-white/90">{t.lectioDivina}</span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              {t.continueJourney}
            </p>
            <div className="space-y-4 pt-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                  <span className="text-2xl">📖</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{t.dailyReadingsTitle}</h3>
                  <p className="text-white/70">{t.dailyReadingsDesc}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                  <span className="text-2xl">🙏</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{t.personalNotesTitle}</h3>
                  <p className="text-white/70">{t.personalNotesDesc}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}>
                  <span className="text-2xl">✨</span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{t.prayerGuideTitle}</h3>
                  <p className="text-white/70">{t.prayerGuideDesc}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
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
