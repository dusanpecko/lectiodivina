"use client";

import { useSupabase } from "@/app/components/SupabaseProvider"; // ← ZMENA: náš provider
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import { useLanguage } from "@/app/components/LanguageProvider";
// import { translations } from "@/app/i18n";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Edit3,
  Eye,
  Globe,
  MessageSquare,
  Quote as QuoteIcon,
  Save,
  Trash2
} from "lucide-react";
import Link from "next/link";

interface DailyQuote {
  id: string;
  date: string;
  quote: string;
  reference: string;
  lang: string;
  created_at?: string;
  updated_at?: string;
}

const languageOptions = [
  { value: "sk", label: "Slovenčina", flag: "🇸🇰" },
  { value: "cz", label: "Čeština", flag: "🇨🇿" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇪🇸" },
];

export default function DailyQuoteEditPage() {
  // const { lang: appLang } = useLanguage();
  // const t = translations[appLang]; // TODO: implementovať prekladové texty

  const { supabase } = useSupabase(); // ← ZMENA: náš provider namiesto useSupabaseClient
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("daily_quotes")
        .select("*")
        .eq("id", id)
        .single();
      
      if (!error && data) {
        setQuote(data);
      } else {
        setMessage("Citát nebol nájdený");
        setMessageType("error");
      }
      setLoading(false);
    };
    fetchQuote();
  }, [id, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!quote) return;
    setQuote({ ...quote, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote) return;

    setSaving(true);
    setMessage(null);
    setMessageType(null);

    // Validácia povinných polí
    if (!quote.date || !quote.quote || !quote.reference || !quote.lang) {
      setMessage("Všetky polia sú povinné");
      setMessageType("error");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("daily_quotes")
      .update({
        date: quote.date,
        quote: quote.quote,
        reference: quote.reference,
        lang: quote.lang,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    setSaving(false);
    setMessage(error ? "Chyba pri ukladaní: " + error.message : "Citát bol úspešne aktualizovaný");
    setMessageType(error ? "error" : "success");
  };

  const handleDelete = async () => {
    if (!confirm("Naozaj chcete vymazať tento citát? Táto akcia sa nedá vrátiť späť.")) {
      return;
    }
    
    setDeleting(true);
    const { error } = await supabase
      .from("daily_quotes")
      .delete()
      .eq("id", id);
    
    if (!error) {
      router.push("/admin/daily_quotes");
    } else {
      setMessage("Chyba pri vymazávaní citátu");
      setMessageType("error");
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('sk-SK', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getQuoteLength = () => {
    return quote?.quote?.length || 0;
  };

  const isToday = () => {
    if (!quote) return false;
    const today = new Date().toISOString().slice(0, 10);
    return quote.date === today;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-gray-600">Načítavam...</span>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Citát nenájdený</h2>
          <p className="text-gray-600 mb-6">Požadovaný citát neexistuje alebo bol vymazaný.</p>
          <Link href="/admin/daily_quotes">
            <button className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
              Späť na citáty
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Hlavička */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/daily_quotes">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition">
                  <ArrowLeft size={24} className="text-gray-600" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <QuoteIcon size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Upraviť citát
                  </h1>
                  <p className="text-gray-600">{formatDate(quote.date)}</p>
                </div>
              </div>
            </div>
            
            {/* Status indikátory */}
            <div className="flex items-center gap-2">
              {isToday() && (
                <span className="inline-flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg">
                  <Eye size={16} />
                  Dnešný citát
                </span>
              )}
              <span className="inline-flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-800 rounded-lg">
                <Globe size={16} />
                {languageOptions.find(l => l.value === quote.lang)?.flag} {languageOptions.find(l => l.value === quote.lang)?.label}
              </span>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Hlavný formulár */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Edit3 size={20} className="text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-800">Údaje citátu</h2>
              </div>

              <div className="space-y-6">
                {/* Dátum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-1" />
                    Dátum citátu *
                  </label>
                  <input
                    name="date"
                    type="date"
                    value={quote.date}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    required
                  />
                </div>

                {/* Citát */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare size={16} className="inline mr-1" />
                    Text citátu *
                    <span className="text-xs text-gray-500 ml-2">
                      ({getQuoteLength()} znakov)
                    </span>
                  </label>
                  <div className="relative">
                    <QuoteIcon size={20} className="absolute top-3 left-3 text-purple-400" />
                    <textarea
                      name="quote"
                      value={quote.quote}
                      onChange={handleChange}
                      rows={4}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                      placeholder="Zadajte text citátu..."
                      required
                    />
                  </div>
                </div>

                {/* Referencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen size={16} className="inline mr-1" />
                    Referencia/Zdroj *
                  </label>
                  <input
                    name="reference"
                    value={quote.reference}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    placeholder="Napr. Biblia, sv. Augustín, Katechizmus..."
                    required
                  />
                </div>

                {/* Jazyk */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe size={16} className="inline mr-1" />
                    Jazyk *
                  </label>
                  <select
                    name="lang"
                    value={quote.lang}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    required
                  >
                    {languageOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.flag} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
          </div>

          {/* Bočný panel */}
          <div className="space-y-6">
            {/* Akcie */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <Save size={20} className="text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-800">Akcie</h2>
              </div>
              
              <div className="space-y-3">
                <button
                  type="submit"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Ukladám...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Uložiť zmeny
                    </>
                  )}
                </button>
                
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
                      Vymazať citát
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Info panel */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center gap-3 mb-4">
                <Clock size={20} className="text-purple-600" />
                <h3 className="font-semibold text-purple-800">Informácie o citáte</h3>
              </div>
              <div className="space-y-3 text-sm text-purple-700">
                <div className="flex justify-between">
                  <span>ID citátu:</span>
                  <span className="font-mono font-medium">{quote.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span>Jazyk:</span>
                  <span className="font-medium">
                    {languageOptions.find(l => l.value === quote.lang)?.flag} {quote.lang.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Dĺžka citátu:</span>
                  <span className="font-medium">{getQuoteLength()} znakov</span>
                </div>
                <div className="flex justify-between">
                  <span>Je dnešný:</span>
                  <span className="font-medium">{isToday() ? "Áno" : "Nie"}</span>
                </div>
                {quote.created_at && (
                  <div className="flex justify-between">
                    <span>Vytvorené:</span>
                    <span className="font-medium text-right">
                      {new Date(quote.created_at).toLocaleDateString('sk-SK')}
                    </span>
                  </div>
                )}
                {quote.updated_at && (
                  <div className="flex justify-between">
                    <span>Upravené:</span>
                    <span className="font-medium text-right">
                      {new Date(quote.updated_at).toLocaleDateString('sk-SK')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Náhľad citátu */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <QuoteIcon size={20} className="text-purple-600" />
                <h3 className="font-semibold text-gray-800">Náhľad</h3>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-xl p-6 border border-purple-200">
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-800 mb-2">
                    {new Date(quote.date + 'T00:00:00').toLocaleDateString('sk-SK', { 
                      day: 'numeric', 
                      month: 'long' 
                    })}
                  </div>
                  <div className="relative mb-4">
                    <QuoteIcon size={24} className="absolute -top-2 -left-2 text-purple-300" />
                    <p className="text-purple-700 font-medium italic leading-relaxed pl-6">
                      {quote.quote}
                    </p>
                  </div>
                  <div className="text-xs text-purple-600 border-t border-purple-200 pt-3">
                    — {quote.reference}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}