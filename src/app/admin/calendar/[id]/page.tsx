"use client";

import { ActionButton, EditPageHeader, FormSection } from "@/app/admin/components";
import { useSupabase } from "@/app/components/SupabaseProvider";
import {
  AlertCircle,
  CalendarDays,
  Calendar as CalendarIcon,
  Globe,
  Save,
  Sparkles,
  Trash2,
  Users2
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const { supabase } = useSupabase(); // ← ZMENA: náš provider namiesto useSupabaseClient
  const params = useParams();
  const router = useRouter();
  const id = params?.id ? String(params.id) : "";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#40467b]"></div>
          <span className="text-gray-700 font-medium">Načítavam...</span>
        </div>
      </div>
    );
  }

  if (!day) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Kalendárny deň nenájdený</h2>
          <p className="text-gray-600 mb-6">Požadovaný kalendárny deň neexistuje alebo bol vymazaný.</p>
          <Link href="/admin/calendar">
            <button className="admin-edit-button-primary">
              Späť na kalendár
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const getBackUrl = () => {
    const returnPage = localStorage.getItem('calendar_return_page');
    localStorage.removeItem('calendar_return_page');
    if (returnPage) {
      return `/admin/calendar?page=${returnPage}`;
    }
    return '/admin/calendar';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hlavička */}
        <EditPageHeader
          title="Upraviť kalendárny deň"
          description={formatDate(day.date)}
          icon={CalendarIcon}
          backUrl={getBackUrl()}
          emoji="📅"
        />

        {/* Notifikácie */}
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

        <form onSubmit={handleSave} className="space-y-8">
          {/* Hlavný formulár */}
          <FormSection title="Údaje kalendárneho dňa" icon={CalendarIcon}>
            <div className="space-y-6">
                {/* Dátum */}
                <div>
                  <label className="admin-edit-label">
                    <CalendarIcon size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Dátum *
                  </label>
                  <input
                    name="date"
                    type="date"
                    value={day.date}
                    onChange={handleChange}
                    className="admin-edit-input"
                    required
                  />
                </div>

                {/* Meno dňa */}
                <div>
                  <label className="admin-edit-label">
                    <CalendarDays size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Meno dňa *
                  </label>
                  <input
                    name="name_day"
                    value={day.name_day}
                    onChange={handleChange}
                    className="admin-edit-input"
                    placeholder="Napr. Nedeľa v Cezročnom období"
                    required
                  />
                </div>

                {/* Liturgický deň */}
                <div>
                  <label className="admin-edit-label">
                    <Sparkles size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Liturgický deň *
                  </label>
                  <input
                    name="liturgical_day"
                    value={day.liturgical_day}
                    onChange={handleChange}
                    className="admin-edit-input"
                    placeholder="Napr. 2. nedeľa v Cezročnom období"
                    required
                  />
                </div>

                {/* Svätí */}
                <div>
                  <label className="admin-edit-label">
                    <Users2 size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Svätí *
                  </label>
                  <textarea
                    name="saints"
                    value={day.saints}
                    onChange={handleChange}
                    rows={3}
                    className="admin-edit-input resize-none"
                    placeholder="Napr. Sv. Anton Opát, Sv. Margaréta Uhorská"
                    required
                  />
                </div>

                {/* Jazyk */}
                <div>
                  <label className="admin-edit-label">
                    <Globe size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Jazyk *
                  </label>
                  <select
                    name="lang"
                    value={day.lang}
                    onChange={handleChange}
                    className="admin-edit-input"
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
            </FormSection>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-end">
            <ActionButton
              icon={Trash2}
              variant="danger"
              loading={deleting}
              onClick={handleDelete}
              type="button"
            >
              Vymazať deň
            </ActionButton>
            
            <ActionButton
              icon={Save}
              variant="primary"
              loading={saving}
            >
              Uložiť zmeny
            </ActionButton>
          </div>
        </form>

        {/* Info Panel - Pod formulárom */}
        <div className="mt-8">
          <FormSection title="Informácie o zázname" icon={CalendarDays}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600">ID záznamu:</span>
                <span className="font-mono font-semibold text-gray-900">{day.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600">Jazyk:</span>
                <span className="font-semibold text-gray-900">
                  {languageOptions.find(l => l.value === day.lang)?.flag} {day.lang.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="font-medium text-gray-600">Formátovaný dátum:</span>
                <span className="font-semibold text-gray-900">{formatDate(day.date)}</span>
              </div>
              {day.created_at && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-600">Vytvorené:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(day.created_at).toLocaleDateString('sk-SK')}
                  </span>
                </div>
              )}
              {day.updated_at && (
                <div className="flex justify-between py-2">
                  <span className="font-medium text-gray-600">Aktualizované:</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(day.updated_at).toLocaleDateString('sk-SK')}
                  </span>
                </div>
              )}
            </div>
          </FormSection>
        </div>

        {/* Náhľad karty */}
        <div className="mt-8">
          <FormSection title="Náhľad" icon={CalendarDays}>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-800 mb-3">
                  {new Date(day.date + 'T00:00:00').toLocaleDateString('sk-SK', { day: 'numeric', month: 'numeric' })}
                </div>
                <div className="text-base font-semibold text-blue-700 mb-2">{day.name_day}</div>
                <div className="text-sm text-blue-600 mb-3">{day.liturgical_day}</div>
                <div className="text-sm text-blue-600 border-t border-blue-200 pt-3">
                  {day.saints}
                </div>
              </div>
            </div>
          </FormSection>
        </div>
      </div>
    </div>
  );
}