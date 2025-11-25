"use client";

import { ActionButton, EditPageHeader, FormSection } from "@/app/admin/components";
import { ArrowLeft, Calendar, Camera, Globe, Mail, Save, Shield, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface UserData {
  id?: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  provider?: string;
  created_at?: string;
  role?: string;
  variable_symbol?: string;
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
    <label className="admin-edit-label">
      {icon}
      {label} {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="admin-edit-input"
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
    <label className="admin-edit-label">
      {icon}
      {label}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="admin-edit-input"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {description && (
      <p className="text-xs text-gray-500">{description}</p>
    )}
  </div>
);

export default function UserEditPage() {

  const params = useParams();
  const router = useRouter();
  const id = params?.id ? String(params.id) : "";
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

  useEffect(() => {
    if (isNew) return;
    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/users/${id}`);
        if (response.ok) {
          const result = await response.json();
          setUser(result.user);
        } else {
          console.error('Failed to fetch user');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
      setLoading(false);
    };
    fetchUser();
  }, [id, isNew]);

  const handleChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setUser((old) => ({ ...old!, [e.target.name]: e.target.value }));
  }, []);

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

    try {
      if (isNew) {
        // For new users, we would need a POST endpoint - for now just show error
        setSaving(false);
        setMessage("Vytváranie nových používateľov zatiaľ nie je implementované");
        setMessageType("error");
        return;
      } else {
        const response = await fetch(`/api/admin/users/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(user),
        });

        setSaving(false);
        
        if (response.ok) {
          const result = await response.json();
          setMessage(result.message || "Zmeny boli úspešne uložené");
          setMessageType("success");
        } else {
          const errorResult = await response.json();
          setMessage(errorResult.error || "Chyba pri ukladaní");
          setMessageType("error");
        }
      }
    } catch (error) {
      setSaving(false);
      setMessage("Chyba pri komunikácii so serverom");
      setMessageType("error");
      console.error('Save error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#40467b]"></div>
          <span className="text-gray-700 font-medium">Načítavam používateľa...</span>
        </div>
      </div>
    );
  }

  if (!user && !isNew) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Používateľ nenájdený</h2>
          <p className="text-gray-600 mb-4">Požadovaný používateľ sa nenašiel v databáze.</p>
          <button
            onClick={() => router.back()}
            className="admin-edit-button-primary"
          >
            <ArrowLeft size={16} className="mr-2" />
            Späť
          </button>
        </div>
      </div>
    );
  }

  const getBackUrl = () => {
    const returnPage = localStorage.getItem('users_return_page');
    localStorage.removeItem('users_return_page');
    if (returnPage) {
      return `/admin/users?page=${returnPage}`;
    }
    return '/admin/users';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <EditPageHeader
          title={isNew ? "Pridať používateľa" : `Upraviť používateľa`}
          description={isNew ? "Vytvorte nový používateľský účet" : `Upravte údaje používateľa ${user.email}`}
          icon={User}
          backUrl={getBackUrl()}
          emoji={isNew ? "➕" : "✏️"}
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

        <form onSubmit={handleSave} className="space-y-8">
              {/* Basic Information */}
              <FormSection title="Základné informácie" icon={User}>
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

                  <InputField
                    label="Variabilný symbol"
                    name="variable_symbol"
                    value={user.variable_symbol || ""}
                    onChange={handleChange}
                    placeholder="napr. 123456"
                    icon={<span className="font-bold text-blue-600">VS</span>}
                    description="Pre párovanie bankových platieb (trvalé príkazy)"
                  />
                </div>
              </FormSection>

              {/* Account Settings */}
              <FormSection title="Nastavenia účtu" icon={Shield}>
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
              </FormSection>

              {/* Additional Info */}
              {!isNew && user.created_at && (
                <FormSection title="Dodatočné informácie" icon={Calendar}>
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
                </FormSection>
              )}

              {/* Save Button */}
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Zrušiť
                </button>
                
                <ActionButton
                  icon={Save}
                  variant="primary"
                  loading={saving}
                >
                  {isNew ? "Vytvoriť používateľa" : "Uložiť zmeny"}
                </ActionButton>
              </div>
        </form>
      </div>
    </div>
  );
}