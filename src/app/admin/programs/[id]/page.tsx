"use client";

import { useEffect, useState, useRef } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import { useFileUpload } from "@/app/hooks/useFileUpload";
import { 
  Play, Upload, FileText, BookOpen, Eye, Heart, 
  Star, Globe, Calendar, Video, Users,
  Save, ArrowLeft, Image as ImageIcon, Settings, Clock
} from "lucide-react";

interface Program {
  id?: string;
  created_at?: string;
  updated_at?: string;
  title: string;
  slug: string;
  category: string;
  description?: string;
  image_url?: string;
  author?: string;
  lang: string;
  total_sessions: number;
  total_duration_minutes: number;
  is_featured: boolean;
  is_published: boolean;
  display_order: number;
  published_at?: string;
}

interface ProgramCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

const LANGUAGE_OPTIONS = [
  { value: "sk" as const, label: "Slovenčina", flag: "🇸🇰" },
  { value: "cz" as const, label: "Čeština", flag: "🇨🇿" },
  { value: "en" as const, label: "English", flag: "🇺🇸" },
  { value: "es" as const, label: "Español", flag: "🇪🇸" },
];

export default function ProgramEditPage() {
  const { supabase } = useSupabase();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { lang: appLang } = useLanguage();
  const t = translations[appLang];
  const isNew = id === "new";

  // Použijeme refs namiesto controlled stavu pre textové polia
  const formRef = useRef<HTMLFormElement>(null);

  const [program, setProgram] = useState<Program | null>(
    isNew
      ? {
          title: "",
          slug: "",
          category: "featured",
          description: "",
          image_url: "",
          author: "",
          lang: appLang,
          total_sessions: 0,
          total_duration_minutes: 0,
          is_featured: false,
          is_published: false,
          display_order: 0,
        }
      : null
  );

  const [categories, setCategories] = useState<ProgramCategory[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  // File upload hook
  const { uploadFile, isUploading, error: uploadError, clearError } = useFileUpload();

  // Fetch kategórie
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("program_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");
      
      if (!error && data) {
        setCategories(data);
      }
    };
    fetchCategories();
  }, [supabase]);

  // Fetch program pre edit
  useEffect(() => {
    if (isNew) return;
    
    const fetchProgram = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("id", id)
        .single();
      
      if (!error && data) {
        setProgram(data);
      } else {
        setMessage("Program sa nenašiel");
        setMessageType("error");
      }
      setLoading(false);
    };
    
    fetchProgram();
  }, [id, supabase, isNew]);

  // Generuj slug z titulu
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // odstráň diakritiku
      .replace(/[^a-z0-9\s-]/g, "") // len písmená, čísla, medzery a pomlčky
      .replace(/\s+/g, "-") // medzery na pomlčky
      .replace(/-+/g, "-") // viacero pomlčiek na jednu
      .replace(/^-|-$/g, ""); // odstráň pomlčky na začiatku/konci
  };

  // Získa aktuálne hodnoty z formulára
  const getFormData = () => {
    if (!formRef.current) return null;
    
    const formData = new FormData(formRef.current);
    const data: Partial<Program> = {};
    
    for (const [key, value] of formData.entries()) {
      if (key === 'is_featured' || key === 'is_published') {
        (data as any)[key] = value === 'on';
      } else if (key === 'display_order') {
        (data as any)[key] = parseInt(value as string) || 0;
      } else {
        (data as any)[key] = value;
      }
    }
    
    // Ak sa title zmenil, aktualizuj slug
    if (data.title && data.title !== program?.title) {
      data.slug = generateSlug(data.title);
    }
    
    return data;
  };

  // Upload súboru do Supabase Storage
  const handleFileUpload = async (file: File, inputName: string) => {
    try {
      clearError();
      const result = await uploadFile(supabase, file, 'image');
      
      if (result.success && formRef.current) {
        const input = formRef.current.querySelector(`input[name="${inputName}"]`) as HTMLInputElement;
        if (input) {
          input.value = result.url;
          // Update the program state to show preview
          setProgram(prev => prev ? { ...prev, [inputName]: result.url } : null);
        }
        setMessage("Obrázok bol úspešne nahraný");
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

    const formData = getFormData();
    if (!formData) {
      setSaving(false);
      setMessage("Chyba pri ukladaní");
      setMessageType("error");
      return;
    }

    try {
      if (isNew) {
        const { data, error } = await supabase
          .from("programs")
          .insert([formData])
          .select("id")
          .single();
        
        if (!error && data?.id) {
          setMessage("Program bol úspešne vytvorený");
          setMessageType("success");
          setTimeout(() => {
            router.replace(`/admin/programs/${data.id}`);
          }, 1000);
        } else {
          throw new Error(error?.message || "Chyba pri vytváraní");
        }
      } else {
        const { error } = await supabase
          .from("programs")
          .update(formData)
          .eq("id", id);
        
        if (error) {
          throw new Error(error.message);
        }
        
        setMessage("Program bol úspešne aktualizovaný");
        setMessageType("success");
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage(error instanceof Error ? error.message : "Chyba pri ukladaní");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-700 font-medium">Načítavam...</span>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Program nenájdený
          </h2>
          <p className="text-gray-600 mb-4">Požadovaný program sa nenašiel v databáze.</p>
          <button
            onClick={() => router.push('/admin/programs')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Späť na zoznam
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "basic", label: "Základné informácie", icon: <FileText size={16} /> },
    { id: "content", label: "Obsah a popis", icon: <BookOpen size={16} /> },
    { id: "media", label: "Obrázky a médiá", icon: <ImageIcon size={16} /> },
    { id: "settings", label: "Nastavenia", icon: <Settings size={16} /> },
  ];

  // Uncontrolled input field
  const InputField = ({ 
    label, 
    name, 
    type = "text", 
    required = false, 
    placeholder = "", 
    rows = 3,
    defaultValue = "",
    icon,
    description,
    onChange
  }: {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    rows?: number;
    defaultValue?: string;
    icon?: React.ReactNode;
    description?: string;
    onChange?: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-700">
        <div className="flex items-center gap-2">
          {icon}
          {label} {required && <span className="text-red-500">*</span>}
        </div>
      </label>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      {type === "textarea" ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder={placeholder}
          rows={rows}
          required={required}
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
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
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/admin/programs')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Play size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {isNew
                    ? "Pridať nový Program"
                    : `Upraviť: ${program.title}`
                  }
                </h1>
                <p className="text-gray-600">
                  {isNew ? "Vytvorte nový program alebo kurz" : "Upravte existujúci program"}
                </p>
              </div>
            </div>
            
            {/* Quick stats */}
            {!isNew && (
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{program.total_sessions}</div>
                  <div className="text-gray-500">Lekcií</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.floor(program.total_duration_minutes / 60)}h {program.total_duration_minutes % 60}m
                  </div>
                  <div className="text-gray-500">Dĺžka</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{program.is_published ? "✅" : "⏳"}</div>
                  <div className="text-gray-500">Stav</div>
                </div>
              </div>
            )}
          </div>
        </div>

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
                        ? "border-blue-500 text-blue-600"
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
                    <InputField
                      label="Názov programu"
                      name="title"
                      defaultValue={program.title || ""}
                      required
                      placeholder="Zadajte názov programu..."
                      icon={<Play size={16} />}
                      onChange={(value) => {
                        // Automaticky generuj slug
                        if (formRef.current) {
                          const slugInput = formRef.current.querySelector('input[name="slug"]') as HTMLInputElement;
                          if (slugInput && isNew) {
                            slugInput.value = generateSlug(value);
                          }
                        }
                      }}
                    />
                    <InputField
                      label="Slug (URL identifikátor)"
                      name="slug"
                      defaultValue={program.slug || ""}
                      required
                      placeholder="automaticky-generovany-slug"
                      icon={<Globe size={16} />}
                      description="URL-friendly identifikátor programu"
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">
                        <div className="flex items-center gap-2">
                          <BookOpen size={16} />
                          Kategória <span className="text-red-500">*</span>
                        </div>
                      </label>
                      <select
                        name="category"
                        defaultValue={program.category || "featured"}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        {categories.map(k => (
                          <option key={k.id} value={k.slug}>
                            {k.name} - {k.description}
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
                        defaultValue={program.lang || appLang}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {LANGUAGE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.flag} {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <InputField
                    label="Autor"
                    name="author"
                    defaultValue={program.author || ""}
                    placeholder="Meno autora programu..."
                    icon={<Users size={16} />}
                    description="Autor alebo tvorca tohto programu"
                  />
                </div>
              )}

              {/* Content Tab */}
              {activeTab === "content" && (
                <div className="space-y-6">
                  <InputField
                    label="Popis programu"
                    name="description"
                    type="textarea"
                    defaultValue={program.description || ""}
                    placeholder="Podrobný popis programu, jeho cieľa a obsahu..."
                    rows={6}
                    icon={<FileText size={16} />}
                    description="Detailný popis toho, čo program obsahuje a komu je určený"
                  />

                  <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center mb-4">
                      <Video size={20} className="mr-3 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Obsah programu</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Počet lekcií:</span>
                        <p className="text-gray-600">{program.total_sessions || 0}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Celková dĺžka:</span>
                        <p className="text-gray-600">
                          {program.total_duration_minutes 
                            ? `${Math.floor(program.total_duration_minutes / 60)}h ${program.total_duration_minutes % 60}min`
                            : '0min'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-gray-600">
                        Lekcie a ich obsah sa spravujú v sekcii &quot;Spravovať lekcie&quot; po uložení programu.
                      </p>
                      {!isNew && (
                        <button
                          type="button"
                          onClick={() => router.push(`/admin/programs/${id}/sessions`)}
                          className="mt-3 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <Video size={16} className="mr-2" />
                          Spravovať lekcie
                        </button>
                      )}
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
                      <h3 className="text-lg font-semibold text-gray-800">Hlavný obrázok programu</h3>
                    </div>
                    <div className="space-y-4">
                      <InputField
                        label="URL obrázka"
                        name="image_url"
                        type="url"
                        defaultValue={program.image_url || ""}
                        placeholder="https://example.com/image.jpg"
                        description="URL adresa obrázka alebo nahrajte súbor nižšie"
                      />
                      
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
                              await handleFileUpload(file, 'image_url');
                              e.target.value = ''; // Reset input
                            }
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={isUploading}
                        />
                        {isUploading && (
                          <p className="text-sm text-blue-600 mt-2">Nahrávam obrázok...</p>
                        )}
                      </div>

                      {program.image_url && (
                        <div className="mt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Náhľad:</p>
                          <img 
                            src={program.image_url} 
                            alt="Náhľad" 
                            className="w-48 h-32 object-cover rounded-lg border border-gray-200"
                          />
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
                      <Settings size={20} className="mr-3 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Všeobecné nastavenia</h3>
                    </div>
                    <div className="space-y-4">
                      <InputField
                        label="Poradie zoradenia"
                        name="display_order"
                        type="number"
                        defaultValue={program.display_order?.toString() || "0"}
                        placeholder="0"
                        description="Poradie zoradenia (menšie číslo = vyššie)"
                      />
                    </div>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                    <div className="flex items-center mb-4">
                      <Star size={20} className="mr-3 text-yellow-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Špeciálne označenia</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="is_featured"
                          defaultChecked={program.is_featured || false}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Odporúčaný program (Featured)
                          </label>
                          <p className="text-xs text-gray-500">
                            Program bude zvýraznený a zobrazovaný v sekcii odporúčaných
                          </p>
                        </div>
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
                        name="is_published"
                        defaultChecked={program.is_published || false}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Publikovať program
                        </label>
                        <p className="text-xs text-gray-500">
                          Označte, ak má byť program viditeľný pre používateľov v aplikácii
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
                          {program.created_at 
                            ? new Date(program.created_at).toLocaleDateString('sk-SK', {
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
                          {program.updated_at 
                            ? new Date(program.updated_at).toLocaleDateString('sk-SK', {
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
                onClick={() => router.push('/admin/programs')}
                className="inline-flex items-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                <ArrowLeft size={16} className="mr-2" />
                Späť na zoznam
              </button>
              
              <div className="flex items-center gap-4">
                {!isNew && (
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/programs/${id}/sessions`)}
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <Video size={16} className="mr-2" />
                    Spravovať lekcie
                  </button>
                )}
                
                <button
                  type="submit"
                  disabled={saving || isUploading}
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      {isNew ? 'Vytvoriť program' : 'Uložiť zmeny'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}