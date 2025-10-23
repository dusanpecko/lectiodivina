"use client";

import { ActionButton, EditPageHeader, FormSection } from "@/app/admin/components";
import BibleImportModal from "@/app/admin/components/BibleImportModal";
import { LectioTemplate } from "@/app/admin/components/LectioTemplates";
import TemplateSelector from "@/app/admin/components/TemplateSelector";
import AITextField from "@/app/components/AITextField";
import AudioGenerateButton from "@/app/components/AudioGenerateButton";
import BulkTranslateSection from "@/app/components/BulkTranslateSection";
import { useLanguage } from "@/app/components/LanguageProvider";
import LectioAIGenerator from "@/app/components/LectioAIGenerator";
import { useSupabase } from "@/app/components/SupabaseProvider";
import TranslateButton from "@/app/components/TranslateButton";
import VoiceSelector from "@/app/components/VoiceSelector";
import { BookOpen, Calendar, FileText, Globe, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// Interfaces
interface Locale {
  id: number;
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
}

interface LectioSource {
  id?: number;
  lang: string; // zachováme pre spätná kompatibilita
  locale_id?: number; // nový stĺpec
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
  source_material?: string; // Nový stĺpec pre zdrojový materiál
  checked?: number; // 0 = nezaškrtnuté, 1 = zaškrtnuté
}


// Main Edit Component
export default function LectioSourceEditPage() {
  const { supabase } = useSupabase();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { lang: appLang } = useLanguage();
  const isNew = id === "new";

  const formRef = useRef<HTMLFormElement>(null);
  
  // State
  const [formData, setFormData] = useState<Partial<LectioSource>>({});
  const [locales, setLocales] = useState<Locale[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDraftAvailable, setIsDraftAvailable] = useState(false);
  const [showBibleImport, setShowBibleImport] = useState(false);
  const [currentBibleField, setCurrentBibleField] = useState<number>(1);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  
  // Voice and model settings
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("scOwDtmlUjD3prqpp97I"); // Sam ako predvolený
  const [selectedModel, setSelectedModel] = useState<string>("eleven_v3"); // V3 ako predvolený

  const DRAFT_KEY = `lectio_draft_${id}`;

  const loadLocales = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('locales')
        .select('id, code, name, native_name, is_active')
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setLocales(data);
      }
    } catch (error) {
      console.error('Chyba pri načítaní jazykov:', error);
    }
  }, [supabase]);

  // Load locales
  useEffect(() => {
    loadLocales();
  }, [loadLocales]);

  const updateFormField = useCallback((name: string, value: string | number) => {
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto-update locale_id when lang changes
      if (name === 'lang') {
        const locale = locales.find(l => l.code === value);
        if (locale) {
          updated.locale_id = locale.id;
        }
      }
      
      setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
      }, 500);
      return updated;
    });
    setHasUnsavedChanges(true);
  }, [DRAFT_KEY, locales]);

  // Small helper to show transient messages
  const showTempMessage = (text: string, type: "success" | "error" = "success", ms = 2500) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => { setMessage(null); setMessageType(null); }, ms);
  };

  // Translation handlers
  const handleSingleFieldTranslation = useCallback((fieldName: string, translatedText: string) => {
    updateFormField(fieldName, translatedText);
    showTempMessage(`Text bol preložený: ${fieldName}`, "success");
  }, [updateFormField]);

  const handleBulkTranslation = useCallback((updates: Record<string, string>) => {
    Object.entries(updates).forEach(([fieldName, translatedText]) => {
      updateFormField(fieldName, translatedText);
    });
    const count = Object.keys(updates).length;
    showTempMessage(`Preložených ${count} polí`, "success");
  }, [updateFormField]);

  // Audio generation handler
  const handleAudioGenerated = useCallback((fieldName: string, audioUrl: string) => {
    updateFormField(fieldName, audioUrl);
    showTempMessage(`Audio bolo vygenerované: ${fieldName}`, "success");
  }, [updateFormField]);

  // AI Lectio Divina generation handler
  const handleLectioAIGenerated = useCallback((data: {
    lectio: string;
    meditatio: string;
    oratio: string;
    contemplatio: string;
  }) => {
    updateFormField('lectio_text', data.lectio);
    updateFormField('meditatio_text', data.meditatio);
    updateFormField('oratio_text', data.oratio);
    updateFormField('contemplatio_text', data.contemplatio);
    showTempMessage('✨ AI vygenerovalo všetky sekcie Lectio Divina', 'success', 4000);
  }, [updateFormField]);

  // Template selection handler
  const handleTemplateSelect = useCallback((template: LectioTemplate) => {
    // Aplikuj template fields do formData
    Object.entries(template.fields).forEach(([fieldName, fieldValue]) => {
      if (fieldValue) {
        updateFormField(fieldName, fieldValue);
      }
    });
    
    setShowTemplateSelector(false);
    showTempMessage(`✨ Šablóna "${template.name}" bola aplikovaná`, 'success', 3000);
  }, [updateFormField]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (isNew) {
        try {
          const savedDraft = localStorage.getItem(DRAFT_KEY);
          if (savedDraft) {
            const draftData = JSON.parse(savedDraft);
            setFormData(draftData);
            setIsDraftAvailable(true);
          } else {
            // Find default locale
            const defaultLocale = locales.find(l => l.code === appLang) || locales[0];
            setFormData({
              lang: defaultLocale?.code || appLang,
              locale_id: defaultLocale?.id,
              kniha: "",
              kapitola: "",
              hlava: "",
              suradnice_pismo: "",
              rok: "N",
              id_cislo: "",
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
              reference: "",
              modlitba_zaver: "",
              audio_5_min: "",
              checked: 0,
            });
            // Otvor template selector iba ak nie je draft
            setShowTemplateSelector(true);
          }
        } catch (error) {
          console.error('Chyba pri načítaní draft:', error);
        }
        setDataLoaded(true);
      } else {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("lectio_sources")
            .select("*")
            .eq("id", id)
            .single();
          
          if (!error && data) {
            // Ak existuje locale_id, skús načítať locale info
            if (data.locale_id) {
              const { data: localeData } = await supabase
                .from("locales")
                .select("id, code, name, native_name, is_active")
                .eq("id", data.locale_id)
                .single();
              
              if (localeData) {
                (data as LectioSource & { locale_info: Locale }).locale_info = localeData;
              }
            }
            
            setFormData(data);
            setDataLoaded(true);
          }
        } catch (error) {
          console.error('Chyba pri načítaní:', error);
        }
        setLoading(false);
      }
    };

    if (locales.length > 0) {
      loadData();
    }
  }, [id, supabase, isNew, appLang, DRAFT_KEY, locales]);

  // Bible import handlers
  const handleBibleImport = (verses: string, reference: string, translationName: string) => {
    const textFieldName = `biblia_${currentBibleField}`;
    const nameFieldName = `nazov_biblia_${currentBibleField}`;
    
    // Do textu dáme verše
    updateFormField(textFieldName, verses);
    // Do názvu dáme názov prekladu (napr. "Katolícky preklad")
    updateFormField(nameFieldName, translationName);
    
    // Ak je to prvý biblický text, aktualizuj aj hlavné súradnice
    if (currentBibleField === 1) {
      updateFormField('suradnice_pismo', reference);
    }

    showTempMessage("Biblický text bol importovaný.", "success");
  };

  const openBibleImport = (fieldNumber: number) => {
    setCurrentBibleField(fieldNumber);
    setShowBibleImport(true);
  };

  // === Odstránenie čísiel veršov ===
  const stripVerseNumbers = (text: string) => {
    let out = text;
    // Odstráni samostatné čísla veršov (1–3 cifry) na začiatkoch úsekov alebo po interpunkcii/medzere.
    out = out.replace(/(^|[^\p{L}\p{N}])\s*\d{1,3}(?=\s)/gmu, (_m, p1) => (p1 || ""));
    // Zlúči viacnásobné medzery
    out = out.replace(/\s{2,}/g, " ");
    // Opraví medzeru pred interpunkciou
    out = out.replace(/\s+([,.;:!?])/g, "$1");
    return out.trim();
  };

  const handleStripVerseNumbers = (fieldNumber: number) => {
    const key = `biblia_${fieldNumber}` as keyof LectioSource;
    const current = (formData[key] as string) || "";
    const cleaned = stripVerseNumbers(current);
    updateFormField(`biblia_${fieldNumber}`, cleaned);
    showTempMessage("Čísla veršov boli odstránené.", "success");
  };



  // Save handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setMessageType(null);

    if (!formData.lang || !formData.kniha || !formData.kapitola || !formData.hlava) {
      setSaving(false);
      setMessage("Jazyk, kniha, kapitola a nadpis sú povinné polia");
      setMessageType("error");
      return;
    }

    try {
      const saveData = { ...formData } as Partial<LectioSource> & { locale_info?: Locale };
      
      // Odstráň locale_info ak existuje (nie je súčasť tabuľky)
      delete saveData.locale_info;
      
      // Nastav locale_id len ak je dostupný v schéme
      if (!saveData.locale_id && saveData.lang) {
        const locale = locales.find(l => l.code === saveData.lang);
        if (locale) {
          try {
            saveData.locale_id = locale.id;
          } catch {
            delete saveData.locale_id;
          }
        }
      }

      if (isNew) {
        const { data, error } = await supabase
          .from("lectio_sources")
          .insert([saveData])
          .select("id")
          .single();
          
        if (!error && data?.id) {
          localStorage.removeItem(DRAFT_KEY);
          setHasUnsavedChanges(false);
          setIsDraftAvailable(false);
          setMessage("Úspešne uložené");
          setMessageType("success");
          router.replace(`/admin/lectio-sources/${data.id}`);
        } else {
          throw error;
        }
      } else {
        const { error } = await supabase
          .from("lectio_sources")
          .update(saveData)
          .eq("id", id);
          
        if (!error) {
          localStorage.removeItem(DRAFT_KEY);
          setHasUnsavedChanges(false);
          setIsDraftAvailable(false);
          setMessage("Úspešne uložené");
          setMessageType("success");
          
          // Redirect späť na zoznam s povodnou strankovu ak existuje
          setTimeout(() => {
            const returnPage = localStorage.getItem('lectio_sources_return_page');
            if (returnPage) {
              router.push(`/admin/lectio-sources?page=${returnPage}`);
              localStorage.removeItem('lectio_sources_return_page');
            } else {
              router.push('/admin/lectio-sources');
            }
          }, 1500); // Počkaj 1.5s na zobrazenie správy
        } else {
          throw error;
        }
      }
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Chyba pri ukladaní");
      setMessageType("error");
    }
    
    setSaving(false);
  };

  if (loading || !dataLoaded || locales.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-700 font-medium">Načítavam...</span>
        </div>
      </div>
    );
  }

  const currentLocale = formData.locale_id 
    ? locales.find(l => l.id === formData.locale_id) 
    : locales.find(l => l.code === formData.lang);

  const getBackUrl = () => {
    const returnPage = localStorage.getItem('lectio_sources_return_page');
    localStorage.removeItem('lectio_sources_return_page');
    if (returnPage) {
      return `/admin/lectio-sources?page=${returnPage}`;
    }
    return '/admin/lectio-sources';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <EditPageHeader
          title={
            isNew
              ? "Pridať nový Lectio zdroj"
              : `Upraviť Lectio zdroj: ${formData.kniha} ${formData.kapitola}`
          }
          description={isNew ? "Vytvorte nový zdrojový obsah" : "Upravte existujúci zdroj"}
          icon={BookOpen}
          backUrl={getBackUrl()}
          emoji={isNew ? "✨" : "📝"}
          hasUnsavedChanges={hasUnsavedChanges}
          isDraftAvailable={isDraftAvailable}
          unsavedText="Neuložené zmeny"
          draftText="Draft načítaný"
        />

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
          {/* Template selector button - len pri novom zázname */}
          {isNew && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Šablóny Lectio Divina</h3>
                    <p className="text-sm text-gray-600">Vyberte si hotovú šablónu pre rýchlejší štart</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowTemplateSelector(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition shadow-md hover:shadow-lg"
                >
                  <span>✨</span>
                  Vybrať šablónu
                </button>
              </div>
            </div>
          )}

          {/* Základné informácie */}
          <FormSection title="Základné informácie" icon={FileText}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="admin-edit-label">
                    <Globe size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Jazyk <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="lang"
                    value={formData.lang || appLang}
                    onChange={(e) => updateFormField('lang', e.target.value)}
                    className="admin-edit-input"
                  >
                    {locales.map(locale => (
                      <option key={locale.id} value={locale.code}>
                        {locale.native_name} ({locale.code})
                      </option>
                    ))}
                  </select>
                  {currentLocale && (
                    <p className="text-xs text-gray-500">
                      ID: {currentLocale.id} - {currentLocale.name}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="admin-edit-label">
                    <Calendar size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Liturgický rok
                  </label>
                  <select
                    name="rok"
                    value={formData.rok || "N"}
                    onChange={(e) => updateFormField('rok', e.target.value)}
                    className="admin-edit-input"
                  >
                    <option value="N">-- Nie je zadané --</option>
                    <option value="A">📅 Rok A</option>
                    <option value="B">📅 Rok B</option>
                    <option value="C">📅 Rok C</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="admin-edit-label">
                    <FileText size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    ID číslo
                  </label>
                  <input
                    type="text"
                    name="id_cislo"
                    value={formData.id_cislo || ""}
                    onChange={(e) => updateFormField('id_cislo', e.target.value)}
                    className="admin-edit-input"
                    placeholder="Identifikačné číslo..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="admin-edit-label">
                    <BookOpen size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Kniha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="kniha"
                    value={formData.kniha || ""}
                    onChange={(e) => updateFormField('kniha', e.target.value)}
                    className="admin-edit-input"
                    placeholder="Názov biblickej knihy..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="admin-edit-label">
                    <FileText size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Kapitola <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="kapitola"
                    value={formData.kapitola || ""}
                    onChange={(e) => updateFormField('kapitola', e.target.value)}
                    className="admin-edit-input"
                    placeholder="Číslo kapitoly..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="admin-edit-label">
                    <BookOpen size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Súradnice Písma <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="suradnice_pismo"
                    value={formData.suradnice_pismo || ""}
                    onChange={(e) => updateFormField('suradnice_pismo', e.target.value)}
                    className="admin-edit-input"
                    placeholder="napr. Mt 5,1-12"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="admin-edit-label">
                    <FileText size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Nadpis <span className="text-red-500">*</span>
                  </label>
                  <TranslateButton
                    text={formData.hlava || ""}
                    fieldType="hlava"
                    onTranslated={(translatedText) => handleSingleFieldTranslation('hlava', translatedText)}
                    disabled={saving}
                  />
                </div>
                <input
                  type="text"
                  name="hlava"
                  value={formData.hlava || ""}
                  onChange={(e) => updateFormField('hlava', e.target.value)}
                  className="admin-edit-input"
                  placeholder="Nadpis lectio..."
                  required
                />
              </div>
            </div>
          </FormSection>

          {/* Voice and Model Settings */}
          <VoiceSelector
            selectedVoiceId={selectedVoiceId}
            selectedModel={selectedModel}
            onVoiceChange={setSelectedVoiceId}
            onModelChange={setSelectedModel}
            language={formData.lang}
            className="mb-8"
          />

          {/* AI Lectio Divina Generator */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAIGenerator(!showAIGenerator)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="text-purple-600" size={24} />
                <h2 className="text-xl font-bold text-gray-900">
                  🤖 AI Generátor Lectio Divina
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {showAIGenerator ? 'Zbaliť' : 'Rozbaliť'}
                </span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showAIGenerator ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            
            {showAIGenerator && (
              <div className="p-6 pt-0 border-t border-gray-100">
                <LectioAIGenerator
                  bibliaText={formData.biblia_1 || ""}
                  suradnicePismo={formData.suradnice_pismo || ""}
                  onGenerated={handleLectioAIGenerated}
                  disabled={saving}
                />
              </div>
            )}
          </div>

          {/* Biblické texty s import funkciou */}
          <FormSection title="Biblické texty" icon={BookOpen}>
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📖</span>
                      <h3 className="text-lg font-semibold text-gray-800">
                        Biblický text {i}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openBibleImport(i)}
                        disabled={!currentLocale?.id}
                        className="admin-edit-button-primary text-sm"
                      >
                        <span className="mr-2">📥</span>
                        Importovať z Biblie
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStripVerseNumbers(i)}
                        className="admin-edit-button-primary text-sm"
                        title="Odstráni čísla veršov (1, 7, 8, 9...)"
                      >
                        <span className="mr-2">✂️</span>
                        Odstrániť čísla veršov
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Preklad Biblie <small className="text-gray-500">(názov sa automaticky vyplní pri importe)</small>
                      </label>
                      <input
                        type="text"
                        name={`nazov_biblia_${i}`}
                        value={formData[`nazov_biblia_${i}` as keyof LectioSource] as string || ""}
                        onChange={(e) => updateFormField(`nazov_biblia_${i}`, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="napr. Katolícky preklad, Jeruzalemská Biblia..."
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Text
                      </label>
                      <textarea
                        name={`biblia_${i}`}
                        value={formData[`biblia_${i}` as keyof LectioSource] as string || ""}
                        onChange={(e) => updateFormField(`biblia_${i}`, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        placeholder="Biblický text..."
                        rows={4}
                        style={{ height: '6rem' }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-700">
                          Audio (URL)
                        </label>
                        <AudioGenerateButton
                          text={formData[`biblia_${i}` as keyof LectioSource] as string || ""}
                          language={formData.lang || "sk"}
                          lectioId={id || "new"}
                          fieldName={`biblia_${i}_audio`}
                          currentAudioUrl={formData[`biblia_${i}_audio` as keyof LectioSource] as string || ""}
                          onAudioGenerated={(audioUrl) => handleAudioGenerated(`biblia_${i}_audio`, audioUrl)}
                          disabled={saving}
                          voice_id={selectedVoiceId}
                          model={selectedModel}
                        />
                      </div>
                      <input
                        type="url"
                        name={`biblia_${i}_audio`}
                        value={formData[`biblia_${i}_audio` as keyof LectioSource] as string || ""}
                        onChange={(e) => updateFormField(`biblia_${i}_audio`, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/audio.mp3"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </FormSection>

          {/* Hromadný preklad */}
          <BulkTranslateSection
            formData={formData}
            onFieldsUpdated={handleBulkTranslation}
            disabled={saving}
          />

          {/* Hlavný obsah lectio divina */}
          <FormSection title="Hlavný obsah lectio divina" icon={BookOpen}>
            <div className="space-y-8">
              <AITextField
                label="Lectio – text"
                name="lectio_text"
                value={formData.lectio_text || ""}
                onChange={(value) => updateFormField('lectio_text', value)}
                placeholder="Napíšte text pre Lectio..."
                rows={12}
                height="18rem"
                fieldType="spiritual"
                disabled={saving}
                showGrammarCheck={true}
                enableAISuggestions={true}
                enableRichText={true}
              />
              
              <AITextField
                label="Meditatio – text"
                name="meditatio_text"
                value={formData.meditatio_text || ""}
                onChange={(value) => updateFormField('meditatio_text', value)}
                placeholder="Napíšte text pre Meditatio..."
                rows={10}
                height="15rem"
                fieldType="spiritual"
                disabled={saving}
                showGrammarCheck={true}
                enableAISuggestions={true}
                enableRichText={true}
              />
              
              <AITextField
                label="Oratio – text"
                name="oratio_text"
                value={formData.oratio_text || ""}
                onChange={(value) => updateFormField('oratio_text', value)}
                placeholder="Napíšte text pre Oratio..."
                rows={10}
                height="15rem"
                fieldType="prayer"
                disabled={saving}
                showGrammarCheck={true}
                enableAISuggestions={true}
                enableRichText={true}
              />
              
              <AITextField
                label="Contemplatio – text"
                name="contemplatio_text"
                value={formData.contemplatio_text || ""}
                onChange={(value) => updateFormField('contemplatio_text', value)}
                placeholder="Napíšte text pre Contemplatio..."
                rows={10}
                height="15rem"
                fieldType="spiritual"
                disabled={saving}
                showGrammarCheck={true}
                enableAISuggestions={true}
                enableRichText={true}
              />
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    Actio – text
                  </label>
                  <TranslateButton
                    text={formData.actio_text || ""}
                    fieldType="spiritual"
                    onTranslated={(translatedText) => handleSingleFieldTranslation('actio_text', translatedText)}
                    disabled={saving}
                  />
                </div>
                <input
                  type="text"
                  name="actio_text"
                  value={formData.actio_text || ""}
                  onChange={(e) => updateFormField('actio_text', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Napíšte text pre Actio..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    Reference
                  </label>
                  <TranslateButton
                    text={formData.reference || ""}
                    fieldType="reference"
                    onTranslated={(translatedText) => handleSingleFieldTranslation('reference', translatedText)}
                    disabled={saving}
                  />
                </div>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference || ""}
                  onChange={(e) => updateFormField('reference', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Odkazy a referencie..."
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    Modlitba záver
                  </label>
                  <TranslateButton
                    text={formData.modlitba_zaver || ""}
                    fieldType="prayer"
                    onTranslated={(translatedText) => handleSingleFieldTranslation('modlitba_zaver', translatedText)}
                    disabled={saving}
                  />
                </div>
                <textarea
                  name="modlitba_zaver"
                  value={formData.modlitba_zaver || ""}
                  onChange={(e) => updateFormField('modlitba_zaver', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Záverečná modlitba..."
                  rows={4}
                  style={{ height: '6rem' }}
                />
              </div>
            </div>
          </FormSection>

          {/* Audio a médiá - rovnaké ako predtým */}
          <FormSection title="Audio a médiá" icon={Globe}>
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">🎵</span>
                <h3 className="text-lg font-semibold text-gray-800">Audio súbory</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">
                      Lectio audio (URL)
                    </label>
                    <AudioGenerateButton
                      text={formData.lectio_text || ""}
                      language={formData.lang || "sk"}
                      lectioId={id || "new"}
                      fieldName="lectio_audio"
                      currentAudioUrl={formData.lectio_audio || ""}
                      onAudioGenerated={(audioUrl) => handleAudioGenerated("lectio_audio", audioUrl)}
                      disabled={saving}
                      voice_id={selectedVoiceId}
                      model={selectedModel}
                    />
                  </div>
                  <input
                    type="url"
                    name="lectio_audio"
                    value={formData.lectio_audio || ""}
                    onChange={(e) => updateFormField('lectio_audio', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/lectio.mp3"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">
                      Meditatio audio (URL)
                    </label>
                    <AudioGenerateButton
                      text={formData.meditatio_text || ""}
                      language={formData.lang || "sk"}
                      lectioId={id || "new"}
                      fieldName="meditatio_audio"
                      currentAudioUrl={formData.meditatio_audio || ""}
                      onAudioGenerated={(audioUrl) => handleAudioGenerated("meditatio_audio", audioUrl)}
                      disabled={saving}
                      voice_id={selectedVoiceId}
                      model={selectedModel}
                    />
                  </div>
                  <input
                    type="url"
                    name="meditatio_audio"
                    value={formData.meditatio_audio || ""}
                    onChange={(e) => updateFormField('meditatio_audio', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/meditatio.mp3"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">
                      Oratio audio (URL)
                    </label>
                    <AudioGenerateButton
                      text={formData.oratio_text || ""}
                      language={formData.lang || "sk"}
                      lectioId={id || "new"}
                      fieldName="oratio_audio"
                      currentAudioUrl={formData.oratio_audio || ""}
                      onAudioGenerated={(audioUrl) => handleAudioGenerated("oratio_audio", audioUrl)}
                      disabled={saving}
                      voice_id={selectedVoiceId}
                      model={selectedModel}
                    />
                  </div>
                  <input
                    type="url"
                    name="oratio_audio"
                    value={formData.oratio_audio || ""}
                    onChange={(e) => updateFormField('oratio_audio', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/oratio.mp3"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">
                      Contemplatio audio (URL)
                    </label>
                    <AudioGenerateButton
                      text={formData.contemplatio_text || ""}
                      language={formData.lang || "sk"}
                      lectioId={id || "new"}
                      fieldName="contemplatio_audio"
                      currentAudioUrl={formData.contemplatio_audio || ""}
                      onAudioGenerated={(audioUrl) => handleAudioGenerated("contemplatio_audio", audioUrl)}
                      voice_id={selectedVoiceId}
                      model={selectedModel}
                      disabled={saving}
                    />
                  </div>
                  <input
                    type="url"
                    name="contemplatio_audio"
                    value={formData.contemplatio_audio || ""}
                    onChange={(e) => updateFormField('contemplatio_audio', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/contemplatio.mp3"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-gray-700">
                      Actio audio (URL)
                    </label>
                    <AudioGenerateButton
                      text={formData.actio_text || ""}
                      language={formData.lang || "sk"}
                      lectioId={id || "new"}
                      fieldName="actio_audio"
                      currentAudioUrl={formData.actio_audio || ""}
                      onAudioGenerated={(audioUrl) => handleAudioGenerated("actio_audio", audioUrl)}
                      disabled={saving}
                      voice_id={selectedVoiceId}
                      model={selectedModel}
                    />
                  </div>
                  <input
                    type="url"
                    name="actio_audio"
                    value={formData.actio_audio || ""}
                    onChange={(e) => updateFormField('actio_audio', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/actio.mp3"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Audio 5 minút (URL)
                  </label>
                  <input
                    type="url"
                    name="audio_5_min"
                    value={formData.audio_5_min || ""}
                    onChange={(e) => updateFormField('audio_5_min', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/5min.mp3"
                  />
                </div>
              </div>
            </div>
          </FormSection>

          {/* Save Button with Checkbox */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 flex-1">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="checked"
                  name="checked"
                  checked={formData.checked === 1}
                  onChange={(e) => updateFormField('checked', e.target.checked ? 1 : 0)}
                  className="w-5 h-5 text-emerald-600 bg-gray-100 border-emerald-300 rounded focus:ring-emerald-500 focus:ring-2 cursor-pointer"
                />
                <label 
                  htmlFor="checked" 
                  className="ml-3 text-sm font-semibold text-emerald-800 cursor-pointer flex items-center"
                >
                  <span className="mr-2">✅</span>
                  Označiť ako skontrolované
                </label>
              </div>
              <p className="text-xs text-emerald-600 ml-8 mt-1">
                Označte keď je obsah skontrolovaný a pripravený na publikovanie
              </p>
            </div>
            
            <ActionButton
              type="submit"
              icon={Save}
              variant="primary"
              loading={saving}
            >
              Uložiť
            </ActionButton>
          </div>
        </form>

        {/* Bible Import Modal */}
        <BibleImportModal
          isOpen={showBibleImport}
          onClose={() => setShowBibleImport(false)}
          onImport={handleBibleImport}
          currentLocaleId={currentLocale?.id || 1}
        />

        {/* Template Selector Modal */}
        <TemplateSelector
          isOpen={showTemplateSelector}
          onClose={() => setShowTemplateSelector(false)}
          onSelect={handleTemplateSelect}
        />
      </div>
    </div>
  );
}
