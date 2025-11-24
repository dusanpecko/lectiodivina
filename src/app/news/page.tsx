"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import { formatDate } from "@/utils/dateFormatter";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, Filter, Grid, Heart, List, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

export default function NewsListPage() {
  const { lang: appLang } = useLanguage();
  const t = translations[appLang as keyof typeof translations] ?? translations.sk;
  
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'likes'>('date');
  const [filteredNews, setFilteredNews] = useState<News[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/news?lang=${appLang}&limit=100`);
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const result = await response.json();
        setNews(result.data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [appLang]);

  useEffect(() => {
    let filtered = news.filter(n => 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.summary.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'likes') {
      filtered = filtered.sort((a, b) => b.likes - a.likes);
    } else {
      filtered = filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    }

    setFilteredNews(filtered);
  }, [news, searchTerm, sortBy]);

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  if (loading) {
    return (
      <section className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
          <div className="text-center mb-16">
            <div className="w-32 h-8 bg-gradient-to-r from-slate-300 to-slate-200 rounded-full mx-auto mb-8 animate-pulse"></div>
            <div className="w-64 h-12 bg-gradient-to-r from-blue-300 to-purple-300 rounded-full mx-auto animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
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
              />
              <span>{t.loading}</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!news.length) {
    return (
      <section className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto px-4"
        >
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-r from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white text-4xl shadow-2xl">
            📰
          </div>
          
          <div className="bg-gradient-to-br from-white/90 via-blue-50/80 to-indigo-50/90 backdrop-blur-xl border border-blue-200/50 rounded-3xl shadow-2xl p-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              {t.newsListPage.no_articles_title}
            </h2>
            <p className="text-xl text-slate-600">
              {t.newsListPage.no_articles_desc}
            </p>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center space-x-2 text-white font-bold text-sm px-6 py-3 rounded-full mb-8 shadow-lg"
            style={{ backgroundColor: '#40467b' }}
          >
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span>{t.newsListPage.all_articles_badge}</span>
          </motion.div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-8 leading-tight" style={{ color: '#40467b' }}>
            {t.newsListPage.title}
          </h1>
          
          <div className="flex items-center justify-center mb-8">
            <div 
              className="w-8 h-px mx-2"
              style={{ background: `linear-gradient(to right, transparent, #40467b)` }}
            ></div>
            <div 
              className="w-6 h-6 rounded-full mx-4 flex items-center justify-center"
              style={{ backgroundColor: '#40467b' }}
            >
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div 
              className="w-8 h-px mx-2"
              style={{ background: `linear-gradient(to left, transparent, #40467b)` }}
            ></div>
          </div>
          
          <p className="text-xl sm:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed font-light">
            {t.newsListPage.subtitle}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mb-12"
        >
          <div className="bg-gradient-to-r from-white/90 via-blue-50/80 to-purple-50/90 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="relative flex-1 max-w-md">
                <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.newsListPage.search_placeholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-6 py-4 w-full bg-white/80 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 text-sm shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{ '--tw-ring-color': '#40467b', 'borderColor': 'var(--tw-ring-color)' } as React.CSSProperties}
                  onFocus={(e) => e.target.style.borderColor = '#40467b'}
                  onBlur={(e) => e.target.style.borderColor = ''}
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'date' | 'likes')}
                    className="appearance-none bg-white/90 border border-white/30 rounded-2xl px-6 py-4 pr-12 text-sm font-semibold focus:ring-2 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-xl"
                    style={{ '--tw-ring-color': '#40467b' } as React.CSSProperties}
                    onFocus={(e) => e.target.style.borderColor = '#40467b'}
                    onBlur={(e) => e.target.style.borderColor = ''}
                  >
                    <option value="date">{t.newsListPage.sort_by_date}</option>
                    <option value="likes">{t.newsListPage.sort_by_likes}</option>
                  </select>
                  <Filter size={16} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
                
                <div className="flex bg-white/80 rounded-2xl p-1 shadow-lg backdrop-blur-xl border border-white/30">
                  <motion.button
                    onClick={() => setViewMode('grid')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      viewMode === 'grid' 
                        ? 'text-white shadow-lg' 
                        : 'text-slate-600'
                    }`}
                    style={viewMode === 'grid' ? { backgroundColor: '#40467b' } : {}}
                  >
                    <Grid size={18} />
                  </motion.button>
                  <motion.button
                    onClick={() => setViewMode('list')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-3 rounded-xl transition-all duration-300 ${
                      viewMode === 'list' 
                        ? 'text-white shadow-lg' 
                        : 'text-slate-600'
                    }`}
                    style={viewMode === 'list' ? { backgroundColor: '#40467b' } : {}}
                  >
                    <List size={18} />
                  </motion.button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-slate-600 font-medium">
                {t.newsListPage.showing_results.replace('{count}', filteredNews.length.toString()).replace('{total}', news.length.toString())}
                {searchTerm && t.newsListPage.search_results_for.replace('{searchTerm}', searchTerm)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12" 
            : "space-y-8"
          }
        >
          {filteredNews.map((n, index) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 60, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.1,
                ease: "easeOut" 
              }}
              whileHover={{
                y: -10,
                scale: 1.02,
                transition: { duration: 0.3, type: "spring", stiffness: 300 }
              }}
              className={`group relative ${
                viewMode === 'list' ? 'flex flex-col lg:flex-row' : ''
              }`}
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-white/30 via-white/20 to-white/10 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              
              <div className={`relative bg-gradient-to-br from-white/90 via-white/80 to-white/70 backdrop-blur-xl rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 overflow-hidden ${
                viewMode === 'list' ? 'flex flex-col lg:flex-row w-full' : 'flex flex-col h-full'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-3xl"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 via-transparent to-transparent rounded-3xl"></div>
                
                <div className={`relative overflow-hidden ${
                  viewMode === 'list' 
                    ? 'lg:w-80 h-64 lg:h-auto rounded-t-3xl lg:rounded-l-3xl lg:rounded-tr-none' 
                    : 'h-64 w-full rounded-t-3xl'
                }`}>
                  <motion.img
                    src={n.image_url}
                    alt={n.title}
                    className="object-cover w-full h-full transition-all duration-500 group-hover:scale-110"
                    loading="lazy"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    <div className="text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-xl" style={{ backgroundColor: '#40467b' }}>
                      {t.newsListPage.new_badge}
                    </div>
                  </div>
                  
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-xl rounded-full p-2 shadow-lg">
                    <div className="flex items-center space-x-1 text-xs font-medium text-slate-600">
                      <Heart size={12} />
                      <span>{n.likes}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`relative flex flex-col flex-1 p-8 ${viewMode === 'list' ? 'lg:p-10' : ''}`}>
                  <div className="flex items-center space-x-4 mb-4 text-sm text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Calendar size={14} />
                      <span>{formatDate(n.published_at, appLang as 'sk' | 'cz' | 'en' | 'es')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{getReadingTime(n.content)} {t.newsListPage.reading_time}</span>
                    </div>
                  </div>
                  
                  <motion.h3 
                    className={`font-bold text-slate-800 mb-4 leading-tight group-hover:text-blue-700 transition-colors duration-300 ${
                      viewMode === 'list' ? 'text-2xl lg:text-3xl' : 'text-xl sm:text-2xl'
                    }`}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {n.title}
                  </motion.h3>
                  
                  <p className={`text-slate-600 leading-relaxed flex-1 mb-6 line-clamp-3 ${
                    viewMode === 'list' ? 'text-lg' : 'text-base'
                  }`}>
                    {n.summary}
                  </p>
                  
                  <Link
                    href={`/news/${n.id}`}
                    className="group/btn relative inline-flex items-center justify-center mt-auto text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                    style={{ backgroundColor: '#40467b' }}
                  >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300"></div>
                    
                    <span className="relative z-10 mr-2">{t.show_article}</span>
                    <motion.div
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                      className="relative z-10"
                    >
                      <ArrowRight size={16} />
                    </motion.div>
                  </Link>
                  
                  <motion.div 
                    className="absolute bottom-0 left-8 right-8 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500"
                    style={{ backgroundColor: '#40467b' }}
                    initial={{ width: 0 }}
                    whileHover={{ width: "calc(100% - 4rem)" }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {searchTerm && filteredNews.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="bg-gradient-to-br from-white/90 via-orange-50/80 to-red-50/90 backdrop-blur-xl border border-orange-200/50 rounded-3xl shadow-2xl p-12 max-w-2xl mx-auto">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white text-2xl">
                🔍
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                {t.newsListPage.no_search_results_title}
              </h3>
              <p className="text-lg text-slate-600 mb-6">
                {t.newsListPage.no_search_results_desc.replace('{searchTerm}', searchTerm)}
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-lg hover:opacity-90"
                style={{ backgroundColor: '#40467b' }}
              >
                {t.newsListPage.clear_search}
              </button>
            </div>
          </motion.div>
        )}
      </div>
      
      <style jsx>{`
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