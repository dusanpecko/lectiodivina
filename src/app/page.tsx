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
import { useSupabase } from "./components/SupabaseProvider";
import { BookOpen, Brain, Users, Heart, Target, ArrowRight, Clock, CheckCircle, ChevronDown, ChevronRight, Menu, X, Mail, Flower, Calendar, User } from "lucide-react";

type LectioStep = {
  title: string;
  desc: string;
};

interface GuideStep {
  title: string;
  subtitle: string;
  description: string;
  duration: string;
}

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

function LectioGuideSection({ t }: { t: any }) {
  const guideSection = t.lectio_guide_section;
  
  const steps = (guideSection.steps as GuideStep[]).map((step: GuideStep, index: number) => ({
    number: index + 1,
    title: step.title,
    subtitle: step.subtitle,
    description: step.description,
    icon: [BookOpen, Brain, Users, Heart, Target][index],
    color: ['from-blue-500 to-indigo-600', 'from-green-500 to-emerald-600', 'from-amber-500 to-orange-600', 'from-red-500 to-pink-600', 'from-purple-500 to-violet-600'][index],
    bgColor: ['bg-blue-50', 'bg-green-50', 'bg-amber-50', 'bg-red-50', 'bg-purple-50'][index],
    borderColor: ['border-blue-200', 'border-green-200', 'border-amber-200', 'border-red-200', 'border-purple-200'][index],
    textColor: ['text-blue-600', 'text-green-600', 'text-amber-600', 'text-red-600', 'text-purple-600'][index],
    duration: step.duration,
    href: ['/intro/lectio', '/intro/meditatio', '/intro/oratio', '/intro/contemplatio', '/intro/actio'][index]
  }));

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm px-4 py-2 rounded-full mb-6">
            <BookOpen className="w-4 h-4" />
            <span>{guideSection.badge}</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
            {guideSection.title}
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            {guideSection.subtitle}
          </p>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{guideSection.total_duration}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>{guideSection.steps_count}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {steps.map((step: any) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={fadeInUp}
                className="group relative"
                whileHover={{
                  scale: 1.02,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
              >
                <a href={step.href} className="block">
                  <div className={`relative ${step.bgColor} ${step.borderColor} border-2 rounded-2xl p-4 hover:shadow-xl transition-all duration-300 h-full`}>
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-700">
                      {step.number}
                    </div>
                    
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} p-3 mb-3 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="text-center mb-3">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {step.title}
                      </h3>
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        {step.subtitle}
                      </p>
                      <div className={`inline-flex items-center space-x-1 ${step.textColor} text-xs font-medium mb-2`}>
                        <Clock className="w-3 h-3" />
                        <span>{step.duration}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-xs leading-relaxed mb-3">
                      {step.description}
                    </p>
                    
                    <div className="text-center">
                      <span className={`inline-flex items-center ${step.textColor} font-medium text-xs group-hover:text-gray-800 transition-colors duration-300`}>
                        {guideSection.start_step}
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </div>
                  </div>
                </a>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="text-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 shadow-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {guideSection.cta.title}
            </h3>
            <p className="text-gray-600 mb-6">
              {guideSection.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/intro"
                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors duration-200"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                {guideSection.cta.start_with_intro}
              </a>
              <a
                href="/intro/lectio"
                className="inline-flex items-center justify-center px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl border-2 border-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
              >
                {guideSection.cta.go_to_lectio}
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <section className="relative min-h-screen w-full overflow-hidden flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="relative px-4 sm:px-8 pt-6 sm:pt-8 flex justify-between items-center">
          <div className="h-12 w-32 bg-white/20 rounded-lg animate-pulse"></div>
          <div className="h-12 w-48 bg-white/20 rounded-2xl animate-pulse"></div>
        </div>
        
        <div className="relative flex flex-col justify-center min-h-[60vh] sm:h-[70vh] max-w-6xl mx-auto px-4 sm:px-8 pt-8 sm:pt-16">
          <div className="space-y-6">
            <div className="h-8 w-32 bg-white/20 rounded-full animate-pulse"></div>
            <div className="space-y-4">
              <div className="h-16 w-3/4 bg-white/20 rounded-lg animate-pulse"></div>
              <div className="h-12 w-1/2 bg-white/20 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-6 w-2/3 bg-white/20 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  const { lang, changeLang } = useLanguage();
  const { session } = useSupabase();
  const t = translations[lang];
  const router = useRouter();


  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lectioSubmenuOpen, setLectioSubmenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => setScrollY(window.scrollY);
    
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector('.nav-dropdown');
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setDropdownOpen(false);
        setLectioSubmenuOpen(false);
      }
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll, { passive: true });
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, []);

  // NOVÁ JEDNODUCHÁ LOGIKA - kontroluje iba či je session, ak nie, zobrazí modal
  const checkAuthAndNavigate = (href: string) => {
    if (session) {
      // Ak je prihlásený, choď na stránku
      router.push(href);
    } else {
      // Ak nie je prihlásený, zobraz modal
      setShowLoginModal(true);
    }
    // Zatvor všetky menu
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    setLectioSubmenuOpen(false);
  };

  const handleLectioClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLectioSubmenuOpen(!lectioSubmenuOpen);
  };

  const lectioSteps = [
    { href: '/about', label: t.about_lectio_divina, color: 'blue' },
    { href: '/intro/lectio', label: 'Lectio', color: 'green' },
    { href: '/intro/meditatio', label: 'Meditatio', color: 'amber' },
    { href: '/intro/oratio', label: 'Oratio', color: 'red' },
    { href: '/intro/contemplatio', label: 'Contemplatio', color: 'purple' },
    { href: '/intro/actio', label: 'Actio', color: 'indigo' }
  ];

  if (!mounted) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Hero sekcia s gradientom */}
      <section className="relative min-h-screen w-full overflow-hidden flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Animated background patterns */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-green-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-pink-400/10 to-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
        </div>

        {/* Fixed Navigation */}
        <nav className="relative z-50 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Logo className="h-12 w-auto text-white drop-shadow-lg" />
              </motion.div>

              {/* Desktop Menu */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="hidden lg:flex items-center space-x-8"
              >
                {/* Prayer Main Dropdown */}
                <div className="relative nav-dropdown">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 text-white hover:text-indigo-200 transition-colors duration-200 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="font-medium">{t.prayer}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Main Dropdown Content */}
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-[9999]"
                    >
                      <div className="p-4">
                        
                        {/* LECTIO NA DNES - VŽDY VIDITEĽNÉ */}
                        <div className="mb-4">
                          <button
                            onClick={() => checkAuthAndNavigate('/lectio')}
                            className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 transition-all duration-200 group"
                          >
                            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                              <Calendar className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-bold text-emerald-700 block">Lectio na dnes</span>
                              <span className="text-xs text-emerald-600">
                                {session ? 'Každodenná modlitba' : 'Prihlásenie potrebné'}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-200" />
                          </button>
                        </div>
                        
                        {/* Lectio Divina Section */}
                        <div className="mb-4">
                          <button
                            onClick={handleLectioClick}
                            className="w-full flex items-center justify-between space-x-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors duration-200 group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-bold text-gray-900">Lectio Divina</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${lectioSubmenuOpen ? 'rotate-90' : ''}`} />
                          </button>
                          
                          {/* Lectio Submenu */}
                          {lectioSubmenuOpen && (
                            <div className="ml-4 mt-2 space-y-1 border-l-2 border-indigo-100 pl-4">
                              {lectioSteps.map((item, index) => (
                                <a
                                  key={index}
                                  href={item.href}
                                  onClick={() => {
                                    setDropdownOpen(false);
                                    setLectioSubmenuOpen(false);
                                  }}
                                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                                >
                                  <div className="w-2 h-2 bg-gray-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                  <span className="text-gray-700 group-hover:text-gray-900 text-sm font-medium">
                                    {item.label}
                                  </span>
                                </a>
                              ))}
                              
                              {/* Lectio CTA */}
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <a
                                  href="/intro"
                                  onClick={() => {
                                    setDropdownOpen(false);
                                    setLectioSubmenuOpen(false);
                                  }}
                                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                                >
                                  <span>{t.start_the_guide}</span>
                                  <ArrowRight className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* RUŽENEC - VŽDY VIDITEĽNÉ */}
                        <div className="border-t border-gray-100 pt-4">
                          <button
                            onClick={() => checkAuthAndNavigate('/rosary')}
                            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-rose-50 transition-colors duration-200 group"
                          >
                            <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                              <Flower className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-bold text-gray-900 block">Ružienec</span>
                              <span className="text-xs text-gray-500">
                                {session ? 'Formou Lectio Divina' : 'Prihlásenie potrebné'}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-600 transition-colors duration-200" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Contact Button */}
                <button
                  onClick={() => router.push("/contact")}
                  className="flex items-center space-x-2 text-white hover:text-indigo-200 transition-colors duration-200 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20"
                >
                  <Mail className="w-4 h-4" />
                  <span className="font-medium">{t.footer.contact}</span>
                </button>

                {/* Language Selector */}
                <select
                  value={lang}
                  onChange={e => changeLang(e.target.value as Language)}
                  className="bg-white/10 backdrop-blur-md text-white rounded-lg px-3 py-2 border border-white/20 focus:ring-2 focus:ring-indigo-400 transition-all"
                >
                  <option value="sk" className="text-black">🇸🇰 SK</option>
                  <option value="cz" className="text-black">🇨🇿 CZ</option>
                  <option value="en" className="text-black">🇬🇧 EN</option>
                  <option value="es" className="text-black">🇪🇸 ES</option>
                </select>
              </motion.div>

              {/* Mobile Menu Button */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:hidden flex items-center space-x-4"
              >
                <select
                  value={lang}
                  onChange={e => changeLang(e.target.value as Language)}
                  className="bg-white/10 backdrop-blur-md text-white rounded-lg px-2 py-1 border border-white/20 text-sm"
                >
                  <option value="sk" className="text-black">🇸🇰</option>
                  <option value="cz" className="text-black">🇨🇿</option>
                  <option value="en" className="text-black">🇬🇧</option>
                  <option value="es" className="text-black">🇪🇸</option>
                </select>
                
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-2 border border-white/20 text-white hover:bg-white/20 transition-colors duration-200"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </motion.div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="lg:hidden bg-white/10 backdrop-blur-md rounded-2xl mt-4 p-4 border border-white/20"
              >
                <div className="space-y-3">
                  
                  {/* MOBILE LECTIO NA DNES - VŽDY VIDITEĽNÉ */}
                  <div className="mb-3 pb-3 border-b border-white/20">
                    <button
                      onClick={() => checkAuthAndNavigate('/lectio')}
                      className="w-full flex items-center space-x-3 bg-white/10 p-3 rounded-lg border border-white/20 transition-colors duration-200"
                    >
                      <Calendar className="w-4 h-4 text-white" />
                      <div className="text-left">
                        <span className="block font-bold text-white">Lectio na dnes</span>
                        <span className="text-xs text-white/60">
                          {session ? 'Každodenná modlitba' : 'Prihlásenie potrebné'}
                        </span>
                      </div>
                    </button>
                  </div>
                  
                  {/* Mobile Lectio Divina Section */}
                  <div>
                    <button
                      onClick={() => setLectioSubmenuOpen(!lectioSubmenuOpen)}
                      className="w-full flex items-center justify-between text-white font-bold border-b border-white/20 pb-2 mb-3"
                    >
                      <div className="flex items-center space-x-2">
                        <BookOpen className="w-4 h-4" />
                        <span>Lectio Divina</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${lectioSubmenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {lectioSubmenuOpen && (
                      <div className="space-y-2 ml-4 mb-4">
                        {lectioSteps.map((item, index) => (
                          <a
                            key={index}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="block text-white/80 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                          >
                            {item.label}
                          </a>
                        ))}
                        
                        <a
                          href="/intro"
                          onClick={() => setMobileMenuOpen(false)}
                          className="w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 mt-3 block"
                        >
                          {t.start_the_guide}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* MOBILE RUŽENEC - VŽDY VIDITEĽNÉ */}
                  <div className="border-t border-white/20 pt-3">
                    <button
                      onClick={() => checkAuthAndNavigate('/rosary')}
                      className="flex items-center space-x-2 text-white/80 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                    >
                      <Flower className="w-4 h-4" />
                      <div>
                        <span className="block font-medium">Ružienec</span>
                        <span className="text-xs text-white/60">
                          {session ? 'Formou Lectio Divina' : 'Prihlásenie potrebné'}
                        </span>
                      </div>
                    </button>
                  </div>
                  
                  {/* Mobile Contact */}
                  <div className="border-t border-white/20 pt-3">
                    <button
                      onClick={() => {
                        router.push("/contact");
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-white/80 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{t.footer.contact}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold tracking-widest text-sm px-6 py-3 rounded-full shadow-lg"
            >
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              <span>{t.preparing}</span>
            </motion.div>

            {/* Main Title */}
            <div className="space-y-4">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight">
                <span className="bg-gradient-to-r from-white via-indigo-100 to-purple-100 bg-clip-text text-transparent">
                  {t.app_title}
                </span>
              </h1>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-indigo-100">
                {t.app_subtitle}
              </h2>
            </div>

            {/* Description */}
            <p className="text-xl sm:text-2xl text-indigo-100 max-w-4xl mx-auto leading-relaxed">
              {t.app_desc}
            </p>
            
            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
            >
              <a 
                href="/about" 
                className="group inline-flex items-center space-x-3 px-8 py-4 rounded-2xl bg-white text-indigo-900 font-bold text-lg shadow-2xl hover:shadow-white/25 hover:scale-105 transition-all duration-300"
              >
                <span>{t.more}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
              
              <a 
                href="https://dcza.24-pay.sk/darovat/lectio-divina" 
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center space-x-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-lg shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300"
              >
                <Heart className="w-5 h-5" />
                <span>{t.support}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </motion.div>

          </motion.div>
        </div>
      </section>
      
      {/* Daily Quote Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-16">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
              {t.lectio_section_title}
            </h2>
            <div className="w-24 h-1.5 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-8"></div>
          </motion.div>
          
          <DailyQuote />
        </div>
      </section>

      {/* Lectio Guide Section */}
      <LectioGuideSection t={t} />
      
      {/* News Section */}
      <div className="relative">
        <HomeNewsSection /> 
      </div>
      
      {/* App Section */}
      <section className="relative py-24 sm:py-32 bg-gradient-to-br from-white via-blue-50 to-slate-100 flex flex-col items-center justify-center w-full overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-200/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16 px-4 sm:px-8">
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
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
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
              <div className="absolute -inset-8 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-3xl blur-2xl"></div>
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full opacity-15 blur-xl"></div>
              
              <motion.img
                whileHover={{ scale: 1.02, rotate: 1 }}
                transition={{ duration: 0.3 }}
                src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=500&q=80"
                alt={t.app_section.alt}
                className="relative rounded-3xl shadow-2xl w-full max-w-[450px] object-cover border-8 border-white/50 backdrop-blur-sm"
              />
              
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

      {/* Community Section */}
      <div className="relative">
        <CommunitySection translations={translations[lang]} />
      </div>

      {/* Scroll to Top Button */}
      {typeof window !== 'undefined' && (
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
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.button>
        </motion.div>
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Prihlásenie potrebné</h3>
              <p className="text-gray-600 mb-6">
                Pre prístup k tejto funkcii sa prosím prihláste do svojho účtu.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Zrušiť
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    router.push('/login');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Prihlásiť sa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .nav-dropdown {
          position: relative;
          z-index: 9999;
        }
        
        .backdrop-blur-md {
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        
        /* Ensure dropdown colors work */
        .hover\\:bg-blue-50:hover {
          background-color: rgb(239 246 255);
        }
        .hover\\:text-blue-700:hover {
          color: rgb(29 78 216);
        }
        .hover\\:bg-green-50:hover {
          background-color: rgb(240 253 244);
        }
        .hover\\:text-green-700:hover {
          color: rgb(21 128 61);
        }
        .hover\\:bg-amber-50:hover {
          background-color: rgb(255 251 235);
        }
        .hover\\:text-amber-700:hover {
          color: rgb(180 83 9);
        }
        .hover\\:bg-red-50:hover {
          background-color: rgb(254 242 242);
        }
        .hover\\:text-red-700:hover {
          color: rgb(185 28 28);
        }
        .hover\\:bg-purple-50:hover {
          background-color: rgb(250 245 255);
        }
        .hover\\:text-purple-700:hover {
          color: rgb(126 34 206);
        }
        .hover\\:bg-indigo-50:hover {
          background-color: rgb(238 242 255);
        }
        .hover\\:text-indigo-700:hover {
          color: rgb(67 56 202);
        }
        .hover\\:bg-rose-50:hover {
          background-color: rgb(255 241 242);
        }
        .hover\\:text-rose-700:hover {
          color: rgb(190 18 60);
        }
        .hover\\:bg-gray-50:hover {
          background-color: rgb(249 250 251);
        }
        .hover\\:text-gray-900:hover {
          color: rgb(17 24 39);
        }
        
        .bg-blue-400 {
          background-color: rgb(96 165 250);
        }
        .bg-green-400 {
          background-color: rgb(74 222 128);
        }
        .bg-amber-400 {
          background-color: rgb(251 191 36);
        }
        .bg-red-400 {
          background-color: rgb(248 113 113);
        }
        .bg-purple-400 {
          background-color: rgb(196 181 253);
        }
        .bg-indigo-400 {
          background-color: rgb(129 140 248);
        }
        .bg-rose-400 {
          background-color: rgb(251 113 133);
        }
        .bg-gray-400 {
          background-color: rgb(156 163 175);
        }
      `}</style>
    </div>
  );
}