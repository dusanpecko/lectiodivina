"use client";
import { useLanguage } from "@/app/components/LanguageProvider";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { translations } from "@/app/i18n";
import NewsDetailArticle from "@/app/news/[id]/NewsDetailArticle";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// Typ pre hlavný článok
interface News {
  id: number;
  title: string;
  summary: string;
  image_url: string;
  content: string;
  published_at: string;
  lang: string;
}

// Typ pre "ďalší/predchádzajúci článok" (stačí id + title)
interface NewsLink {
  id: number;
  title: string;
}

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { supabase } = useSupabase();
  const { lang } = useLanguage();
  const t = translations[lang as keyof typeof translations] ?? translations.sk;

  const [news, setNews] = useState<News | null>(null);
  const [prev, setPrev] = useState<NewsLink | null>(null);
  const [next, setNext] = useState<NewsLink | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const fetchData = async () => {
      // Fetch current article
      const { data: current, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .eq("lang", lang)
        .single();

      if (error || !current) {
        setNews(null);
        setPrev(null);
        setNext(null);
        setLoading(false);
        return;
      }

      setNews(current);

      // Fetch prev (predchádzajúci článok podľa published_at)
      const { data: prevArr } = await supabase
        .from("news")
        .select("id, title")
        .eq("lang", current.lang)
        .lt("published_at", current.published_at)
        .order("published_at", { ascending: false })
        .limit(1);

      setPrev(prevArr && prevArr.length > 0 ? prevArr[0] : null);

      // Fetch next (ďalší článok podľa published_at)
      const { data: nextArr } = await supabase
        .from("news")
        .select("id, title")
        .eq("lang", current.lang)
        .gt("published_at", current.published_at)
        .order("published_at", { ascending: true })
        .limit(1);

      setNext(nextArr && nextArr.length > 0 ? nextArr[0] : null);

      setLoading(false);
    };

    fetchData();
  }, [id, lang, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        {t.loading}
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-xl text-gray-700 mt-10">{t.item_not_found}</div>
        <Link
          href="/news"
          className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t.show_all_news}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-100/10 via-purple-100/10 to-pink-100/10 rounded-full blur-3xl"></div>
      </div>

      <main className="relative pt-6 pb-16">
        {/* ZJEDNODUŠENÉ - NewsDetailArticle si načíta preklady sám */}
        <NewsDetailArticle
          news={news}
          prev={prev}
          next={next}
        />
      </main>
    </div>
  );
}