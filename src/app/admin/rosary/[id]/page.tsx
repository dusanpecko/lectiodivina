"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import { useFileUpload } from "@/app/hooks/useFileUpload";
import { 
  Sparkles, Upload, FileText, BookOpen, Eye, Heart, 
  Crown, Star, Sun, Globe, Calendar, Headphones,
  Save, ArrowLeft, Image as ImageIcon, Volume2
} from "lucide-react";

interface LectioDivinaRuzenec {
  id?: string;
  created_at?: string;
  updated_at?: string;
  lang: string;
  biblicky_text: string;
  kategoria: string;
  ruzenec: string;
  uvod: string;
  ilustracny_obrazok?: string;
  uvodne_modlitby?: string;
  lectio_text: string;
  komentar?: string;
  meditatio_text: string;
  oratio_html: string;
  contemplatio_text: string;
  actio_text: string;
  audio_nahravka?: string;
  autor?: string;
  publikovane: boolean;
  poradie: number;
}

interface Kategoria {
  id: string;
  nazov: string;
  popis: string;
  farba: string;
}

const LANGUAGE_OPTIONS = [
  { value: "sk" as const, label: "Slovenčina", flag: "🇸🇰" },
  { value: "cz" as const, label: "Čeština", flag: "🇨🇿" },
  { value: "en" as const, label: "English", flag: "🇺🇸" },
  { value: "es" as const, label: "Español", flag: "🇪🇸" },
];

export default function RosaryEditPage() {
  const { supabase } = useSupabase();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { lang: appLang } = useLanguage();
  const t = translations[appLang];
  const isNew = id === "new";

  const formRef = useRef<HTMLFormElement>(null);
  
  // State pre formulár - controlled inputs
  const [formData, setFormData] = useState<Partial<LectioDivinaRuzenec>>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [kategorie, setKategorie] = useState<Kategoria[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDraftAvailable, setIsDraftAvailable] = useState(false);

  // File upload hook
  const { uploadFile, isUploading, error: uploadError, clearError } = useFileUpload();

  // Konštanty
  const DRAFT_KEY = `rosary_draft_${id}`;

  // Stabilná funkcia na aktualizáciu formulára - presne ako v lectio-sources
  const updateFormField = useCallback((name: string, value: string | boolean | number) => {
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Uložiť do localStorage s malým debounce
      setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
      }, 500);
      return updated;
    });
    setHasUnsavedChanges(true);
  }, [DRAFT_KEY]);

  // Fetch kategórie
  useEffect(() => {
    const fetchKategorie = async () => {
      const { data, error } = await supabase
        .from("kategorie_ruzenec")
        .select("*")
        .order("nazov");
      
      if (!error && data) {
        setKategorie(data);
      }
    };
    fetchKategorie();
  }, [supabase]);

  // Načítanie dát
  useEffect(() => {
    const loadData = async () => {
      if (isNew) {
        // Pre nový záznam - skús načítať draft
        try {
          const savedDraft = localStorage.getItem(DRAFT_KEY);
          if (savedDraft) {
            const draftData = JSON.parse(savedDraft);
            setFormData(draftData);
            setIsDraftAvailable(true);
          } else {
            // Inicializácia pre nový záznam
            setFormData({
              lang: appLang,
              biblicky_text: "",
              kategoria: "radostné",
              ruzenec: "",
              uvod: "",
              ilustracny_obrazok: "",
              uvodne_modlitby: "",
              lectio_text: "",
              komentar: "",
              meditatio_text: "",
              oratio_html: "",
              contemplatio_text: "",
              actio_text: "",
              audio_nahravka: "",
              autor: "",
              publikovane: false,
              poradie: 0,
            });
          }
        } catch (error) {
          console.error('Chyba pri načítaní draft:', error);
        }
        setDataLoaded(true);
      } else {
        // Pre existujúci záznam
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("lectio_divina_ruzenec")
            .select("*")
            .eq("id", id)
            .single();
          
          if (!error && data) {
            setFormData(data);
            setDataLoaded(true);
          }
        } catch (error) {
          console.error('Chyba pri načítaní:', error);
        }
        setLoading(false);
      }
    };

    loadData();
  }, [id, supabase, isNew, appLang, DRAFT_KEY]);

  // Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasUnsavedChanges && dataLoaded) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
        console.log('Draft uložený pred skrytím stránky');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [formData, hasUnsavedChanges, dataLoaded, DRAFT_KEY]);

  // Upozornenie pred opustením
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && dataLoaded) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
        e.preventDefault();
        e.returnValue = 'Máte neuložené zmeny. Chcete naozaj opustiť stránku?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, formData, dataLoaded, DRAFT_KEY]);

  // Vymazanie draft
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setIsDraftAvailable(false);
    setHasUnsavedChanges(false);
    
    if (isNew) {
      setFormData({
        lang: appLang,
        biblicky_text: "",
        kategoria: "radostné",
        ruzenec: "",
        uvod: "",
        ilustracny_obrazok: "",
        uvodne_modlitby: "",
        lectio_text: "",
        komentar: "",
        meditatio_text: "",
        oratio_html: "",
        contemplatio_text: "",
        actio_text: "",
        audio_nahravka: "",
        autor: "",
        publikovane: false,
        poradie: 0,
      });
    }
    
    setMessage("Draft vymazaný");
    setMessageType("success");
  };

  // Upload súboru do Supabase Storage
  const handleFileUpload = async (file: File, type: 'image' | 'audio', inputName: string) => {
    try {
      clearError();
      const result = await uploadFile(supabase, file, type);
      
      if (result.success) {
        updateFormField(inputName, result.url);
        setMessage(`${type === 'image' ? 'Obrázok' : 'Audio'} bol úspešne nahraný`);
        setMessageType("success");
      } else {
        throw new Error(result.error || 'Upload zlyhal');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`Chyba pri uploade: ${error instanceof Error ? error.message : 'Neznáma chyba'}`);
      setMessageType("error");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setMessageType(null);

    if (!formData.ruzenec || !formData.biblicky_text || !formData.lectio_text) {
      setSaving(false);
      setMessage("Názov ruženec, biblický text a lectio text sú povinné polia");
      setMessageType("error");
      return;
    }

    try {
      if (isNew) {
        const { data, error } = await supabase
          .from("lectio_divina_ruzenec")
          .insert([formData])
          .select("id")
          .single();
        
        if (!error && data?.id) {
          localStorage.removeItem(DRAFT_KEY);
          setHasUnsavedChanges(false);
          setIsDraftAvailable(false);
          setMessage("Ruženec bol úspešne vytvorený");
          setMessageType("success");
          setTimeout(() => {
            router.replace(`/admin/rosary/${data.id}`);
          }, 1000);
        } else {
          throw new Error(error?.message || "Chyba pri vytváraní");
        }
      } else {
        const { error } = await supabase
          .from("lectio_divina_ruzenec")
          .update(formData)
          .eq("id", id);
        
        if (error) {
          throw new Error(error.message);
        }
        
        localStorage.removeItem(DRAFT_KEY);
        setHasUnsavedChanges(false);
        setIsDraftAvailable(false);
        setMessage("Ruženec bol úspešne aktualizovaný");
        setMessageType("success");
      }
    } catch (error: any) {
      console.error('Save error:', error);
      setMessage(error?.message || "Chyba pri ukladaní");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
          <span className="text-gray-700 font-medium">Načítavam...</span>
        </div>
      </div>
    );
  }

  if (!dataLoaded && !isNew) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Ruženec nenájdený
          </h2>
          <p className="text-gray-600 mb-4">Požadovaný ruženec sa nenašiel v databáze.</p>
          <button
            onClick={() => router.push('/admin/rosary')}
            className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 transition"
          >
            Späť na zoznam
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "basic", label: "Základné informácie", icon: <FileText size={16} /> },
    { id: "content", label: "Lectio Divina obsah", icon: <BookOpen size={16} /> },
    { id: "media", label: "Médiá a audio", icon: <Headphones size={16} /> },
    { id: "settings", label: "Nastavenia", icon: <Globe size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/rosary')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {isNew
                    ? "Pridať nový Lectio Divina Ruženec"
                    : `Upraviť: ${formData.ruzenec}`
                  }
                </h1>
                <p className="text-gray-600">
                  {isNew ? "Vytvorte nový duchovný ruženec" : "Upravte existujúci ruženec"}
                </p>
                {/* Status indikátor */}
                <div className="flex items-center space-x-4 text-sm mt-2">
                  {hasUnsavedChanges && (
                    <div className="flex items-center space-x-1 text-orange-600">
                      <span>●</span>
                      <span>Neuložené zmeny</span>
                    </div>
                  )}
                  {isDraftAvailable && (
                    <div className="flex items-center space-x-1 text-blue-600">
                      <span>📝</span>
                      <span>Draft načítaný</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-4xl">
              {isNew ? "✨" : "📿"}
            </div>
          </div>
        </div>

        {/* Draft indikátor */}
        {isDraftAvailable && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📝</span>
                <span className="text-yellow-800 font-medium">
                  Načítaný uložený draft
                </span>
              </div>
              <button
                type="button"
                onClick={clearDraft}
                className="text-yellow-600 hover:text-yellow-800 text-sm underline"
              >
                Vymazať draft
              </button>
            </div>
          </div>
        )}

        {/* Message */}
        {(message || uploadError) && (
          <div className={`mb-6 p-4 rounded-lg shadow-md ${
            messageType === "error" || uploadError
              ? "bg-red-50 border border-red-200 text-red-800" 
              : "bg-green-50 border border-green-200 text-green-800"
          }`}>
            <div className="flex items-center space-x-2">
              <span className="text-xl">
                {messageType === "error" || uploadError ? "❌" : "✅"}
              </span>
              <span className="font-medium">{message || uploadError}</span>
              {uploadError && (
                <button
                  onClick={clearError}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSave} className="space-y-8">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? "border-rose-500 text-rose-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Basic Tab */}
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Sparkles size={16} />
                          Názov ruženec <span className="text-red-500">*</span>
                        </div>
                      </label>
                      <input
                        type="text"
                        name="ruzenec"
                        value={formData.ruzenec || ""}
                        onChange={(e) => updateFormField('ruzenec', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Zadajte názov ruženec..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} />
                          Biblický text <span className="text-red-500">*</span>
                        </div>
                      </label>
                      <input
                        type="text"
                        name="biblicky_text"
                        value={formData.biblicky_text || ""}
                        onChange={(e) => updateFormField('biblicky_text', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        placeholder="napr. Anjel Pána zvestoval Panne Márii..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Crown size={16} />
                          Kategória <span className="text-red-500">*</span>
                        </div>
                      </label>
                      <select
                        name="kategoria"
                        value={formData.kategoria || "radostné"}
                        onChange={(e) => updateFormField('kategoria', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                        required
                      >
                        {kategorie.map(k => (
                          <option key={k.id} value={k.nazov}>
                            {k.nazov} - {k.popis}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <Globe size={16} />
                          Jazyk <span className="text-red-500">*</span>
                        </div>
                      </label>
                      <select
                        name="lang"
                        value={formData.lang || appLang}
                        onChange={(e) => updateFormField('lang', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      >
                        {LANGUAGE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.flag} {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        Úvod
                      </div>
                    </label>
                    <p className="text-xs text-gray-500">Úvodné slová a vysvetlenie pre tento ruženec</p>
                    <textarea
                      name="uvod"
                      value={formData.uvod || ""}
                      onChange={(e) => updateFormField('uvod', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                      placeholder="Úvodný text pre ruženec..."
                      rows={4}
                      style={{ height: '6rem' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Heart size={16} />
                        Úvodné modlitby (HTML)
                      </div>
                    </label>
                    <p className="text-xs text-gray-500">HTML obsah pre preddesiatky a úvodné modlitby</p>
                    <textarea
                      name="uvodne_modlitby"
                      value={formData.uvodne_modlitby || ""}
                      onChange={(e) => updateFormField('uvodne_modlitby', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none font-mono text-sm"
                      placeholder="<p>Otče náš...</p><p>Zdravas Mária...</p>"
                      rows={6}
                      style={{ height: '9rem' }}
                    />
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === "content" && (
                <div className="space-y-8">
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center mb-4">
                      <BookOpen size={20} className="mr-3 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-800">1. Lectio (Čítanie slova)</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Lectio text <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="lectio_text"
                          value={formData.lectio_text || ""}
                          onChange={(e) => updateFormField('lectio_text', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                          placeholder="Text pre čítanie a pochopenie Božieho slova..."
                          rows={8}
                          required
                          style={{ height: '12rem' }}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Komentár
                        </label>
                        <textarea
                          name="komentar"
                          value={formData.komentar || ""}
                          onChange={(e) => updateFormField('komentar', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                          placeholder="Dodatočný komentár alebo vysvetlenie..."
                          rows={4}
                          style={{ height: '6rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center mb-4">
                      <Eye size={20} className="mr-3 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-800">2. Meditatio (Rozjímanie)</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Meditatio text <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="meditatio_text"
                        value={formData.meditatio_text || ""}
                        onChange={(e) => updateFormField('meditatio_text', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                        placeholder="Text pre rozjímanie a premýšľanie o Božom slove..."
                        rows={8}
                        required
                        style={{ height: '12rem' }}
                      />
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center mb-4">
                      <Heart size={20} className="mr-3 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-800">3. Oratio (Modlitba) - Desiatky</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Oratio HTML <span className="text-red-500">*</span>
                      </label>
                      <p className="text-xs text-gray-500">HTML obsah pre desiatky ruženec - modlitby a rozjímanie</p>
                      <textarea
                        name="oratio_html"
                        value={formData.oratio_html || ""}
                        onChange={(e) => updateFormField('oratio_html', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none font-mono text-sm"
                        placeholder="<p>1. desiatka: Rozjímajme o...</p><p>Otče náš, 10x Zdravas Mária, Sláva Otcu</p>"
                        rows={10}
                        required
                        style={{ height: '15rem' }}
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                    <div className="flex items-center mb-4">
                      <Star size={20} className="mr-3 text-yellow-600" />
                      <h3 className="text-lg font-semibold text-gray-800">4. Contemplatio (Spočinutie)</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Contemplatio text <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="contemplatio_text"
                        value={formData.contemplatio_text || ""}
                        onChange={(e) => updateFormField('contemplatio_text', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                        placeholder="Text pre tichú kontempláciu a spočinutie v Bohu..."
                        rows={6}
                        required
                        style={{ height: '9rem' }}
                      />
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-6 border border-orange-200">
                    <div className="flex items-center mb-4">
                      <Sun size={20} className="mr-3 text-orange-600" />
                      <h3 className="text-lg font-semibold text-gray-800">5. Actio (Konanie)</h3>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Actio text <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="actio_text"
                        value={formData.actio_text || ""}
                        onChange={(e) => updateFormField('actio_text', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                        placeholder="Praktické podnety pre život a konanie..."
                        rows={6}
                        required
                        style={{ height: '9rem' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Media Tab */}
              {activeTab === "media" && (
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center mb-4">
                      <ImageIcon size={20} className="mr-3 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Ilustračný obrázok</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          URL obrázka
                        </label>
                        <p className="text-xs text-gray-500">URL adresa obrázka alebo nahrajte súbor nižšie</p>
                        <input
                          type="url"
                          name="ilustracny_obrazok"
                          value={formData.ilustracny_obrazok || ""}
                          onChange={(e) => updateFormField('ilustracny_obrazok', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Alebo nahrajte obrázok
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await handleFileUpload(file, 'image', 'ilustracny_obrazok');
                              e.target.value = ''; // Reset input
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          disabled={isUploading}
                        />
                        {isUploading && (
                          <p className="text-sm text-blue-600 mt-2">Nahrávam obrázok...</p>
                        )}
                      </div>

                      {formData.ilustracny_obrazok && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Náhľad:</p>
                          <img 
                            src={formData.ilustracny_obrazok} 
                            alt="Náhľad" 
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center mb-4">
                      <Volume2 size={20} className="mr-3 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Audio nahrávka</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          URL audio súboru
                        </label>
                        <p className="text-xs text-gray-500">URL adresa audio súboru alebo nahrajte súbor nižšie</p>
                        <input
                          type="url"
                          name="audio_nahravka"
                          value={formData.audio_nahravka || ""}
                          onChange={(e) => updateFormField('audio_nahravka', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          placeholder="https://example.com/audio.mp3"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Alebo nahrajte audio
                        </label>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              await handleFileUpload(file, 'audio', 'audio_nahravka');
                              e.target.value = ''; // Reset input
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          disabled={isUploading}
                        />
                        {isUploading && (
                          <p className="text-sm text-green-600 mt-2">Nahrávam audio...</p>
                        )}
                      </div>

                      {formData.audio_nahravka && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Audio prehrávač:</p>
                          <audio 
                            controls 
                            src={formData.audio_nahravka}
                            className="w-full"
                          >
                            Váš prehliadač nepodporuje audio prehrávanie.
                          </audio>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === "settings" && (
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex items-center mb-4">
                      <Globe size={20} className="mr-3 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Všeobecné nastavenia</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Autor
                        </label>
                        <p className="text-xs text-gray-500">Autor alebo tvorca tohto ruženec</p>
                        <input
                          type="text"
                          name="autor"
                          value={formData.autor || ""}
                          onChange={(e) => updateFormField('autor', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          placeholder="Meno autora ruženec..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                          Poradie
                        </label>
                        <p className="text-xs text-gray-500">Poradie zoradenia (menšie číslo = vyššie)</p>
                        <input
                          type="number"
                          name="poradie"
                          value={formData.poradie || 0}
                          onChange={(e) => updateFormField('poradie', parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center mb-4">
                      <Eye size={20} className="mr-3 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Publikovanie</h3>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="publikovane"
                        checked={formData.publikovane || false}
                        onChange={(e) => updateFormField('publikovane', e.target.checked)}
                        className="w-5 h-5 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                      />
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Publikovať ruženec
                        </label>
                        <p className="text-xs text-gray-500">
                          Označte, ak má byť ruženec viditeľný pre používateľov v aplikácii
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center mb-4">
                      <Calendar size={20} className="mr-3 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Informácie o zázname</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Vytvorené:</span>
                        <p className="text-gray-600">
                          {formData.created_at 
                            ? new Date(formData.created_at).toLocaleDateString('sk-SK', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Nový záznam'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Posledná úprava:</span>
                        <p className="text-gray-600">
                          {formData.updated_at 
                            ? new Date(formData.updated_at).toLocaleDateString('sk-SK', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : 'Nikdy'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => router.push('/admin/rosary')}
                className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <ArrowLeft size={16} className="mr-2" />
                Späť na zoznam
              </button>
              
              <button
                type="submit"
                disabled={saving || isUploading}
                className="inline-flex items-center px-8 py-3 bg-rose-600 text-white font-semibold rounded-lg shadow-md hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Ukladám...
                  </>
                ) : isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Nahrávam súbor...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    {isNew ? 'Vytvoriť ruženec' : 'Uložiť zmeny'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}