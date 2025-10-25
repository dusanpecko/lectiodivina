"use client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, FileText, Globe, Heart, LogOut, Menu, Settings, User, X } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserRole } from "../hooks/useUserRole";
import ConfirmDialog from "./components/ConfirmDialog";
import type { Language } from "./components/LanguageProvider";
import { useLanguage } from "./components/LanguageProvider";
import Logo from "./components/Logo";
import { useSupabase } from "./components/SupabaseProvider";
import { translations } from "./i18n";

// Lazy load components pod fold pre lepší LCP
const AppSection = dynamic(() => import("./components/AppSection"), {
  loading: () => <div className="min-h-screen" />
});
const LectioGuideSection = dynamic(() => import("./components/LectioGuideSection"), {
  loading: () => <div className="min-h-screen" />
});
const HomeLectioSection = dynamic(() => import("@/app/components/HomeLectioSection"), {
  loading: () => <div className="min-h-screen" />
});
const DailyQuote = dynamic(() => import("./components/DailyQuote"), {
  loading: () => <div className="min-h-screen" />
});
const HomeNewsSection = dynamic(() => import("./components/HomeNewsSection").then(mod => ({ default: mod.HomeNewsSection })), {
  loading: () => <div className="min-h-screen" />
});
const RoadmapSection = dynamic(() => import("./components/RoadmapSection"), {
  loading: () => <div className="min-h-screen" />
});
const CommunitySection = dynamic(() => import("./components/CommunitySection"), {
  loading: () => <div className="min-h-screen" />
});


function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <section className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center">
        {/* Background Image - rovnaký ako v hlavnej sekcii */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/hero-background.webp)',
          }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        {/* Simple loading spinner v strede */}
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p className="text-white/60 text-sm font-medium">Loading...</p>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  const { lang, changeLang, isLoaded } = useLanguage();
  const { supabase, session } = useSupabase();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const t = (isLoaded && translations[lang]) ? translations[lang] : translations.sk; // Safe access with fallback
  const router = useRouter();


  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdown1Open, setDropdown1Open] = useState(false);
  const [dropdown2Open, setDropdown2Open] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Zisti, či sa kliklo do niektorého dropdown menu
      const allDropdowns = document.querySelectorAll('.nav-dropdown');
      const clickedInsideAnyDropdown = Array.from(allDropdowns).some(dropdown => 
        dropdown.contains(target)
      );
      
      // Zatvor všetky dropdown menu iba ak sa kliklo MIMO všetkých
      if (!clickedInsideAnyDropdown) {
        setDropdown1Open(false);
        setDropdown2Open(false);
      }
    };
    
    if (typeof window !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, []);

  // Fetch user data when session changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        const { data } = await supabase
          .from("users")
          .select("full_name, avatar_url")
          .eq("email", session.user.email)
          .single();
        if (data) {
          setFullName(data.full_name);
          setAvatarUrl(data.avatar_url);
        }
      }
    };

    if (mounted && session) {
      fetchUserData();
    }
  }, [session, supabase, mounted]);

  // Block body scroll when mobile menu is open
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (mobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        document.body.style.overflow = '';
      }
    };
  }, [mobileMenuOpen]);

  if (!mounted || !isLoaded || !t) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Hero sekcia s obrazkom pozadia */}
      <section className="relative min-h-screen w-full overflow-hidden flex flex-col snap-start">
        {/* Background Image - Optimized with Next.js Image */}
        <div className="absolute inset-0">
          <Image
            src="/hero-background.webp"
            alt="Hero Background"
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover object-center"
            placeholder="blur"
            blurDataURL="data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA="
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40 z-10"></div>
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
                {/* Explore Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdown1Open(!dropdown1Open)}
                    className="text-white hover:text-indigo-200 transition-colors duration-200 font-medium flex items-center space-x-1"
                  >
                    <span>{t.explore}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdown1Open ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {dropdown1Open && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-56 rounded-lg shadow-xl overflow-hidden z-50"
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <button
                          onClick={() => {
                            router.push('/about');
                            setDropdown1Open(false);
                          }}
                          className="w-full text-left px-4 py-3 text-gray-800 hover:bg-indigo-50 transition-colors duration-200 font-medium"
                        >
                          {t.about_lectio_divina}
                        </button>
                        <button
                          onClick={() => {
                            router.push('/intro');
                            setDropdown1Open(false);
                          }}
                          className="w-full text-left px-4 py-3 text-gray-800 hover:bg-indigo-50 transition-colors duration-200 font-medium"
                        >
                          {t.start_the_guide}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Prayer Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdown2Open(!dropdown2Open)}
                    className="text-white hover:text-indigo-200 transition-colors duration-200 font-medium flex items-center space-x-1"
                  >
                    <span>{t.prayer}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdown2Open ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {dropdown2Open && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 mt-2 w-56 rounded-lg shadow-xl overflow-hidden z-50"
                        style={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(10px)'
                        }}
                      >
                        <button
                          onClick={() => {
                            router.push('/lectio');
                            setDropdown2Open(false);
                          }}
                          className="w-full text-left px-4 py-3 text-gray-800 hover:bg-indigo-50 transition-colors duration-200 font-medium"
                        >
                          {t.today_lectio}
                        </button>
                        <button
                          onClick={() => {
                            router.push('/rosary');
                            setDropdown2Open(false);
                          }}
                          className="w-full text-left px-4 py-3 text-gray-800 hover:bg-indigo-50 transition-colors duration-200 font-medium"
                        >
                          {t.rosary}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Contact */}
                <button
                  onClick={() => router.push("/contact")}
                  className="text-white hover:text-indigo-200 transition-colors duration-200 font-medium"
                >
                  {t.footer.contact}
                </button>

                {/* Right Side Actions */}
                <div className="flex items-center space-x-4">
                  {/* Language Selector */}
                  <div className="flex items-center space-x-1 px-4 h-10 border border-white/30 rounded-lg">
                    <Globe className="w-4 h-4 text-white" />
                    <select
                      value={lang.toUpperCase()}
                      onChange={e => changeLang(e.target.value.toLowerCase() as Language)}
                      className="bg-transparent text-white font-medium cursor-pointer focus:outline-none text-sm"
                    >
                      <option value="SK" className="text-black">SK</option>
                      <option value="CZ" className="text-black">CZ</option>
                      <option value="EN" className="text-black">EN</option>
                      <option value="ES" className="text-black">ES</option>
                    </select>
                  </div>

                  {/* Give Button */}
                  <button
                    onClick={() => window.open('https://www.paypal.com/donate/?hosted_button_id=3BMNK9CH675ZL', '_blank')}
                    className="px-4 h-10 border border-white/30 text-white hover:bg-white/10 rounded-lg transition-colors duration-200 font-medium flex items-center"
                  >
                    {t.give}
                  </button>

                  {/* Download Button */}
                  <button
                    onClick={() => window.open('https://mypro.one/837de1', '_blank')}
                    className="px-4 h-10 text-white rounded-lg transition-colors duration-200 font-medium flex items-center"
                    style={{ backgroundColor: '#40467b' }}
                  >
                    {t.homepage.download}
                  </button>

                  {/* Profile Dropdown / Login */}
                  {session ? (
                    <div className="relative">
                      <button
                        onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        {avatarUrl ? (
                          <Image 
                            src={avatarUrl} 
                            alt="Profile" 
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gradient-to-r from-white/20 to-white/30 rounded-full flex items-center justify-center">
                            <User size={16} className="text-white" />
                          </div>
                        )}
                        <div className="hidden sm:block text-left">
                          <p className="text-sm font-medium text-white">
                            {fullName || t.homepage.default_user}
                          </p>
                          <p className="text-xs text-white/70">
                            {session.user.email}
                          </p>
                        </div>
                        <ChevronDown size={16} className={`text-white/70 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {profileDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                              {avatarUrl ? (
                                <Image 
                                  src={avatarUrl} 
                                  alt="Profile" 
                                  width={40}
                                  height={40}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                                  <User size={20} className="text-white" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {fullName || t.homepage.default_user}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {session.user.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="py-2">
                            <button
                              onClick={() => {
                                router.push('/profile');
                                setProfileDropdownOpen(false);
                              }}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
                            >
                              <User size={16} />
                              <span>{t.homepage.profile}</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                router.push('/notes');
                                setProfileDropdownOpen(false);
                              }}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
                            >
                              <FileText size={16} />
                              <span>{t.homepage.notes}</span>
                            </button>
                            
                            {isAdmin && !roleLoading && (
                              <button
                                onClick={() => {
                                  router.push('/admin');
                                  setProfileDropdownOpen(false);
                                }}
                                className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
                              >
                                <Settings size={16} />
                                <span>{t.admin}</span>
                              </button>
                            )}
                            
                            <hr className="my-2" />
                            
                            <button
                              onClick={() => {
                                setShowLogoutDialog(true);
                                setProfileDropdownOpen(false);
                              }}
                              className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                            >
                              <LogOut size={16} />
                              <span>{t.logout}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => router.push('/login')}
                      className="text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors backdrop-blur-sm border"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }}
                    >
                      {t.login}
                    </button>
                  )}
                </div>
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
                  className="bg-transparent text-white text-sm font-medium cursor-pointer focus:outline-none"
                >
                  <option value="sk" className="text-black">🇸🇰</option>
                  <option value="cz" className="text-black">🇨🇿</option>
                  <option value="en" className="text-black">🇬🇧</option>
                  <option value="es" className="text-black">🇪🇸</option>
                </select>
                
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="text-white hover:text-indigo-200 transition-colors duration-200 p-1"
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
                className="lg:hidden mt-4 p-4 bg-white/10 backdrop-blur-md rounded-xl max-h-[70vh] overflow-y-auto"
              >
                <div className="space-y-4">
                  {/* Explore Section */}
                  <div className="space-y-2">
                    <div className="text-white/60 font-bold text-xs uppercase tracking-wider px-2">{t.explore}</div>
                    <button
                      onClick={() => { setMobileMenuOpen(false); router.push('/about'); }}
                      className="block w-full text-left text-white hover:text-indigo-200 font-medium py-2 px-2"
                    >
                      {t.about_lectio_divina}
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); router.push('/intro'); }}
                      className="block w-full text-left text-white hover:text-indigo-200 font-medium py-2 px-2"
                    >
                      {t.start_the_guide}
                    </button>
                  </div>

                  {/* Prayer Section */}
                  <div className="space-y-2">
                    <div className="text-white/60 font-bold text-xs uppercase tracking-wider px-2">{t.prayer}</div>
                    <button
                      onClick={() => { setMobileMenuOpen(false); router.push('/lectio'); }}
                      className="block w-full text-left text-white hover:text-indigo-200 font-medium py-2 px-2"
                    >
                      {t.today_lectio}
                    </button>
                    <button
                      onClick={() => { setMobileMenuOpen(false); router.push('/rosary'); }}
                      className="block w-full text-left text-white hover:text-indigo-200 font-medium py-2 px-2"
                    >
                      {t.rosary}
                    </button>
                  </div>

                  {/* Contact */}
                  <button
                    onClick={() => {
                      router.push("/contact");
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-white hover:text-indigo-200 font-medium py-2"
                  >
                    {t.footer.contact}
                  </button>

                  {/* Divider */}
                  <div className="border-t border-white/20 pt-4 space-y-2">
                    {/* Give */}
                    <button
                      onClick={() => {
                        window.open('https://www.paypal.com/donate/?hosted_button_id=3BMNK9CH675ZL', '_blank');
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left text-white hover:text-indigo-200 font-medium py-2 px-4 border border-white/30 rounded-lg"
                    >
                      {t.give}
                    </button>

                    {/* Download */}
                    <button
                      onClick={() => {
                        window.open('https://mypro.one/837de1', '_blank');
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left text-white font-medium py-2 px-4 rounded-lg"
                      style={{ backgroundColor: '#40467b' }}
                    >
                      {t.homepage.download}
                    </button>

                    {/* Profile / Login */}
                    {session ? (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 px-3 py-2 rounded-lg backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                          {avatarUrl ? (
                            <Image 
                              src={avatarUrl} 
                              alt="Profile" 
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-r from-white/20 to-white/30 rounded-full flex items-center justify-center">
                              <User size={20} className="text-white" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-white">
                              {fullName || t.homepage.default_user}
                            </p>
                            <p className="text-sm text-white/70">
                              {session.user.email}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            router.push('/profile');
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors w-full text-left"
                        >
                          <User size={18} />
                          <span>{t.homepage.profile}</span>
                        </button>

                        <button
                          onClick={() => {
                            router.push('/notes');
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors w-full text-left"
                        >
                          <FileText size={18} />
                          <span>{t.homepage.notes}</span>
                        </button>

                        {isAdmin && !roleLoading && (
                          <button
                            onClick={() => {
                              router.push('/admin');
                              setMobileMenuOpen(false);
                            }}
                            className="flex items-center space-x-3 px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors w-full text-left"
                          >
                            <Settings size={18} />
                            <span>{t.admin}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setShowLogoutDialog(true);
                            setMobileMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-colors w-full text-left"
                        >
                          <LogOut size={18} />
                          <span>{t.logout}</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          router.push('/login');
                          setMobileMenuOpen(false);
                        }}
                        className="flex items-center justify-center space-x-2 text-white px-4 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors backdrop-blur-sm border"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                          borderColor: 'rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <User size={18} />
                        <span>{t.login}</span>
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-20 flex-1 flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
                href="https://www.paypal.com/donate/?hosted_button_id=3BMNK9CH675ZL" 
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center space-x-3 px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-2xl hover:scale-105 transition-all duration-300"
                style={{ backgroundColor: '#40467b' }}
              >
                <Heart className="w-5 h-5" />
                <span>{t.support}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </a>
            </motion.div>

          </motion.div>
        </div>
      </section>
      {/* App Section */}
      <AppSection t={t} />
      {/* Lectio Guide Section */}
      <LectioGuideSection t={t} />
      
      {/* Lectio Divina Preview Section */}
      <HomeLectioSection />
      
      {/* Daily Actio with Team Section */}
      <DailyQuote t={t} router={router} />
      
      {/* News Section */}
      <HomeNewsSection />
      
      {/* Roadmap Section */}
      <RoadmapSection />
      
      {/* Community Section */}
      <CommunitySection translations={translations[lang]} />

      {/* OVERLAY PRE ZATVORENIE DROPDOWN MENU */}
      {(profileDropdownOpen || mobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setProfileDropdownOpen(false);
            setMobileMenuOpen(false);
          }}
        />
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{t.homepage.login_required_title}</h3>
              <p className="text-gray-600 mb-6">
                {t.homepage.login_required_message}
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  onClick={() => {
                    setShowLoginModal(false);
                    router.push('/login');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {t.login}
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

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
  title={t.homepage.logout_confirm_title}
  message={t.homepage.logout_confirm_message}
  confirmText={t.logout}
  cancelText={t.cancel}
        onConfirm={async () => {
          await supabase.auth.signOut();
          setShowLogoutDialog(false);
          router.push('/');
        }}
        onCancel={() => setShowLogoutDialog(false)}
        type="warning"
      />
    </div>
  );
}