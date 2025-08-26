"use client";

import { useEffect, useState, useRef } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";

interface Lectio {
  id?: number;
  datum: string;
  lang: string;
  hlava: string;
  suradnice_pismo: string;
  uvod: string;
  uvod_audio: string;
  video: string;
  modlitba_uvod: string;
  modlitba_audio: string;
  nazov_biblia_1: string;
  biblia_1: string;
  biblia_1_audio: string;
  nazov_biblia_2: string;
  biblia_2: string;
  biblia_2_audio: string;
  nazov_biblia_3: string;
  biblia_3: string;
  biblia_3_audio: string;
  lectio_text: string;
  lectio_audio: string;
  meditatio_text: string;
  meditatio_audio: string;
  oratio_text: string;
  oratio_audio: string;
  contemplatio_text: string;
  contemplatio_audio: string;
  actio_text: string;
  actio_audio: string;
  modlitba_zaver: string;
  audio_5_min: string;
  zaver: string;
  pozehnanie: string;
}

interface LectioSource {
  id: number;
  lang: string;
  kniha: string;
  kapitola: string;
  hlava: string;
  suradnice_pismo: string;
  rok?: string;
  id_cislo?: string;
  nazov_biblia_1: string;
  biblia_1: string;
  biblia_1_audio: string;
  nazov_biblia_2: string;
  biblia_2: string;
  biblia_2_audio: string;
  nazov_biblia_3: string;
  biblia_3: string;
  biblia_3_audio: string;
  lectio_text: string;
  lectio_audio: string;
  meditatio_text: string;
  meditatio_audio: string;
  oratio_text: string;
  oratio_audio: string;
  contemplatio_text: string;
  contemplatio_audio: string;
  actio_text: string;
  actio_audio: string;
  modlitba_zaver: string;
  audio_5_min: string;
  reference: string;
}

// Source Import Modal Component
function SourceImportModal({ 
  isOpen, 
  onClose, 
  onImport, 
  currentLang 
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (sourceData: LectioSource) => void;
  currentLang: string;
}) {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [allSources, setAllSources] = useState<LectioSource[]>([]);
  const [filteredSources, setFilteredSources] = useState<LectioSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>("");
  const [previewData, setPreviewData] = useState<LectioSource | null>(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLang, setSelectedLang] = useState(currentLang);
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableLangs, setAvailableLangs] = useState<string[]>([]);

  // Load sources when modal opens
  useEffect(() => {
    if (isOpen) {
      loadSources();
    }
  }, [isOpen]);

  const loadSources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lectio_sources')
        .select('*')
        .order('hlava');

      if (!error && data) {
        setAllSources(data);
        
        // Extract unique languages
        const langs = [...new Set(data.map(s => s.lang))].sort();
        setAvailableLangs(langs);
        
        // Extract unique years
        const years = [...new Set(data.map(s => s.rok).filter(Boolean))].sort();
        setAvailableYears(years);
      }
    } catch (error) {
      console.error('Chyba pri načítaní zdrojov:', error);
    }
    setLoading(false);
  };

  // Apply filters whenever filter states change
  useEffect(() => {
    let filtered = allSources;

    // Filter by language
    if (selectedLang !== "all") {
      filtered = filtered.filter(source => source.lang === selectedLang);
    }

    // Filter by year
    if (selectedYear !== "all") {
      filtered = filtered.filter(source => source.rok === selectedYear);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(source => 
        source.hlava.toLowerCase().includes(query) ||
        source.kniha.toLowerCase().includes(query) ||
        source.kapitola.toLowerCase().includes(query) ||
        (source.suradnice_pismo && source.suradnice_pismo.toLowerCase().includes(query))
      );
    }

    setFilteredSources(filtered);
  }, [allSources, selectedLang, selectedYear, searchQuery]);

  useEffect(() => {
    if (selectedSource) {
      const source = filteredSources.find(s => s.id.toString() === selectedSource);
      setPreviewData(source || null);
    } else {
      setPreviewData(null);
    }
  }, [selectedSource, filteredSources]);

  const handleImport = () => {
    if (previewData) {
      onImport(previewData);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-green-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📥</span>
              <h2 className="text-xl font-semibold">Import zo zdrojov</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-3 text-gray-700">Načítavam zdroje...</span>
            </div>
          ) : (
            <>
              {/* Filters Section */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="mr-2">🔍</span>
                  Filtre a vyhľadávanie
                </h3>
                
                <div className="space-y-4">
                  {/* Search bar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vyhľadávanie
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Hľadajte podľa názvu, knihy, kapitoly alebo súradníc..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  {/* Filter row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jazyk
                      </label>
                      <select
                        value={selectedLang}
                        onChange={(e) => setSelectedLang(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="all">Všetky jazyky</option>
                        {availableLangs.map(lang => (
                          <option key={lang} value={lang}>
                            {lang === 'sk' && '🇸🇰 Slovenčina'}
                            {lang === 'cz' && '🇨🇿 Čeština'}
                            {lang === 'en' && '🇬🇧 English'}
                            {lang === 'es' && '🇪🇸 Español'}
                            {!['sk', 'cz', 'en', 'es'].includes(lang) && lang}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Liturgický rok
                      </label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="all">Všetky roky</option>
                        {availableYears.map(year => (
                          <option key={year} value={year}>
                            {year === 'N' ? 'Nie je zadané' : `Rok ${year}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Results count */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      Zobrazené: <strong>{filteredSources.length}</strong> z <strong>{allSources.length}</strong> záznamov
                    </span>
                    {(searchQuery || selectedLang !== currentLang || selectedYear !== "all") && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedLang(currentLang);
                          setSelectedYear("all");
                        }}
                        className="text-green-600 hover:text-green-700 underline"
                      >
                        Vymazať filtre
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Source Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vyberte zdroj na import
                </label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  size={Math.min(filteredSources.length + 1, 10)}
                >
                  <option value="">-- Vyberte zdroj --</option>
                  {filteredSources.map(source => (
                    <option key={source.id} value={source.id}>
                      {source.hlava} ({source.kniha} {source.kapitola}) 
                      {source.rok !== 'N' && ` - Rok ${source.rok}`}
                      {source.lang !== currentLang && ` [${source.lang}]`}
                    </option>
                  ))}
                </select>
                
                {filteredSources.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Žiadne záznamy nevyhovujú zadaným filtrom.
                  </p>
                )}
              </div>

              {previewData && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Náhľad importovaných dát</h3>
                  
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>Nadpis:</strong> {previewData.hlava}
                      </div>
                      <div>
                        <strong>Súradnice:</strong> {previewData.suradnice_pismo}
                      </div>
                      <div>
                        <strong>Kniha:</strong> {previewData.kniha} {previewData.kapitola}
                      </div>
                      <div>
                        <strong>Rok:</strong> {previewData.rok || 'N'}
                      </div>
                    </div>

                    {previewData.biblia_1 && (
                      <div className="border-t pt-3">
                        <strong className="text-blue-600">Biblický text 1:</strong>
                        <p className="text-sm text-gray-700 mt-1">
                          {previewData.nazov_biblia_1 && <em>{previewData.nazov_biblia_1}:</em>}
                          {previewData.biblia_1.substring(0, 200)}
                          {previewData.biblia_1.length > 200 ? '...' : ''}
                        </p>
                      </div>
                    )}

                    {previewData.lectio_text && (
                      <div className="border-t pt-3">
                        <strong className="text-purple-600">Lectio:</strong>
                        <p className="text-sm text-gray-700 mt-1">
                          {previewData.lectio_text.substring(0, 300)}
                          {previewData.lectio_text.length > 300 ? '...' : ''}
                        </p>
                      </div>
                    )}

                    <div className="border-t pt-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                        <div>Meditatio: {previewData.meditatio_text ? '✅' : '❌'}</div>
                        <div>Oratio: {previewData.oratio_text ? '✅' : '❌'}</div>
                        <div>Contemplatio: {previewData.contemplatio_text ? '✅' : '❌'}</div>
                        <div>Actio: {previewData.actio_text ? '✅' : '❌'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Zrušiť
                </button>
                <button
                  onClick={handleImport}
                  disabled={!previewData}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Importovať
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LectioEditPage() {
  const { supabase } = useSupabase();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { lang: appLang } = useLanguage();
  const t = translations[appLang];
  const isNew = id === "new";

  // Použijeme refs namiesto controlled stavu pre textové polia
  const formRef = useRef<HTMLFormElement>(null);

  const [lectio, setLectio] = useState<Lectio | null>(
    isNew
      ? {
          datum: "",
          lang: appLang,
          hlava: "",
          suradnice_pismo: "",
          uvod: "",
          uvod_audio: "",
          video: "",
          modlitba_uvod: "",
          modlitba_audio: "",
          nazov_biblia_1: "",
          biblia_1: "",
          biblia_1_audio: "",
          nazov_biblia_2: "",
          biblia_2: "",
          biblia_2_audio: "",
          nazov_biblia_3: "",
          biblia_3: "",
          biblia_3_audio: "",
          lectio_text: "",
          lectio_audio: "",
          meditatio_text: "",
          meditatio_audio: "",
          oratio_text: "",
          oratio_audio: "",
          contemplatio_text: "",
          contemplatio_audio: "",
          actio_text: "",
          actio_audio: "",
          modlitba_zaver: "",
          audio_5_min: "",
          zaver: "",
          pozehnanie: "",
        }
      : null
  );
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  const [showSourceImport, setShowSourceImport] = useState(false);

  useEffect(() => {
    if (isNew) return;
    const fetchLectio = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("lectio")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) {
        setLectio(data);
      }
      setLoading(false);
    };
    fetchLectio();
  }, [id, supabase, isNew]);

  // Získa aktuálne hodnoty z formulára
  const getFormData = () => {
    if (!formRef.current) return null;
    
    const formData = new FormData(formRef.current);
    const data: Partial<Lectio> = {};
    
    for (const [key, value] of formData.entries()) {
      (data as any)[key] = value;
    }
    
    return data;
  };

  // Handle import from sources
  const handleImportFromSources = (sourceData: LectioSource) => {
    if (!formRef.current) return;

    // Mapovanie polí z lectio_sources do lectio
    const mappings = [
      { source: 'hlava', target: 'hlava' },
      { source: 'suradnice_pismo', target: 'suradnice_pismo' },
      { source: 'nazov_biblia_1', target: 'nazov_biblia_1' },
      { source: 'biblia_1', target: 'biblia_1' },
      { source: 'biblia_1_audio', target: 'biblia_1_audio' },
      { source: 'nazov_biblia_2', target: 'nazov_biblia_2' },
      { source: 'biblia_2', target: 'biblia_2' },
      { source: 'biblia_2_audio', target: 'biblia_2_audio' },
      { source: 'nazov_biblia_3', target: 'nazov_biblia_3' },
      { source: 'biblia_3', target: 'biblia_3' },
      { source: 'biblia_3_audio', target: 'biblia_3_audio' },
      { source: 'lectio_text', target: 'lectio_text' },
      { source: 'lectio_audio', target: 'lectio_audio' },
      { source: 'meditatio_text', target: 'meditatio_text' },
      { source: 'meditatio_audio', target: 'meditatio_audio' },
      { source: 'oratio_text', target: 'oratio_text' },
      { source: 'oratio_audio', target: 'oratio_audio' },
      { source: 'contemplatio_text', target: 'contemplatio_text' },
      { source: 'contemplatio_audio', target: 'contemplatio_audio' },
      { source: 'actio_text', target: 'actio_text' },
      { source: 'actio_audio', target: 'actio_audio' },
      { source: 'modlitba_zaver', target: 'modlitba_zaver' },
      { source: 'audio_5_min', target: 'audio_5_min' },
    ];

    // Aplikuj mapovanie na form polia
    mappings.forEach(({ source, target }) => {
      const input = formRef.current?.querySelector(`[name="${target}"]`) as HTMLInputElement | HTMLTextAreaElement;
      if (input && sourceData[source as keyof LectioSource]) {
        input.value = String(sourceData[source as keyof LectioSource]);
      }
    });

    // Aktualizuj state
    setLectio(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      mappings.forEach(({ source, target }) => {
        if (sourceData[source as keyof LectioSource]) {
          (updated as any)[target] = sourceData[source as keyof LectioSource];
        }
      });
      return updated;
    });

    setMessage("Úspešne importované zo zdrojov!");
    setMessageType("success");
    
    // Skry správu po 3 sekundách
    setTimeout(() => {
      setMessage(null);
      setMessageType(null);
    }, 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setMessageType(null);

    const formData = getFormData();
    if (!formData) {
      setSaving(false);
      setMessage(t.save_error || "Chyba pri ukladaní");
      setMessageType("error");
      return;
    }

    if (isNew) {
      const { data, error } = await supabase
        .from("lectio")
        .insert([formData])
        .select("id")
        .single();
      setSaving(false);
      if (!error && data?.id) {
        setMessage(t.save_success || "Úspešne uložené");
        setMessageType("success");
        router.replace(`/admin/lectio/${data.id}`);
      } else {
        setMessage(
          (error?.message ? error.message + " " : "") +
            (t.save_error || "Chyba pri ukladaní")
        );
        setMessageType("error");
      }
    } else {
      const { error } = await supabase
        .from("lectio")
        .update(formData)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-700 font-medium">{t.loading || "Načítavam..."}</span>
        </div>
      </div>
    );
  }

  if (!lectio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {t.item_not_found || "Položka nenájdená"}
          </h2>
          <p className="text-gray-600">Požadovaný záznam sa nenašiel v databáze.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "basic", label: "Základné informácie", icon: "📝" },
    { id: "content", label: "Hlavný obsah", icon: "📖" },
    { id: "bible", label: "Biblické texty", icon: "✝️" },
    { id: "audio", label: "Audio a médiá", icon: "🎵" },
  ];

  // Uncontrolled input field
  const InputField = ({ 
    label, 
    name, 
    type = "text", 
    required = false, 
    placeholder = "", 
    rows = 3,
    defaultValue = ""
  }: {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    rows?: number;
    defaultValue?: string;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder={placeholder}
          rows={rows}
          required={required}
          style={{ height: `${rows * 1.5}rem` }}
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {isNew
                  ? t.add_lectio_title || "Pridať nový Lectio záznam"
                  : t.edit_lectio_title
                  ? `${t.edit_lectio_title} ${lectio.hlava}`
                  : `Upraviť Lectio: ${lectio.hlava}`}
              </h1>
              <p className="text-gray-600">
                {isNew ? "Vytvorte nový duchovný záznam" : "Upravte existujúci záznam"}
              </p>
            </div>
            <div className="text-4xl">
              {isNew ? "✨" : "📝"}
            </div>
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

        <form ref={formRef} onSubmit={handleSave} className="space-y-8">
          {/* Action Buttons - TOP */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowSourceImport(true)}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <span className="mr-2">📥</span>
                Import zo zdrojov
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

          {/* Základné informácie */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <span className="text-2xl mr-3">📝</span>
              <h2 className="text-xl font-semibold text-gray-800">Základné informácie</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label={t.hlava || "Nadpis"}
                  name="hlava"
                  defaultValue={lectio.hlava || ""}
                  required
                  placeholder="Zadajte nadpis lectio..."
                />
                <InputField
                  label={t.suradnice_pismo || "Súradnice Písma"}
                  name="suradnice_pismo"
                  defaultValue={lectio.suradnice_pismo || ""}
                  required
                  placeholder="napr. Mt 5,1-12"
                />
                <InputField
                  label={t.datum || "Dátum"}
                  name="datum"
                  type="date"
                  defaultValue={lectio.datum?.slice(0, 10) || ""}
                  required
                />
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t.lang || "Jazyk"} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="lang"
                    defaultValue={lectio.lang || appLang}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="sk">🇸🇰 Slovenčina</option>
                    <option value="cz">🇨🇿 Čeština</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="es">🇪🇸 Español</option>
                  </select>
                </div>
              </div>
              
              <InputField
                label={t.uvod || "Úvod"}
                name="uvod"
                type="textarea"
                defaultValue={lectio.uvod || ""}
                placeholder="Úvodný text pre lectio..."
                rows={4}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label={t.uvod_audio || "Úvod - audio (URL)"}
                  name="uvod_audio"
                  type="url"
                  defaultValue={lectio.uvod_audio || ""}
                  placeholder="https://example.com/audio.mp3"
                />
                <InputField
                  label={t.video || "Video (URL)"}
                  name="video"
                  type="url"
                  defaultValue={lectio.video || ""}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            </div>
          </div>

          {/* Biblické texty */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <span className="text-2xl mr-3">✝️</span>
              <h2 className="text-xl font-semibold text-gray-800">Biblické texty</h2>
            </div>
            
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">📖</span>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t[`biblia_${i}`] || `Biblický text ${i}`}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <InputField
                      label={t[`nazov_biblia_${i}`] || "Názov"}
                      name={`nazov_biblia_${i}`}
                      defaultValue={String(lectio[`nazov_biblia_${i}` as keyof Lectio] ?? "")}
                      placeholder="Názov biblického textu..."
                    />
                    
                    <InputField
                      label={t[`biblia_${i}`] || "Text"}
                      name={`biblia_${i}`}
                      type="textarea"
                      defaultValue={String(lectio[`biblia_${i}` as keyof Lectio] ?? "")}
                      placeholder="Biblický text..."
                      rows={4}
                    />
                    
                    <InputField
                      label={t[`biblia_${i}_audio`] || "Audio (URL)"}
                      name={`biblia_${i}_audio`}
                      type="url"
                      defaultValue={String(lectio[`biblia_${i}_audio` as keyof Lectio] ?? "")}
                      placeholder="https://example.com/audio.mp3"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hlavný obsah lectio divina */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <span className="text-2xl mr-3">📖</span>
              <h2 className="text-xl font-semibold text-gray-800">Hlavný obsah lectio divina</h2>
            </div>
            
            <div className="space-y-8">
              <InputField
                label={t.lectio_text || "Lectio – text"}
                name="lectio_text"
                type="textarea"
                defaultValue={lectio.lectio_text || ""}
                placeholder="Napíšte text pre Lectio..."
                rows={12}
              />
              
              <InputField
                label={t.meditatio_text || "Meditatio – text"}
                name="meditatio_text"
                type="textarea"
                defaultValue={lectio.meditatio_text || ""}
                placeholder="Napíšte text pre Meditatio..."
                rows={10}
              />
              
              <InputField
                label={t.oratio_text || "Oratio – text"}
                name="oratio_text"
                type="textarea"
                defaultValue={lectio.oratio_text || ""}
                placeholder="Napíšte text pre Oratio..."
                rows={10}
              />
              
              <InputField
                label={t.contemplatio_text || "Contemplatio – text"}
                name="contemplatio_text"
                type="textarea"
                defaultValue={lectio.contemplatio_text || ""}
                placeholder="Napíšte text pre Contemplatio..."
                rows={10}
              />
              
              <InputField
                label={t.actio_text || "Actio – text"}
                name="actio_text"
                type="textarea"
                defaultValue={lectio.actio_text || ""}
                placeholder="Napíšte text pre Actio..."
                rows={10}
              />
            </div>
          </div>

          {/* Audio a médiá */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <span className="text-2xl mr-3">🎵</span>
              <h2 className="text-xl font-semibold text-gray-800">Audio a médiá</h2>
            </div>
            
            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">🎵</span>
                  <h3 className="text-lg font-semibold text-gray-800">Audio súbory</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label={t.lectio_audio || "Lectio audio (URL)"}
                    name="lectio_audio"
                    type="url"
                    defaultValue={lectio.lectio_audio || ""}
                    placeholder="https://example.com/lectio.mp3"
                  />
                  <InputField
                    label={t.meditatio_audio || "Meditatio audio (URL)"}
                    name="meditatio_audio"
                    type="url"
                    defaultValue={lectio.meditatio_audio || ""}
                    placeholder="https://example.com/meditatio.mp3"
                  />
                  <InputField
                    label={t.oratio_audio || "Oratio audio (URL)"}
                    name="oratio_audio"
                    type="url"
                    defaultValue={lectio.oratio_audio || ""}
                    placeholder="https://example.com/oratio.mp3"
                  />
                  <InputField
                    label={t.contemplatio_audio || "Contemplatio audio (URL)"}
                    name="contemplatio_audio"
                    type="url"
                    defaultValue={lectio.contemplatio_audio || ""}
                    placeholder="https://example.com/contemplatio.mp3"
                  />
                  <InputField
                    label={t.actio_audio || "Actio audio (URL)"}
                    name="actio_audio"
                    type="url"
                    defaultValue={lectio.actio_audio || ""}
                    placeholder="https://example.com/actio.mp3"
                  />
                  <InputField
                    label={t.audio_5_min || "Audio 5 minút (URL)"}
                    name="audio_5_min"
                    type="url"
                    defaultValue={lectio.audio_5_min || ""}
                    placeholder="https://example.com/5min.mp3"
                  />
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="flex items-center mb-4">
                  <span className="text-2xl mr-3">🙏</span>
                  <h3 className="text-lg font-semibold text-gray-800">Modlitby a záver</h3>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label={t.modlitba_uvod || "Modlitba úvod"}
                      name="modlitba_uvod"
                      type="textarea"
                      defaultValue={lectio.modlitba_uvod || ""}
                      placeholder="Úvodná modlitba..."
                      rows={3}
                    />
                    <InputField
                      label={t.modlitba_audio || "Modlitba audio (URL)"}
                      name="modlitba_audio"
                      type="url"
                      defaultValue={lectio.modlitba_audio || ""}
                      placeholder="https://example.com/modlitba.mp3"
                    />
                  </div>
                  
                  <InputField
                    label={t.modlitba_zaver || "Modlitba záver"}
                    name="modlitba_zaver"
                    type="textarea"
                    defaultValue={lectio.modlitba_zaver || ""}
                    placeholder="Záverečná modlitba..."
                    rows={3}
                  />
                  
                  <InputField
                    label={t.zaver || "Záver"}
                    name="zaver"
                    type="textarea"
                    defaultValue={lectio.zaver || ""}
                    placeholder="Záverečné slová..."
                    rows={3}
                  />
                  
                  <InputField
                    label={t.pozehnanie || "Požehnanie"}
                    name="pozehnanie"
                    type="textarea"
                    defaultValue={lectio.pozehnanie || ""}
                    placeholder="Záverečné požehnanie..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - BOTTOM */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => setShowSourceImport(true)}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <span className="mr-2">📥</span>
                Import zo zdrojov
              </button>
              
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Source Import Modal - mimo form, aby nebola prekrytá */}
        <SourceImportModal
          isOpen={showSourceImport}
          onClose={() => setShowSourceImport(false)}
          onImport={handleImportFromSources}
          currentLang={lectio.lang}
        />
      </div>
    </div>
  );
}