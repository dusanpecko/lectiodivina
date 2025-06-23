"use client";
import { useLanguage } from "./components/LanguageProvider";
import { translations } from "./i18n";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Language } from "./components/LanguageProvider";
import { motion } from "framer-motion";
import DailyQuote from "./components/DailyQuote";
import Logo from "./components/Logo";
import { HomeNewsSection } from "@/app/components/HomeNewsSection";
import CommunitySection from "./components/CommunitySection";

type LectioStep = {
  title: string;
  desc: string;
};

const lectioIcons = [
  
  // LECTIO - Jednoduchá ikona
  <div key="lectio" className="relative">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-2xl blur-xl"></div>
    <div className="relative w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-3 text-white text-3xl font-bold">
      📖
    </div>
  </div>,
  
  // MEDITATIO - Jednoduchá ikona
  <div key="meditatio" className="relative">
    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-2xl blur-xl"></div>
    <div className="relative w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-3 text-white text-3xl font-bold">
      🕐
    </div>
  </div>,
  
  // ORATIO - Jednoduchá ikona
  <div key="oratio" className="relative">
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-2xl blur-xl"></div>
    <div className="relative w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-3 text-white text-3xl font-bold">
      🙏
    </div>
  </div>,
  
  // CONTEMPLATIO - Jednoduchá ikona
  <div key="contemplatio" className="relative">
    <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-2xl blur-xl"></div>
    <div className="relative w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-3 text-white text-3xl font-bold">
      ✨
    </div>
  </div>
];

function getCountdown(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff < 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function HomePage() {
  const { lang, changeLang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();

  // Fixed target date to prevent server/client mismatch
  const targetDate = new Date('2026-01-01T00:00:00');
  
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Initialize countdown after mount
    setCountdown(getCountdown(targetDate));
    const timer = setInterval(() => setCountdown(getCountdown(targetDate)), 1000);
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Show basic layout until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        {/* Basic hero section without dynamic content */}
        <section className="relative z-20 min-h-screen w-full overflow-hidden flex flex-col">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=cover&w=1500&q=80"
              alt="Pozadie"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/70 to-slate-900/60 z-10"></div>
          
          <div className="relative z-30 px-4 sm:px-8 pt-6 sm:pt-8 flex justify-between items-center">
            <Logo className="h-12 w-auto pt-3 pl-3 drop-shadow-lg" />
            <div className="flex items-center gap-4 sm:gap-6 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
              <button
                onClick={() => router.push("/login")}
                className="text-white font-medium hover:text-blue-300 transition-colors duration-300 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t.admin}</span>
              </button>
              <div className="w-px h-6 bg-white/30"></div>
              <label htmlFor="lang-select" className="text-white mr-1 text-sm font-medium">{t.select_language}:</label>
              <select
                id="lang-select"
                value={lang}
                onChange={e => changeLang(e.target.value as Language)}
                className="bg-white/20 backdrop-blur-sm text-white rounded-lg px-3 py-1 border border-white/30 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
              >
                <option value="sk" className="text-black">🇸🇰 SK</option>
                <option value="cz" className="text-black">🇨🇿 CZ</option>
                <option value="en" className="text-black">🇬🇧 EN</option>
                <option value="es" className="text-black">🇪🇸 ES</option>
              </select>
            </div>
          </div>
          
          <div className="relative z-30 flex flex-col justify-center min-h-[60vh] sm:h-[70vh] max-w-6xl mx-auto px-4 sm:px-8 pt-8 sm:pt-16">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  {t.app_title}
                </span>
                <br />
                <span className="font-light text-slate-300 text-3xl sm:text-4xl md:text-5xl">
                  {t.app_subtitle}
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-slate-200 mb-8 max-w-3xl leading-relaxed">
                {t.app_desc}
              </p>
              
              {/* Static countdown placeholder */}
              <div className="grid grid-cols-4 gap-4 sm:gap-8 mb-8 max-w-2xl">
                {[
                  { label: t.days },
                  { label: t.hours },
                  { label: t.minutes },
                  { label: t.seconds }
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 text-center"
                  >
                    <div className="text-3xl sm:text-5xl font-bold text-white mb-2 font-mono">
                      --
                    </div>
                    <div className="text-xs sm:text-sm text-slate-300 uppercase tracking-widest font-medium">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Basic sections without dynamic content */}
        <section className="relative z-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen flex flex-col justify-center py-24">
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
                {t.lectio_section_title}
              </h2>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 z-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-orange-400/5 to-pink-400/5 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Hero sekcia */}
      <section className="relative z-20 min-h-screen w-full overflow-hidden flex flex-col">
        {/* Parallax Background */}
        <div 
          className="absolute inset-0 z-0"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=cover&w=1500&q=80"
            alt="Pozadie"
            className="w-full h-[120%] object-cover"
          />
        </div>
        
        {/* Enhanced gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/70 to-slate-900/60 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-15"></div>
        
        {/* Floating Navigation */}
        <motion.div 
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-30 px-4 sm:px-8 pt-6 sm:pt-8 flex justify-between items-center"
        >
          <Logo className="h-12 w-auto pt-3 pl-3 drop-shadow-lg" />
          <div className="flex items-center gap-4 sm:gap-6 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/20">
            <button
              onClick={() => router.push("/login")}
              className="text-white font-medium hover:text-blue-300 transition-colors duration-300 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t.admin}</span>
            </button>
            <div className="w-px h-6 bg-white/30"></div>
            <label htmlFor="lang-select" className="text-white mr-1 text-sm font-medium">{t.select_language}:</label>
            <select
              id="lang-select"
              value={lang}
              onChange={e => changeLang(e.target.value as Language)}
              className="bg-white/20 backdrop-blur-sm text-white rounded-lg px-3 py-1 border border-white/30 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
            >
              <option value="sk" className="text-black">🇸🇰 SK</option>
              <option value="cz" className="text-black">🇨🇿 CZ</option>
              <option value="en" className="text-black">🇬🇧 EN</option>
              <option value="es" className="text-black">🇪🇸 ES</option>
            </select>
          </div>
        </motion.div>
        
        {/* Hero Content */}
        <div className="relative z-30 flex flex-col justify-center min-h-[60vh] sm:h-[70vh] max-w-6xl mx-auto px-4 sm:px-8 pt-8 sm:pt-16">
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="space-y-6"
          >
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold tracking-widest text-sm px-4 py-2 rounded-full shadow-lg"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span>{t.preparing}</span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                {t.app_title}
              </span>
              <br />
              <span className="font-light text-slate-300 text-3xl sm:text-4xl md:text-5xl">
                {t.app_subtitle}
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-200 mb-8 max-w-3xl leading-relaxed">
              {t.app_desc}
            </p>
            
            {/* Enhanced Countdown */}
            <div className="grid grid-cols-4 gap-4 sm:gap-8 mb-8 max-w-2xl">
              {[
                { value: countdown.days, label: t.days },
                { value: countdown.hours, label: t.hours },
                { value: countdown.minutes, label: t.minutes },
                { value: countdown.seconds, label: t.seconds }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-6 text-center hover:bg-white/20 transition-all duration-300"
                >
                  <div className="text-3xl sm:text-5xl font-bold text-white mb-2 font-mono">
                    {item.value.toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 uppercase tracking-widest font-medium">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <a 
                href="/about" 
                className="group inline-flex items-center space-x-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300"
              >
                <span>{t.more}</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>
              
              <a 
                href="https://dcza.24-pay.sk/darovat/lectio-divina" 
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center space-x-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-lg shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>{t.support}</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Enhanced LECTIO sekcia */}
      <section className="relative z-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen flex flex-col justify-center py-24">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
              {t.lectio_section_title}
            </h2>
            <div className="w-24 h-1.5 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6"></div>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Objavte duchovnú cestu cez štvor kroky Lectio Divina - starovekú kresťanskú prax meditácie
            </p>
          </motion.div>
          
          {/* Enhanced Daily Quote */}
          <div className="mb-16">
            <DailyQuote />
          </div>
          
          {/* Enhanced Lectio Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {t.lectio_steps.map((step: LectioStep, idx: number) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 60, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ 
                  duration: 0.7, 
                  delay: idx * 0.15,
                  ease: "easeOut"
                }}
                whileHover={{
                  scale: 1.08,
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="group relative"
              >
                {/* Card background with glass effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-sm rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-300"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-3xl"></div>
                
                {/* Card content */}
                <div className="relative p-8 sm:p-10 flex flex-col items-center text-center h-full">
                  {/* Enhanced icon with glow effect */}
                  <div className="mb-6 group-hover:scale-110 transition-transform duration-300">
                    {lectioIcons[idx]}
                  </div>
                  
                  {/* Step number */}
                  <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-800 text-white text-sm font-bold rounded-full flex items-center justify-center">
                    {idx + 1}
                  </div>
                  
                  <h3 className="font-bold text-xl sm:text-2xl text-slate-800 mb-4 tracking-wide group-hover:text-blue-700 transition-colors duration-300">
                    {step.title}
                  </h3>
                  
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                    {step.desc}
                  </p>
                  
                  {/* Decorative bottom accent */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Enhanced News Section */}
      <div className="relative z-20">
        <HomeNewsSection /> 
      </div>
      
      {/* Enhanced App Section */}
      <section className="relative z-20 py-24 sm:py-32 bg-gradient-to-br from-white via-blue-50 to-slate-100 flex flex-col items-center justify-center w-full overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-200/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 px-4 sm:px-8">
          <motion.div 
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="flex-1 w-full"
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span>MOBILNÁ APLIKÁCIA</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-8 uppercase tracking-tight leading-tight">
              {t.app_section.headline}
            </h2>
            <div className="w-20 h-1.5 mb-8 rounded bg-gradient-to-r from-blue-600 to-purple-600" />
            
            <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
              <p className="text-xl font-semibold text-slate-800">
                {t.app_section.lead}
              </p>
              <p>{t.app_section.p1}</p>
              <p>{t.app_section.p2}</p>
              <p>{t.app_section.p3}</p>
              <p className="text-red-700 font-medium bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                {t.app_section.note}
              </p>
            </div>
            
            {/* Enhanced App Store Badges */}
            <div className="flex items-center gap-6 sm:gap-8 mb-8 flex-wrap mt-8">
              <motion.a 
                href="https://play.google.com/store/apps/details?id=sk.dpapp.app.android604688a88a394" 
                target="_blank" 
                rel="noopener"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="block hover:shadow-lg transition-all duration-300"
              >
                <img 
                  src="https://play.google.com/intl/en_us/badges/static/images/badges/sk_badge_web_generic.png"
                  alt="Google Play"
                  className="h-12 sm:h-16 object-contain"
                  style={{ minWidth: 140, maxWidth: 200 }} 
                />
              </motion.a>
              
              <motion.a 
                href="https://apps.apple.com/sk/app/lectio-divina/id6443882687" 
                target="_blank" 
                rel="noopener"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="block hover:shadow-lg transition-all duration-300"
              >
                <img 
                  src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                  alt="App Store"
                  className="h-12 sm:h-16 object-contain"
                  style={{ minWidth: 140, maxWidth: 200, paddingTop: 4, paddingBottom: 4 }}
                />
              </motion.a>
            </div>
            
            <motion.a
              href="https://www.lectiodivina.sk"
              target="_blank"
              rel="noopener"
              whileHover={{ x: 5 }}
              className="group inline-flex items-center space-x-2 text-blue-700 font-semibold text-lg hover:text-blue-800 transition-colors duration-300"
            >
              <span>{t.app_section.more}</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </motion.a>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-1 flex justify-center w-full mt-8 lg:mt-0"
          >
            <div className="relative">
              {/* Decorative background elements */}
              <div className="absolute -inset-8 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-2xl"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-15 blur-xl"></div>
              
              {/* Main image */}
              <motion.img
                whileHover={{ scale: 1.02, rotate: 1 }}
                transition={{ duration: 0.3 }}
                src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=500&q=80"
                alt={t.app_section.alt}
                className="relative rounded-3xl shadow-2xl w-full max-w-[450px] object-cover border-8 border-white/50 backdrop-blur-sm"
              />
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/50"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-slate-700">Live</span>
                </div>
              </motion.div>
              
              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-sm font-medium">4.8/5</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Community Section */}
      <div className="relative z-20">
        <CommunitySection translations={translations[lang]} />
      </div>

      {/* Floating scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: scrollY > 500 ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-8 right-8 z-50"
      >
        <motion.button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </motion.button>
      </motion.div>

      {/* Custom animations styles */}
      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}