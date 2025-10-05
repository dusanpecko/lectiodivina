//app/components/AdminSidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  Crown, // Pridané pre ruženec
  AlertCircle, // Pre error reports
  Bell, // Pre notifikácie
  Plus // Pre quick actions button
} from "lucide-react";

const links = [
  { href: "/admin", key: "dashboard", icon: LayoutDashboard, color: "blue" },
  { href: "/admin/lectio-sources", key: "lectio_sources", icon: Book, color: "teal" }, 
  { href: "/admin/lectio", key: "lectio", icon: BookOpen, color: "emerald" },
  { href: "/admin/news", key: "news", icon: Newspaper, color: "red" },
  { href: "/admin/notifications/", key: "Notifikácie", icon: Bell, color: "pink" },
  { href: "/admin/calendar", key: "calendar", icon: Calendar, color: "green" },
  { href: "/admin/daily_quotes", key: "daily_quotes", icon: Quote, color: "purple" },
  { href: "/admin/community", key: "community", icon: UserPlus, color: "amber" },
  { href: "/admin/rosary", key: "rosary", icon: Crown, color: "violet" },
  { href: "/admin/content_cards", key: "content_cards", icon: CreditCard, color: "indigo" }, 
  { href: "/admin/programs", key: "programs", icon: Kanban, color: "pink" },
  { href: "/admin/tasks", key: "tasks", icon: Kanban, color: "pink" },
  { href: "/admin/error-reports", key: "error_reports", icon: AlertCircle, color: "orange" },
  { href: "/admin/users", key: "users_id", icon: Users, color: "cyan" }, 
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
  // Pridané pre error reports
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700", 
    icon: "text-orange-600",
    active: "bg-orange-100 border-orange-300 text-orange-800",
    hover: "hover:bg-orange-50 hover:border-orange-200"
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
  const [showQuickActions, setShowQuickActions] = useState(false);
  
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
    if (key === 'rosary') return 'Ruženec';
    if (key === 'error_reports') return 'Správa chýb';
    if (key === 'programs') return 'Programy';
    if (key === 'Notifikácie') return 'Notifikácie';
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
        bg-[#40467b] h-screen
        flex flex-col border-r border-[#2d3356] shadow-xl
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-60'}
        ${isMobile ? 'fixed z-50' : 'sticky top-0'}
      `}>
        {/* Static header */}
        <div className={`
          flex-shrink-0 p-6 border-b border-gray-200 bg-white/90 backdrop-blur-sm
          ${isCollapsed ? 'p-4' : 'p-6'}
        `}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
              <Settings size={16} className="text-white" />
            </div>
            
            {!isCollapsed && (
              <div className="flex-1">
                <h2 className="text-base font-bold text-gray-800">Admin Panel</h2>
                <p className="text-xs text-gray-500">Správa obsahu</p>
              </div>
            )}
          </div>
        </div>

        {/* Static navigation */}
        <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-4'}`}>
          <div className="space-y-2">
            {links.map(link => {
              const Icon = link.icon;
              
              return (
                <div
                  key={link.href}
                  className={`group relative flex items-center gap-2 rounded-lg border border-transparent transition-all duration-200 ${
                    isCollapsed ? 'px-3 py-1.5 justify-center' : 'px-3 py-1.5'
                  } hover:bg-gray-50 hover:border-gray-200`}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 text-gray-500 transition-colors">
                    <Icon size={14} />
                  </div>
                  
                  {/* Text - only show if not collapsed */}
                  {!isCollapsed && (
                    <span className="flex-1 text-xs font-medium transition-colors text-gray-700">
                      Loading...
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </nav>


      </aside>
    );
  }

  // Full interactive version after mount and language load
  return (
    <aside className={`
      bg-[#40467b] h-screen
      flex flex-col border-r border-[#2d3356] shadow-xl
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-16' : 'w-60'}
      ${isMobile ? 'fixed z-50' : 'sticky top-0'}
    `}>
      {/* Hlavička */}
      <div className={`
        flex-shrink-0 p-6 border-b border-[#2d3356] bg-[#40467b]
        ${isCollapsed ? 'p-4' : 'p-6'}
      `}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center shadow-lg">
            <Settings size={16} className="text-white" />
          </div>
          
          {!isCollapsed && (
            <div className="flex-1">
              <h2 className="text-base font-bold text-white">Admin Panel</h2>
              <p className="text-xs text-gray-300">Správa obsahu</p>
            </div>
          )}
          
          {/* Toggle button for desktop */}
          {onToggle && !isMobile && (
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-[#2d3356] transition-colors duration-200 lg:flex hidden"
              aria-label="Toggle sidebar"
            >
              {isCollapsed ? (
                <ChevronRight size={14} className="text-gray-300" />
              ) : (
                <ChevronLeft size={14} className="text-gray-300" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Navigácia - OPRAVA: Pridané min-h-0 a proper flex layout */}
      <div className="flex-1 min-h-0 flex flex-col">
        <nav className={`flex-1 overflow-y-auto ${isCollapsed ? 'p-2' : 'p-4'}`}>
          <div className="space-y-2 pb-8">
            {links.map(link => {
              const Icon = link.icon;
              const colors = colorVariants[link.color];
              const active = isActive(link.href);
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group relative flex items-center gap-2 rounded-lg border transition-all duration-200 ${
                    isCollapsed ? 'px-3 py-1.5 justify-center' : 'px-3 py-1.5'
                  } ${
                    active 
                      ? `bg-[#2d3356] border-[#1a1f3a] shadow-md` 
                      : `border-transparent hover:bg-[#2d3356] hover:shadow-sm`
                  }`}
                  title={isCollapsed ? getTranslation(link.key) : undefined}
                >
                  {/* Ikona */}
                  <div className={`flex-shrink-0 ${active ? 'text-blue-300' : 'text-gray-300'} transition-colors`}>
                    <Icon size={14} />
                  </div>
                  
                  {/* Text */}
                  {!isCollapsed && (
                    <>
                      <span className={`flex-1 text-xs font-medium transition-colors ${
                        active ? 'text-blue-200' : 'text-gray-200 group-hover:text-white'
                      }`}>
                        {getTranslation(link.key)}
                      </span>
                      
                      {/* Šípka pre aktívnu položku */}
                      {active && (
                        <ChevronRight size={12} className={`text-blue-300 animate-pulse`} />
                      )}
                    </>
                  )}
                  
                  {/* Aktivný indikátor */}
                  {active && (
                    <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-300 rounded-r-full shadow-sm`} />
                  )}
                  
                  {/* Tooltip pre collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {getTranslation(link.key)}
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Quick actions button - ALWAYS VISIBLE */}
        <div className={`absolute bottom-24 z-50 ${
          isCollapsed 
            ? 'left-1/2 transform -translate-x-1/2' // Centrované v collapsed mode
            : 'left-4 right-4'
        }`}>
          <div className={`flex ${isCollapsed ? 'justify-center' : 'justify-end pr-4'}`}>
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className={`
                ${isCollapsed ? 'w-10 h-10' : 'w-14 h-14'} 
                bg-[#2d3356] rounded-full flex items-center justify-center 
                shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-110 
                border-2 border-white/20 hover:bg-[#5a6096]
              `}
              title="Rýchle akcie"
            >
              <Plus 
                size={isCollapsed ? 16 : 20} 
                className={`text-white transition-transform duration-200 ${showQuickActions ? 'rotate-45' : ''}`} 
              />
            </button>
          </div>

          {/* Quick actions dropdown - PORTÁLOVANÉ DO BODY */}
          {showQuickActions && mounted && typeof document !== 'undefined' && createPortal(
            <div 
              className="bg-[#2d3356] rounded-lg shadow-2xl border border-[#1a1f3a] py-2 min-w-52"
              style={{
                position: 'fixed',
                zIndex: 2147483647, // Najvyšší možný z-index
                bottom: '120px',
                left: isCollapsed ? '24px' : '16px'
              }}
            >
              <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider px-3 pb-2 border-b border-[#1a1f3a]">
                Rýchle akcie
              </div>
              <div className="py-1">
                <Link
                  href="/admin/news/new"
                  className="flex items-center gap-3 px-3 py-2 text-xs text-gray-200 hover:bg-[#40467b] hover:text-white transition-colors"
                  onClick={() => setShowQuickActions(false)}
                >
                  <Newspaper size={14} />
                  Nový článok
                </Link>
                <Link
                  href="/admin/lectio-sources/new"
                  className="flex items-center gap-3 px-3 py-2 text-xs text-gray-200 hover:bg-[#40467b] hover:text-white transition-colors"
                  onClick={() => setShowQuickActions(false)}
                >
                  <Book size={14} />
                  Nový Lectio zdroj
                </Link>
                <Link
                  href="/admin/notifications/"
                  className="flex items-center gap-3 px-3 py-2 text-xs text-gray-200 hover:bg-[#40467b] hover:text-white transition-colors"
                  onClick={() => setShowQuickActions(false)}
                >
                  <Bell size={14} />
                  Notifikácie
                </Link>
              </div>
              {/* Šípka smerujúca dolu k tlačidlu */}
              <div className={`
                absolute top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#2d3356]
                ${isCollapsed 
                  ? 'left-8' // Šípka umiestnená pod tlačidlom v collapsed mode
                  : 'left-8' // Šípka viac vpravo v expanded mode
                }
              `}></div>
            </div>,
            document.body
          )}
        </div>
      </div>


    </aside>
  );
}