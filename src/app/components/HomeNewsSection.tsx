//app/components/HomeNewsSection.tsx

'use client'

import { useEffect, useState } from "react";
import Link from "next/link";
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
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        console.log("Fetching news for language:", appLang);
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from("news")
          .select("*")
          .eq("lang", appLang)
          .order("published_at", { ascending: false })
          .limit(3);

        console.log("Supabase response:", { data, error });

        if (error) {
          console.error("Supabase error:", error);
          setError(error.message);
        } else {
          console.log("Fetched news:", data);
          setNews(data || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Chyba pri načítavaní článkov");
      } finally {
        setLoading(false);
      }
    };

    if (supabase && appLang) {
      fetchNews();
    }
  }, [supabase, appLang]);

  console.log("HomeNewsSection render:", { loading, error, newsCount: news.length, appLang });

  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Najnovšie články</h2>
          <div className="text-center text-gray-400">
            Načítavam články pre jazyk: {appLang}...
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Najnovšie články</h2>
          <div className="text-center text-red-500">
            Chyba: {error}
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            Skontrolujte Supabase databázu a údaje pre jazyk "{appLang}"
          </div>
        </div>
      </section>
    );
  }

  if (!news.length) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Najnovšie články</h2>
          <div className="text-center text-gray-500">
            Žiadne články pre jazyk "{appLang}" neboli nájdené.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Najnovšie články</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {news.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-2xl shadow p-0 overflow-hidden flex flex-col hover:shadow-lg transition"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <img
                  src={n.image_url || '/placeholder-image.jpg'}
                  alt={n.title}
                  className="object-cover w-full h-full transition scale-100 hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    console.error("Image load error for:", n.image_url);
                    e.currentTarget.src = '/placeholder-image.jpg';
                  }}
                />
              </div>
              <div className="flex flex-col flex-1 p-6">
                <div className="font-semibold text-lg mb-3">{n.title}</div>
                <div className="text-gray-700 flex-1 mb-5 line-clamp-3">{n.summary}</div>
                <Link
                  href={`/news/${n.id}`}
                  className="mt-auto inline-block bg-blue-600 text-white px-5 py-2 rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                  Zobraziť článok
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Link
            href="/news"
            className="inline-block text-blue-700 font-semibold hover:underline"
          >
            Zobraziť všetky články &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}