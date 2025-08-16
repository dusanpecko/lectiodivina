//app/components/HomeNewsSection.tsx

'use client'

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { useSupabase } from "./SupabaseProvider";
import { motion } from "framer-motion";
import { translations } from "@/app/i18n";

interface News {
  id: number;
  created_at: string;
  title: string;
  summary: string;
  image_url: string;
  content: string;
  published_at: string;
  likes: number;
  updated_at: string;
  lang: string;
}

export function HomeNewsSection() {
  const { supabase } = useSupabase();
  const { lang: appLang } = useLanguage();
  const t = translations[appLang as keyof typeof translations] ?? translations.sk;
  
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Ref na predchádzajúci jazyk pre porovnanie
  const prevLangRef = useRef<string | undefined>(undefined);
  const isInitialMount = useRef(true);

  const fetchNews = useCallback(async (language: string) => {
    if (!supabase || !language) return;
    
    try {
      console.log("Fetching news for language:", language);
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("lang", language)
        .order("published_at", { ascending: false })
        .limit(3);

      console.log("Supabase response:", { data, error });

      if (error) {
        console.error("Supabase error:", error);
        setError(error.message);
        setNews([]);
      } else {
        console.log("Fetched news:", data);
        setNews(data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err instanceof Error ? err.message : t.homeNewsSection?.error_title || "Chyba pri načítavaní článkov");
      setNews([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, t.homeNewsSection?.error_title]);

  useEffect(() => {
    // Fetch iba ak sa jazyk zmenil alebo je to prvé načítanie
    if (appLang && (isInitialMount.current || prevLangRef.current !== appLang)) {
      fetchNews(appLang);
      prevLangRef.current = appLang;
      isInitialMount.current = false;
    }
  }, [appLang, fetchNews]);

  // Debug log iba ak sa skutočne niečo zmenilo
  const currentState = { loading, error: !!error, newsCount: news.length, appLang };
  const prevStateRef = useRef(currentState);
  
  if (JSON.stringify(currentState) !== JSON.stringify(prevStateRef.current)) {
    console.log("HomeNewsSection render:", currentState);
    prevStateRef.current = currentState;
  }

  // Enhanced Loading State
  if (loading) {
    return (
      <section className="relative py-24 sm:py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-300/15 via-purple-300/10 to-indigo-300/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-purple-300/15 via-pink-300/10 to-purple-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
              {t.homeNewsSection?.title || "Najnovšie články"}
            </h2>
          </div>
          
          {/* Loading cards */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="group relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-white/30 via-white/20 to-white/10 rounded-3xl blur-2xl animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
                  <div className="h-64 bg-gradient-to-br from-slate-200 to-slate-300 animate-pulse"></div>
                  <div className="p-8">
                    <div className="h-6 bg-gradient-to-r from-slate-300 to-slate-200 rounded-full mb-4 animate-pulse"></div>
                    <div className="space-y-2 mb-6">
                      <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full animate-pulse"></div>
                      <div className="h-4 bg-gradient-to-r from-slate-300 to-slate-200 rounded-full animate-pulse"></div>
                      <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full w-3/4 animate-pulse"></div>
                    </div>
                    <div className="h-12 bg-gradient-to-r from-blue-200 to-purple-200 rounded-2xl animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-3 text-xl font-medium text-slate-600">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
              ></motion.div>
              <span>{t.homeNewsSection?.loading || "Načítavam články pre jazyk:"} {appLang}...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Enhanced Error State
  if (error) {
    return (
      <section className="relative py-24 sm:py-32 bg-gradient-to-br from-red-50 via-orange-50 to-pink-50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-red-300/15 via-orange-300/10 to-pink-300/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-orange-300/15 via-red-300/10 to-pink-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white text-3xl shadow-2xl">
              ⚠️
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-red-800 via-orange-700 to-pink-800 bg-clip-text text-transparent mb-6">
              {t.homeNewsSection?.title || "Najnovšie články"}
            </h2>
            
            <div className="bg-gradient-to-br from-white/90 via-red-50/80 to-orange-50/90 backdrop-blur-xl border border-red-200/50 rounded-3xl shadow-2xl p-12">
              <div className="text-2xl font-bold text-red-700 mb-4">
                {t.homeNewsSection?.error_title || "Chyba pri načítavaní článkov"}
              </div>
              <div className="text-red-600 mb-4 text-lg">
                {error}
              </div>
              <div className="text-slate-600">
                {t.homeNewsSection?.error_check || "Skontrolujte Supabase databázu a údaje pre jazyk"} "{appLang}"
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Enhanced Empty State
  if (!news.length) {
    return (
      <section className="relative py-24 sm:py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-blue-300/15 via-purple-300/10 to-indigo-300/15 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-purple-300/15 via-pink-300/10 to-purple-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-3xl shadow-2xl">
              📰
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6">
              {t.homeNewsSection?.title || "Najnovšie články"}
            </h2>
            
            <div className="bg-gradient-to-br from-white/90 via-blue-50/80 to-indigo-50/90 backdrop-blur-xl border border-blue-200/50 rounded-3xl shadow-2xl p-12">
              <div className="text-2xl font-bold text-slate-700 mb-4">
                {t.homeNewsSection?.no_articles_title || "Zatiaľ žiadne články"}
              </div>
              <div className="text-slate-600 text-lg">
                {t.homeNewsSection?.no_articles_desc?.replace('{lang}', appLang) || `Žiadne články pre jazyk "${appLang}" neboli nájdené.`}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Enhanced Main Content
  return (
    <section className="relative py-24 sm:py-32 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-[500px] h-[500px] bg-gradient-to-br from-blue-300/15 via-indigo-300/10 to-purple-300/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-300/15 via-pink-300/10 to-red-300/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-10 w-64 h-64 bg-gradient-to-br from-emerald-300/15 via-teal-300/10 to-cyan-300/15 rounded-full blur-3xl" style={{ animation: 'float 6s ease-in-out infinite' }}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Cpath d='M20 20h20v20H20V20zM0 0h20v20H0V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
        {/* Enhanced section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          {/* Section badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm px-6 py-3 rounded-full mb-8 shadow-lg"
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span>{t.homeNewsSection?.badge || "NAJNOVŠIE SPRÁVY"}</span>
          </motion.div>
          
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-8 leading-tight">
            {t.homeNewsSection?.title || "Najnovšie články"}
          </h2>
          
          {/* Enhanced divider */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-8 h-px bg-gradient-to-r from-transparent to-blue-600"></div>
            <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-4 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div className="w-8 h-px bg-gradient-to-l from-transparent to-purple-600"></div>
          </div>
          
          <p className="text-xl sm:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light">
            {t.homeNewsSection?.subtitle || "Zostávajte informovaní o najnovších udalostiach a duchovných témach"}
          </p>
        </motion.div>

        {/* Enhanced news grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {news.map((n, index) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.2,
                ease: "easeOut" 
              }}
              whileHover={{
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3, type: "spring", stiffness: 300 }
              }}
              className="group relative"
            >
              {/* Enhanced glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-br from-white/30 via-white/20 to-white/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              
              {/* Main card with enhanced glass effect */}
              <div className="relative bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 overflow-hidden flex flex-col h-full">
                {/* Card background layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 via-transparent to-transparent rounded-3xl"></div>
                
                {/* Image with enhanced effects */}
                <div className="relative h-64 w-full overflow-hidden rounded-t-3xl">
                  <motion.img
                    src={n.image_url || '/placeholder-image.jpg'}
                    alt={n.title}
                    className="object-cover w-full h-full transition-all duration-500 group-hover:scale-110"
                    loading="lazy"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                    onError={(e) => {
                      console.error("Image load error for:", n.image_url);
                      e.currentTarget.src = '/placeholder-image.jpg';
                    }}
                  />
                  
                  {/* Image overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Floating badge */}
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {t.homeNewsSection?.new_badge || "NOVÝ"}
                  </div>
                </div>
                
                {/* Content with enhanced styling */}
                <div className="relative flex flex-col flex-1 p-8">
                  <motion.h3 
                    className="font-bold text-xl sm:text-2xl text-slate-800 mb-4 leading-tight group-hover:text-blue-700 transition-colors duration-300"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {n.title}
                  </motion.h3>
                  
                  <p className="text-slate-600 text-base leading-relaxed flex-1 mb-6 line-clamp-3">
                    {n.summary}
                  </p>
                  
                  {/* Enhanced button */}
                  <Link
                    href={`/news/${n.id}`}
                    className="group/btn relative inline-flex items-center justify-center mt-auto bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"></div>
                    
                    <span className="relative z-10 mr-2">{t.homeNewsSection?.show_article || "Zobraziť článok"}</span>
                    <motion.svg 
                      className="relative z-10 w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      whileHover={{ x: 2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </motion.svg>
                  </Link>
                  
                  {/* Decorative bottom accent */}
                  <motion.div 
                    className="absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
                    initial={{ width: 0 }}
                    whileHover={{ width: "calc(100% - 4rem)" }}
                    transition={{ duration: 0.5 }}
                  ></motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Enhanced "View All" section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center mt-16"
        >
          <Link
            href="/news"
            className="group inline-flex items-center space-x-3 text-2xl font-bold bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent hover:from-blue-800 hover:via-purple-800 hover:to-indigo-800 transition-all duration-300"
          >
            <span>{t.homeNewsSection?.show_all_articles || "Zobraziť všetky články"}</span>
            <motion.svg 
              className="w-6 h-6 text-blue-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              whileHover={{ x: 4 }}
              transition={{ duration: 0.2 }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </motion.svg>
          </Link>
        </motion.div>
      </div>
      
      {/* Custom animations styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
}