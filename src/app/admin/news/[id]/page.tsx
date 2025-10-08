"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import dynamic from "next/dynamic";
import ImageUploadCrop from "@/app/components/ImageUploadCrop";

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

type TabType = 'basic' | 'content' | 'preview';

// Tab Component - mimo hlavnej komponenty
const Tab = memo(({ id, label, icon, isActive, onClick }: { 
  id: TabType; 
  label: string; 
  icon: string; 
  isActive: boolean; 
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex items-center px-6 py-3 font-semibold rounded-lg transition-all duration-200 ${
      isActive 
        ? 'text-white shadow-md' 
        : 'text-gray-600 hover:bg-gray-100'
    }`}
    style={isActive ? { backgroundColor: '#40467b' } : {}}
  >
    <span className="mr-2 text-lg">{icon}</span>
    {label}
  </button>
));
Tab.displayName = 'Tab';

// Controlled Input Field - mimo hlavnej komponenty
const InputField = memo(({ 
  label, 
  field,
  type = "text", 
  required = false, 
  placeholder = "", 
  value,
  onChange,
  icon,
  rows
}: {
  label: string;
  field: keyof News;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: string;
  rows?: number;
}) => (
  <div className="space-y-2">
    <label className="flex items-center text-sm font-semibold text-gray-700">
      {icon && <span className="mr-2 text-lg">{icon}</span>}
      {label} {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {type === "textarea" ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent resize-none"
        style={{'--tw-ring-color': '#40467b'} as any}
        placeholder={placeholder}
        required={required}
        rows={rows || 3}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
        style={{'--tw-ring-color': '#40467b'} as any}
        placeholder={placeholder}
        required={required}
      />
    )}
  </div>
));
InputField.displayName = 'InputField';

export default function NewsEditPage() {
  const { supabase } = useSupabase();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { lang: appLang } = useLanguage();
  const t = translations[appLang];

  const isNew = id === "new";
  
  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [news, setNews] = useState<News>({
    title: "",
    summary: "",
    image_url: "",
    content: "",
    published_at: "",
    lang: appLang,
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  // Načítanie z databázy
  useEffect(() => {
    if (isNew) return;
    const fetchNews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        setNews(data);
      }
      setLoading(false);
    };
    fetchNews();
  }, [id, supabase, isNew]);

  // Automatické ukladanie do localStorage (draft) - s debounce
  useEffect(() => {
    const draftKey = `news-draft-${id}`;
    
    // Uložiť draft pri každej zmene (s debounce)
    const timeoutId = setTimeout(() => {
      if (news.title || news.content || news.summary) {
        try {
          localStorage.setItem(draftKey, JSON.stringify(news));
        } catch (e) {
          console.error("Chyba pri ukladaní draftu:", e);
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [news, id]);

  // Načítať draft pri načítaní (ak existuje)
  useEffect(() => {
    if (isNew) {
      const draftKey = `news-draft-${id}`;
      const savedDraft = localStorage.getItem(draftKey);
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setNews(draft);
        } catch (e) {
          console.error("Chyba pri načítaní draftu:", e);
        }
      }
    }
  }, [id, isNew]);

  // Optimalizované handlery pre každé pole
  const handleTitleChange = useCallback((value: string) => {
    setNews(prev => ({ ...prev, title: value }));
  }, []);

  const handleSummaryChange = useCallback((value: string) => {
    setNews(prev => ({ ...prev, summary: value }));
  }, []);

  const handleImageUrlChange = useCallback((value: string) => {
    setNews(prev => ({ ...prev, image_url: value }));
  }, []);

  const handleContentChange = useCallback((value: string) => {
    setNews(prev => ({ ...prev, content: value }));
  }, []);

  const handlePublishedAtChange = useCallback((value: string) => {
    setNews(prev => ({ ...prev, published_at: value }));
  }, []);

  const handleLangChange = useCallback((value: string) => {
    setNews(prev => ({ ...prev, lang: value }));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setMessageType(null);
    
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
        // Vymazať draft
        localStorage.removeItem(`news-draft-${id}`);
        // Presmerovať na editáciu
        setTimeout(() => {
          router.replace(`/admin/news/${data.id}`);
        }, 1000);
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
        .update(news)
        .eq("id", id);
      setSaving(false);
      setMessage(
        error
          ? t.save_error || "Chyba pri ukladaní"
          : t.save_success || "Úspešne uložené"
      );
      setMessageType(error ? "error" : "success");
      
      if (!error) {
        // Vymazať draft po úspešnom uložení
        localStorage.removeItem(`news-draft-${id}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <span className="text-gray-700 font-medium">{t.loading || "Načítavam..."}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <span className="mr-3">{isNew ? "📝" : "✏️"}</span>
                {isNew
                  ? t.add_news_title || "Pridať nový článok"
                  : (news.title || "Upraviť článok")}
              </h1>
              <p className="text-gray-600 flex items-center text-sm md:text-base">
                <span className="mr-2">📰</span>
                {isNew ? "Vytvorte nový článok pre vašich čitateľov" : "Upravte existujúci článok"}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <span className="mr-2">↩️</span>
                Späť
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg shadow-md animate-fade-in ${
            messageType === "error" 
              ? "bg-red-50 border border-red-200 text-red-800" 
              : "bg-green-50 border border-green-200 text-green-800"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xl">
                  {messageType === "error" ? "❌" : "✅"}
                </span>
                <span className="font-medium">{message}</span>
              </div>
              <button
                onClick={() => setMessage(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6 p-4">
          <div className="flex flex-wrap gap-3">
            <Tab 
              id="basic" 
              label="Základné info" 
              icon="📋" 
              isActive={activeTab === 'basic'} 
              onClick={() => setActiveTab('basic')}
            />
            <Tab 
              id="content" 
              label="Obsah článku" 
              icon="📖" 
              isActive={activeTab === 'content'} 
              onClick={() => setActiveTab('content')}
            />
            <Tab 
              id="preview" 
              label="Náhľad" 
              icon="👁️" 
              isActive={activeTab === 'preview'} 
              onClick={() => setActiveTab('preview')}
            />
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center border-b pb-3">
                  <span className="mr-2">📋</span>
                  Základné informácie
                </h2>
                
                <div className="space-y-5">
                  <InputField
                    label={t.title || "Nadpis"}
                    field="title"
                    value={news.title}
                    onChange={handleTitleChange}
                    required
                    placeholder="Zadajte výstižný nadpis článku..."
                    icon="📝"
                  />
                  
                  <InputField
                    label={t.summary || "Súhrn"}
                    field="summary"
                    type="textarea"
                    value={news.summary}
                    onChange={handleSummaryChange}
                    required
                    placeholder="Stručný popis obsahu článku (zobrazí sa v zozname článkov)..."
                    icon="📄"
                    rows={4}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      label={t.published_at || "Dátum publikovania"}
                      field="published_at"
                      type="date"
                      value={news.published_at?.slice(0, 10) || ""}
                      onChange={handlePublishedAtChange}
                      icon="📅"
                    />
                    
                    <div className="space-y-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700">
                        <span className="mr-2 text-lg">🌍</span>
                        {t.lang || "Jazyk"}
                      </label>
                      <select
                        value={news.lang}
                        onChange={(e) => handleLangChange(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                        style={{'--tw-ring-color': '#40467b'} as any}
                      >
                        <option value="sk">🇸🇰 Slovenčina</option>
                        <option value="cz">🇨🇿 Čeština</option>
                        <option value="en">🇬🇧 English</option>
                        <option value="es">🇪🇸 Español</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-semibold text-gray-700">
                      <span className="mr-2 text-lg">📸</span>
                      {t.image_url}
                    </label>
                    <ImageUploadCrop
                      supabase={supabase}
                      currentImageUrl={news.image_url}
                      onImageUploaded={handleImageUrlChange}
                      bucketName="news"
                      folder="images"
                    />
                    
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Odporúčaná veľkosť: 1920x1080px (16:9). Obrázok bude automaticky orezaný.
                    </p>
                  </div>

                  {/* Alternatívne: Manuálne zadanie URL */}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-semibold text-gray-600 hover:text-gray-800">
                      🔗 Alebo zadajte URL manuálne
                    </summary>
                    <div className="mt-3">
                      <InputField
                        label="URL obrázka"
                        field="image_url"
                        type="url"
                        value={news.image_url}
                        onChange={handleImageUrlChange}
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>
                  </details>
                </div>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center border-b pb-3">
                  <span className="mr-2">📖</span>
                  Obsah článku
                </h2>
                
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Hlavný obsah článku (HTML editor)
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <Editor
                      key={`editor-${id}`}
                      apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                      init={{
                        height: 600,
                        plugins: "link image lists code table emoticons media wordcount autoresize",
                        toolbar: "undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image media | table | emoticons | code",
                        menubar: false,
                        paste_data_images: true,
                        paste_as_text: false,
                        paste_auto_cleanup_on_paste: true,
                        content_style: "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 16px; line-height: 1.6; padding: 1rem; }",
                        resize: false,
                        statusbar: true,
                        auto_focus: false,
                        branding: false,
                        promotion: false,
                      }}
                      value={news.content || ""}
                      onEditorChange={handleContentChange}
                    />
                  </div>
                  <p className="text-sm text-gray-500 italic">
                    💡 Tip: Text sa automaticky ukladá do dočasnej pamäte každú sekundu, takže neprídete o svoju prácu pri prepínaní medzi tabmi.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                    <span className="mr-2">👁️</span>
                    Náhľad článku
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Takto bude článok vyzerať pre čitateľov</p>
                </div>
                
                <div className="p-8">
                  <article className="max-w-4xl mx-auto">
                    {news.image_url && (
                      <div className="mb-8">
                        <img 
                          src={news.image_url} 
                          alt={news.title}
                          className="w-full h-80 object-cover rounded-xl shadow-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="mb-6">
                      <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        {news.title || "Názov článku"}
                      </h1>
                      <p className="text-xl text-gray-600 leading-relaxed">
                        {news.summary || "Súhrn článku"}
                      </p>
                    </div>
                    
                    {news.published_at && (
                      <div className="mb-8 pb-6 border-b border-gray-200">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="mr-2">�</span>
                          Publikované: {new Date(news.published_at).toLocaleDateString('sk-SK', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    )}
                    
                    <div 
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: news.content || "<p class='text-gray-400 italic'>Obsah článku sa zobrazí tu...</p>" }}
                    />
                  </article>
                </div>
              </div>
            </div>
          )}

          {/* Save Button - Fixed at bottom */}
          <div className="bg-white rounded-xl shadow-lg p-6 sticky bottom-4">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div className="text-sm text-gray-600">
                {isNew ? (
                  <span>💡 Po uložení budete presmerovaní na editáciu článku</span>
                ) : (
                  <span>✏️ Upravujete existujúci článok</span>
                )}
              </div>
              
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-8 py-3 text-white font-semibold rounded-lg shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#40467b' }}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    {t.saving || "Ukladám..."}
                  </>
                ) : (
                  <>
                    <span className="mr-2">�</span>
                    {t.save || "Uložiť článok"}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}