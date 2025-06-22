"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider"; // ← ZMENA: náš provider
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Calendar,
  Star,
  Globe,
  Type,
  FileText,
  Link as LinkIcon,
  Hash,
  Clock,
  AlertCircle,
  CheckCircle,
  Upload
} from "lucide-react";
import Link from "next/link";

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  { ssr: false }
);

interface ContentCard {
  id?: number;
  title?: string;
  image_url?: string;
  image_url_2?: string;
  description_1?: string;
  description_2?: string;
  description_3?: string;
  description_4?: string;
  description_5?: string;
  description_6?: string;
  visible_from?: string;
  visible_to?: string;
  published_at?: string;
  priority?: number;
  lang?: string;
}

const languageOptions = [
  { value: "sk", label: "Slovenčina", flag: "🇸🇰" },
  { value: "cz", label: "Čeština", flag: "🇨🇿" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇪🇸" },
];

export default function ContentCardEditPage() {
  const { lang: appLang } = useLanguage();
  const t = translations[appLang];

  const { supabase } = useSupabase(); // ← ZMENA: náš provider namiesto useSupabaseClient
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [card, setCard] = useState<ContentCard>(
    isNew
      ? { priority: 0, lang: "sk" }
      : {}
  );
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    if (isNew) return;
    const fetchCard = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("content_cards")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        setCard(data);
      } else {
        setMessage("Karta nebola nájdená");
        setMessageType("error");
      }
      setLoading(false);
    };
    fetchCard();
  }, [id, supabase, isNew]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setCard((old) => ({ ...old!, [e.target.name]: value }));
  };

  const handleEditorChange = (field: string, value: string) => {
    setCard((old) => ({ ...old!, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setMessageType(null);

    if (!card?.title) {
      setMessage("Názov karty je povinný");
      setMessageType("error");
      setSaving(false);
      return;
    }

    if (isNew) {
      const { data, error } = await supabase
        .from("content_cards")
        .insert([card])
        .select("id")
        .single();
      setSaving(false);
      if (!error && data?.id) {
        setMessage("Karta bola úspešne vytvorená");
        setMessageType("success");
        router.replace(`/admin/content_cards/${data.id}`);
      } else {
        setMessage((error?.message ? error.message + " " : "") + "Chyba pri vytváraní karty");
        setMessageType("error");
      }
    } else {
      const { error } = await supabase
        .from("content_cards")
        .update(card)
        .eq("id", id);
      setSaving(false);
      setMessage(error ? "Chyba pri ukladaní" : "Karta bola úspešne aktualizovaná");
      setMessageType(error ? "error" : "success");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Naozaj chcete vymazať túto kartu? Táto akcia sa nedá vrátiť späť.")) {
      return;
    }
    
    setDeleting(true);
    const { error } = await supabase
      .from("content_cards")
      .delete()
      .eq("id", id);
    
    if (!error) {
      router.push("/admin/content_cards");
    } else {
      setMessage("Chyba pri vymazávaní karty");
      setMessageType("error");
      setDeleting(false);
    }
  };

  // Zistiť, či je karta aktuálne viditeľná
  const isCardVisible = () => {
    if (!card) return true;
    const now = new Date();
    const visibleFrom = card.visible_from ? new Date(card.visible_from) : null;
    const visibleTo = card.visible_to ? new Date(card.visible_to) : null;
    
    if (visibleFrom && now < visibleFrom) return false;
    if (visibleTo && now > visibleTo) return false;
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-gray-600">Načítavam...</span>
        </div>
      </div>
    );
  }

  if (!card && !isNew) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Karta nenájdená</h2>
          <p className="text-gray-600 mb-6">Požadovaná karta neexistuje alebo bola vymazaná.</p>
          <Link href="/admin/content_cards">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
              Späť na zoznam
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Hlavička */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/content_cards">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition">
                  <ArrowLeft size={24} className="text-gray-600" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {isNew ? "Nová content karta" : `Upraviť kartu`}
                  </h1>
                  {!isNew && card?.title && (
                    <p className="text-gray-600">{card.title}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Status indikátory */}
            <div className="flex items-center gap-4">
              {!isNew && (
                <div className="flex items-center gap-2">
                  {isCardVisible() ? (
                    <span className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                      <Eye size={16} />
                      Viditeľná
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 text-red-800 rounded-lg">
                      <EyeOff size={16} />
                      Skrytá
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-800 rounded-lg">
                    <Star size={16} />
                    Priorita: {card?.priority || 0}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifikácie */}
        {message && (
          <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${
            messageType === "error" 
              ? "bg-red-50 border border-red-200 text-red-700" 
              : "bg-green-50 border border-green-200 text-green-700"
          }`}>
            {messageType === "error" ? (
              <AlertCircle size={20} />
            ) : (
              <CheckCircle size={20} />
            )}
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ľavý stĺpec - Základné informácie */}
            <div className="lg:col-span-2 space-y-6">
              {/* Základné údaje */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Type size={20} className="text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Základné informácie</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Názov karty *
                    </label>
                    <input
                      name="title"
                      value={card?.title || ""}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="Zadajte názov karty..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Hash size={16} className="inline mr-1" />
                        Priorita
                      </label>
                      <input
                        name="priority"
                        type="number"
                        min="0"
                        max="10"
                        value={card?.priority ?? 0}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe size={16} className="inline mr-1" />
                        Jazyk
                      </label>
                      <select
                        name="lang"
                        value={card?.lang || "sk"}
                        onChange={handleChange}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      >
                        {languageOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.flag} {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Obrázky */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <ImageIcon size={20} className="text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Obrázky</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hlavný obrázok
                    </label>
                    <input
                      name="image_url"
                      type="url"
                      value={card?.image_url || ""}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="https://example.com/image.jpg"
                    />
                    {card?.image_url && (
                      <div className="mt-3">
                        <img
                          src={card.image_url}
                          alt="Náhľad obrázka 1"
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Druhý obrázok
                    </label>
                    <input
                      name="image_url_2"
                      type="url"
                      value={card?.image_url_2 || ""}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                      placeholder="https://example.com/image2.jpg"
                    />
                    {card?.image_url_2 && (
                      <div className="mt-3">
                        <img
                          src={card.image_url_2}
                          alt="Náhľad obrázka 2"
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Popisy */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <FileText size={20} className="text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Obsah a popisy</h2>
                </div>
                
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i}>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Popis {i}
                      </label>
                      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                        <Editor
                          apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
                          init={{
                            height: 200,
                            toolbar: "undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code paste",
                            menubar: false,
                            paste_data_images: true,
                            skin: "oxide",
                            content_css: "default",
                          }}
                          value={card?.[`description_${i}` as keyof ContentCard] !== undefined 
                            ? String(card[`description_${i}` as keyof ContentCard]) 
                            : ""
                          }
                          onEditorChange={(value) => handleEditorChange(`description_${i}`, value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pravý stĺpec - Nastavenia */}
            <div className="space-y-6">
              {/* Dátumové nastavenia */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar size={20} className="text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Časové nastavenia</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Viditeľná od
                    </label>
                    <input
                      name="visible_from"
                      type="date"
                      value={card?.visible_from?.slice(0, 10) || ""}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Viditeľná do
                    </label>
                    <input
                      name="visible_to"
                      type="date"
                      value={card?.visible_to?.slice(0, 10) || ""}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dátum publikovania
                    </label>
                    <input
                      name="published_at"
                      type="date"
                      value={card?.published_at?.slice(0, 10) || ""}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>

              {/* Akcie */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Save size={20} className="text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-800">Akcie</h2>
                </div>
                
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Ukladám...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        {isNew ? "Vytvoriť kartu" : "Uložiť zmeny"}
                      </>
                    )}
                  </button>
                  
                  {!isNew && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {deleting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Vymazávam...
                        </>
                      ) : (
                        <>
                          <Trash2 size={20} />
                          Vymazať kartu
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Info panel */}
              {!isNew && card?.id && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <Clock size={20} className="text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Informácie o karte</h3>
                  </div>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div>ID: <span className="font-mono">{card.id}</span></div>
                    <div>Status: {isCardVisible() ? "Viditeľná" : "Skrytá"}</div>
                    <div>Priorita: {card.priority || 0}/10</div>
                    <div>Jazyk: {languageOptions.find(l => l.value === card.lang)?.label || "Slovenčina"}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}