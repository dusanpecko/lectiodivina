// components/DailyQuote.tsx
"use client";
import { useEffect, useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { useSupabase } from "./SupabaseProvider";
import { motion } from "framer-motion";
import { translations } from "@/app/i18n";

type DailyQuoteRow = {
  date: string;
  quote: string;
  reference: string;
  lang: string;
};

export default function DailyQuote() {
  const { lang, isLoaded } = useLanguage();
  const { supabase } = useSupabase();
  const [quote, setQuote] = useState<DailyQuoteRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Get translations for current language
  const t = translations[lang as keyof typeof translations] ?? translations.sk;

  // Mark as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch quote only after mount and language is loaded
  useEffect(() => {
    if (!mounted || !isLoaded) return;

    async function fetchQuote() {
      setLoading(true);
      
      // SAFE: Date sa vytvorí len na client-side
      const today = new Date().toISOString().slice(0, 10);
      
      const { data, error } = await supabase
        .from("daily_quotes")
        .select("date,quote,reference,lang")
        .eq("date", today)
        .eq("lang", lang)
        .single();

      if (!error && data) {
        setQuote(data);
      } else {
        setQuote(null);
      }
      setLoading(false);
    }

    fetchQuote();
  }, [lang, supabase, mounted, isLoaded]);

  // Enhanced loading state with modern design
  if (!mounted || !isLoaded || loading) {
    return (
      <div className="relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Main loading card */}
        <div className="relative bg-gradient-to-br from-white/95 via-blue-50/90 to-indigo-50/95 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 rounded-3xl"></div>
          
          <div className="relative z-10">
            {/* Animated loading icon */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 mx-auto mb-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center"
            >
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
            
            {/* Loading text with gradient */}
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-800 via-purple-700 to-indigo-800 bg-clip-text text-transparent mb-4">
              {t.dailyQuote.loading}
            </p>
            
            {/* Animated dots */}
            <div className="flex justify-center space-x-2">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                ></motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error state
  if (!quote) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute top-10 left-10 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-red-300/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        {/* Main error card */}
        <div className="relative bg-gradient-to-br from-orange-50/95 via-red-50/90 to-pink-50/95 backdrop-blur-xl border border-orange-200/50 rounded-3xl shadow-2xl p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 rounded-3xl"></div>
          
          <div className="relative z-10">
            {/* Error icon */}
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
              📖
            </div>
            
            {/* Error message */}
            <p className="text-2xl font-bold bg-gradient-to-r from-orange-800 via-red-700 to-pink-800 bg-clip-text text-transparent mb-4">
              {t.dailyQuote.notFound}
            </p>
            
            <p className="text-lg text-slate-600 leading-relaxed">
              {t.dailyQuote.notFoundDescription}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative group"
    >
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute top-8 left-8 w-40 h-40 bg-gradient-to-br from-blue-400/20 via-purple-400/15 to-indigo-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-8 right-8 w-32 h-32 bg-gradient-to-br from-emerald-400/20 via-teal-400/15 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br from-yellow-400/15 via-orange-400/10 to-pink-400/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>
      
      {/* Glow effect on hover */}
      <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 rounded-[2rem] blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
      
      {/* Main quote card with enhanced glass morphism */}
      <div className="relative bg-gradient-to-br from-white/90 via-blue-50/80 to-indigo-50/90 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-white/10 rounded-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/30 via-transparent to-transparent rounded-3xl"></div>
        
        {/* Content */}
        <div className="relative z-10 p-12 sm:p-16 text-center">
          {/* Decorative header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex items-center justify-center mb-8"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                📖
              </div>
              <div className="w-12 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
            </div>
          </motion.div>
          
          {/* Today's label */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm px-4 py-2 rounded-full mb-8 shadow-lg"
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span>{t.dailyQuote.todayLabel}</span>
          </motion.div>
          
          {/* Quote with elegant typography */}
          <motion.blockquote
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            {/* Decorative quotes */}
            <div className="absolute -top-4 -left-4 text-6xl text-blue-300/30 font-serif">"</div>
            <div className="absolute -bottom-8 -right-4 text-6xl text-purple-300/30 font-serif">"</div>
            
            <p className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-8 leading-relaxed tracking-wide">
              {quote.quote}
            </p>
          </motion.blockquote>
          
          {/* Reference with enhanced styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center justify-center space-x-3"
          >
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
            <span className="text-lg sm:text-xl font-medium text-slate-600 tracking-wide">
              {quote.reference}
            </span>
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent"></div>
          </motion.div>
          
          {/* Decorative bottom accent */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "6rem", opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="mx-auto mt-8 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
          ></motion.div>
        </div>
        
        {/* Subtle floating elements */}
        <motion.div
          animate={{ 
            y: [-5, 5, -5],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"
        ></motion.div>
        
        <motion.div
          animate={{ 
            y: [5, -5, 5],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-4 left-4 w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full"
        ></motion.div>
      </div>
      
      {/* Additional decorative elements */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-60 animate-pulse" style={{ animationDelay: '3s' }}></div>
      <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
    </motion.div>
  );
}