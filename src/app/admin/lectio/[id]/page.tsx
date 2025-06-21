"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  { ssr: false }
);

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

export default function LectioEditPage() {
  const supabase = useSupabaseClient();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { lang: appLang } = useLanguage();
  const t = translations[appLang];
  const isNew = id === "new";

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
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (isNew) return;
    const fetchLectio = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("lectio")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setLectio(data);
      setLoading(false);
    };
    fetchLectio();
  }, [id, supabase, isNew]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setLectio((old) => ({ ...old!, [e.target.name]: e.target.value }));
  };

  const handleEditorChange = (name: keyof Lectio, value: string) => {
    setLectio((old) => ({ ...old!, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setMessageType(null);
    
    if (!lectio) {
      setSaving(false);
      setMessage(t.save_error || "Chyba pri ukladaní");
      setMessageType("error");
      return;
    }
    
    if (isNew) {
      const { data, error } = await supabase
        .from("lectio")
        .insert([lectio])
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
        .update(lectio)
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

  const InputField = ({ 
    label, 
    name, 
    type = "text", 
    required = false, 
    placeholder = "", 
    rows = 3,
    value,
    onChange
  }: {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    rows?: number;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-vertical"
          placeholder={placeholder}
          rows={rows}
          required={required}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );

  const EditorField = ({ 
    label, 
    name, 
    value, 
    onChange, 
    height = 200 
  }: {
    label: string;
    name: keyof Lectio;
    value: string;
    onChange: (name: keyof Lectio, value: string) => void;
    height?: number;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">{label}</label>
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <Editor
          apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
          init={{
            height,
            plugins: "link image lists code paste table emoticons",
            toolbar: "undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | table | emoticons | code",
            menubar: false,
            paste_data_images: true,
            content_style: "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.6; }",
          }}
          value={value}
          onEditorChange={(val) => onChange(name, val)}
        />
      </div>
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

        <form onSubmit={handleSave} className="space-y-8">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors duration-200 ${
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
                    <InputField
                      label={t.hlava || "Nadpis"}
                      name="hlava"
                      value={lectio.hlava || ""}
                      onChange={handleChange}
                      required
                      placeholder="Zadajte nadpis lectio..."
                    />
                    <InputField
                      label={t.suradnice_pismo || "Súradnice Písma"}
                      name="suradnice_pismo"
                      value={lectio.suradnice_pismo || ""}
                      onChange={handleChange}
                      required
                      placeholder="napr. Mt 5,1-12"
                    />
                    <InputField
                      label={t.datum || "Dátum"}
                      name="datum"
                      type="date"
                      value={lectio.datum?.slice(0, 10) || ""}
                      onChange={handleChange}
                      required
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        {t.lang || "Jazyk"} <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="lang"
                        value={lectio.lang || appLang}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                    value={lectio.uvod || ""}
                    onChange={handleChange}
                    placeholder="Úvodný text pre lectio..."
                    rows={4}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label={t.uvod_audio || "Úvod - audio (URL)"}
                      name="uvod_audio"
                      type="url"
                      value={lectio.uvod_audio || ""}
                      onChange={handleChange}
                      placeholder="https://example.com/audio.mp3"
                    />
                    <InputField
                      label={t.video || "Video (URL)"}
                      name="video"
                      type="url"
                      value={lectio.video || ""}
                      onChange={handleChange}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              )}

              {/* Content Tab */}
              {activeTab === "content" && (
                <div className="space-y-8">
                  <EditorField
                    label={t.lectio_text || "Lectio – text"}
                    name="lectio_text"
                    value={lectio.lectio_text || ""}
                    onChange={handleEditorChange}
                    height={300}
                  />
                  
                  <EditorField
                    label={t.meditatio_text || "Meditatio – text"}
                    name="meditatio_text"
                    value={lectio.meditatio_text || ""}
                    onChange={handleEditorChange}
                    height={250}
                  />
                  
                  <EditorField
                    label={t.oratio_text || "Oratio – text"}
                    name="oratio_text"
                    value={lectio.oratio_text || ""}
                    onChange={handleEditorChange}
                    height={250}
                  />
                  
                  <EditorField
                    label={t.contemplatio_text || "Contemplatio – text"}
                    name="contemplatio_text"
                    value={lectio.contemplatio_text || ""}
                    onChange={handleEditorChange}
                    height={250}
                  />
                  
                  <EditorField
                    label={t.actio_text || "Actio – text"}
                    name="actio_text"
                    value={lectio.actio_text || ""}
                    onChange={handleEditorChange}
                    height={250}
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
                          value={String(lectio[`nazov_biblia_${i}` as keyof Lectio] ?? "")}
                          onChange={handleChange}
                          placeholder="Názov biblického textu..."
                        />
                        
                        <InputField
                          label={t[`biblia_${i}`] || "Text"}
                          name={`biblia_${i}`}
                          type="textarea"
                          value={String(lectio[`biblia_${i}` as keyof Lectio] ?? "")}
                          onChange={handleChange}
                          placeholder="Biblický text..."
                          rows={4}
                        />
                        
                        <InputField
                          label={t[`biblia_${i}_audio`] || "Audio (URL)"}
                          name={`biblia_${i}_audio`}
                          type="url"
                          value={String(lectio[`biblia_${i}_audio` as keyof Lectio] ?? "")}
                          onChange={handleChange}
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
                        value={lectio.lectio_audio || ""}
                        onChange={handleChange}
                        placeholder="https://example.com/lectio.mp3"
                      />
                      <InputField
                        label={t.meditatio_audio || "Meditatio audio (URL)"}
                        name="meditatio_audio"
                        type="url"
                        value={lectio.meditatio_audio || ""}
                        onChange={handleChange}
                        placeholder="https://example.com/meditatio.mp3"
                      />
                      <InputField
                        label={t.oratio_audio || "Oratio audio (URL)"}
                        name="oratio_audio"
                        type="url"
                        value={lectio.oratio_audio || ""}
                        onChange={handleChange}
                        placeholder="https://example.com/oratio.mp3"
                      />
                      <InputField
                        label={t.contemplatio_audio || "Contemplatio audio (URL)"}
                        name="contemplatio_audio"
                        type="url"
                        value={lectio.contemplatio_audio || ""}
                        onChange={handleChange}
                        placeholder="https://example.com/contemplatio.mp3"
                      />
                      <InputField
                        label={t.actio_audio || "Actio audio (URL)"}
                        name="actio_audio"
                        type="url"
                        value={lectio.actio_audio || ""}
                        onChange={handleChange}
                        placeholder="https://example.com/actio.mp3"
                      />
                      <InputField
                        label={t.audio_5_min || "Audio 5 minút (URL)"}
                        name="audio_5_min"
                        type="url"
                        value={lectio.audio_5_min || ""}
                        onChange={handleChange}
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
                          value={lectio.modlitba_uvod || ""}
                          onChange={handleChange}
                          placeholder="Úvodná modlitba..."
                          rows={3}
                        />
                        <InputField
                          label={t.modlitba_audio || "Modlitba audio (URL)"}
                          name="modlitba_audio"
                          type="url"
                          value={lectio.modlitba_audio || ""}
                          onChange={handleChange}
                          placeholder="https://example.com/modlitba.mp3"
                        />
                      </div>
                      
                      <InputField
                        label={t.modlitba_zaver || "Modlitba záver"}
                        name="modlitba_zaver"
                        type="textarea"
                        value={lectio.modlitba_zaver || ""}
                        onChange={handleChange}
                        placeholder="Záverečná modlitba..."
                        rows={3}
                      />
                      
                      <InputField
                        label={t.zaver || "Záver"}
                        name="zaver"
                        type="textarea"
                        value={lectio.zaver || ""}
                        onChange={handleChange}
                        placeholder="Záverečné slová..."
                        rows={3}
                      />
                      
                      <InputField
                        label={t.pozehnanie || "Požehnanie"}
                        name="pozehnanie"
                        type="textarea"
                        value={lectio.pozehnanie || ""}
                        onChange={handleChange}
                        placeholder="Záverečné požehnanie..."
                        rows={3}
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
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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