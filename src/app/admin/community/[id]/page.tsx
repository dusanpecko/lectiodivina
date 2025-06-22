"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider"; // ← ZMENA: náš provider
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  TestTube, 
  Lightbulb, 
  MessageCircle,
  User,
  Save,
  Trash2
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

  const { lang: appLang } = useLanguage();
  const t = translations[appLang];

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

  const handleEditChange = (field: keyof CommunityMember, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg text-gray-600">Načítavam...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Člen nenájdený</h2>
          <p className="text-red-600 mb-4">Požadovaný člen komunity nebol nájdený.</p>
          <Link href="/admin/community">
            <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
              Späť na zoznam
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto">
      {/* Hlavička */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/community">
            <button className="p-2 rounded hover:bg-gray-100 transition">
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <User size={28} className="text-amber-600" />
            Detail člena komunity
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Upraviť
            </button>
          ) : (
            <>
              <button
                onClick={() => setEditMode(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              >
                Zrušiť
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} />
                {saving ? "Ukladám..." : "Uložiť"}
              </button>
            </>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Trash2 size={16} />
            {deleting ? "Vymazávam..." : "Vymazať"}
          </button>
        </div>
      </div>

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

      {/* Detaily člena */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Hlavička karty */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{member.name}</h2>
              <p className="text-amber-100">{member.email}</p>
            </div>
          </div>
        </div>

        {/* Obsah karty */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Základné informácie */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                Základné informácie
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Meno
                </label>
                {editMode ? (
                  <input
                    type="text"
                    value={editData.name || ""}
                    onChange={(e) => handleEditChange("name", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-gray-400" />
                    <span className="text-gray-800">{member.name}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Email
                </label>
                {editMode ? (
                  <input
                    type="email"
                    value={editData.email || ""}
                    onChange={(e) => handleEditChange("email", e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                ) : (
                  <div className="flex items-center gap-2">
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
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Dátum registrácie
                </label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-800">
                    {new Date(member.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Posledná aktualizácia
                </label>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-gray-800">
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
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Chce testovať aplikáciu
                  </label>
                  {editMode ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.want_testing || false}
                        onChange={(e) => handleEditChange("want_testing", e.target.checked)}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                      />
                      <span className="text-sm">Áno, chcem testovať</span>
                    </label>
                  ) : (
                    <div className="flex items-center gap-2">
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
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Chce dostávať newsletter
                  </label>
                  {editMode ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.want_newsletter || false}
                        onChange={(e) => handleEditChange("want_newsletter", e.target.checked)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm">Áno, chcem newsletter</span>
                    </label>
                  ) : (
                    <div className="flex items-center gap-2">
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
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Má nápad na vylepšenie
                  </label>
                  {editMode ? (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.has_idea || false}
                        onChange={(e) => handleEditChange("has_idea", e.target.checked)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm">Áno, mám nápad</span>
                    </label>
                  ) : (
                    <div className="flex items-center gap-2">
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
                </div>
              </div>
            </div>
          </div>

          {/* Správa/Nápad */}
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MessageCircle size={20} />
              Správa alebo nápad
            </h3>
            
            {editMode ? (
              <textarea
                value={editData.message || ""}
                onChange={(e) => handleEditChange("message", e.target.value)}
                rows={6}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                placeholder="Zadajte správu alebo nápad..."
              />
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
          </div>

          {/* Akcie pre kontakt */}
          {!editMode && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Rýchle akcie
              </h3>
              <div className="flex gap-3 flex-wrap">
                <a
                  href={`mailto:${member.email}?subject=Ďakujeme za záujem o našu aplikáciu`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <Mail size={16} />
                  Napísať email
                </a>
                
                {member.want_testing && (
                  <a
                    href={`mailto:${member.email}?subject=Beta testovanie aplikácie&body=Dobrý deň ${member.name},%0D%0A%0D%0AĎakujeme za váš záujem o testovanie našej aplikácie...`}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition flex items-center gap-2"
                  >
                    <TestTube size={16} />
                    Pozvať na testovanie
                  </a>
                )}
                
                {member.want_newsletter && (
                  <button
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition flex items-center gap-2"
                    onClick={() => alert("Funkcia bude dostupná čoskoro")}
                  >
                    <Mail size={16} />
                    Pridať do newslettera
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}