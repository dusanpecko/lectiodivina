import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeftCircle, ArrowRightCircle, Calendar, Clock, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

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
  t: {
    show_all_news: string;
    previous_article: string;
    next_article: string;
  };
}

export default function NewsDetailArticle({
  news,
  prev,
  next,
  t,
}: NewsDetailArticleProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(news.lang === 'sk' ? 'sk-SK' : 'en-US', {
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
      <div className="max-w-5xl mx-auto px-4 sm:px-8">
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
              <ArrowLeft size={20} className="text-blue-600" />
            </motion.div>
            <span className="font-semibold text-slate-700 group-hover:text-blue-700 transition-colors duration-300">
              {t.show_all_news}
            </span>
          </Link>
        </motion.div>

        {/* Main Article Container */}
        <motion.article
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative"
        >
          {/* Main content card */}
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Hero Image Section */}
            <div className="relative w-full h-80 sm:h-96 lg:h-[500px] overflow-hidden">
              <motion.img
                src={news.image_url}
                alt={news.title}
                className="object-cover w-full h-full"
                loading="lazy"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              
              {/* Image overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              
              {/* Navigation arrows */}
              {prev && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute top-1/2 left-6 -translate-y-1/2 z-20"
                >
                  <Link
                    href={`/news/${prev.id}`}
                    className="group relative flex items-center justify-center w-14 h-14 bg-white/90 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white"
                    title={`${t.previous_article}: ${prev.title}`}
                    aria-label={t.previous_article}
                  >
                    <ChevronLeft size={24} className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                    
                    {/* Tooltip */}
                    <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap max-w-xs">
                      <div className="truncate">{prev.title}</div>
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                    </div>
                  </Link>
                </motion.div>
              )}
              
              {next && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="absolute top-1/2 right-6 -translate-y-1/2 z-20"
                >
                  <Link
                    href={`/news/${next.id}`}
                    className="group relative flex items-center justify-center w-14 h-14 bg-white/90 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white"
                    title={`${t.next_article}: ${next.title}`}
                    aria-label={t.next_article}
                  >
                    <ChevronRight size={24} className="text-blue-600 group-hover:text-blue-700 transition-colors duration-300" />
                    
                    {/* Tooltip */}
                    <div className="absolute right-full mr-4 px-3 py-2 bg-slate-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap max-w-xs">
                      <div className="truncate">{next.title}</div>
                      <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                    </div>
                  </Link>
                </motion.div>
              )}

              {/* Article badge */}
              <div className="absolute top-6 left-6">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur-xl">
                  ČLÁNOK
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="relative px-8 sm:px-12 lg:px-16 py-12">
              {/* Article meta */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center space-x-6 mb-8 text-slate-500"
              >
                <div className="flex items-center space-x-2">
                  <Calendar size={18} />
                  <span className="font-medium">{formatDate(news.published_at)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={18} />
                  <span className="font-medium">{getReadingTime(news.content)} min čítania</span>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 leading-tight mb-8"
              >
                {news.title}
              </motion.h1>

              {/* Divider */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex items-center justify-center mb-8"
              >
                <div className="w-16 h-px bg-gradient-to-r from-transparent to-blue-600"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-4"></div>
                <div className="w-16 h-px bg-gradient-to-l from-transparent to-purple-600"></div>
              </motion.div>

              {/* Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="text-xl sm:text-2xl text-slate-600 leading-relaxed font-light mb-12 italic border-l-4 border-gradient-to-b from-blue-500 to-purple-500 pl-6"
                style={{
                  borderImage: 'linear-gradient(to bottom, #3b82f6, #8b5cf6) 1'
                }}
              >
                {news.summary}
              </motion.div>

              {/* Main Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="prose prose-lg sm:prose-xl max-w-none prose-slate prose-headings:text-slate-800 prose-headings:font-bold prose-p:text-slate-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-700 prose-strong:text-slate-800 prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50/50 prose-blockquote:rounded-r-lg prose-blockquote:py-4"
                dangerouslySetInnerHTML={{ __html: news.content }}
              />

              {/* Bottom decorative accent */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 1, delay: 1.4 }}
                className="mt-16 mb-8 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
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
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-200/20 via-purple-200/10 to-blue-200/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                <div className="relative flex items-center space-x-4">
                  <motion.div
                    whileHover={{ x: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <ChevronLeft size={24} className="text-white" />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-blue-600 mb-1 uppercase tracking-wide">
                      {t.previous_article}
                    </p>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors duration-300 line-clamp-2">
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
                <div className="absolute -inset-4 bg-gradient-to-br from-purple-200/20 via-pink-200/10 to-purple-200/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                
                <div className="relative flex items-center space-x-4 md:flex-row-reverse md:space-x-reverse">
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <ChevronRight size={24} className="text-white" />
                  </motion.div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-purple-600 mb-1 uppercase tracking-wide">
                      {t.next_article}
                    </p>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-purple-700 transition-colors duration-300 line-clamp-2">
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