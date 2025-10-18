//app/components/AdminSidebar.tsx
"use client";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import {
    AlertCircle, // Pre error reports
    Bell,
    Book,
    BookOpen,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight, // Pre lectio-sources
    Crown,
    Kanban,
    LayoutDashboard,
    Newspaper, // Pre notifikácie
    Plus // Pre quick actions button
    ,



    Quote,
    Settings,
    UserPlus,
    Users
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { adminSidebarTranslations } from "./adminSidebarTranslations";

const links = [
  { href: "/admin", key: "dashboard", icon: LayoutDashboard, color: "blue" },
  { href: "/admin/lectio-sources", key: "lectio_sources", icon: Book, color: "teal" }, 
  { href: "/admin/lectio", key: "lectio", icon: BookOpen, color: "emerald" },
  { href: "/admin/bible-bulk-import", key: "bible_bulk_import", icon: BookOpen, color: "indigo" },
  { href: "/admin/news", key: "news", icon: Newspaper, color: "red" },
  { href: "/admin/notifications/", key: "notifications", icon: Bell, color: "pink" },
  { href: "/admin/notification-topics", key: "notification_topics", icon: Settings, color: "purple" },
  { href: "/admin/calendar", key: "calendar", icon: Calendar, color: "green" },
  { href: "/admin/daily_quotes", key: "daily_quotes", icon: Quote, color: "purple" },
  { href: "/admin/community", key: "community", icon: UserPlus, color: "amber" },
  { href: "/admin/rosary", key: "rosary", icon: Crown, color: "violet" },
  { href: "/admin/launch-checklist", key: "launch_checklist", icon: CheckCircle2, color: "green" },
  // { href: "/admin/content_cards", key: "content_cards", icon: CreditCard, color: "indigo" }, // VO VÝVOJI
  // { href: "/admin/programs", key: "programs", icon: Kanban, color: "pink" }, // VO VÝVOJI
  { href: "/admin/tasks", key: "tasks", icon: Kanban, color: "pink" },
  { href: "/admin/error-reports", key: "error_reports", icon: AlertCircle, color: "orange" },
  { href: "/admin/users", key: "users_id", icon: Users, color: "cyan" }, 
] as const;

type SidebarKey = typeof links[number]["key"];

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
  const adminT = (mounted && isLoaded) ? adminSidebarTranslations[lang] : adminSidebarTranslations.sk;

  // Fallback pre navigation items with adminT translations
  const getTranslation = (key: SidebarKey) => {
    if (key === 'tasks') return adminT.navigation.tasks;
    if (key === 'lectio_sources') return adminT.navigation.lectio_sources;
    if (key === 'rosary') return adminT.navigation.rosary;
    if (key === 'launch_checklist') return adminT.navigation.launch_checklist;
    if (key === 'error_reports') return adminT.navigation.error_reports;
    if (key === 'bible_bulk_import') return adminT.navigation.bible_bulk_import;
    // if (key === 'programs') return adminT.navigation.programs; // VO VÝVOJI
    // if (key === 'content_cards') return adminT.navigation.content_cards; // VO VÝVOJI
    if (key === 'notifications') return adminT.navigation.notifications;
    if (key === 'notification_topics') return adminT.navigation.notification_topics;
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
                <h2 className="text-base font-bold text-gray-800">{adminT.header.title}</h2>
                <p className="text-xs text-gray-500">{adminT.header.subtitle}</p>
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
                      {adminT.states.loading}
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
              <h2 className="text-base font-bold text-white">{adminT.header.title}</h2>
              <p className="text-xs text-gray-300">{adminT.header.subtitle}</p>
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
              title={adminT.quick_actions.button_title}
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
                {adminT.quick_actions.title}
              </div>
              <div className="py-1">
                <Link
                  href="/admin/news/new"
                  className="flex items-center gap-3 px-3 py-2 text-xs text-gray-200 hover:bg-[#40467b] hover:text-white transition-colors"
                  onClick={() => setShowQuickActions(false)}
                >
                  <Newspaper size={14} />
                  {adminT.quick_actions.new_article}
                </Link>
                <Link
                  href="/admin/lectio-sources/new"
                  className="flex items-center gap-3 px-3 py-2 text-xs text-gray-200 hover:bg-[#40467b] hover:text-white transition-colors"
                  onClick={() => setShowQuickActions(false)}
                >
                  <Book size={14} />
                  {adminT.quick_actions.new_lectio_source}
                </Link>
                <Link
                  href="/admin/notifications/"
                  className="flex items-center gap-3 px-3 py-2 text-xs text-gray-200 hover:bg-[#40467b] hover:text-white transition-colors"
                  onClick={() => setShowQuickActions(false)}
                >
                  <Bell size={14} />
                  {adminT.quick_actions.notifications}
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