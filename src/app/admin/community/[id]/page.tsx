"use client";

import { useSupabase } from "@/app/components/SupabaseProvider"; // ← ZMENA: náš provider
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
// import { useLanguage } from "@/app/components/LanguageProvider";
// import { translations } from "@/app/i18n";
import ActionButton from "@/app/admin/components/ActionButton";
import EditPageHeader from "@/app/admin/components/EditPageHeader";
import FormSection from "@/app/admin/components/FormSection";
import {
  Calendar,
  Lightbulb,
  Mail,
  MessageCircle,
  Save,
  TestTube,
  Trash2,
  User
} from "lucide-react";
import Link from "next/link";

interface CommunityMember {
  id: string;
  created_at: string;
  name: string;
  email: string;
  message: string | null;
  want_testing: boolean;
  want_newsletter: boolean;
  has_idea: boolean;
  updated_at: string;
}

export default function CommunityDetailPage() {
  const { supabase } = useSupabase(); // ← ZMENA: náš provider namiesto useSupabaseClient
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // const { lang: appLang } = useLanguage();
  // const t = translations[appLang]; // TODO: implementovať prekladové texty

  const [member, setMember] = useState<CommunityMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  
  // Editovateľné polia
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<CommunityMember>>({});

  useEffect(() => {
    const fetchMember = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("community_members")
        .select("*")
        .eq("id", id)
        .single();
      
      if (!error && data) {
        setMember(data);
        setEditData(data);
      } else {
        setMessage("Člen komunity nebol nájdený");
        setMessageType("error");
      }
      setLoading(false);
    };
    
    fetchMember();
  }, [id, supabase]);

  const handleSave = async () => {
    if (!member || !editData) return;
    
    setSaving(true);
    setMessage(null);
    setMessageType(null);
    
    const { error } = await supabase
      .from("community_members")
      .update({
        name: editData.name,
        email: editData.email,
        message: editData.message,
        want_testing: editData.want_testing,
        want_newsletter: editData.want_newsletter,
        has_idea: editData.has_idea,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);
    
    setSaving(false);
    
    if (!error) {
      setMember({ ...member, ...editData });
      setEditMode(false);
      setMessage("Údaje boli úspešne uložené");
      setMessageType("success");
    } else {
      setMessage("Chyba pri ukladaní údajov");
      setMessageType("error");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Naozaj chcete vymazať tohto člena komunity? Táto akcia sa nedá vrátiť späť.")) {
      return;
    }
    
    setDeleting(true);
    const { error } = await supabase
      .from("community_members")
      .delete()
      .eq("id", id);
    
    if (!error) {
      router.push("/admin/community");
    } else {
      setMessage("Chyba pri vymazávaní člena");
      setMessageType("error");
      setDeleting(false);
    }
  };

  const handleEditChange = (field: keyof CommunityMember, value: string | boolean | null) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const getBackUrl = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('admin-community-page');
      return stored || '/admin/community';
    }
    return '/admin/community';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-3 border-[#40467b] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600">Načítavam...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-800 mb-2">Člen nenájdený</h2>
            <p className="text-gray-600 mb-6">Požadovaný člen komunity nebol nájdený.</p>
            <Link href="/admin/community">
              <button className="admin-edit-button-primary">
                Späť na zoznam
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hlavička na celú šírku */}
        <EditPageHeader
          title="Detail člena komunity"
          description={member.name}
          icon={User}
          emoji="👤"
          backUrl={getBackUrl()}
        />

        {/* Notifikácie */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            messageType === "error" 
              ? "bg-red-50 border border-red-200 text-red-700" 
              : "bg-green-50 border border-green-200 text-green-700"
          }`}>
            {message}
          </div>
        )}

        {/* Sekcie s medzerami */}
        <div className="space-y-6">
          {/* Kontaktné údaje */}
          <FormSection title="Kontaktné údaje" icon={User}>
          <div className="space-y-6">
            {/* Meno a email na vrchu */}
            <div className="bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <div className="text-xl font-bold">{member.name}</div>
                  <div className="text-gray-100">{member.email}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Základné informácie */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Základné informácie
                </h3>
                
                <div>
                  <label className="admin-edit-label">
                    <User size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Meno
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editData.name || ""}
                      onChange={(e) => handleEditChange("name", e.target.value)}
                      className="admin-edit-input"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <User size={16} className="text-gray-400" />
                      <span className="text-gray-800">{member.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="admin-edit-label">
                    <Mail size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Email
                  </label>
                  {editMode ? (
                    <input
                      type="email"
                      value={editData.email || ""}
                      onChange={(e) => handleEditChange("email", e.target.value)}
                      className="admin-edit-input"
                    />
                  ) : (
                    <div className="flex items-center gap-2 mt-2">
                      <Mail size={16} className="text-gray-400" />
                      <a 
                        href={`mailto:${member.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {member.email}
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <label className="admin-edit-label">
                    <Calendar size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Dátum registrácie
                  </label>
                  <div className="flex items-center gap-2 mt-2 text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>
                      {new Date(member.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="admin-edit-label">
                    <Calendar size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    Posledná aktualizácia
                  </label>
                  <div className="flex items-center gap-2 mt-2 text-gray-600">
                    <Calendar size={16} className="text-gray-400" />
                    <span>
                      {new Date(member.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Záujmy */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Záujmy a preferencie
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <label className="admin-edit-label">
                      <TestTube size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                      Chce testovať aplikáciu
                    </label>
                    {editMode ? (
                      <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input
                          type="checkbox"
                          checked={editData.want_testing || false}
                          onChange={(e) => handleEditChange("want_testing", e.target.checked)}
                          className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                        />
                        <span className="text-sm">Áno, chcem testovať</span>
                      </label>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <TestTube size={16} className={member.want_testing ? "text-green-600" : "text-gray-400"} />
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          member.want_testing 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {member.want_testing ? "Áno" : "Nie"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="admin-edit-label">
                      <Mail size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                      Chce dostávať newsletter
                    </label>
                    {editMode ? (
                      <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input
                          type="checkbox"
                          checked={editData.want_newsletter || false}
                          onChange={(e) => handleEditChange("want_newsletter", e.target.checked)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm">Áno, chcem newsletter</span>
                      </label>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <Mail size={16} className={member.want_newsletter ? "text-purple-600" : "text-gray-400"} />
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          member.want_newsletter 
                            ? "bg-purple-100 text-purple-800" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {member.want_newsletter ? "Áno" : "Nie"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="admin-edit-label">
                      <Lightbulb size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                      Má nápad na vylepšenie
                    </label>
                    {editMode ? (
                      <label className="flex items-center gap-2 cursor-pointer mt-2">
                        <input
                          type="checkbox"
                          checked={editData.has_idea || false}
                          onChange={(e) => handleEditChange("has_idea", e.target.checked)}
                          className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />
                        <span className="text-sm">Áno, mám nápad</span>
                      </label>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <Lightbulb size={16} className={member.has_idea ? "text-orange-600" : "text-gray-400"} />
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          member.has_idea 
                            ? "bg-orange-100 text-orange-800" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {member.has_idea ? "Áno" : "Nie"}
                        </span>
                      </div>
                    )}
                  </div> {/* koniec tretieho checkboxu */}
                </div> {/* koniec space-y-3 */}
              </div> {/* koniec Záujmy sekcie */}
            </div> {/* koniec grid md:grid-cols-2 */}
          </div> {/* koniec space-y-6 */}
        </FormSection>

        {/* Správa/Nápad */}
        <FormSection title="Správa alebo nápad" icon={MessageCircle}>
          {editMode ? (
            <div>
              <label className="admin-edit-label">
                <MessageCircle size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                Správa
              </label>
              <textarea
                value={editData.message || ""}
                onChange={(e) => handleEditChange("message", e.target.value)}
                rows={6}
                className="admin-edit-input resize-none"
                placeholder="Zadajte správu alebo nápad..."
              />
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4">
              {member.message ? (
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {member.message}
                </p>
              ) : (
                <p className="text-gray-500 italic">
                  Žiadna správa nebola zadaná.
                </p>
              )}
            </div>
          )}
        </FormSection>

        {/* Rýchle akcie - tlačidlá na úpravu a kontakt */}
        <FormSection title="Rýchle akcie" icon={Mail}>
          <div className="flex gap-3 flex-wrap">
            {/* Tlačidlá pre editovanie */}
            {!editMode ? (
              <button
                onClick={() => setEditMode(true)}
                className="admin-edit-button-primary flex items-center gap-2"
              >
                <Save size={16} />
                Upraviť
              </button>
            ) : (
              <>
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors flex items-center gap-2"
                >
                  Zrušiť
                </button>
                <ActionButton
                  icon={Save}
                  variant="primary"
                  loading={saving}
                  onClick={handleSave}
                >
                  {saving ? "Ukladám..." : "Uložiť"}
                </ActionButton>
              </>
            )}
            
            <ActionButton
              icon={Trash2}
              variant="danger"
              loading={deleting}
              onClick={handleDelete}
            >
              {deleting ? "Vymazávam..." : "Vymazať"}
            </ActionButton>

            {/* Tlačidlá pre kontakt - zobrazujú sa len mimo editMode */}
            {!editMode && (
              <>
                <a
                  href={`mailto:${member.email}?subject=Ďakujeme za záujem o našu aplikáciu`}
                  className="admin-edit-button-primary flex items-center gap-2"
                >
                  <Mail size={16} />
                  Napísať email
                </a>
                
                {member.want_testing && (
                  <a
                    href={`mailto:${member.email}?subject=Beta testovanie aplikácie&body=Dobrý deň ${member.name},%0D%0A%0D%0AĎakujeme za váš záujem o testovanie našej aplikácie...`}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <TestTube size={16} />
                    Pozvať na testovanie
                  </a>
                )}
                
                {member.want_newsletter && (
                  <button
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    onClick={() => alert("Funkcia bude dostupná čoskoro")}
                  >
                    <Mail size={16} />
                    Pridať do newslettera
                  </button>
                )}
              </>
            )}
          </div>
        </FormSection>
        </div> {/* space-y-6 wrapper */}
      </div> {/* container mx-auto px-4 py-8 */}
    </main>
  );
}