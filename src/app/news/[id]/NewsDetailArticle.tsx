import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(news.lang === 'sk' ? 'sk-SK' : 
      news.lang === 'cz' ? 'cs-CZ' :
      news.lang === 'es' ? 'es-ES' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  return (
    <div className="py-12">
      <div className="w-[88%] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to News Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            href="/news"
            className="group inline-flex items-center space-x-3 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <motion.div
              whileHover={{ x: -4 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowLeft size={20} style={{ color: '#40467b' }} />
            </motion.div>
            <span className="font-semibold text-slate-700 transition-colors duration-300"
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
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
              
              {/* Left Column - Image */}
              <div className="relative lg:w-2/5">
                {/* Article Title above image */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-4"
                  style={{ color: '#40467b' }}
                >
                  {news.title}
                </motion.h1>

                {/* Article Meta in one line */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex items-center space-x-6 mb-6 text-slate-600 text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} />
                    <span className="font-medium">{formatDate(news.published_at)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Clock size={16} />
                    <span className="font-medium">
                      {getReadingTime(news.content)} {t.newsDetail.reading_time}
                    </span>
                  </div>
                </motion.div>

                {/* Hero Image Section - 16:9 aspect ratio */}
                <div className="relative w-full aspect-video overflow-hidden rounded-2xl shadow-xl mb-6">
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
                  <div className="absolute top-4 left-4">
                    <div className="text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-xl" style={{ backgroundColor: '#40467b' }}>
                      {t.newsDetail.article_badge}
                    </div>
                  </div>
                </div>

                {/* Summary below image */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="text-lg text-slate-600 leading-relaxed font-light italic border-l-4 pl-4 bg-slate-50/50 py-4 rounded-r-xl"
                  style={{
                    borderLeftColor: '#40467b'
                  }}
                >
                  {news.summary}
                </motion.div>
              </div>
              
              {/* Right Column - Content */}
              <div className="relative flex-1">

                {/* Main Content */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  className="prose prose-lg max-w-none prose-slate 
                    prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-8
                    prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6
                    prose-a:no-underline prose-a:text-blue-600 prose-a:hover:text-blue-800
                    prose-strong:text-slate-800 prose-strong:font-semibold
                    prose-ul:my-6 prose-ul:space-y-2
                    prose-ol:my-6 prose-ol:space-y-2
                    prose-li:text-slate-700
                    prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-6
                    prose-img:rounded-lg prose-img:shadow-md prose-img:my-8
                    prose-hr:my-8 prose-hr:border-gray-300"
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
                  className="mt-12 mb-6 h-1 rounded-full"
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
            className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Previous Article */}
            {prev && (
              <Link
                href={`/news/${prev.id}`}
                className="group relative bg-white border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden"
              >
                <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}></div>
                
                <div className="relative flex items-center space-x-4">
                  <motion.div
                    whileHover={{ x: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: '#40467b' }}
                  >
                    <ChevronLeft size={24} className="text-white" />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold mb-1 uppercase tracking-wide" style={{ color: '#40467b' }}>
                      {t.previous_article}
                    </p>
                    <h3 className="text-lg font-bold text-slate-800 transition-colors duration-300 line-clamp-2"
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
                className="group relative bg-white border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden md:text-right"
              >
                <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500" style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}></div>
                
                <div className="relative flex items-center space-x-4 md:flex-row-reverse md:space-x-reverse">
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                    style={{ backgroundColor: '#40467b' }}
                  >
                    <ChevronRight size={24} className="text-white" />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold mb-1 uppercase tracking-wide" style={{ color: '#40467b' }}>
                      {t.next_article}
                    </p>
                    <h3 className="text-lg font-bold text-slate-800 transition-colors duration-300 line-clamp-2"
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