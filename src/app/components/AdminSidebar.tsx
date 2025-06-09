"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";

const links = [
  { href: "/admin", key: "dashboard" },
  { href: "/admin/calendar", key: "calendar" },
  { href: "/admin/daily_quotes", key: "daily_quotes" },   // <-- podtržítko je ok
  { href: "/admin/news", key: "news" },                   // <-- NOVÁ POLOŽKA NEWS
  { href: "/admin/content_cards", key: "content_cards" }, 
  { href: "/admin/users", key: "users_id" }, 
  { href: "/admin/lectio", key: "lectio" }, 

] as const;

type SidebarKey = typeof links[number]["key"];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const t = translations[lang] as Record<SidebarKey, string>;

  return (
    <aside className="bg-gray-100 min-h-screen w-60 flex flex-col gap-2 px-6 py-8 border-r border-gray-200">
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={`block px-3 py-2 rounded hover:bg-blue-100 transition
            ${pathname.startsWith(link.href) ? "bg-blue-200 font-semibold" : ""}`}
        >
          {t[link.key]}
        </Link>
      ))}
    </aside>
  );
}
