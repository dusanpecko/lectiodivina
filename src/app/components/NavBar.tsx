"use client";
import Link from "next/link";
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
  ChevronDown
} from "lucide-react";

interface NavBarProps {
  onMenuClick?: () => void;
}

export default function NavBar({ onMenuClick }: NavBarProps) {
  const { lang, changeLang } = useLanguage();
  const { supabase, session } = useSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(0); // Start with 0 to prevent mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Set notifications after mount to prevent hydration mismatch
    setNotifications(3);
  }, []);

  useEffect(() => {
    // Načítaj meno a avatar používateľa z DB ak je prihlásený
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
    if (mounted) {
      fetchUserData();
    }
  }, [session, supabase, mounted]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutMessage(true);
    setProfileDropdownOpen(false);
    router.push("/");
    setTimeout(() => setShowLogoutMessage(false), 3000);
  };

  // Safe pathname checking
  const isAdminPage = mounted && pathname?.startsWith('/admin');

  const flagEmojis = {
    sk: "🇸🇰",
    cz: "🇨🇿", 
    en: "🇬🇧",
    es: "🇪🇸"
  };

  // Show basic navbar until mounted
  if (!mounted) {
    return (
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Section - Logo & Main Nav */}
            <div className="flex items-center space-x-8">
              <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Menu size={20} />
              </button>

              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Home size={18} className="text-white" />
                </div>
                <span className="hidden sm:block text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Lectio divina
                </span>
              </Link>

              <div className="hidden lg:flex items-center space-x-6">
                <Link 
                  href="/" 
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-all duration-200"
                >
                  <Home size={16} />
                  <span>{translations[lang].home}</span>
                </Link>
              </div>
            </div>

            {/* Right Section */}
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

              <Link
                href="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Prihlásiť sa
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* Logout Success Message */}
      {showLogoutMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-[100] animate-bounce">
          <div className="flex items-center space-x-2">
            <span>✅</span>
            <span>{translations[lang].logout_success ?? "Úspešne odhlásený."}</span>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left Section - Logo & Main Nav */}
            <div className="flex items-center space-x-8">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {/* Logo/Brand */}
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Home size={18} className="text-white" />
                </div>
                <span className="hidden sm:block text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  Lectio divina
                </span>
              </Link>

              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex items-center space-x-6">
                <Link 
                  href="/" 
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    pathname === '/' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  <Home size={16} />
                  <span>{translations[lang].home}</span>
                </Link>
                
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

            {/* Right Section - Search, Language, Profile */}
            <div className="flex items-center space-x-4">
              
              {/* Search Bar - Hidden on mobile */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Hľadať..."
                    className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Language Selector */}
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
                <>
                  {/* Notifications */}
                  <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Bell size={20} className="text-gray-600" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifications}
                      </span>
                    )}
                  </button>

                  {/* Profile Dropdown */}
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

                    {/* Profile Dropdown Menu */}
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
                </>
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-3">
              {/* Mobile Search */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Hľadať..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* Mobile Navigation Links */}
              <Link 
                href="/" 
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg font-medium transition-colors ${
                  pathname === '/' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home size={18} />
                <span>{translations[lang].home}</span>
              </Link>
              
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

      {/* Click outside to close dropdowns */}
      {(profileDropdownOpen || mobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-30" 
          onClick={() => {
            setProfileDropdownOpen(false);
            setMobileMenuOpen(false);
          }}
        />
      )}
    </>
  );
}