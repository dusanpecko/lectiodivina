"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider"; // ← ZMENA: náš provider
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import {
  ArrowLeft,
  Save,
  Trash2,
  Calendar as CalendarIcon,
  CalendarDays,
  Sparkles,
  Users2,
  Globe,
  AlertCircle,
  CheckCircle,
  Clock,
  Hash,
  Edit3
} from "lucide-react";
import Link from "next/link";

interface CalendarDay {
  id: number;
  date: string;
  name_day: string;
  liturgical_day: string;
  saints: string;
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

export default function CalendarEditPage() {
  const { lang: appLang } = useLanguage();
  const t = translations[appLang];

  const { supabase } = useSupabase(); // ← ZMENA: náš provider namiesto useSupabaseClient
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [day, setDay] = useState<CalendarDay | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    const fetchDay = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("calendar_info")
        .select("*")
        .eq("id", id)
        .single();
      
      if (!error && data) {
        setDay(data);
      } else {
        setMessage("Kalendárny deň nebol nájdený");
        setMessageType("error");
      }
      setLoading(false);
    };
    fetchDay();
  }, [id, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!day) return;
    setDay({ ...day, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!day) return;

    setSaving(true);
    setMessage(null);
    setMessageType(null);

    // Validácia povinných polí
    if (!day.date || !day.name_day || !day.liturgical_day || !day.saints || !day.lang) {
      setMessage("Všetky polia sú povinné");
      setMessageType("error");
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from("calendar_info")
      .update({
        date: day.date,
        name_day: day.name_day,
        liturgical_day: day.liturgical_day,
        saints: day.saints,
        lang: day.lang,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    setSaving(false);
    setMessage(error ? "Chyba pri ukladaní: " + error.message : "Kalendárny deň bol úspešne aktualizovaný");
    setMessageType(error ? "error" : "success");
  };

  const handleDelete = async () => {
    if (!confirm("Naozaj chcete vymazať tento kalendárny deň? Táto akcia sa nedá vrátiť späť.")) {
      return;
    }
    
    setDeleting(true);
    const { error } = await supabase
      .from("calendar_info")
      .delete()
      .eq("id", id);
    
    if (!error) {
      router.push("/admin/calendar");
    } else {
      setMessage("Chyba pri vymazávaní kalendárneho dňa");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg text-gray-600">Načítavam...</span>
        </div>
      </div>
    );
  }

  if (!day) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Kalendárny deň nenájdený</h2>
          <p className="text-gray-600 mb-6">Požadovaný kalendárny deň neexistuje alebo bol vymazaný.</p>
          <Link href="/admin/calendar">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
              Späť na kalendár
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Hlavička */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/calendar">
                <button className="p-2 rounded-lg hover:bg-gray-100 transition">
                  <ArrowLeft size={24} className="text-gray-600" />
                </button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <CalendarIcon size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Upraviť kalendárny deň
                  </h1>
                  <p className="text-gray-600">{formatDate(day.date)}</p>
                </div>
              </div>
            </div>
            
            {/* Jazykový indikátor */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg">
                <Globe size={16} />
                {languageOptions.find(l => l.value === day.lang)?.flag} {languageOptions.find(l => l.value === day.lang)?.label}
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
                <Edit3 size={20} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Údaje kalendárneho dňa</h2>
              </div>

              <div className="space-y-6">
                {/* Dátum */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarIcon size={16} className="inline mr-1" />
                    Dátum *
                  </label>
                  <input
                    name="date"
                    type="date"
                    value={day.date}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>

                {/* Meno dňa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CalendarDays size={16} className="inline mr-1" />
                    Meno dňa *
                  </label>
                  <input
                    name="name_day"
                    value={day.name_day}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Napr. Nedeľa v Cezročnom období"
                    required
                  />
                </div>

                {/* Liturgický deň */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Sparkles size={16} className="inline mr-1" />
                    Liturgický deň *
                  </label>
                  <input
                    name="liturgical_day"
                    value={day.liturgical_day}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Napr. 2. nedeľa v Cezročnom období"
                    required
                  />
                </div>

                {/* Svätí */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Users2 size={16} className="inline mr-1" />
                    Svätí *
                  </label>
                  <textarea
                    name="saints"
                    value={day.saints}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                    placeholder="Napr. Sv. Anton Opát, Sv. Margaréta Uhorská"
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
                    value={day.lang}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                <Save size={20} className="text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Akcie</h2>
              </div>
              
              <div className="space-y-3">
                <button
                  type="submit"
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
                      Vymazať deň
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Info panel */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Clock size={20} className="text-blue-600" />
                <h3 className="font-semibold text-blue-800">Informácie o zázname</h3>
              </div>
              <div className="space-y-3 text-sm text-blue-700">
                <div className="flex justify-between">
                  <span>ID záznamu:</span>
                  <span className="font-mono font-medium">{day.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jazyk:</span>
                  <span className="font-medium">
                    {languageOptions.find(l => l.value === day.lang)?.flag} {day.lang.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Formátovaný dátum:</span>
                  <span className="font-medium text-right">{formatDate(day.date)}</span>
                </div>
                {day.created_at && (
                  <div className="flex justify-between">
                    <span>Vytvorené:</span>
                    <span className="font-medium text-right">
                      {new Date(day.created_at).toLocaleDateString('sk-SK')}
                    </span>
                  </div>
                )}
                {day.updated_at && (
                  <div className="flex justify-between">
                    <span>Upravené:</span>
                    <span className="font-medium text-right">
                      {new Date(day.updated_at).toLocaleDateString('sk-SK')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Náhľad karty */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CalendarDays size={20} className="text-blue-600" />
                <h3 className="font-semibold text-gray-800">Náhľad</h3>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-4 border border-blue-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-800 mb-2">
                    {new Date(day.date + 'T00:00:00').toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric' })}
                  </div>
                  <div className="text-sm font-medium text-blue-700 mb-1">{day.name_day}</div>
                  <div className="text-xs text-blue-600 mb-2">{day.liturgical_day}</div>
                  <div className="text-xs text-blue-600 border-t border-blue-200 pt-2">
                    {day.saints}
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