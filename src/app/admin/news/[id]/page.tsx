"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
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
  const { supabase } = useSupabase();
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
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="text-gray-700 font-medium">{t.loading || "Načítavam..."}</span>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">📰</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {t.item_not_found || "Položka nenájdená"}
          </h2>
          <p className="text-gray-600">Požadovaný článok sa nenašiel v databáze.</p>
        </div>
      </div>
    );
  }

  const InputField = ({ 
    label, 
    name, 
    type = "text", 
    required = false, 
    placeholder = "", 
    value,
    onChange,
    icon
  }: {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    icon?: string;
  }) => (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-semibold text-gray-700">
        {icon && <span className="mr-2 text-lg">{icon}</span>}
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-vertical"
          placeholder={placeholder}
          required={required}
          rows={3}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );

  const NewsPreview = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <span className="mr-2">👁️</span>
            Náhľad článku
          </h3>
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <article className="max-w-none">
          {news.image_url && (
            <div className="mb-6">
              <img 
                src={news.image_url} 
                alt={news.title}
                className="w-full h-64 object-cover rounded-lg shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{news.title || "Názov článku"}</h1>
            <p className="text-gray-600 text-lg leading-relaxed">{news.summary || "Súhrn článku"}</p>
          </div>
          
          {news.published_at && (
            <div className="mb-6 text-sm text-gray-500 flex items-center">
              <span className="mr-2">📅</span>
              Publikované: {new Date(news.published_at).toLocaleDateString('sk-SK')}
            </div>
          )}
          
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: news.content || "<p>Obsah článku...</p>" }}
          />
        </article>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <span className="mr-3">{isNew ? "📝" : "✏️"}</span>
                {isNew
                  ? t.add_news_title || "Pridať nový článok"
                  : t.edit_news_title
                  ? `${t.edit_news_title} ${news.title}`
                  : `Upraviť článok: ${news.title}`}
              </h1>
              <p className="text-gray-600 flex items-center">
                <span className="mr-2">📰</span>
                {isNew ? "Vytvorte nový článok pre vašich čitateľov" : "Upravte existujúci článok"}
              </p>
            </div>
            
            {!isNew && (
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-200 transition-colors duration-200"
              >
                <span className="mr-2">👁️</span>
                {previewMode ? "Skryť náhľad" : "Zobraziť náhľad"}
              </button>
            )}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg shadow-md ${
            messageType === "error" 
              ? "bg-red-50 border border-red-200 text-red-800" 
              : "bg-green-50 border border-green-200 text-green-800"
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-xl">
                {messageType === "error" ? "❌" : "✅"}
              </span>
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📋</span>
                  Základné informácie
                </h2>
                
                <div className="space-y-4">
                  <InputField
                    label={t.title || "Nadpis"}
                    name="title"
                    value={news.title || ""}
                    onChange={handleChange}
                    required
                    placeholder="Zadajte výstižný nadpis článku..."
                    icon="📝"
                  />
                  
                  <InputField
                    label={t.summary || "Súhrn"}
                    name="summary"
                    type="textarea"
                    value={news.summary || ""}
                    onChange={handleChange}
                    required
                    placeholder="Stručný popis obsahu článku..."
                    icon="📄"
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label={t.published_at || "Dátum publikovania"}
                      name="published_at"
                      type="date"
                      value={news.published_at?.slice(0, 10) || ""}
                      onChange={handleChange}
                      icon="📅"
                    />
                    
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <span className="mr-2 text-lg">🌍</span>
                        {t.lang || "Jazyk"}
                      </label>
                      <select
                        name="lang"
                        value={news.lang || appLang}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      >
                        <option value="sk">🇸🇰 Slovenčina</option>
                        <option value="cz">🇨🇿 Čeština</option>
                        <option value="en">🇬🇧 English</option>
                        <option value="es">🇪🇸 Español</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">🖼️</span>
                  Médiá
                </h2>
                
                <InputField
                  label={t.image_url || "URL obrázka"}
                  name="image_url"
                  type="url"
                  value={news.image_url || ""}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  icon="📸"
                />
                
                {news.image_url && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">Náhľad obrázka:</p>
                    <img 
                      src={news.image_url} 
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">📖</span>
                  Obsah článku
                </h2>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Hlavný obsah článku
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <Editor
                      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                      init={{
                        height: 400,
                        plugins: "link image lists code paste table emoticons media",
                        toolbar: "undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image media | table | emoticons | code",
                        menubar: false,
                        paste_data_images: true,
                        content_style: "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; }",
                      }}
                      value={news.content || ""}
                      onEditorChange={(value) => setNews((old) => ({ ...old!, content: value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    <span className="mr-2">↩️</span>
                    Zrušiť
                  </button>
                  
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        {t.saving || "Ukladám..."}
                      </>
                    ) : (
                      <>
                        <span className="mr-2">💾</span>
                        {t.save || "Uložiť"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            {previewMode ? (
              <NewsPreview />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-dashed border-gray-200">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👁️</div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Náhľad článku</h3>
                  <p className="text-gray-500 mb-4">
                    Kliknite na "Zobraziť náhľad" pre zobrazenie ako bude článok vyzerať
                  </p>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 font-semibold rounded-lg hover:bg-emerald-200 transition-colors duration-200"
                  >
                    <span className="mr-2">👁️</span>
                    Zobraziť náhľad
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}