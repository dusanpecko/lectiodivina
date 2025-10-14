//app/components/HomeNewsSection.tsx

'use client'

import { translations } from "@/app/i18n";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { useSupabase } from "./SupabaseProvider";

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
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("lang", language)
        .order("published_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Error fetching news:", error);
        setError(error.message);
        setNews([]);
      } else {
        setNews(data || []);
      }
    } catch (err) {
      console.error("Error fetching news:", err);
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

  // Enhanced Loading State
  if (loading) {
    return (
      <section className="relative py-24 sm:py-32 overflow-hidden min-h-screen snap-start flex items-center" style={{ backgroundColor: '#40467b' }}>
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              {t.homeNewsSection?.title || "Najnovšie články"}
            </h2>
          </div>
          
          {/* Loading cards */}
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="group relative">
                <div className="absolute -inset-4 bg-white/10 rounded-3xl blur-2xl animate-pulse"></div>
                <div className="relative rounded-3xl shadow-2xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <div className="h-64 bg-white/20 animate-pulse"></div>
                  <div className="p-8">
                    <div className="h-6 bg-white/30 rounded-full mb-4 animate-pulse"></div>
                    <div className="space-y-2 mb-6">
                      <div className="h-4 bg-white/25 rounded-full animate-pulse"></div>
                      <div className="h-4 bg-white/25 rounded-full animate-pulse"></div>
                      <div className="h-4 bg-white/25 rounded-full w-3/4 animate-pulse"></div>
                    </div>
                    <div className="h-12 bg-white/30 rounded-2xl animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="inline-flex items-center space-x-3 text-xl font-medium text-white">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
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
      <section className="relative py-24 sm:py-32 overflow-hidden min-h-screen snap-start flex items-center" style={{ backgroundColor: '#40467b' }}>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-red-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center text-white text-3xl shadow-2xl" style={{ background: 'rgba(239, 68, 68, 0.3)', backdropFilter: 'blur(5px)' }}>
              ⚠️
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t.homeNewsSection?.title || "Najnovšie články"}
            </h2>
            
            <div className="rounded-3xl shadow-2xl p-12" style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div className="text-2xl font-bold text-red-300 mb-4">
                {t.homeNewsSection?.error_title || "Chyba pri načítavaní článkov"}
              </div>
              <div className="text-red-200 mb-4 text-lg">
                {error}
              </div>
              <div className="text-white/80">
                {t.homeNewsSection?.error_check || "Skontrolujte Supabase databázu a údaje pre jazyk"} &ldquo;{appLang}&rdquo;
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
      <section className="relative py-24 sm:py-32 overflow-hidden min-h-screen snap-start flex items-center" style={{ backgroundColor: '#40467b' }}>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 mx-auto mb-8 rounded-full flex items-center justify-center text-white text-3xl shadow-2xl" style={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(5px)' }}>
              📰
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t.homeNewsSection?.title || "Najnovšie články"}
            </h2>
            
            <div className="rounded-3xl shadow-2xl p-12" style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
              <div className="text-2xl font-bold text-white mb-4">
                {t.homeNewsSection?.no_articles_title || "Zatiaľ žiadne články"}
              </div>
              <div className="text-white/80 text-lg">
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
    <section className="relative py-12 lg:py-16 overflow-hidden min-h-screen snap-start flex items-center" style={{ backgroundColor: '#40467b' }}>
      {/* Simplified background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 w-full">
        {/* Enhanced section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
            {t.homeNewsSection?.title || "Najnovšie články"}
          </h2>
          
          
          <p className="text-base sm:text-lg text-white/80 max-w-4xl mx-auto leading-relaxed">
            {t.homeNewsSection?.subtitle || "Zostávajte informovaní o najnovších udalostiach a duchovných témach"}
          </p>
        </motion.div>

        {/* Enhanced news grid */}
        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
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
              <div className="relative rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 overflow-hidden flex flex-col h-full" style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                {/* Card background layers */}
                <div className="absolute inset-0 bg-white/5 rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-transparent rounded-3xl"></div>
                
                {/* Image with enhanced effects */}
                <div className="relative h-40 w-full overflow-hidden rounded-t-3xl">
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
                  <div className="absolute top-4 right-4 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg" style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(5px)' }}>
                    {t.homeNewsSection?.new_badge || "NOVÝ"}
                  </div>
                </div>
                
                {/* Content with enhanced styling */}
                <div className="relative flex flex-col flex-1 p-4">
                  <motion.h3 
                    className="font-bold text-lg sm:text-xl text-white mb-3 leading-tight transition-colors duration-300"
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {n.title}
                  </motion.h3>
                  
                  <p className="text-white/80 text-sm leading-relaxed flex-1 mb-4 line-clamp-3">
                    {n.summary}
                  </p>
                  
                  {/* Enhanced button */}
                  <Link
                    href={`/news/${n.id}`}
                    className="group/btn relative inline-flex items-center justify-center mt-auto text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                    style={{ background: 'rgba(255, 255, 255, 0.25)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                  >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    
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
                    className="absolute bottom-0 left-8 right-8 h-1 bg-white/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
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
          className="text-center mt-8"
        >
          <Link
            href="/news"
            className="group inline-flex items-center space-x-2 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
            style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.2)' }}
          >
            <span>{t.homeNewsSection?.show_all_articles || "Zobraziť všetky články"}</span>
            <motion.svg 
              className="w-5 h-5 text-white" 
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