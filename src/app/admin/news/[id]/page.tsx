"use client";

import { EditPageHeader, FormSection } from "@/app/admin/components";
import ImageUploadCrop from "@/app/components/ImageUploadCrop";
import { useLanguage } from "@/app/components/LanguageProvider";
import SimpleRichTextEditor from "@/app/components/SimpleRichTextEditor";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { translations } from "@/app/i18n";
import { FileText, Globe, Image as ImageIcon, Sparkles, Volume2, Wand2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { memo, useCallback, useEffect, useState } from "react";

interface News {
  id?: number;
  title: string;
  summary: string;
  image_url: string;
  content: string;
  published_at: string;
  lang: string;
  audio_url?: string;
}

// Controlled Input Field
const InputField = memo(({ 
  label, 
  type = "text", 
  required = false, 
  placeholder = "", 
  value,
  onChange,
  icon,
  rows
}: {
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  icon?: string;
  rows?: number;
}) => (
  <div className="space-y-2">
    <label className="admin-edit-label">
      {icon && <span className="mr-2 text-lg">{icon}</span>}
      {label} {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {type === "textarea" ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="admin-edit-input resize-none"
        placeholder={placeholder}
        required={required}
        rows={rows || 3}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="admin-edit-input"
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
  
  const [news, setNews] = useState<News>({
    title: "",
    summary: "",
    image_url: "",
    content: "",
    published_at: "",
    lang: appLang,
    audio_url: "",
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  
  // AI state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiArticleType, setAiArticleType] = useState("lectio_divina_practice");
  const [aiLength, setAiLength] = useState("medium");
  const [aiBibleRefs, setAiBibleRefs] = useState("");
  const [aiGenerateImage, setAiGenerateImage] = useState(true); // Nová option

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

  // Automatické ukladanie do localStorage (draft)
  useEffect(() => {
    const draftKey = `news-draft-${id}`;
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

  // Načítať draft pri načítaní
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

  // Optimalizované handlery
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

  // AI Handlery
  const handleGenerateArticle = async () => {
    if (!aiTopic.trim()) {
      setMessage("Zadajte tému článku");
      setMessageType("error");
      return;
    }

    setAiGenerating(true);
    setMessage(null);
    setMessageType(null);

    try {
      // 1. Generovanie článku
      const articleResponse = await fetch("/api/ai-generate-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic,
          articleType: aiArticleType,
          length: aiLength,
          targetLang: news.lang,
          bibleRefs: aiBibleRefs || undefined,
        }),
      });

      const articleData = await articleResponse.json();

      if (!articleResponse.ok) {
        throw new Error(articleData.error || "Chyba pri generovaní článku");
      }

      // 2. Generovanie obrázka (ak je zapnuté)
      let imageUrl = news.image_url;

      if (aiGenerateImage) {
        try {
          const imageResponse = await fetch("/api/ai-generate-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic: aiTopic,
              articleType: aiArticleType,
            }),
          });

          const imageData = await imageResponse.json();

          if (imageResponse.ok) {
            imageUrl = imageData.imageUrl;
            console.log("✅ Obrázok vygenerovaný:", imageData.fileName);
          } else {
            console.warn("⚠️ Chyba pri generovaní obrázka:", imageData.error);
          }
        } catch (imageError) {
          console.warn("⚠️ Chyba pri generovaní obrázka, pokračujem bez obrázka:", imageError);
        }
      }

      // 3. Vyplniť všetky polia
      setNews(prev => ({
        ...prev,
        title: articleData.title,
        content: articleData.content,
        summary: articleData.summary,
        image_url: imageUrl,
      }));

      setMessage(
        `✨ Článok ${aiGenerateImage && imageUrl !== news.image_url ? "a obrázok " : ""}vygenerovaný! (${articleData.usage.totalTokens} tokenov)`
      );
      setMessageType("success");
      setShowAiPanel(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Chyba pri generovaní článku";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!news.content || news.content.trim().length < 100) {
      setMessage("Obsah článku je príliš krátky na vytvorenie súhrnu");
      setMessageType("error");
      return;
    }

    setAiGenerating(true);
    setMessage(null);
    setMessageType(null);

    try {
      const response = await fetch("/api/ai-generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: news.content,
          lang: news.lang,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Chyba pri generovaní súhrnu");
      }

      setNews(prev => ({ ...prev, summary: data.summary }));
      setMessage(`✨ Súhrn vygenerovaný! (${data.usage.totalTokens} tokenov)`);
      setMessageType("success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Chyba pri generovaní súhrnu";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleImproveTitle = async () => {
    if (!news.title || news.title.trim().length < 5) {
      setMessage("Zadajte najprv nadpis");
      setMessageType("error");
      return;
    }

    setAiGenerating(true);
    setMessage(null);
    setMessageType(null);

    try {
      const response = await fetch("/api/ai-improve-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: news.title,
          lang: news.lang,
          type: "title",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Chyba pri vylepšovaní nadpisu");
      }

      setNews(prev => ({ ...prev, title: data.improvedText }));
      setMessage(`✨ Nadpis vylepšený! (${data.usage.totalTokens} tokenov)`);
      setMessageType("success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Chyba pri vylepšovaní nadpisu";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleImproveContent = async () => {
    if (!news.content || news.content.trim().length < 100) {
      setMessage("Obsah článku je príliš krátky");
      setMessageType("error");
      return;
    }

    setAiGenerating(true);
    setMessage(null);
    setMessageType(null);

    try {
      const response = await fetch("/api/ai-improve-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: news.content,
          lang: news.lang,
          type: "content",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Chyba pri vylepšovaní obsahu");
      }

      setNews(prev => ({ ...prev, content: data.improvedText }));
      setMessage(`✨ Obsah vylepšený! (${data.usage.totalTokens} tokenov)`);
      setMessageType("success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Chyba pri vylepšovaní obsahu";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!news.title && !aiTopic) {
      setMessage("Zadajte najprv nadpis článku alebo tému v AI paneli");
      setMessageType("error");
      return;
    }

    setAiGenerating(true);
    setMessage(null);
    setMessageType(null);

    try {
      const topic = aiTopic || news.title;
      const type = aiArticleType || "lectio_divina_practice";

      const response = await fetch("/api/ai-generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topic,
          articleType: type,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Chyba pri generovaní obrázka");
      }

      setNews(prev => ({ ...prev, image_url: data.imageUrl }));
      setMessage(
        `🎨 Ilustrácia vygenerovaná! (${data.size.reduction}% komprimácia, WebP ${Math.round(data.size.webp / 1024)}KB)`
      );
      setMessageType("success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Chyba pri generovaní obrázka";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!news.title || !news.content) {
      setMessage("Najprv musíte mať vyplnený nadpis a obsah článku");
      setMessageType("error");
      return;
    }

    if (news.content.trim().length < 100) {
      setMessage("Obsah článku je príliš krátky na generovanie audio");
      setMessageType("error");
      return;
    }

    setAiGenerating(true);
    setMessage(null);
    setMessageType(null);

    try {
      const response = await fetch("/api/ai-generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newsId: news.id?.toString() || "new",
          title: news.title,
          content: news.content,
          language: news.lang,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Chyba pri generovaní audio");
      }

      setNews(prev => ({ ...prev, audio_url: data.audioUrl }));
      setMessage(
        `🔊 Audio vygenerované! (${Math.round(data.fileSize / 1024)}KB, ${data.chunksProcessed} chunks, ~${data.duration}s)`
      );
      setMessageType("success");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Chyba pri generovaní audio";
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setAiGenerating(false);
    }
  };

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
        localStorage.removeItem(`news-draft-${id}`);
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
        localStorage.removeItem(`news-draft-${id}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#40467b]"></div>
          <span className="text-gray-700 font-medium">{t.loading || "Načítavam..."}</span>
        </div>
      </div>
    );
  }

  const getBackUrl = () => {
    const returnPage = localStorage.getItem('news_return_page');
    localStorage.removeItem('news_return_page');
    if (returnPage) {
      return `/admin/news?page=${returnPage}`;
    }
    return '/admin/news';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <EditPageHeader
          title={isNew ? (t.add_news_title || "Pridať nový článok") : (news.title || "Upraviť článok")}
          description={isNew ? "Vytvorte nový článok pre vašich čitateľov" : "Upravte existujúci článok"}
          icon={FileText}
          backUrl={getBackUrl()}
          emoji={isNew ? "📝" : "✏️"}
        />

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

        {/* AI Panel */}
        <div className="mb-6">
          <button
            type="button"
            onClick={() => setShowAiPanel(!showAiPanel)}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg flex items-center justify-center space-x-3 transition-all duration-200"
          >
            <Sparkles size={24} />
            <span className="text-lg">
              {showAiPanel ? "🔽 Skryť AI Asistent" : "✨ Otvoriť AI Asistent pre generovanie článkov"}
            </span>
          </button>

          {showAiPanel && (
            <div className="mt-4 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 shadow-lg animate-fade-in">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Sparkles size={20} className="mr-2 text-purple-600" />
                AI Generátor článku
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🎯 Téma článku (po slovensky):
                  </label>
                  <textarea
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    placeholder="Napríklad: Lectio Divina ako cesta k hlbšiemu vzťahu s Bohom"
                    rows={2}
                    disabled={aiGenerating}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📚 Typ článku:
                    </label>
                    <select
                      value={aiArticleType}
                      onChange={(e) => setAiArticleType(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={aiGenerating}
                    >
                      <option value="biblical_commentary">📖 Biblický výklad</option>
                      <option value="lectio_divina_practice">🙏 Lectio Divina praktiky</option>
                      <option value="theological_article">⛪ Teologický článok</option>
                      <option value="spiritual_meditation">💭 Duchovná meditácia</option>
                      <option value="church_history">📜 História cirkvi</option>
                      <option value="sacraments_liturgy">✝️ Sviatosti a liturgia</option>
                      <option value="lectio_news">🔔 Novinky Lectio.one</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      📏 Dĺžka článku:
                    </label>
                    <select
                      value={aiLength}
                      onChange={(e) => setAiLength(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={aiGenerating}
                    >
                      <option value="short">🔹 Krátky (500 slov)</option>
                      <option value="medium">🔸 Stredný (1000 slov)</option>
                      <option value="long">🔶 Dlhý (2000+ slov)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    📖 Biblické odkazy (voliteľné):
                  </label>
                  <input
                    type="text"
                    value={aiBibleRefs}
                    onChange={(e) => setAiBibleRefs(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Napríklad: Ján 3:16, Žalm 23, Mt 5:1-12"
                    disabled={aiGenerating}
                  />
                </div>

                <div className="bg-white bg-opacity-60 rounded-lg p-3 border border-purple-200">
                  <p className="text-sm text-gray-700">
                    <strong>🌍 Jazyk článku:</strong> {news.lang.toUpperCase()} 
                    <span className="ml-2 text-gray-500">(Zmeňte ho v sekcii Základné informácie)</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2 bg-white bg-opacity-60 rounded-lg p-3 border border-purple-200">
                  <input
                    type="checkbox"
                    id="aiGenerateImage"
                    checked={aiGenerateImage}
                    onChange={(e) => setAiGenerateImage(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    disabled={aiGenerating}
                  />
                  <label htmlFor="aiGenerateImage" className="text-sm font-semibold text-gray-700 cursor-pointer">
                    🎨 Automaticky vygenerovať ilustračný obrázok (WebP, optimalizovaný)
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateArticle}
                  disabled={aiGenerating || !aiTopic.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  {aiGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Generujem článok...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>🚀 Vygenerovať článok s AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Základné informácie */}
          <FormSection title="Základné informácie" icon={FileText}>
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="admin-edit-label">
                    <span className="mr-2 text-lg">📝</span>
                    {t.title || "Nadpis"} <span className="text-red-500 ml-1">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleImproveTitle}
                    disabled={aiGenerating || !news.title}
                    className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-1"
                  >
                    <Wand2 size={14} />
                    <span>AI Vylepši</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={news.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="admin-edit-input"
                  placeholder="Zadajte výstižný nadpis článku..."
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="admin-edit-label">
                    <span className="mr-2 text-lg">📄</span>
                    Súhrn <span className="text-red-500 ml-1">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSummary}
                    disabled={aiGenerating || !news.content}
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-1"
                  >
                    <Sparkles size={14} />
                    <span>AI z obsahu</span>
                  </button>
                </div>
                <SimpleRichTextEditor
                  label=""
                  value={news.summary || ""}
                  onChange={handleSummaryChange}
                  minHeight="150px"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Stručný popis obsahu článku (zobrazí sa v zozname článkov)
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  label={t.published_at || "Dátum publikovania"}
                  type="date"
                  value={news.published_at?.slice(0, 10) || ""}
                  onChange={handlePublishedAtChange}
                  icon="📅"
                />
                
                <div className="space-y-2">
                  <label className="admin-edit-label">
                    <Globe size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    {t.lang || "Jazyk"}
                  </label>
                  <select
                    value={news.lang}
                    onChange={(e) => handleLangChange(e.target.value)}
                    className="admin-edit-input"
                  >
                    <option value="sk">🇸🇰 Slovenčina</option>
                    <option value="cz">🇨🇿 Čeština</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="es">🇪🇸 Español</option>
                    <option value="it">🇮🇹 Italiano</option>
                    <option value="pt">🇵🇹 Português</option>
                    <option value="de">🇩🇪 Deutsch</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="admin-edit-label">
                    <ImageIcon size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    {t.image_url}
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateImage}
                    disabled={aiGenerating}
                    className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-1"
                  >
                    <Sparkles size={14} />
                    <span>🎨 AI Ilustrácia</span>
                  </button>
                </div>
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

              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-semibold text-gray-600 hover:text-gray-800">
                  🔗 Alebo zadajte URL manuálne
                </summary>
                <div className="mt-3">
                  <InputField
                    label="URL obrázka"
                    type="url"
                    value={news.image_url}
                    onChange={handleImageUrlChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </details>

              {/* Audio generovanie */}
              <div className="space-y-3 mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <label className="admin-edit-label">
                    <Volume2 size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Audio verzia článku
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateAudio}
                    disabled={aiGenerating || !news.title || !news.content}
                    className="px-3 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-1"
                  >
                    <Volume2 size={14} />
                    <span>🔊 Generovať Audio</span>
                  </button>
                </div>

                {news.audio_url && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
                      <Volume2 size={16} className="mr-2" />
                      Poslech článku (ElevenLabs TTS):
                    </p>
                    <audio controls className="w-full">
                      <source src={news.audio_url} type="audio/mpeg" />
                      Váš prehliadač nepodporuje audio prehrávač.
                    </audio>
                    <p className="text-xs text-blue-600 mt-2">
                      {news.audio_url}
                    </p>
                  </div>
                )}

                {!news.audio_url && (
                  <p className="text-xs text-gray-500 italic">
                    💡 Audio verzia umožní používateľom vypočuť si článok. Generuje sa pomocou ElevenLabs Text-to-Speech s profesionálnymi hlasmi pre {news.lang.toUpperCase()}.
                  </p>
                )}
              </div>
            </div>
          </FormSection>

          {/* Obsah článku */}
          <FormSection title="Obsah článku" icon={FileText}>
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <label className="admin-edit-label">
                  <span className="mr-2 text-lg">📝</span>
                  Hlavný obsah článku <span className="text-red-500 ml-1">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleImproveContent}
                  disabled={aiGenerating || !news.content}
                  className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-1"
                >
                  <Wand2 size={14} />
                  <span>AI Vylepši</span>
                </button>
              </div>
              <SimpleRichTextEditor
                label=""
                value={news.content || ""}
                onChange={handleContentChange}
                minHeight="600px"
              />
              <p className="text-sm text-gray-500 italic">
                💡 Tip: Text sa automaticky ukladá do dočasnej pamäte každú sekundu, takže neprídete o svoju prácu.
              </p>
            </div>
          </FormSection>

          {/* Save Button */}
          <div className="bg-white rounded-xl shadow-lg p-6">
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
                    <span className="mr-2">💾</span>
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
