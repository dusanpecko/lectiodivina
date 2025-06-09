"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  { ssr: false }
);

interface News {
  id?: number;
  title: string;
  summary: string;
  image_url: string;
  content: string;
  published_at: string;
  lang: string;
}

export default function NewsEditPage() {
  const supabase = useSupabaseClient();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { lang: appLang } = useLanguage();
  const t = translations[appLang];

  const isNew = id === "new";

  const [news, setNews] = useState<News | null>(
    isNew
      ? {
          title: "",
          summary: "",
          image_url: "",
          content: "",
          published_at: "",
          lang: appLang,
        }
      : null
  );
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );

  useEffect(() => {
    if (isNew) return;
    const fetchNews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setNews(data);
      setLoading(false);
    };
    fetchNews();
  }, [id, supabase, isNew]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setNews((old) => ({ ...old!, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setMessageType(null);
    if (!news) {
      setSaving(false);
      setMessage(t.save_error || "Chyba pri ukladaní");
      setMessageType("error");
      return;
    }
    if (isNew) {
      // INSERT NEW NEWS
      const { data, error } = await supabase
        .from("news")
        .insert([news])
        .select("id")
        .single();
      setSaving(false);
      if (!error && data?.id) {
        setMessage(t.save_success || "Úspešne uložené");
        setMessageType("success");
        router.replace(`/admin/news/${data.id}`);
      } else {
        setMessage(
          (error?.message ? error.message + " " : "") +
            (t.save_error || "Chyba pri ukladaní")
        );
        setMessageType("error");
      }
    } else {
      // UPDATE EXISTING NEWS
      const { error } = await supabase
        .from("news")
        .update({
          title: news.title,
          summary: news.summary,
          image_url: news.image_url,
          content: news.content,
          published_at: news.published_at,
          lang: news.lang,
        })
        .eq("id", id);
      setSaving(false);
      setMessage(
        error
          ? t.save_error || "Chyba pri ukladaní"
          : t.save_success || "Úspešne uložené"
      );
      setMessageType(error ? "error" : "success");
    }
  };

  if (loading) return <div>{t.loading || "Načítavam..."}</div>;
  if (!news) return <div>{t.item_not_found || "Položka nenájdená"}</div>;

  return (
    <main className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {isNew
          ? t.add_news_title || "Pridať nový článok"
          : t.edit_news_title
          ? `${t.edit_news_title} ${news.title}`
          : `Upraviť novinku ${news.title}`}
      </h1>
      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <label>
          {t.title || "Nadpis"}:
          <input
            name="title"
            value={news.title || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
            required
          />
        </label>
        <label>
          {t.summary || "Súhrn"}:
          <input
            name="summary"
            value={news.summary || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
            required
          />
        </label>
        <label>
          {t.image_url || "Obrázok URL"}:
          <input
            name="image_url"
            value={news.image_url || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
            type="url"
            placeholder="https://..."
          />
        </label>
        <label>
          {t.content || "Obsah"}:
          <div className="bg-white">
            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
              init={{
                height: 500,
                toolbar:
                  "undo redo | formatselect | bold italic | link image | alignleft aligncenter alignright | code paste",
                paste_data_images: true,
              }}
              value={news.content || ""}
              onEditorChange={(value) => setNews((old) => ({ ...old!, content: value }))}
            />
          </div>
        </label>
        <label>
          {t.published_at || "Publikované"}:
          <input
            name="published_at"
            type="date"
            value={news.published_at?.slice(0, 10) || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />
        </label>
        <label>
          {t.lang || "Jazyk"}:
          <select
            name="lang"
            value={news.lang || appLang}
            onChange={handleChange}
            className="border rounded w-full p-2"
          >
            <option value="sk">Slovenčina</option>
            <option value="cz">Čeština</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
          disabled={saving}
        >
          {saving ? t.saving || "Ukladám..." : t.save || "Uložiť"}
        </button>
        {message && (
          <div
            className={`mt-2 ${
              messageType === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </main>
  );
}