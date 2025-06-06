import Link from "next/link";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";

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
  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden mx-2 mt-6">
        {/* Obrázok */}
        <div className="relative w-full h-64 sm:h-80 overflow-hidden">
          <img
            src={news.image_url}
            alt={news.title}
            className="object-cover w-full h-full"
            loading="lazy"
          />
          {/* Prev/Next arrows on sides */}
          {prev && (
            <Link
              href={`/news/${prev.id}`}
              className="absolute top-1/2 left-4 -translate-y-1/2 z-20 rounded-full bg-white shadow-lg hover:bg-blue-50 focus:outline-none p-1"
              title={t.previous_article}
              aria-label={t.previous_article}
            >
              <ArrowLeftCircle size={40} className="text-blue-600" />
            </Link>
          )}
          {next && (
            <Link
              href={`/news/${next.id}`}
              className="absolute top-1/2 right-4 -translate-y-1/2 z-20 rounded-full bg-white shadow-lg hover:bg-blue-50 focus:outline-none p-1"
              title={t.next_article}
              aria-label={t.next_article}
            >
              <ArrowRightCircle size={40} className="text-blue-600" />
            </Link>
          )}
        </div>
        {/* Content */}
        <div className="px-6 pb-7 pt-5">
          <div className="mb-2 text-3xl font-bold leading-tight">{news.title}</div>
          <div className="mb-3 text-base text-gray-500">{news.summary}</div>
          <article
            className="prose max-w-none prose-blue prose-lg text-gray-800"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
          <div className="mt-8 flex justify-start">
            <Link
              href="/news"
              className="inline-flex items-center px-4 py-2 rounded bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition"
            >
              <ArrowLeftCircle size={20} className="mr-2" />
              {t.show_all_news}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
