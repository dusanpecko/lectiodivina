//app/components/NavBar.tsx
"use client";
import Link from "next/link";
import Image from "next/image";
import { useLanguage, Language } from "./LanguageProvider";
import { translations } from "../i18n";
import { useSupabase } from "./SupabaseProvider";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
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
    router.push("/");
    setTimeout(() => setShowLogoutMessage(false), 3000);
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

  const flagEmojis = {
    sk: "🇸🇰",
    cz: "🇨🇿", 
    en: "🇬🇧",
    es: "🇪🇸"
  };

  const lectioSteps = [
    { href: '/about', label: 'O Lectio Divina', color: 'blue' },
    { href: '/intro/lectio', label: 'Lectio', color: 'green' },
    { href: '/intro/meditatio', label: 'Meditatio', color: 'amber' },
    { href: '/intro/oratio', label: 'Oratio', color: 'red' },
    { href: '/intro/contemplatio', label: 'Contemplatio', color: 'purple' },
    { href: '/intro/actio', label: 'Actio', color: 'indigo' }
  ];

  if (!mounted || !langLoaded) {
    return (
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Menu size={20} />
              </button>

              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-8 h-8 relative">
                  <Image
                    src="/apple-touch-icon.png"
                    alt="Lectio divina logo"
                    width={32}
                    height={32}
                    className="rounded-lg object-cover"
                  />
                </div>
                <span className="hidden sm:block text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Lectio divina
                </span>
              </Link>

              <div className="hidden lg:flex items-center space-x-6">
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-gray-700">
                  <Home size={16} />
                  <span>Domov</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-gray-700">
                  <BookOpen size={16} />
                  <span>Modlitba</span>
                </div>
                <div className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-gray-700">
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
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  <option value="sk">{flagEmojis.sk} SK</option>
                  <option value="cz">{flagEmojis.cz} CZ</option>
                  <option value="en">{flagEmojis.en} EN</option>
                  <option value="es">{flagEmojis.es} ES</option>
                </select>
                <Globe size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium">
                Načítavam...
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

      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-8 h-8 relative">
                  <Image
                    src="/apple-touch-icon.png"
                    alt="Lectio divina logo"
                    width={32}
                    height={32}
                    className="rounded-lg object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="hidden sm:block text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Lectio divina
                </span>
              </Link>

              <div className="hidden lg:flex items-center space-x-6">
                <Link 
                  href="/" 
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isHomePage
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <Home size={16} />
                  <span>{translations[lang].home}</span>
                </Link>

                <div className="relative prayer-dropdown">
                  <button
                    onClick={() => setPrayerDropdownOpen(!prayerDropdownOpen)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isPrayerPage
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-100'
                    }`}
                  >
                    <BookOpen size={16} />
                    <span>{translations[lang].prayer || 'Modlitba'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${prayerDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {prayerDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
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

                        {/* LECTIO DIVINA SUBMENU */}
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
                          
                          {lectioSubmenuOpen && (
                            <div className="ml-4 mt-2 space-y-1 border-l-2 border-indigo-100 pl-4">
                              {lectioSteps.map((item, index) => (
                                <Link
                                  key={index}
                                  href={item.href}
                                  onClick={() => {
                                    setPrayerDropdownOpen(false);
                                    setLectioSubmenuOpen(false);
                                  }}
                                  className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 group"
                                >
                                  <div className="w-2 h-2 bg-gray-400 rounded-full opacity-60 group-hover:opacity-100 transition-opacity"></div>
                                  <span className="text-gray-700 group-hover:text-gray-900 text-sm font-medium">
                                    {item.label}
                                  </span>
                                </Link>
                              ))}
                              
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <Link
                                  href="/intro"
                                  onClick={() => {
                                    setPrayerDropdownOpen(false);
                                    setLectioSubmenuOpen(false);
                                  }}
                                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-2 px-4 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
                                >
                                  <span>{translations[lang].start_the_guide || 'Začať sprievodcu'}</span>
                                  <ChevronRight className="w-4 h-4" />
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* RUŽENEC - VŽDY VIDITEĽNÝ */}
                        <div className="border-t border-gray-100 pt-4">
                          <button
                            onClick={() => checkAuthAndNavigate('/rosary')}
                            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-rose-50 transition-colors duration-200 group"
                          >
                            <div className="w-8 h-8 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg flex items-center justify-center">
                              <Flower className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                              <span className="font-bold text-gray-900 block">Ruženec</span>
                              <span className="text-xs text-gray-500">
                                {session ? 'Formou Lectio Divina' : 'Prihlásenie potrebné'}
                              </span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-rose-600 transition-colors duration-200" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Link 
                  href="/contact" 
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isContactPage
                      ? 'bg-green-100 text-green-700' 
                      : 'text-gray-700 hover:text-green-600 hover:bg-gray-100'
                  }`}
                >
                  <Mail size={16} />
                  <span>{translations[lang].contact || 'Kontakt'}</span>
                </Link>
                
                {session && (
                  <Link 
                    href="/notes" 
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isNotesPage
                        ? 'bg-amber-100 text-amber-700' 
                        : 'text-gray-700 hover:text-amber-600 hover:bg-gray-100'
                    }`}
                  >
                    <FileText size={16} />
                    <span>Poznámky</span>
                  </Link>
                )}
                
                {session && (
                  <Link 
                    href="/admin" 
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                      isAdminPage
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-gray-700 hover:text-purple-600 hover:bg-gray-100'
                    }`}
                  >
                    <Settings size={16} />
                    <span>{translations[lang].admin}</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <select
                  value={lang}
                  onChange={e => changeLang(e.target.value as Language)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                  <option value="sk">{flagEmojis.sk} SK</option>
                  <option value="cz">{flagEmojis.cz} CZ</option>
                  <option value="en">{flagEmojis.en} EN</option>
                  <option value="es">{flagEmojis.es} ES</option>
                </select>
                <Globe size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {session ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {avatarUrl ? (
                      <img 
                        src={avatarUrl} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {fullName || "Admin"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {session.user.email}
                      </p>
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
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
                              {fullName || "Admin"}
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
                          <span>Môj profil</span>
                        </Link>
                        
                        <Link
                          href="/notes"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <FileText size={16} />
                          <span>Poznámky</span>
                        </Link>
                        
                        <Link
                          href="/admin"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          <Settings size={16} />
                          <span>Administrácia</span>
                        </Link>
                        
                        <hr className="my-2" />
                        
                        <button
                          onClick={handleLogout}
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
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Prihlásiť sa
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* MOBILNÉ MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Hľadať..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <Link 
                href="/" 
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                  isHomePage
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={18} />
                <span>{translations[lang].home}</span>
              </Link>

              <div>
                <button
                  onClick={() => setLectioSubmenuOpen(!lectioSubmenuOpen)}
                  className="w-full flex items-center justify-between text-gray-700 font-medium border-b border-gray-200 pb-2 mb-3"
                >
                  <div className="flex items-center space-x-3">
                    <BookOpen size={18} />
                    <span>{translations[lang].prayer || 'Modlitba'}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${lectioSubmenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {lectioSubmenuOpen && (
                  <div className="space-y-2 ml-4 mb-4">
                    {/* LECTIO NA DNES - MOBILE */}
                    <div className="mb-3 pb-3 border-b border-gray-100">
                      <button
                        onClick={() => checkAuthAndNavigate('/lectio')}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 transition-colors duration-200"
                      >
                        <Calendar size={18} className="text-emerald-600" />
                        <div className="text-left">
                          <span className="block font-bold text-emerald-700">Lectio na dnes</span>
                          <span className="text-xs text-emerald-600">
                            {session ? 'Každodenná modlitba' : 'Prihlásenie potrebné'}
                          </span>
                        </div>
                      </button>
                    </div>

                    <div className="font-medium text-gray-800 mb-2">Lectio Divina</div>
                    {lectioSteps.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        {item.label}
                      </Link>
                    ))}
                    
                    <Link
                      href="/intro"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 mt-3 block"
                    >
                      {translations[lang].start_the_guide || 'Začať sprievodcu'}
                    </Link>

                    {/* RUŽENEC - MOBILE */}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <button
                        onClick={() => checkAuthAndNavigate('/rosary')}
                        className="w-full flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Flower size={18} />
                        <div className="text-left">
                          <span className="block font-medium">Ruženec</span>
                          <span className="text-xs text-gray-500">
                            {session ? 'Formou Lectio Divina' : 'Prihlásenie potrebné'}
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Link 
                href="/contact" 
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                  isContactPage
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-700 hover:text-green-600 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Mail size={18} />
                <span>{translations[lang].contact || 'Kontakt'}</span>
              </Link>
              
              {session && (
                <Link 
                  href="/notes" 
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isNotesPage
                      ? 'bg-amber-100 text-amber-700' 
                      : 'text-gray-700 hover:text-amber-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FileText size={18} />
                  <span>Moje poznámky</span>
                </Link>
              )}
              
              {session && (
                <Link 
                  href="/admin" 
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                    isAdminPage
                      ? 'bg-purple-100 text-purple-700' 
                      : 'text-gray-700 hover:text-purple-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>{translations[lang].admin}</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* OVERLAY PRE ZATVORENIE DROPDOWN MENU */}
      {(profileDropdownOpen || mobileMenuOpen || prayerDropdownOpen) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setProfileDropdownOpen(false);
            setMobileMenuOpen(false);
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
                <Link
                  href="/login"
                  onClick={() => setShowLoginModal(false)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Prihlásiť sa
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}