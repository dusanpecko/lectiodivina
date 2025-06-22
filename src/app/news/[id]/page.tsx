"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabase } from "@/app/components/SupabaseProvider";
import NewsDetailArticle from "@/app/news/[id]/NewsDetailArticle";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";

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
  const router = useRouter();
  const { supabase } = useSupabase();
  const { lang } = useLanguage();
  const t = translations[lang];

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
        {t.loading || "Načítavam..."}
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-xl text-gray-700 mt-10">{t.item_not_found || "Článok nenájdený"}</div>
        <a
          href="/news"
          className="mt-6 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {t.show_all_news || "Zobraziť všetky články"}
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <main className="pt-6 pb-16">
        <NewsDetailArticle
          news={news}
          prev={prev}
          next={next}
          t={{
            show_all_news: t.show_all_news,
            previous_article: t.previous_article,
            next_article: t.next_article,
          }}
        />
      </main>
    </div>
  );
}
