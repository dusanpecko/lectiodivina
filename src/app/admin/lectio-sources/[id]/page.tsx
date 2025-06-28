"use client";

import { useEffect, useState, useRef } from "react";
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
}

export default function LectioSourceEditPage() {
  const { supabase } = useSupabase();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { lang: appLang } = useLanguage();
  const t = translations[appLang];
  const isNew = id === "new";

  // Použijeme refs namiesto controlled stavu pre textové polia
  const formRef = useRef<HTMLFormElement>(null);
  
  const [lectioSource, setLectioSource] = useState<LectioSource | null>(
    isNew
      ? {
          lang: appLang,
          kniha: "",
          kapitola: "",
          hlava: "",
          suradnice_pismo: "",
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
        }
      : null
  );
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (isNew) return;
    const fetchLectioSource = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("lectio_sources")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) {
        setLectioSource(data);
      }
      setLoading(false);
    };
    fetchLectioSource();
  }, [id, supabase, isNew]);

  // Získa aktuálne hodnoty z formulára
  const getFormData = () => {
    if (!formRef.current) return null;
    
    const formData = new FormData(formRef.current);
    const data: Partial<LectioSource> = {};
    
    for (const [key, value] of formData.entries()) {
      (data as any)[key] = value;
    }
    
    return data;
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
        .from("lectio_sources")
        .insert([formData])
        .select("id")
        .single();
      setSaving(false);
      if (!error && data?.id) {
        setMessage(t.save_success || "Úspešne uložené");
        setMessageType("success");
        router.replace(`/admin/lectio-sources/${data.id}`);
      } else {
        setMessage(
          (error?.message ? error.message + " " : "") +
            (t.save_error || "Chyba pri ukladaní")
        );
        setMessageType("error");
      }
    } else {
      const { error } = await supabase
        .from("lectio_sources")
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

  if (!lectioSource) {
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
                  ? "Pridať nový Lectio zdroj"
                  : `Upraviť Lectio zdroj: ${lectioSource.kniha} ${lectioSource.kapitola}`}
              </h1>
              <p className="text-gray-600">
                {isNew ? "Vytvorte nový zdrojový obsah" : "Upravte existujúci zdroj"}
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
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
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
                        {t.lang || "Jazyk"} <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="lang"
                        defaultValue={lectioSource.lang || appLang}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="sk">🇸🇰 Slovenčina</option>
                        <option value="cz">🇨🇿 Čeština</option>
                        <option value="en">🇬🇧 English</option>
                        <option value="es">🇪🇸 Español</option>
                      </select>
                    </div>
                    <InputField
                      label="Kniha"
                      name="kniha"
                      defaultValue={lectioSource.kniha || ""}
                      required
                      placeholder="Názov biblickej knihy..."
                    />
                    <InputField
                      label="Kapitola"
                      name="kapitola"
                      defaultValue={lectioSource.kapitola || ""}
                      required
                      placeholder="Číslo kapitoly..."
                    />
                    <InputField
                      label={t.suradnice_pismo || "Súradnice Písma"}
                      name="suradnice_pismo"
                      defaultValue={lectioSource.suradnice_pismo || ""}
                      required
                      placeholder="napr. Mt 5,1-12"
                    />
                  </div>
                  
                  <InputField
                    label={t.hlava || "Nadpis"}
                    name="hlava"
                    defaultValue={lectioSource.hlava || ""}
                    required
                    placeholder="Nadpis lectio..."
                  />
                </div>
              )}

              {/* Content Tab */}
              {activeTab === "content" && (
                <div className="space-y-8">
                  <InputField
                    label={t.lectio_text || "Lectio – text"}
                    name="lectio_text"
                    type="textarea"
                    defaultValue={lectioSource.lectio_text || ""}
                    placeholder="Napíšte text pre Lectio..."
                    rows={12}
                  />
                  
                  <InputField
                    label={t.meditatio_text || "Meditatio – text"}
                    name="meditatio_text"
                    type="textarea"
                    defaultValue={lectioSource.meditatio_text || ""}
                    placeholder="Napíšte text pre Meditatio..."
                    rows={10}
                  />
                  
                  <InputField
                    label={t.oratio_text || "Oratio – text"}
                    name="oratio_text"
                    type="textarea"
                    defaultValue={lectioSource.oratio_text || ""}
                    placeholder="Napíšte text pre Oratio..."
                    rows={10}
                  />
                  
                  <InputField
                    label={t.contemplatio_text || "Contemplatio – text"}
                    name="contemplatio_text"
                    type="textarea"
                    defaultValue={lectioSource.contemplatio_text || ""}
                    placeholder="Napíšte text pre Contemplatio..."
                    rows={10}
                  />
                  
                  <InputField
                    label={t.actio_text || "Actio – text"}
                    name="actio_text"
                    type="textarea"
                    defaultValue={lectioSource.actio_text || ""}
                    placeholder="Napíšte text pre Actio..."
                    rows={10}
                  />

                  <InputField
                    label={t.modlitba_zaver || "Modlitba záver"}
                    name="modlitba_zaver"
                    type="textarea"
                    defaultValue={lectioSource.modlitba_zaver || ""}
                    placeholder="Záverečná modlitba..."
                    rows={4}
                  />
                </div>
              )}

              {/* Bible Tab */}
              {activeTab === "bible" && (
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
                          defaultValue={String(lectioSource[`nazov_biblia_${i}` as keyof LectioSource] ?? "")}
                          placeholder="Názov biblického textu..."
                        />
                        
                        <InputField
                          label={t[`biblia_${i}`] || "Text"}
                          name={`biblia_${i}`}
                          type="textarea"
                          defaultValue={String(lectioSource[`biblia_${i}` as keyof LectioSource] ?? "")}
                          placeholder="Biblický text..."
                          rows={4}
                        />
                        
                        <InputField
                          label={t[`biblia_${i}_audio`] || "Audio (URL)"}
                          name={`biblia_${i}_audio`}
                          type="url"
                          defaultValue={String(lectioSource[`biblia_${i}_audio` as keyof LectioSource] ?? "")}
                          placeholder="https://example.com/audio.mp3"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Audio Tab */}
              {activeTab === "audio" && (
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
                        defaultValue={lectioSource.lectio_audio || ""}
                        placeholder="https://example.com/lectio.mp3"
                      />
                      <InputField
                        label={t.meditatio_audio || "Meditatio audio (URL)"}
                        name="meditatio_audio"
                        type="url"
                        defaultValue={lectioSource.meditatio_audio || ""}
                        placeholder="https://example.com/meditatio.mp3"
                      />
                      <InputField
                        label={t.oratio_audio || "Oratio audio (URL)"}
                        name="oratio_audio"
                        type="url"
                        defaultValue={lectioSource.oratio_audio || ""}
                        placeholder="https://example.com/oratio.mp3"
                      />
                      <InputField
                        label={t.contemplatio_audio || "Contemplatio audio (URL)"}
                        name="contemplatio_audio"
                        type="url"
                        defaultValue={lectioSource.contemplatio_audio || ""}
                        placeholder="https://example.com/contemplatio.mp3"
                      />
                      <InputField
                        label={t.actio_audio || "Actio audio (URL)"}
                        name="actio_audio"
                        type="url"
                        defaultValue={lectioSource.actio_audio || ""}
                        placeholder="https://example.com/actio.mp3"
                      />
                      <InputField
                        label={t.audio_5_min || "Audio 5 minút (URL)"}
                        name="audio_5_min"
                        type="url"
                        defaultValue={lectioSource.audio_5_min || ""}
                        placeholder="https://example.com/5min.mp3"
                      />
                    </div>
                  </div>
                </div>
              )}
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
      </div>
    </div>
  );
}