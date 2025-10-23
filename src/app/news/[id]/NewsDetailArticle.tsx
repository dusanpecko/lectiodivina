import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import { formatDate } from "@/utils/dateFormatter";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Clock, Volume2 } from "lucide-react";
import Link from "next/link";

interface NewsDetailArticleProps {
  news: {
    id: number;
    title: string;
    summary: string;
    image_url: string;
    content: string;
    published_at: string;
    lang: string;
    audio_url?: string;
  };
  prev: { id: number; title: string } | null;
  next: { id: number; title: string } | null;
}

export default function NewsDetailArticle({
  news,
  prev,
  next,
}: NewsDetailArticleProps) {
  // Načítanie prekladov priamo v komponente
  const { lang } = useLanguage();
  const t = translations[lang as keyof typeof translations] ?? translations.sk;

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  return (
    <div className="py-2 sm:py-6 lg:py-12">
      <div className="w-full sm:w-[92%] lg:w-[88%] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to News Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 sm:mb-6 lg:mb-8"
        >
          <Link
            href="/news"
            className="group inline-flex items-center space-x-2 sm:space-x-3 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <motion.div
              whileHover={{ x: -4 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowLeft size={18} className="sm:w-5 sm:h-5" style={{ color: '#40467b' }} />
            </motion.div>
            <span className="text-sm sm:text-base font-semibold text-slate-700 transition-colors duration-300"
              onMouseEnter={(e) => (e.target as HTMLSpanElement).style.color = '#40467b'}
              onMouseLeave={(e) => (e.target as HTMLSpanElement).style.color = ''}
            >
              {t.show_all_news}
            </span>
          </Link>
        </motion.div>

        {/* Main Article Container */}
        <motion.article
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full"
        >


          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12">
              
              {/* Left Column - Image */}
              <div className="relative lg:w-2/5">
                {/* Article Title above image */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-xl sm:text-2xl lg:text-4xl font-bold leading-tight mb-3 sm:mb-4"
                  style={{ color: '#40467b' }}
                >
                  {news.title}
                </motion.h1>

                {/* Article Meta - responsive */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 text-slate-600 text-xs sm:text-sm"
                >
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <Calendar size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="font-medium">{formatDate(news.published_at, news.lang as 'sk' | 'cz' | 'en' | 'es' | 'it' | 'pt' | 'de')}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1.5 sm:space-x-2">
                    <Clock size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="font-medium">
                      {getReadingTime(news.content)} {t.newsDetail.reading_time}
                    </span>
                  </div>
                </motion.div>

                {/* Hero Image Section - 16:9 aspect ratio */}
                <div className="relative w-full aspect-video overflow-hidden rounded-xl sm:rounded-2xl shadow-xl mb-4 sm:mb-6">
                  <motion.img
                    src={news.image_url}
                    alt={news.title}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                  
                  {/* Article badge */}
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                    <div className="text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-lg backdrop-blur-xl" style={{ backgroundColor: '#40467b' }}>
                      {t.newsDetail.article_badge}
                    </div>
                  </div>
                </div>

                {/* Summary below image */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="text-base sm:text-lg text-slate-600 leading-relaxed font-light border-l-4 pl-3 sm:pl-4 bg-slate-50/50 py-3 sm:py-4 rounded-r-xl prose prose-sm sm:prose-lg prose-slate prose-p:text-slate-600 prose-p:leading-relaxed prose-strong:text-slate-700 prose-em:text-slate-600"
                  style={{
                    borderLeftColor: '#40467b'
                  }}
                  dangerouslySetInnerHTML={{ __html: news.summary }}
                />

                {/* Audio Player - if available */}
                {news.audio_url && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.1 }}
                    className="mt-4 sm:mt-6 bg-white border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg"
                    style={{ borderColor: '#40467b' }}
                  >
                    <div className="flex items-center space-x-2.5 sm:space-x-3 mb-3 sm:mb-4">
                      <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: '#40467b' }}
                      >
                        <Volume2 size={18} className="sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-bold truncate" style={{ color: '#40467b' }}>
                          {t.newsDetail?.listen_article || 'Počúvať článok'}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-slate-500 truncate">
                          {t.newsDetail?.audio_generated || 'Profesionálny TTS od ElevenLabs'}
                        </p>
                      </div>
                    </div>
                    <audio 
                      controls 
                      className="w-full h-10 sm:h-12"
                      style={{
                        accentColor: '#40467b'
                      }}
                    >
                      <source src={news.audio_url} type="audio/mpeg" />
                      {t.newsDetail?.audio_not_supported || 'Váš prehliadač nepodporuje audio prehrávač.'}
                    </audio>
                  </motion.div>
                )}
              </div>
              
              {/* Right Column - Content */}
              <div className="relative flex-1">

                {/* Main Content */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-slate 
                    prose-headings:font-bold prose-headings:mb-3 prose-headings:mt-6 sm:prose-headings:mb-4 sm:prose-headings:mt-8
                    prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4 sm:prose-p:mb-6
                    prose-a:no-underline prose-a:text-blue-600 prose-a:hover:text-blue-800
                    prose-strong:text-slate-800 prose-strong:font-semibold
                    prose-ul:my-4 prose-ul:space-y-1.5 sm:prose-ul:my-6 sm:prose-ul:space-y-2
                    prose-ol:my-4 prose-ol:space-y-1.5 sm:prose-ol:my-6 sm:prose-ol:space-y-2
                    prose-li:text-slate-700
                    prose-blockquote:border-l-4 prose-blockquote:pl-3 prose-blockquote:italic prose-blockquote:my-4 sm:prose-blockquote:pl-4 sm:prose-blockquote:my-6
                    prose-img:rounded-lg prose-img:shadow-md prose-img:my-6 sm:prose-img:my-8
                    prose-hr:my-6 prose-hr:border-gray-300 sm:prose-hr:my-8"
                  style={{
                    '--tw-prose-headings': '#40467b',
                    '--tw-prose-links': '#40467b',
                    '--tw-prose-blockquote-borders': '#40467b',
                  } as React.CSSProperties}
                  dangerouslySetInnerHTML={{ __html: news.content }}
                />

                {/* Bottom decorative accent */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 1, delay: 1.4 }}
                  className="mt-8 sm:mt-12 mb-4 sm:mb-6 h-1 rounded-full"
                  style={{ backgroundColor: '#40467b' }}
                />
              </div>
            </div>
        </motion.article>

        {/* Enhanced Navigation Section */}
        {(prev || next) && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="mt-10 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6"
          >
            {/* Previous Article */}
            {prev && (
              <Link
                href={`/news/${prev.id}`}
                className="group relative bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div className="absolute -inset-4 rounded-2xl sm:rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}></div>
                
                <div className="relative flex items-center space-x-3 sm:space-x-4">
                  <motion.div
                    whileHover={{ x: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: '#40467b' }}
                  >
                    <ChevronLeft size={20} className="sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 uppercase tracking-wide" style={{ color: '#40467b' }}>
                      {t.previous_article}
                    </p>
                    <h3 className="text-sm sm:text-lg font-bold text-slate-800 transition-colors duration-300 line-clamp-2"
                      onMouseEnter={(e) => (e.target as HTMLHeadingElement).style.color = '#40467b'}
                      onMouseLeave={(e) => (e.target as HTMLHeadingElement).style.color = ''}
                    >
                      {prev.title}
                    </h3>
                  </div>
                </div>
              </Link>
            )}

            {/* Next Article */}
            {next && (
              <Link
                href={`/news/${next.id}`}
                className="group relative bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden md:text-right"
              >
                <div className="absolute -inset-4 rounded-2xl sm:rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}></div>
                
                <div className="relative flex items-center space-x-3 sm:space-x-4 md:flex-row-reverse md:space-x-reverse">
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: '#40467b' }}
                  >
                    <ChevronRight size={20} className="sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold mb-0.5 sm:mb-1 uppercase tracking-wide" style={{ color: '#40467b' }}>
                      {t.next_article}
                    </p>
                    <h3 className="text-sm sm:text-lg font-bold text-slate-800 transition-colors duration-300 line-clamp-2"
                      onMouseEnter={(e) => (e.target as HTMLHeadingElement).style.color = '#40467b'}
                      onMouseLeave={(e) => (e.target as HTMLHeadingElement).style.color = ''}
                    >
                      {next.title}
                    </h3>
                  </div>
                </div>
              </Link>
            )}
          </motion.div>
        )}
      </div>

      {/* Custom styles */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}