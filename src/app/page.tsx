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

const icons = [
  { emoji: "📖", bg: "bg-gradient-to-br from-blue-400/20 to-indigo-500/20", color: "bg-blue-600" },
  { emoji: "🧘", bg: "bg-gradient-to-br from-purple-400/20 to-pink-500/20", color: "bg-purple-600" },
  { emoji: "🙏", bg: "bg-gradient-to-br from-emerald-400/20 to-teal-500/20", color: "bg-emerald-600" },
  { emoji: "✨", bg: "bg-gradient-to-br from-orange-400/20 to-red-500/20", color: "bg-orange-600" }
];

function renderIcon(emoji: string, bg: string, color: string) {
  return (
    <div className="relative">
      <div className={`absolute inset-0 ${bg} rounded-2xl blur-xl`}></div>
      <div className={`relative w-16 h-16 ${color} rounded-2xl flex items-center justify-center mb-3 text-white text-3xl font-bold`}>
        {emoji}
      </div>
    </div>
  );
}

export default function HomePage() {
  const { lang, changeLang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();

  const targetDate = new Date('2026-01-01T00:00:00');
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCountdown(getCountdown(targetDate));
    const timer = setInterval(() => setCountdown(getCountdown(targetDate)), 1000);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-white text-black">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <header className="relative z-30 px-4 sm:px-8 pt-6 sm:pt-8 flex justify-between items-center bg-white/10 backdrop-blur-md border-b border-white/20">
        <Logo className="h-12 w-auto" />
        <div className="flex items-center gap-4 sm:gap-6">
          <button
            onClick={() => router.push("/login")}
            className="text-white font-medium hover:text-blue-300 transition-colors"
          >
            {t.admin}
          </button>
          <select
            value={lang}
            onChange={(e) => changeLang(e.target.value as Language)}
            className="bg-white/20 text-white rounded px-3 py-1 border border-white/30"
          >
            <option value="sk" className="text-black">🇸🇰 SK</option>
            <option value="cz" className="text-black">🇨🇿 CZ</option>
            <option value="en" className="text-black">🇬🇧 EN</option>
            <option value="es" className="text-black">🇪🇸 ES</option>
          </select>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-6xl font-bold mb-8 text-slate-900">
              {t.app_title}
            </h1>
            <p className="text-xl sm:text-2xl text-slate-700 mb-8">
              {t.app_desc}
            </p>
            <div className="grid grid-cols-4 gap-4 justify-center max-w-xl mx-auto">
              {[t.days, t.hours, t.minutes, t.seconds].map((label, idx) => (
                <div key={idx} className="bg-white/30 p-4 rounded-xl shadow-md">
                  <div className="text-3xl font-bold">
                    {Object.values(countdown)[idx].toString().padStart(2, "0")}
                  </div>
                  <div className="text-sm uppercase text-slate-600">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
              {t.lectio_steps.map((step: { title: string; desc: string }, idx: number) => (
                <div key={idx} className="text-center">
                  {renderIcon(icons[idx].emoji, icons[idx].bg, icons[idx].color)}
                  <h3 className="text-xl font-bold mt-4">{step.title}</h3>
                  <p className="text-gray-600 mt-2">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <DailyQuote />
          </div>
        </section>

        <section className="py-24 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <HomeNewsSection />
          </div>
        </section>

        <section className="py-24 bg-slate-100">
          <div className="max-w-6xl mx-auto px-4">
            <CommunitySection translations={t} />
          </div>
        </section>
      </main>
    </div>
  );
}
