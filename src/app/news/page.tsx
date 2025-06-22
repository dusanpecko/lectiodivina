"use client";
import { useEffect, useState } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageProvider";
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

export default function NewsListPage() {
  const { supabase } = useSupabase();
  const { lang: appLang } = useLanguage();
  const t = translations[appLang];
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("news")
        .select("*")
        .eq("lang", appLang)
        .order("published_at", { ascending: false });
      setNews(data || []);
      setLoading(false);
    };
    fetchNews();
  }, [supabase, appLang]);

  if (loading) {
    return (
      <div className="w-full text-center text-gray-400 py-20">{t.loading}</div>
    );
  }

  if (!news.length) {
    return (
      <div className="w-full text-center text-gray-400 py-20">
        {t.no_articles || "Žiadne články neboli nájdené."}
      </div>
    );
  }

  return (
    <section>
      <h1 className="text-3xl font-bold mb-10 text-center">{t.latest_news}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {news.map((n) => (
          <div
            key={n.id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition flex flex-col overflow-hidden"
          >
            <div className="h-52 w-full overflow-hidden">
              <img
                src={n.image_url}
                alt={n.title}
                className="object-cover w-full h-full scale-100 hover:scale-105 transition"
                loading="lazy"
              />
            </div>
            <div className="flex-1 flex flex-col p-6">
              <div className="font-semibold text-lg mb-2">{n.title}</div>
              <div className="text-gray-600 mb-5 line-clamp-3">{n.summary}</div>
              <Link
                href={`/news/${n.id}`}
                className="mt-auto inline-block bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-blue-700 transition text-center"
              >
                {t.show_article}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
