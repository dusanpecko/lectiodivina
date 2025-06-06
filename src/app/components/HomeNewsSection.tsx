import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageProvider";

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
  const supabase = useSupabaseClient();
  const { lang: appLang } = useLanguage();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("lang", appLang)
        .order("published_at", { ascending: false })
        .limit(3);

      setNews(data || []);
      setLoading(false);
    };
    fetchNews();
  }, [supabase, appLang]);

  if (loading) {
    return (
      <section className="py-12">
        <div className="container mx-auto">
          <div className="text-center text-gray-400">Načítavam články...</div>
        </div>
      </section>
    );
  }

  if (!news.length) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Najnovšie články</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {news.map((n) => (
            <div
              key={n.id}
              className="bg-white rounded-2xl shadow p-0 overflow-hidden flex flex-col hover:shadow-lg transition"
            >
              <div className="relative h-56 w-full overflow-hidden">
                <img
                  src={n.image_url}
                  alt={n.title}
                  className="object-cover w-full h-full transition scale-100 hover:scale-105"
                  loading="lazy"
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
