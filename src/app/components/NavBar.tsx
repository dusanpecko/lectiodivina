"use client";
import Link from "next/link";
import { useLanguage, Language } from "./LanguageProvider";
import { translations } from "../i18n";
import { useSupabaseClient, useSession } from "@supabase/auth-helpers-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function NavBar() {
  const { lang, changeLang } = useLanguage();
  const supabase = useSupabaseClient();
  const session = useSession();
  const router = useRouter();
  const [showLogoutMessage, setShowLogoutMessage] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    // Načítaj meno používateľa z DB ak je prihlásený
    const fetchFullName = async () => {
      if (session?.user?.email) {
        const { data, error } = await supabase
          .from("users")
          .select("full_name")
          .eq("email", session.user.email)
          .single();
        if (data && data.full_name) setFullName(data.full_name);
        else setFullName(null);
      }
    };
    fetchFullName();
  }, [session, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLogoutMessage(true);
    router.push("/");
    setTimeout(() => setShowLogoutMessage(false), 3000);
  };

  return (
    <>
      {showLogoutMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-2 rounded-xl shadow z-50 animate-fade">
          {translations[lang].logout_success ?? "Úspešne odhlásený."}
        </div>
      )}
      <nav className="flex items-center gap-6 bg-gray-100 py-4 px-8 rounded-xl shadow mb-8">
        <Link href="/" className="font-bold text-lg hover:text-blue-600 transition">
          {translations[lang].home}
        </Link>
        <Link href="/admin" className="font-medium hover:text-blue-600 transition">
          {translations[lang].admin}
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-sm">{translations[lang].select_language}:</label>
          <select
            value={lang}
            onChange={e => changeLang(e.target.value as Language)}
            className="border rounded px-2 py-1"
          >
            <option value="sk">SK</option>
            <option value="cz">CZ</option>
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
          {/* Prihlásený používateľ: zobraz meno, alebo email */}
          {session && (
            <span className="ml-4 text-sm text-gray-700">
              {fullName ?? session.user.email}
            </span>
          )}
          {session && (
            <button
              onClick={handleLogout}
              className="ml-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              {translations[lang].logout}
            </button>
          )}
        </div>
      </nav>
    </>
  );
}
