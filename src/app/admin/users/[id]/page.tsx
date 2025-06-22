"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { useParams, useRouter } from "next/navigation";
import { User, Mail, Shield, Calendar, Camera, Globe, Save, ArrowLeft, Eye, AlertCircle } from "lucide-react";

interface UserData {
  id?: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  provider?: string;
  created_at?: string;
  role?: string;
}

export default function UserEditPage() {
  const { supabase } = useSupabase();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [user, setUser] = useState<UserData>(
    isNew
      ? { role: "user", provider: "email" }
      : {}
  );
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (isNew) return;
    const fetchUser = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) setUser(data);
      setLoading(false);
    };
    fetchUser();
  }, [id, supabase, isNew]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setUser((old) => ({ ...old!, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setMessageType(null);

    if (!user || !user.email) {
      setSaving(false);
      setMessage("Email je povinný");
      setMessageType("error");
      return;
    }

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user.email)) {
      setSaving(false);
      setMessage("Zadajte platný email");
      setMessageType("error");
      return;
    }

    if (isNew) {
      const { data, error } = await supabase
        .from("users")
        .insert([user])
        .select("id")
        .single();
      setSaving(false);
      if (!error && data?.id) {
        setMessage("Používateľ bol úspešne vytvorený");
        setMessageType("success");
        router.replace(`/admin/users/${data.id}`);
      } else {
        setMessage((error?.message ? error.message + " " : "") + "Chyba pri vytváraní používateľa");
        setMessageType("error");
      }
    } else {
      const { error } = await supabase
        .from("users")
        .update(user)
        .eq("id", id);
      setSaving(false);
      setMessage(error ? "Chyba pri ukladaní" : "Zmeny boli úspešne uložené");
      setMessageType(error ? "error" : "success");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="text-gray-700 font-medium">Načítavam používateľa...</span>
        </div>
      </div>
    );
  }

  if (!user && !isNew) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Používateľ nenájdený</h2>
          <p className="text-gray-600 mb-4">Požadovaný používateľ sa nenašiel v databáze.</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            <ArrowLeft size={16} className="mr-2" />
            Späť
          </button>
        </div>
      </div>
    );
  }

  const InputField = ({ 
    label, 
    name, 
    type = "text", 
    required = false, 
    placeholder = "", 
    value,
    onChange,
    icon,
    description
  }: {
    label: string;
    name: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    icon?: React.ReactNode;
    description?: string;
  }) => (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-semibold text-gray-700">
        {icon && <span className="mr-2">{icon}</span>}
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
        placeholder={placeholder}
        required={required}
      />
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );

  const SelectField = ({ 
    label, 
    name, 
    value,
    onChange,
    options,
    icon,
    description
  }: {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: { value: string; label: string; icon?: string }[];
    icon?: React.ReactNode;
    description?: string;
  }) => (
    <div className="space-y-2">
      <label className="flex items-center text-sm font-semibold text-gray-700">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.icon && `${option.icon} `}{option.label}
          </option>
        ))}
      </select>
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
    </div>
  );

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-700 border-red-200', icon: '👑', label: 'Administrátor' },
      moderator: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: '🛡️', label: 'Moderátor' },
      editor: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '✏️', label: 'Editor' },
      user: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '👤', label: 'Používateľ' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getProviderBadge = (provider: string) => {
    const providerConfig = {
      google: { color: 'bg-red-50 text-red-700', icon: '🔴', label: 'Google' },
      facebook: { color: 'bg-blue-50 text-blue-700', icon: '🔵', label: 'Facebook' },
      github: { color: 'bg-gray-50 text-gray-700', icon: '⚫', label: 'GitHub' },
      email: { color: 'bg-green-50 text-green-700', icon: '✉️', label: 'Email' },
    };

    const config = providerConfig[provider as keyof typeof providerConfig] || { color: 'bg-gray-50 text-gray-700', icon: '❓', label: provider || 'Neznámy' };
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const UserPreview = () => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Eye size={20} className="mr-2" />
            Náhľad používateľa
          </h3>
          <button
            type="button"
            onClick={() => setPreviewMode(false)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            {user.avatar_url ? (
              <img 
                src={user.avatar_url} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center border-4 border-purple-200">
                <User size={32} className="text-purple-600" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {user.full_name || "Bez mena"}
            </h2>
            <p className="text-gray-600 mb-4 flex items-center">
              <Mail size={16} className="mr-2" />
              {user.email || "email@example.com"}
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-600">Rola:</span>
                {getRoleBadge(user.role || 'user')}
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-600">Provider:</span>
                {getProviderBadge(user.provider || 'email')}
              </div>
              
              {user.created_at && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-600">Vytvorené:</span>
                  <span className="text-sm text-gray-700 flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {new Date(user.created_at).toLocaleDateString('sk-SK')}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <span className="mr-3">{isNew ? "➕" : "✏️"}</span>
                {isNew ? "Pridať používateľa" : `Upraviť používateľa`}
              </h1>
              <p className="text-gray-600 flex items-center">
                <span className="mr-2">👤</span>
                {isNew ? "Vytvorte nový používateľský účet" : `Upravte údaje používateľa ${user.email}`}
              </p>
            </div>
            
            {!isNew && (
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition-colors duration-200"
              >
                <Eye size={18} className="mr-2" />
                {previewMode ? "Skryť náhľad" : "Zobraziť náhľad"}
              </button>
            )}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="space-y-6">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <User size={20} className="mr-2" />
                  Základné informácie
                </h2>
                
                <div className="space-y-4">
                  <InputField
                    label="Email adresa"
                    name="email"
                    type="email"
                    value={user.email || ""}
                    onChange={handleChange}
                    required
                    placeholder="user@example.com"
                    icon={<Mail size={16} />}
                    description="Primárna emailová adresa používateľa"
                  />
                  
                  <InputField
                    label="Celé meno"
                    name="full_name"
                    value={user.full_name || ""}
                    onChange={handleChange}
                    placeholder="Ján Novák"
                    icon={<User size={16} />}
                    description="Zobrazované meno používateľa"
                  />
                  
                  <InputField
                    label="URL avatara"
                    name="avatar_url"
                    type="url"
                    value={user.avatar_url || ""}
                    onChange={handleChange}
                    placeholder="https://example.com/avatar.jpg"
                    icon={<Camera size={16} />}
                    description="Odkaz na profilový obrázok"
                  />
                </div>
              </div>

              {/* Account Settings */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <Shield size={20} className="mr-2" />
                  Nastavenia účtu
                </h2>
                
                <div className="space-y-4">
                  <SelectField
                    label="Rola používateľa"
                    name="role"
                    value={user.role || "user"}
                    onChange={handleChange}
                    icon={<Shield size={16} />}
                    description="Určuje oprávnenia používateľa v systéme"
                    options={[
                      { value: "user", label: "Používateľ", icon: "👤" },
                      { value: "editor", label: "Editor", icon: "✏️" },
                      { value: "moderator", label: "Moderátor", icon: "🛡️" },
                      { value: "admin", label: "Administrátor", icon: "👑" },
                    ]}
                  />
                  
                  <SelectField
                    label="Provider prihlásenia"
                    name="provider"
                    value={user.provider || "email"}
                    onChange={handleChange}
                    icon={<Globe size={16} />}
                    description="Spôsob ako sa používateľ prihlasuje"
                    options={[
                      { value: "email", label: "Email", icon: "✉️" },
                      { value: "google", label: "Google", icon: "🔴" },
                      { value: "facebook", label: "Facebook", icon: "🔵" },
                      { value: "github", label: "GitHub", icon: "⚫" },
                    ]}
                  />
                </div>
              </div>

              {/* Additional Info */}
              {!isNew && user.created_at && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <Calendar size={20} className="mr-2" />
                    Dodatočné informácie
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">ID používateľa:</span>
                      <span className="text-sm text-gray-900 font-mono">{user.id}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">Dátum vytvorenia:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(user.created_at).toLocaleDateString('sk-SK', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-600">Aktuálny status:</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        Aktívny
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    <ArrowLeft size={18} className="mr-2" />
                    Zrušiť
                  </button>
                  
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Ukladám...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        {isNew ? "Vytvoriť používateľa" : "Uložiť zmeny"}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            {previewMode || isNew ? (
              <UserPreview />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-dashed border-gray-200">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👁️</div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Náhľad používateľa</h3>
                  <p className="text-gray-500 mb-4">
                    Kliknite na "Zobraziť náhľad" pre zobrazenie ako bude profil vyzerať
                  </p>
                  <button
                    type="button"
                    onClick={() => setPreviewMode(true)}
                    className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition-colors duration-200"
                  >
                    <Eye size={18} className="mr-2" />
                    Zobraziť náhľad
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}