"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";

interface LectioSource {
  id?: number;
  lang: string;
  kniha: string;
  kapitola: string;
  hlava: string;
  suradnice_pismo: string;
  rok?: string; // A, B, C, N
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

export default function LectioSourceEditPage() {
  const { supabase } = useSupabase();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { lang: appLang } = useLanguage();
  const t = translations[appLang];
  const isNew = id === "new";

  const formRef = useRef<HTMLFormElement>(null);
  
  // State pre formulár
  const [formData, setFormData] = useState<Partial<LectioSource>>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDraftAvailable, setIsDraftAvailable] = useState(false);

  // Konštanty
  const DRAFT_KEY = `lectio_draft_${id}`;

  // Stabilná funkcia na aktualizáciu formulára
  const updateFormField = useCallback((name: string, value: string) => {
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
            .from("lectio_sources")
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
      });
    }
    
    setMessage("Draft vymazaný");
    setMessageType("success");
  };

  // Ukladanie
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
      if (isNew) {
        const { data, error } = await supabase
          .from("lectio_sources")
          .insert([formData])
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
          .update(formData)
          .eq("id", id);
          
        if (!error) {
          localStorage.removeItem(DRAFT_KEY);
          setHasUnsavedChanges(false);
          setIsDraftAvailable(false);
          setMessage("Úspešne uložené");
          setMessageType("success");
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      setMessage(error?.message || "Chyba pri ukladaní");
      setMessageType("error");
    }
    
    setSaving(false);
  };

  if (loading || !dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-700 font-medium">Načítavam...</span>
        </div>
      </div>
    );
  }

  if (!dataLoaded && !isNew) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Položka nenájdená
          </h2>
          <p className="text-gray-600">Požadovaný záznam sa nenašiel v databáze.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {isNew
                  ? "Pridať nový Lectio zdroj"
                  : `Upraviť Lectio zdroj: ${formData.kniha} ${formData.kapitola}`}
              </h1>
              <p className="text-gray-600">
                {isNew ? "Vytvorte nový zdrojový obsah" : "Upravte existujúci zdroj"}
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
            <div className="text-4xl">
              {isNew ? "✨" : "📝"}
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
          {/* Základné informácie */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <span className="text-2xl mr-3">📝</span>
              <h2 className="text-xl font-semibold text-gray-800">Základné informácie</h2>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Jazyk <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="lang"
                    value={formData.lang || appLang}
                    onChange={(e) => updateFormField('lang', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="sk">🇸🇰 Slovenčina</option>
                    <option value="cz">🇨🇿 Čeština</option>
                    <option value="en">🇬🇧 English</option>
                    <option value="es">🇪🇸 Español</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Liturgický rok
                  </label>
                  <select
                    name="rok"
                    value={formData.rok || "N"}
                    onChange={(e) => updateFormField('rok', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="N">-- Nie je zadané --</option>
                    <option value="A">📅 Rok A</option>
                    <option value="B">📅 Rok B</option>
                    <option value="C">📅 Rok C</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    ID číslo
                  </label>
                  <input
                    type="text"
                    name="id_cislo"
                    value={formData.id_cislo || ""}
                    onChange={(e) => updateFormField('id_cislo', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Identifikačné číslo..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Kniha <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="kniha"
                    value={formData.kniha || ""}
                    onChange={(e) => updateFormField('kniha', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Názov biblickej knihy..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Kapitola <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="kapitola"
                    value={formData.kapitola || ""}
                    onChange={(e) => updateFormField('kapitola', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Číslo kapitoly..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Súradnice Písma <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="suradnice_pismo"
                    value={formData.suradnice_pismo || ""}
                    onChange={(e) => updateFormField('suradnice_pismo', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="napr. Mt 5,1-12"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Nadpis <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hlava"
                  value={formData.hlava || ""}
                  onChange={(e) => updateFormField('hlava', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nadpis lectio..."
                  required
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
                      Biblický text {i}
                    </h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        Názov
                      </label>
                      <input
                        type="text"
                        name={`nazov_biblia_${i}`}
                        value={formData[`nazov_biblia_${i}` as keyof LectioSource] as string || ""}
                        onChange={(e) => updateFormField(`nazov_biblia_${i}`, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Názov biblického textu..."
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
                      <label className="block text-sm font-semibold text-gray-700">
                        Audio (URL)
                      </label>
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
          </div>

          {/* Hlavný obsah */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <span className="text-2xl mr-3">📖</span>
              <h2 className="text-xl font-semibold text-gray-800">Hlavný obsah lectio divina</h2>
            </div>
            
            <div className="space-y-8">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Lectio – text
                </label>
                <textarea
                  name="lectio_text"
                  value={formData.lectio_text || ""}
                  onChange={(e) => updateFormField('lectio_text', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Napíšte text pre Lectio..."
                  rows={12}
                  style={{ height: '18rem' }}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Meditatio – text
                </label>
                <textarea
                  name="meditatio_text"
                  value={formData.meditatio_text || ""}
                  onChange={(e) => updateFormField('meditatio_text', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Napíšte text pre Meditatio..."
                  rows={10}
                  style={{ height: '15rem' }}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Oratio – text
                </label>
                <textarea
                  name="oratio_text"
                  value={formData.oratio_text || ""}
                  onChange={(e) => updateFormField('oratio_text', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Napíšte text pre Oratio..."
                  rows={10}
                  style={{ height: '15rem' }}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Contemplatio – text
                </label>
                <textarea
                  name="contemplatio_text"
                  value={formData.contemplatio_text || ""}
                  onChange={(e) => updateFormField('contemplatio_text', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Napíšte text pre Contemplatio..."
                  rows={10}
                  style={{ height: '15rem' }}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Actio – text
                </label>
                <textarea
                  name="actio_text"
                  value={formData.actio_text || ""}
                  onChange={(e) => updateFormField('actio_text', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Napíšte text pre Actio..."
                  rows={10}
                  style={{ height: '15rem' }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Reference
                </label>
                <textarea
                  name="reference"
                  value={formData.reference || ""}
                  onChange={(e) => updateFormField('reference', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  placeholder="Odkazy a referencie..."
                  rows={6}
                  style={{ height: '9rem' }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Modlitba záver
                </label>
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
          </div>

          {/* Audio a médiá */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-6">
              <span className="text-2xl mr-3">🎵</span>
              <h2 className="text-xl font-semibold text-gray-800">Audio a médiá</h2>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">🎵</span>
                <h3 className="text-lg font-semibold text-gray-800">Audio súbory</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Lectio audio (URL)
                  </label>
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
                  <label className="block text-sm font-semibold text-gray-700">
                    Meditatio audio (URL)
                  </label>
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
                  <label className="block text-sm font-semibold text-gray-700">
                    Oratio audio (URL)
                  </label>
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
                  <label className="block text-sm font-semibold text-gray-700">
                    Contemplatio audio (URL)
                  </label>
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
                  <label className="block text-sm font-semibold text-gray-700">
                    Actio audio (URL)
                  </label>
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
          </div>

          {/* Save Button */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Ukladám...
                  </>
                ) : (
                  <>
                    <span className="mr-2">💾</span>
                    Uložiť
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