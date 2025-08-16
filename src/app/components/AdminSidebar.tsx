//app/components/AdminSidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Quote, 
  Newspaper, 
  CreditCard, 
  Users, 
  BookOpen,
  UserPlus,
  ChevronRight,
  Settings,
  ChevronLeft,
  Menu,
  Kanban,
  Book, // Pre lectio-sources
  Crown // Pridané pre ruženec
} from "lucide-react";

const links = [
  { href: "/admin", key: "dashboard", icon: LayoutDashboard, color: "blue" },
  { href: "/admin/calendar", key: "calendar", icon: Calendar, color: "green" },
  { href: "/admin/daily_quotes", key: "daily_quotes", icon: Quote, color: "purple" },
  { href: "/admin/news", key: "news", icon: Newspaper, color: "red" },
  { href: "/admin/content_cards", key: "content_cards", icon: CreditCard, color: "indigo" }, 
  { href: "/admin/community", key: "community", icon: UserPlus, color: "amber" },
  { href: "/admin/users", key: "users_id", icon: Users, color: "cyan" }, 
  { href: "/admin/lectio", key: "lectio", icon: BookOpen, color: "emerald" },
  { href: "/admin/lectio-sources", key: "lectio_sources", icon: Book, color: "teal" }, 
  { href: "/admin/lectio-sources/new", key: "lectio_sources_news", icon: Book, color: "teal" },
  { href: "/admin/rosary", key: "rosary", icon: Crown, color: "violet" }, // Pridané ruženec
  { href: "/admin/tasks", key: "tasks", icon: Kanban, color: "pink" },
  { href: "/admin/programs", key: "programs", icon: Kanban, color: "pink" },
] as const;

type SidebarKey = typeof links[number]["key"];

const colorVariants = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200", 
    text: "text-blue-700",
    icon: "text-blue-600",
    active: "bg-blue-100 border-blue-300 text-blue-800",
    hover: "hover:bg-blue-50 hover:border-blue-200"
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700", 
    icon: "text-green-600",
    active: "bg-green-100 border-green-300 text-green-800",
    hover: "hover:bg-green-50 hover:border-green-200"
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    icon: "text-purple-600", 
    active: "bg-purple-100 border-purple-300 text-purple-800",
    hover: "hover:bg-purple-50 hover:border-purple-200"
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: "text-red-600",
    active: "bg-red-100 border-red-300 text-red-800", 
    hover: "hover:bg-red-50 hover:border-red-200"
  },
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    icon: "text-indigo-600",
    active: "bg-indigo-100 border-indigo-300 text-indigo-800",
    hover: "hover:bg-indigo-50 hover:border-indigo-200"
  },
  amber: {
    bg: "bg-amber-50", 
    border: "border-amber-200",
    text: "text-amber-700",
    icon: "text-amber-600",
    active: "bg-amber-100 border-amber-300 text-amber-800",
    hover: "hover:bg-amber-50 hover:border-amber-200"
  },
  cyan: {
    bg: "bg-cyan-50",
    border: "border-cyan-200", 
    text: "text-cyan-700",
    icon: "text-cyan-600",
    active: "bg-cyan-100 border-cyan-300 text-cyan-800",
    hover: "hover:bg-cyan-50 hover:border-cyan-200"
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700", 
    icon: "text-emerald-600",
    active: "bg-emerald-100 border-emerald-300 text-emerald-800",
    hover: "hover:bg-emerald-50 hover:border-emerald-200"
  },
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700", 
    icon: "text-teal-600",
    active: "bg-teal-100 border-teal-300 text-teal-800",
    hover: "hover:bg-teal-50 hover:border-teal-200"
  },
  // Pridané pre ruženec
  violet: {
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700", 
    icon: "text-violet-600",
    active: "bg-violet-100 border-violet-300 text-violet-800",
    hover: "hover:bg-violet-50 hover:border-violet-200"
  },
  pink: {
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-700", 
    icon: "text-pink-600",
    active: "bg-pink-100 border-pink-300 text-pink-800",
    hover: "hover:bg-pink-50 hover:border-pink-200"
  }
};

interface AdminSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

export default function AdminSidebar({ isCollapsed = false, onToggle, isMobile = false }: AdminSidebarProps) {
  const pathname = usePathname();
  const { lang, isLoaded } = useLanguage();
  const [mounted, setMounted] = useState(false);
  
  // Mark as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Safe translations - wait for language to load
  const t = (mounted && isLoaded) ? translations[lang] as Record<SidebarKey, string> : {} as Record<SidebarKey, string>;

  // Fallback pre tasks, lectio_sources a rosary ak nie sú v translations
  const getTranslation = (key: SidebarKey) => {
    if (key === 'tasks') return 'Úlohy';
    if (key === 'lectio_sources') return 'Lectio Zdroje';
    if (key === 'lectio_sources_news') return 'Nový Lectio zdroj';
    if (key === 'rosary') return 'Ruženec'; // Pridané pre ruženec
    return t[key] || key;
  };

  const isActive = (href: string) => {
    if (!mounted) return false; // No active state during SSR/hydration
    
    if (href === "/admin") {
      return pathname === "/admin";
    }
    
    // OPRAVA: Najprv hľadáme presnejšiu zhodu
    // Ak existuje presnejšia cesta v links, nezvýrazníme kratšiu
    const allHrefs = links.map(link => link.href);
    const longerMatches = allHrefs.filter(h => 
      h !== href && 
      h.startsWith(href) && 
      (pathname === h || pathname.startsWith(h + "/"))
    );
    
    // Ak existuje dlhšia cesta ktorá lepšie vyhovuje, nezvýrazníme túto
    if (longerMatches.length > 0) {
      return false;
    }
    
    // Inak použijeme štandardnú logiku
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Show static version during SSR/hydration
  if (!mounted || !isLoaded) {
    return (
      <aside className={`
        bg-gradient-to-b from-white via-gray-50 to-gray-100 
        ${isMobile ? 'h-screen' : 'min-h-screen'} flex flex-col border-r border-gray-200 shadow-xl
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-72'}
        ${isMobile ? 'fixed z-50' : 'relative'}
      `}>
        {/* Static header */}
        <div className={`
          flex-shrink-0 p-6 border-b border-gray-200 bg-white/90 backdrop-blur-sm
          ${isCollapsed ? 'p-4' : 'p-6'}
        `}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Settings size={20} className="text-white" />
            </div>
            
            {!isCollapsed && (
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800">Admin Panel</h2>
                <p className="text-sm text-gray-500">Správa obsahu</p>
              </div>
            )}
          </div>
        </div>

        {/* Static navigation */}
        <nav className={`flex-1 min-h-0 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-4'}`}>
          <div className="space-y-2">
            {links.map(link => {
              const Icon = link.icon;
              
              return (
                <div
                  key={link.href}
                  className={`group relative flex items-center gap-3 rounded-xl border border-transparent transition-all duration-200 ${
                    isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
                  } hover:bg-gray-50 hover:border-gray-200`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 text-gray-500 transition-colors">
                    <Icon size={20} />
                  </div>
                  
                  {/* Text - only show if not collapsed */}
                  {!isCollapsed && (
                    <span className="flex-1 font-medium transition-colors text-gray-700">
                      Loading...
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Static footer */}
        <div className={`flex-shrink-0 border-t border-gray-200 bg-white/90 backdrop-blur-sm ${isCollapsed ? 'p-2' : 'p-4'}`}>
          {isCollapsed ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">Admin</p>
                <p className="text-xs text-gray-500">Načítavam...</p>
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          )}
        </div>
      </aside>
    );
  }

  // Full interactive version after mount and language load
  return (
    <aside className={`
      bg-gradient-to-b from-white via-gray-50 to-gray-100 
      ${isMobile ? 'h-screen' : 'min-h-screen'} flex flex-col border-r border-gray-200 shadow-xl
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-16' : 'w-72'}
      ${isMobile ? 'fixed z-50' : 'relative'}
    `}>
      {/* Hlavička */}
      <div className={`
        flex-shrink-0 p-6 border-b border-gray-200 bg-white/90 backdrop-blur-sm
        ${isCollapsed ? 'p-4' : 'p-6'}
      `}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Settings size={20} className="text-white" />
          </div>
          
          {!isCollapsed && (
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">Admin Panel</h2>
              <p className="text-sm text-gray-500">Správa obsahu</p>
            </div>
          )}
          
          {/* Toggle button for desktop */}
          {onToggle && !isMobile && (
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 lg:flex hidden"
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? (
                <ChevronRight size={18} className="text-gray-600" />
              ) : (
                <ChevronLeft size={18} className="text-gray-600" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigácia - OPRAVA: Pridané min-h-0 a proper flex layout */}
      <div className="flex-1 min-h-0 flex flex-col">
        <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-4'}`}>
          <div className="space-y-2">
            {links.map(link => {
              const Icon = link.icon;
              const colors = colorVariants[link.color];
              const active = isActive(link.href);
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative flex items-center gap-3 rounded-xl border transition-all duration-200 ${
                    isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3'
                  } ${
                    active 
                      ? `${colors.active} shadow-md` 
                      : `border-transparent ${colors.hover} hover:shadow-sm`
                  }`}
                  title={isCollapsed ? getTranslation(link.key) : undefined}
                >
                  {/* Ikona */}
                  <div className={`flex-shrink-0 ${active ? colors.icon : 'text-gray-500'} transition-colors`}>
                    <Icon size={20} />
                  </div>
                  
                  {/* Text */}
                  {!isCollapsed && (
                    <>
                      <span className={`flex-1 font-medium transition-colors ${
                        active ? colors.text : 'text-gray-700 group-hover:text-gray-800'
                      }`}>
                        {getTranslation(link.key)}
                      </span>
                      
                      {/* Šípka pre aktívnu položku */}
                      {active && (
                        <ChevronRight size={16} className={`${colors.icon} animate-pulse`} />
                      )}
                    </>
                  )}
                  
                  {/* Aktivný indikátor */}
                  {active && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 ${colors.bg} rounded-r-full shadow-sm`} />
                  )}
                  
                  {/* Tooltip pre collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {getTranslation(link.key)}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Quick actions - len ak nie je collapsed */}
        {!isCollapsed && (
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2">
                Rýchle akcie
              </div>
              <Link
                href="/admin/news/new"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Newspaper size={16} />
                Nový článok
              </Link>
              <Link
                href="/admin/lectio-sources/new"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Book size={16} />
                Nový Lectio zdroj
              </Link>
              {/* Pridané rýchle akcie pre ruženec */}
              <Link
                href="/admin/rosary/collections/new"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Crown size={16} />
                Nová kolekcia ruženča
              </Link>
              <Link
                href="/admin/rosary/mysteries/new"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Crown size={16} />
                Nové tajomstvo ruženča
              </Link>
              <Link
                href="/admin/tasks"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Kanban size={16} />
                Správa úloh
              </Link>
              <Link
                href="/admin/users/new"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <UserPlus size={16} />
                Nový používateľ
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Pätička */}
      <div className={`flex-shrink-0 border-t border-gray-200 bg-white/90 backdrop-blur-sm ${isCollapsed ? 'p-2' : 'p-4'}`}>
        {isCollapsed ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
            <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">Admin</p>
              <p className="text-xs text-gray-500">Prihlásený</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    </aside>
  );
}