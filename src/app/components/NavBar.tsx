//app/components/NavBar.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useLanguage, Language } from "./LanguageProvider";
import { translations } from "../i18n";
import { useSupabase } from "./SupabaseProvider";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserRole } from "../../hooks/useUserRole";
import Logo from "./Logo";
import ConfirmDialog from "./ConfirmDialog";
import {
  Home,
  Settings,
  Globe,
  LogOut,
  User,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Mail,
  BookOpen,
  Flower,
  FileText,
  Calendar
} from "lucide-react";

interface NavBarProps {
  onMenuClick?: () => void;
}

export default function NavBar({ onMenuClick }: NavBarProps) {
  const { lang, changeLang, isLoaded: langLoaded } = useLanguage();
  const { supabase, session } = useSupabase();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [prayerDropdownOpen, setPrayerDropdownOpen] = useState(false);
  const [lectioSubmenuOpen, setLectioSubmenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setTimeout(() => {
        setNotifications(3);
      }, 100);
    }
  }, [mounted]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.email) {
        const { data, error } = await supabase
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const prayerDropdown = document.querySelector('.prayer-dropdown');
      if (prayerDropdown && !prayerDropdown.contains(event.target as Node)) {
        setPrayerDropdownOpen(false);
        setLectioSubmenuOpen(false);
      }
    };

    if (mounted) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      if (mounted) {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, [mounted]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutMessage(true);
    setProfileDropdownOpen(false);
    setShowLogoutDialog(false);
    router.push("/");
    setTimeout(() => setShowLogoutMessage(false), 3000);
  };

  const handleLogoutClick = () => {
    setShowLogoutDialog(true);
  };

  const handleLectioClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLectioSubmenuOpen(!lectioSubmenuOpen);
  };

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
    setPrayerDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const isAdminPage = mounted && pathname?.startsWith('/admin');
  const isContactPage = mounted && pathname?.startsWith('/contact');
  const isHomePage = mounted && pathname === '/';
  const isNotesPage = mounted && pathname?.startsWith('/notes');
  const isLectioPage = mounted && pathname?.startsWith('/lectio');
  const isPrayerPage = mounted && (
    pathname?.startsWith('/intro') || 
    pathname?.startsWith('/rosary') ||
    pathname?.startsWith('/about') ||
    pathname?.startsWith('/lectio')
  );

  // Translations shortcut
  const t = translations[lang];

  const flagEmojis = {
    sk: "🇸🇰",
    cz: "🇨🇿", 
    en: "🇬🇧",
    es: "🇪🇸"
  };

  const lectioSteps = [
    { href: '/about', label: t.navbar.about_lectio, color: 'blue' },
    { href: '/intro/lectio', label: t.navbar.lectio_steps.lectio, color: 'green' },
    { href: '/intro/meditatio', label: t.navbar.lectio_steps.meditatio, color: 'amber' },
    { href: '/intro/oratio', label: t.navbar.lectio_steps.oratio, color: 'red' },
    { href: '/intro/contemplatio', label: t.navbar.lectio_steps.contemplatio, color: 'purple' },
    { href: '/intro/actio', label: t.navbar.lectio_steps.actio, color: 'indigo' }
  ];

  if (!mounted || !langLoaded) {
    return (
      <nav 
        className="backdrop-blur-md shadow-md fixed top-0 left-0 right-0 z-50"
        style={{ 
          backgroundColor: 'rgba(64, 70, 123, 0.95)'
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <button className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white">
                <Menu size={20} />
              </button>

              <Link href="/" className="flex items-center group">
                <Logo 
                  className="h-8 w-auto text-white group-hover:opacity-80 transition-opacity" 
                  height={32}
                />
              </Link>

              <div className="hidden lg:flex items-center space-x-6">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-white/90">
                  <Home size={16} />
                  <span>{t.home}</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-white/90">
                  <BookOpen size={16} />
                  <span>{t.prayer}</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-white/90">
                  <Mail size={16} />
                  <span>Kontakt</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={lang}
                  onChange={e => changeLang(e.target.value as Language)}
                  className="appearance-none backdrop-blur-sm rounded-lg px-3 py-2 pr-8 text-sm font-medium focus:ring-2 focus:ring-white/50 cursor-pointer text-white border"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <option value="sk" className="text-gray-900">{flagEmojis.sk} SK</option>
                  <option value="cz" className="text-gray-900">{flagEmojis.cz} CZ</option>
                  <option value="en" className="text-gray-900">{flagEmojis.en} EN</option>
                  <option value="es" className="text-gray-900">{flagEmojis.es} ES</option>
                </select>
                <Globe size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 pointer-events-none" />
              </div>

              <div className="text-white px-4 py-2 rounded-lg font-medium backdrop-blur-sm border" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                borderColor: 'rgba(255, 255, 255, 0.3)'
              }}>
                {t.loading}
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {showLogoutMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100] animate-bounce">
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span>{translations[lang].logout_success ?? "Úspešne odhlásený."}</span>
          </div>
        </div>
      )}

      <nav 
        className="backdrop-blur-md shadow-md fixed top-0 left-0 right-0 z-50"
        style={{ 
          backgroundColor: 'rgba(64, 70, 123, 0.95)'
        }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <Link href="/" className="flex items-center group">
                <Logo 
                  className="h-4 sm:h-8 w-auto text-white group-hover:opacity-80 transition-opacity" 
                  height={32}
                />
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              {/* Desktop Menu Items */}
              <div className="hidden lg:flex items-center space-x-4">
                {/* Explore Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setPrayerDropdownOpen(!prayerDropdownOpen);
                      setLectioSubmenuOpen(false);
                    }}
                    className="text-white hover:text-indigo-200 transition-colors duration-200 font-medium flex items-center space-x-1"
                  >
                    <span>{t.explore}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${prayerDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {prayerDropdownOpen && (
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
                            setPrayerDropdownOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-gray-800 hover:bg-indigo-50 transition-colors duration-200 font-medium"
                        >
                          {t.navbar.about_lectio}
                        </button>
                        <button
                          onClick={() => {
                            router.push('/intro');
                            setPrayerDropdownOpen(false);
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
                    onClick={() => {
                      setLectioSubmenuOpen(!lectioSubmenuOpen);
                      setPrayerDropdownOpen(false);
                    }}
                    className="text-white hover:text-indigo-200 transition-colors duration-200 font-medium flex items-center space-x-1"
                  >
                    <span>{t.prayer}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${lectioSubmenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  
                  <AnimatePresence>
                    {lectioSubmenuOpen && (
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
                            checkAuthAndNavigate('/lectio');
                            setLectioSubmenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-gray-800 hover:bg-indigo-50 transition-colors duration-200 font-medium"
                        >
                          {t.today_lectio}
                        </button>
                        <button
                          onClick={() => {
                            checkAuthAndNavigate('/rosary');
                            setLectioSubmenuOpen(false);
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
              </div>

              {/* Give Button */}
              <button
                onClick={() => window.open('https://www.paypal.com/donate/?hosted_button_id=3BMNK9CH675ZL', '_blank')}
                className="hidden lg:flex items-center px-3 py-2 rounded-lg font-medium transition-all duration-200 text-white/90 hover:text-white hover:bg-white/10 border"
                style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                {t.give}
              </button>

              {/* Language Selector */}
              <div className="relative">
                <select
                  value={lang}
                  onChange={e => changeLang(e.target.value as Language)}
                  className="appearance-none backdrop-blur-sm rounded-lg px-3 py-2 pr-8 text-sm font-medium focus:ring-2 focus:ring-white/50 cursor-pointer text-white border"
                  style={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <option value="sk" className="text-gray-900">{flagEmojis.sk} SK</option>
                  <option value="cz" className="text-gray-900">{flagEmojis.cz} CZ</option>
                  <option value="en" className="text-gray-900">{flagEmojis.en} EN</option>
                  <option value="es" className="text-gray-900">{flagEmojis.es} ES</option>
                </select>
                <Globe size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white/70 pointer-events-none" />
              </div>

              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Profile" 
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
                            <img 
                              src={avatarUrl} 
                              alt="Profile" 
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
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <User size={16} />
                          <span>{t.homepage.profile}</span>
                        </Link>
                        
                        <Link
                          href="/notes"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <FileText size={16} />
                          <span>{t.homepage.notes}</span>
                        </Link>
                        
                        {isAdmin && !roleLoading && (
                          <Link
                            href="/admin"
                            className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            <Settings size={16} />
                            <span>{t.admin}</span>
                          </Link>
                        )}
                        
                        <hr className="my-2" />
                        
                        <button
                          onClick={handleLogoutClick}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <LogOut size={16} />
                          <span>{translations[lang].logout}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-white px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-colors backdrop-blur-sm border"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                >
                  {t.login}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* MOBILNÉ MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden fixed left-0 right-0 top-16 bottom-0 flex items-start justify-center p-4 z-[60]"
              style={{ 
                backgroundColor: '#40467b',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div className="w-full max-w-md rounded-xl p-4 max-h-[80vh] overflow-y-auto"
                style={{ 
                  backgroundColor: 'rgba(96, 102, 153, 0.9',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <div className="space-y-3">
              {/* Explore Section */}
              <div className="space-y-2">
                <div className="text-white/60 font-bold text-xs uppercase tracking-wider px-2">{t.explore}</div>
                <button
                  onClick={() => { setMobileMenuOpen(false); router.push('/about'); }}
                  className="block w-full text-left text-white hover:text-indigo-200 font-medium py-2 px-2"
                >
                  {t.navbar.about_lectio}
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
                  onClick={() => { 
                    checkAuthAndNavigate('/lectio');
                    setMobileMenuOpen(false); 
                  }}
                  className="block w-full text-left text-white hover:text-indigo-200 font-medium py-2 px-2"
                >
                  {t.today_lectio}
                </button>
                <button
                  onClick={() => { 
                    checkAuthAndNavigate('/rosary');
                    setMobileMenuOpen(false); 
                  }}
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

              {/* Give Button - MOBILE */}
              <div className="border-t pt-3 mt-3" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <button
                  onClick={() => {
                    window.open('https://www.paypal.com/donate/?hosted_button_id=3BMNK9CH675ZL', '_blank');
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center space-x-2 w-full px-4 py-3 rounded-lg font-medium transition-colors text-white/90 hover:text-white hover:bg-white/10 border"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  <span>{t.give}</span>
                </button>
              </div>

              {/* DIVIDER */}
              <div className="border-t pt-3 mt-3" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                {session ? (
                  /* POUŽÍVATEĽSKÝ PROFIL - MOBILE */
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-3 py-2 rounded-lg backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                      {avatarUrl ? (
                        <img 
                          src={avatarUrl} 
                          alt="Profile" 
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

                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={18} />
                      <span>{t.homepage.profile}</span>
                    </Link>

                    <Link
                      href="/notes"
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <FileText size={18} />
                      <span>{t.homepage.notes}</span>
                    </Link>

                    {isAdmin && !roleLoading && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-3 px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings size={18} />
                        <span>{t.admin}</span>
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        handleLogoutClick();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-colors w-full text-left"
                    >
                      <LogOut size={18} />
                      <span>{translations[lang].logout}</span>
                    </button>
                  </div>
                ) : (
                  /* PRIHLÁSENIE - MOBILE */
                  <div className="space-y-3">
                    <Link
                      href="/login"
                      className="flex items-center justify-center space-x-2 text-white px-4 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors backdrop-blur-sm border"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User size={18} />
                      <span>{t.login}</span>
                    </Link>
                  </div>
                )}
              </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* OVERLAY PRE ZATVORENIE DROPDOWN MENU */}
      {(profileDropdownOpen || prayerDropdownOpen) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setProfileDropdownOpen(false);
            setPrayerDropdownOpen(false);
            setLectioSubmenuOpen(false);
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
                <Link
                  href="/login"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  {t.login}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutDialog}
        title={t.homepage.logout_confirm_title}
        message={t.homepage.logout_confirm_message}
        confirmText={t.logout}
        cancelText={t.cancel}
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutDialog(false)}
        type="warning"
      />
    </>
  );
}