//admin/rosary/page.tsx
"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import { useSupabase } from "@/app/components/SupabaseProvider";
import {
  AlertCircle,
  ArrowLeft, ArrowRight,
  CheckCircle,
  ChevronDown, ChevronUp,
  Copy,
  Crown,
  Download,
  Edit3,
  Eye,
  FileText,
  Filter,
  Globe,
  Headphones,
  Heart,
  PlusCircle,
  Scroll,
  Search,
  Sparkles,
  Star, Sun,
  Trash2,
  Upload,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { rosaryListTranslations, type RosaryListLang } from "./translations";

interface LectioDivinaRuzenec {
  id?: string;
  created_at?: string;
  updated_at?: string;
  lang: string;
  biblicky_text?: string;
  kategoria?: string;
  ruzenec?: string;
  uvod?: string;
  uvod_audio?: string;
  ilustracny_obrazok?: string;
  uvodne_modlitby?: string;
  uvodne_modlitby_audio?: string;
  lectio_text?: string;
  lectio_audio?: string;
  komentar?: string;
  komentar_audio?: string;
  meditatio_text?: string;
  meditatio_audio?: string;
  oratio_html?: string;
  oratio_audio?: string;
  contemplatio_text?: string;
  contemplatio_audio?: string;
  actio_text?: string;
  actio_audio?: string;
  audio_nahravka?: string;
  autor?: string;
  publikovane?: boolean;
  poradie?: number;
}

interface Kategoria {
  id: string;
  nazov: string;
  popis: string;
  farba: string;
}

type FilterState = {
  kategoria: string;
  biblicky_text: string;
  autor: string;
  publikovane: string;
};

type NotificationType = 'success' | 'error' | 'info';

const PAGE_SIZE = 20;

const LANGUAGE_OPTIONS = [
  { value: "sk" as const, label: "Slovenčina", flag: "🇸🇰" },
  { value: "cz" as const, label: "Čeština", flag: "🇨🇿" },
  { value: "en" as const, label: "English", flag: "🇺🇸" },
  { value: "es" as const, label: "Español", flag: "🇪🇸" },
];

const KATEGORIA_ICONS = {
  'joyful': <Star className="w-4 h-4 text-yellow-500" />,
  'sorrowful': <Heart className="w-4 h-4 text-red-500" />,
  'glorious': <Crown className="w-4 h-4 text-purple-500" />,
  'luminous': <Sun className="w-4 h-4 text-blue-500" />,
};

// Notification komponenta
const Notification = ({ 
  message, 
  type, 
  onClose 
}: { 
  message: string; 
  type: NotificationType; 
  onClose: () => void; 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-lg p-4 shadow-lg ${bgColor} max-w-md`}>
      <div className="flex items-start gap-3">
        <Icon size={20} />
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Copy Dialog komponenta
const CopyDialog = ({ 
  isOpen, 
  onClose, 
  onCopy, 
  onCopyAndOpen,
  currentLang,
  ruzenec,
  translations: rt
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCopy: (targetLang: string) => void;
  onCopyAndOpen: (targetLang: string) => void;
  currentLang: string;
  ruzenec: LectioDivinaRuzenec | null;
  translations: typeof rosaryListTranslations.sk;
}) => {
  const [selectedLang, setSelectedLang] = useState<string>("");
  
  useEffect(() => {
    if (isOpen) {
      // Reset selection when dialog opens
      setSelectedLang("");
    }
  }, [isOpen]);

  if (!isOpen || !ruzenec) return null;

  const availableLanguages = LANGUAGE_OPTIONS.filter(lang => lang.value !== currentLang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Copy size={20} style={{ color: '#40467b' }} />
            {rt.copyTitle}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            {rt.copyDescription} <span className="font-medium">{ruzenec.ruzenec}</span>
          </p>
          <p className="text-xs text-gray-500">
            {rt.copyInfo}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {rt.copySelectLanguage}:
          </label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#40467b] focus:border-transparent transition"
          >
            <option value="">{rt.selectLanguagePlaceholder}</option>
            {availableLanguages.map(lang => (
              <option key={lang.value} value={lang.value}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition order-3 sm:order-1"
          >
            {rt.copyCancel}
          </button>
          <button
            onClick={() => {
              if (selectedLang) {
                onCopy(selectedLang);
                onClose();
              }
            }}
            disabled={!selectedLang}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-2"
            style={{ backgroundColor: '#40467b' }}
          >
            <Copy size={16} />
            {rt.copyAction}
          </button>
          <button
            onClick={() => {
              if (selectedLang) {
                onCopyAndOpen(selectedLang);
                onClose();
              }
            }}
            disabled={!selectedLang}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 order-1 sm:order-3"
            style={{ backgroundColor: '#40467b' }}
          >
            <Copy size={16} />
            <Edit3 size={16} />
            <span className="hidden sm:inline">{rt.copyAndOpen}</span>
            <span className="sm:hidden">{rt.copyAndOpen}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading komponenta
const LoadingSpinner = ({ size = 6 }: { size?: number }) => (
  <div className={`w-${size} h-${size} border-2 border-[#40467b] border-t-transparent rounded-full animate-spin`} />
);

export default function RosaryAdminPage() {
  const { lang: appLang } = useLanguage();
  const rt = rosaryListTranslations[appLang as RosaryListLang] || rosaryListTranslations.sk;
  const router = useRouter();
  const { supabase } = useSupabase();

  // State
  const [ruzence, setRuzence] = useState<LectioDivinaRuzenec[]>([]);
  const [kategorie, setKategorie] = useState<Kategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);

  // Copy dialog state
  const [copyDialog, setCopyDialog] = useState<{
    isOpen: boolean;
    ruzenec: LectioDivinaRuzenec | null;
  }>({
    isOpen: false,
    ruzenec: null
  });

  // Filtre a stránkovanie - inicializácia z URL alebo default sk
  const [filterLang, setFilterLang] = useState<"sk" | "cz" | "en" | "es">(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const langParam = params.get('lang');
      if (langParam && ['sk', 'cz', 'en', 'es'].includes(langParam)) {
        return langParam as "sk" | "cz" | "en" | "es";
      }
    }
    return "sk";
  });
  const [langInitialized, setLangInitialized] = useState(false); // Flag pre kontrolu načítania jazyka
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    kategoria: "",
    biblicky_text: "",
    autor: "",
    publikovane: "",
  });
  const [globalSearch, setGlobalSearch] = useState("");

  // Notifikácie helper
  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
  }, []);

  // Fetch kategórie
  const fetchKategorie = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("kategorie_ruzenec")
        .select("*")
        .order("nazov");

      if (error) throw error;
      setKategorie(data || []);
    } catch (error) {
      console.error('Kategórie fetch error:', error);
    }
  }, [supabase]);

  // Fetch data s optimalizáciou
  const fetchRuzence = useCallback(async () => {
    setLoading(true);
    
    try {
      let dataQuery = supabase
        .from("lectio_divina_ruzenec")
        .select(`
          id, created_at, lang, biblicky_text, kategoria, ruzenec, uvod, 
          ilustracny_obrazok, uvodne_modlitby, lectio_text, komentar, meditatio_text, oratio_html,
          contemplatio_text, actio_text, audio_nahravka, autor, publikovane, poradie
        `)
        .eq("lang", filterLang);

      let countQuery = supabase
        .from("lectio_divina_ruzenec")
        .select("*", { count: "exact", head: true })
        .eq("lang", filterLang);

      // Aplikovať filtre
      if (globalSearch) {
        const searchPattern = `%${globalSearch}%`;
        const searchCondition = `ruzenec.ilike.${searchPattern},biblicky_text.ilike.${searchPattern},uvod.ilike.${searchPattern},lectio_text.ilike.${searchPattern}`;
        dataQuery = dataQuery.or(searchCondition);
        countQuery = countQuery.or(searchCondition);
      } else {
        if (filter.kategoria) {
          dataQuery = dataQuery.eq("kategoria", filter.kategoria);
          countQuery = countQuery.eq("kategoria", filter.kategoria);
        }
        if (filter.biblicky_text) {
          dataQuery = dataQuery.ilike("biblicky_text", `%${filter.biblicky_text}%`);
          countQuery = countQuery.ilike("biblicky_text", `%${filter.biblicky_text}%`);
        }
        if (filter.autor) {
          dataQuery = dataQuery.ilike("autor", `%${filter.autor}%`);
          countQuery = countQuery.ilike("autor", `%${filter.autor}%`);
        }
        if (filter.publikovane !== "") {
          const isPublished = filter.publikovane === "true";
          dataQuery = dataQuery.eq("publikovane", isPublished);
          countQuery = countQuery.eq("publikovane", isPublished);
        }
      }

      dataQuery = dataQuery.order("kategoria", { ascending: true })
        .order("poradie", { ascending: true })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      const [{ data, error }, { count, error: countError }] = await Promise.all([
        dataQuery,
        countQuery
      ]);

      if (error || countError) {
        throw new Error(error?.message || countError?.message || "Chyba pri načítavaní dát");
      }

      setRuzence(data as LectioDivinaRuzenec[]);
      setTotal(count || 0);
    } catch (error) {
      console.error('Fetch error:', error);
      showNotification("Chyba pri načítavaní dát", "error");
      setRuzence([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [supabase, filterLang, filter, globalSearch, page, showNotification]);

  // Effects
  
  // Načítaj jazyk z URL pri prvom načítaní (návrat z editácie) - MUSÍ BYŤ PRVÝ!
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const langParam = params.get('lang');
    if (langParam && ['sk', 'cz', 'en', 'es'].includes(langParam)) {
      setFilterLang(langParam as "sk" | "cz" | "en" | "es");
      // Vyčisti URL parameter po načítaní
      window.history.replaceState({}, '', '/admin/rosary');
    }
    // Označ, že jazyk bol inicializovaný (aj keď nebol v URL)
    setLangInitialized(true);
  }, []);

  useEffect(() => {
    fetchKategorie();
  }, [fetchKategorie]);

  // Načítaj dáta až po inicializácii jazyka
  useEffect(() => {
    if (langInitialized) {
      fetchRuzence();
    }
  }, [fetchRuzence, langInitialized]);

  // Handlers
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Naozaj chcete vymazať tento ruženec? Táto akcia sa nedá vrátiť späť.")) {
      return;
    }

    setDeletingId(id);
    
    try {
      const { error } = await supabase
        .from("lectio_divina_ruzenec")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw new Error(error.message);
      }

      showNotification(rt.successDelete, "success");
      
      // Ak je posledný item na stránke, choď na predchádzajúcu
      if (ruzence.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        fetchRuzence();
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification(rt.errorDelete, "error");
    } finally {
      setDeletingId(null);
    }
  }, [supabase, ruzence.length, page, fetchRuzence, showNotification, rt.successDelete, rt.errorDelete]);

  const clearFilters = useCallback(() => {
    setFilter({ kategoria: "", biblicky_text: "", autor: "", publikovane: "" });
    setGlobalSearch("");
    setPage(1);
  }, []);

  const handleExportExcel = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("lectio_divina_ruzenec")
        .select("*")
        .eq("lang", filterLang)
        .order("poradie", { ascending: true });

      if (error || !data) {
        throw new Error("Chyba pri exporte!");
      }

      // Priprav dáta pre export (bez ID a timestamps pre čitateľnosť)
      const exportData = data.map(item => ({
        lang: item.lang,
        biblicky_text: item.biblicky_text || "",
        kategoria: item.kategoria || "",
        ruzenec: item.ruzenec || "",
        uvod: item.uvod || "",
        uvod_audio: item.uvod_audio || "",
        ilustracny_obrazok: item.ilustracny_obrazok || "",
        uvodne_modlitby: item.uvodne_modlitby || "",
        uvodne_modlitby_audio: item.uvodne_modlitby_audio || "",
        lectio_text: item.lectio_text || "",
        lectio_audio: item.lectio_audio || "",
        komentar: item.komentar || "",
        komentar_audio: item.komentar_audio || "",
        meditatio_text: item.meditatio_text || "",
        meditatio_audio: item.meditatio_audio || "",
        oratio_html: item.oratio_html || "",
        oratio_audio: item.oratio_audio || "",
        contemplatio_text: item.contemplatio_text || "",
        contemplatio_audio: item.contemplatio_audio || "",
        actio_text: item.actio_text || "",
        actio_audio: item.actio_audio || "",
        audio_nahravka: item.audio_nahravka || "",
        autor: item.autor || "",
        publikovane: item.publikovane ? "TRUE" : "FALSE",
        poradie: item.poradie || 0,
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ruzence");
      XLSX.writeFile(wb, `ruzence_export_${filterLang}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
      showNotification(rt.successExport, "success");
    } catch (error) {
      console.error('Export error:', error);
      showNotification(rt.errorExport, "error");
    }
  }, [supabase, filterLang, showNotification, rt.successExport, rt.errorExport]);

  const handleExcelImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = new Uint8Array(evt.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        const newItems = json.map(row => ({
          lang: row.lang || "sk",
          biblicky_text: row.biblicky_text || "",
          kategoria: row.kategoria || "radostné",
          ruzenec: row.ruzenec || "",
          uvod: row.uvod || "",
          uvod_audio: row.uvod_audio || null,
          ilustracny_obrazok: row.ilustracny_obrazok || null,
          uvodne_modlitby: row.uvodne_modlitby || "",
          uvodne_modlitby_audio: row.uvodne_modlitby_audio || null,
          lectio_text: row.lectio_text || "",
          lectio_audio: row.lectio_audio || null,
          komentar: row.komentar || "",
          komentar_audio: row.komentar_audio || null,
          meditatio_text: row.meditatio_text || "",
          meditatio_audio: row.meditatio_audio || null,
          oratio_html: row.oratio_html || "",
          oratio_audio: row.oratio_audio || null,
          contemplatio_text: row.contemplatio_text || "",
          contemplatio_audio: row.contemplatio_audio || null,
          actio_text: row.actio_text || "",
          actio_audio: row.actio_audio || null,
          audio_nahravka: row.audio_nahravka || null,
          autor: row.autor || "",
          publikovane: row.publikovane === "TRUE" || row.publikovane === true || row.publikovane === "true",
          poradie: parseInt(String(row.poradie || "0")) || 0,
        })).filter(item => item.ruzenec && item.lang);

        if (newItems.length === 0) {
          throw new Error(rt.errorImportDetails);
        }

        const { error } = await supabase
          .from("lectio_divina_ruzenec")
          .insert(newItems);

        if (error) {
          throw new Error(error.message);
        }

        showNotification(rt.successImport, "success");
        fetchRuzence();
      } catch (error) {
        console.error('Import error:', error);
        showNotification(rt.errorImport, "error");
      } finally {
        setImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  }, [supabase, fetchRuzence, showNotification, rt.successImport, rt.errorImport, rt.errorImportDetails]);

  // Computed values
  const hasActiveFilters = useMemo(() => 
    globalSearch || Object.values(filter).some(f => f !== ""), 
    [globalSearch, filter]
  );

  const stats = useMemo(() => {
    return {
      total: ruzence.length,
      withAudio: ruzence.filter(r => r.audio_nahravka).length,
      published: ruzence.filter(r => r.publikovane).length,
      language: filterLang.toUpperCase(),
    };
  }, [ruzence, filterLang]);

  const hasAudioContent = useCallback((ruzenec: LectioDivinaRuzenec) => {
    return !!(ruzenec.audio_nahravka);
  }, []);

  // Create new ruzenec from existing one for copy
  const createNewRuzenec = useCallback((original: LectioDivinaRuzenec, targetLang: string): Omit<LectioDivinaRuzenec, 'id' | 'created_at' | 'updated_at'> => {
    return {
      lang: targetLang,
      biblicky_text: original.biblicky_text || "",
      kategoria: original.kategoria || "",
      ruzenec: original.ruzenec || "",
      uvod: original.uvod || "",
      ilustracny_obrazok: original.ilustracny_obrazok || "", // Kopírovať URL obrázka
      uvodne_modlitby: original.uvodne_modlitby || "",
      lectio_text: original.lectio_text || "",
      komentar: original.komentar || "",
      meditatio_text: original.meditatio_text || "",
      oratio_html: original.oratio_html || "",
      contemplatio_text: original.contemplatio_text || "",
      actio_text: original.actio_text || "",
      // Všetky audio polia sa vynulujú
      audio_nahravka: "",
      uvod_audio: "",
      uvodne_modlitby_audio: "",
      lectio_audio: "",
      komentar_audio: "",
      meditatio_audio: "",
      oratio_audio: "",
      contemplatio_audio: "",
      actio_audio: "",
      autor: original.autor || "",
      publikovane: false, // Copy as draft
      poradie: original.poradie || 0
    };
  }, []);

  const handleCopyToLanguage = useCallback(async (targetLang: string) => {
    if (!copyDialog.ruzenec) return;

    const original = copyDialog.ruzenec;
    const newRuzenec = createNewRuzenec(original, targetLang);

    try {
      const { error } = await supabase
        .from("lectio_divina_ruzenec")
        .insert([newRuzenec]);

      if (error) {
        throw new Error(error.message);
      }

      showNotification(rt.successCopyCreate, "success");
      
      // Refresh data if we're viewing the target language
      if (filterLang === targetLang) {
        fetchRuzence();
      }
    } catch (error) {
      console.error('Copy error:', error);
      showNotification(rt.errorCopy, "error");
    }
  }, [copyDialog.ruzenec, createNewRuzenec, supabase, showNotification, filterLang, fetchRuzence, rt.successCopyCreate, rt.errorCopy]);

  const handleCopyAndOpen = useCallback(async (targetLang: string) => {
    if (!copyDialog.ruzenec) return;

    const original = copyDialog.ruzenec;
    const newRuzenec = createNewRuzenec(original, targetLang);

    try {
      const { data, error } = await supabase
        .from("lectio_divina_ruzenec")
        .insert([newRuzenec])
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      showNotification(rt.successCopyCreate, "success");
      
      // Uložíme aktuálnu stránku a jazyk filtra pre návrat
      localStorage.setItem('rosary_return_page', page.toString());
      localStorage.setItem('rosary_filter_lang', targetLang);
      
      // Presmerujeme na editáciu nového záznamu
      router.push(`/admin/rosary/${data.id}`);
    } catch (error) {
      console.error('Copy and open error:', error);
      showNotification(rt.errorCopy, "error");
    }
  }, [copyDialog.ruzenec, createNewRuzenec, supabase, showNotification, page, router, rt.successCopyCreate, rt.errorCopy]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen">
      {/* Notifikácie */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Copy Dialog */}
      <CopyDialog
        isOpen={copyDialog.isOpen}
        onClose={() => setCopyDialog({ isOpen: false, ruzenec: null })}
        onCopy={handleCopyToLanguage}
        onCopyAndOpen={handleCopyAndOpen}
        currentLang={filterLang}
        ruzenec={copyDialog.ruzenec}
        translations={rt}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hlavička */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] px-8 py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Sparkles size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    {rt.title}
                  </h1>
                  <p className="text-indigo-100 mt-1">{rt.subtitle}</p>
                </div>
              </div>
              
              {/* Štatistiky */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.total}</div>
                  <div className="text-sm text-indigo-100 mt-1">{rt.statsTotal}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.withAudio}</div>
                  <div className="text-sm text-indigo-100 mt-1">{rt.statsWithAudio}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.published}</div>
                  <div className="text-sm text-indigo-100 mt-1">{rt.statsPublished}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">
                    {LANGUAGE_OPTIONS.find(l => l.value === filterLang)?.flag}
                  </div>
                  <div className="text-sm text-indigo-100 mt-1">{rt.statsLanguage}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Ovládacie panely */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Výber jazyka */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Globe size={20} className="text-[#40467b]" />
              </div>
              <h3 className="font-semibold text-gray-800">{rt.languageRosary}</h3>
            </div>
            <select
              value={filterLang}
              onChange={e => { 
                setFilterLang(e.target.value as "sk" | "cz" | "en" | "es"); 
                setPage(1); 
              }}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition"
            >
              {LANGUAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.flag} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Import/Export */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Download size={20} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">{rt.importExport}</h3>
            </div>
            <div className="flex gap-2">
              <label className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition cursor-pointer text-center text-sm flex items-center justify-center gap-2 shadow-sm">
                {importing ? <LoadingSpinner size={4} /> : <Upload size={16} />}
                {importing ? rt.importing : rt.import}
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleExcelImport}
                  className="hidden"
                  disabled={importing}
                />
              </label>
              <button
                onClick={handleExportExcel}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-lg hover:from-green-700 hover:to-green-800 transition text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <Download size={16} />
                {rt.export}
              </button>
            </div>
          </div>

          {/* Akcie */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <PlusCircle size={20} className="text-[#40467b]" />
              </div>
              <h3 className="font-semibold text-gray-800">{rt.actions}</h3>
            </div>
            <button
              onClick={() => {
                // Ulož aktuálny jazyk filtra pre návrat
                localStorage.setItem('rosary_filter_lang', filterLang);
                router.push("/admin/rosary/new");
              }}
              className="w-full bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white px-4 py-2.5 rounded-lg hover:from-[#686ea3] hover:to-[#40467b] transition flex items-center justify-center gap-2 shadow-sm font-medium"
            >
              <PlusCircle size={16} />
              {rt.addNew}
            </button>
          </div>
        </div>

        {/* Vyhľadávanie a filtre */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search size={20} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">{rt.filtersTitle}</h3>
                {hasActiveFilters && (
                  <span className="text-xs text-[#40467b] font-medium">Aktívne filtre</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
            >
              <Filter size={16} />
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {/* Globálne vyhľadávanie */}
          <div className="mb-4">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={globalSearch}
                onChange={e => { 
                  setGlobalSearch(e.target.value); 
                  setPage(1); 
                }}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition"
                placeholder={rt.searchPlaceholder}
              />
            </div>
          </div>

          {/* Detailné filtre */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Crown size={16} className="inline mr-1" />
                    {rt.category}
                  </label>
                  <select
                    value={filter.kategoria}
                    onChange={e => { 
                      setFilter(f => ({ ...f, kategoria: e.target.value })); 
                      setPage(1); 
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition"
                    disabled={!!globalSearch}
                  >
                    <option value="">{rt.allCategories}</option>
                    {kategorie.map(k => (
                      <option key={k.id} value={k.nazov}>
                        {k.nazov}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Scroll size={16} className="inline mr-1" />
                    {rt.biblicalText}
                  </label>
                  <input
                    type="text"
                    value={filter.biblicky_text}
                    onChange={e => { 
                      setFilter(f => ({ ...f, biblicky_text: e.target.value })); 
                      setPage(1); 
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition"
                    placeholder={rt.biblicalTextPlaceholder}
                    disabled={!!globalSearch}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{rt.author}</label>
                  <input
                    type="text"
                    value={filter.autor}
                    onChange={e => { 
                      setFilter(f => ({ ...f, autor: e.target.value })); 
                      setPage(1); 
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition"
                    placeholder={rt.authorPlaceholder}
                    disabled={!!globalSearch}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{rt.published}</label>
                  <select
                    value={filter.publikovane}
                    onChange={e => { 
                      setFilter(f => ({ ...f, publikovane: e.target.value })); 
                      setPage(1); 
                    }}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition"
                    disabled={!!globalSearch}
                  >
                    <option value="">{rt.all}</option>
                    <option value="true">{rt.publishedOnly}</option>
                    <option value="false">{rt.unpublishedOnly}</option>
                  </select>
                </div>
              </div>

              {/* Vyčistiť filtre */}
              {hasActiveFilters && (
                <div className="flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    <X size={16} />
                    {rt.clearFilters}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabuľka */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Crown size={16} />
                      {rt.tableCategory}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} />
                      {rt.tableRosary}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Scroll size={16} />
                      {rt.tableBiblicalText}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Globe size={16} />
                      {rt.tableLanguage}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">{rt.tableStatus}</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">{rt.tableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center gap-4">
                        <LoadingSpinner />
                        <span className="text-gray-500 font-medium">{rt.loading}</span>
                      </div>
                    </td>
                  </tr>
                ) : ruzence.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="text-gray-500 flex flex-col items-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <Sparkles size={40} className="text-gray-300" />
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mb-1">{rt.noResults}</p>
                        <p className="text-sm text-gray-500">{rt.noResultsDesc}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  ruzence.map(r => (
                    <tr key={r.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {KATEGORIA_ICONS[r.kategoria as keyof typeof KATEGORIA_ICONS] || <Star className="w-4 h-4 text-gray-400" />}
                          <span className="font-medium text-gray-900 capitalize">
                            {r.kategoria}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">
                          {(r.ruzenec?.length ?? 0) > 50 ? (
                            <span title={r.ruzenec}>{r.ruzenec?.slice(0, 50)}...</span>
                          ) : (
                            r.ruzenec || ""
                          )}
                        </div>
                        {r.uvod && (
                          <div className="text-sm text-gray-500 mt-1">
                            {(r.uvod?.length ?? 0) > 80 ? r.uvod.slice(0, 80) + "..." : r.uvod}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 text-sm bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 font-mono">
                          {(r.biblicky_text?.length ?? 0) > 60 ? 
                            r.biblicky_text?.slice(0, 60) + "..." : 
                            r.biblicky_text || ""
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-indigo-200 text-[#40467b] text-sm font-semibold rounded-full border border-indigo-300">
                          <span className="text-base">{LANGUAGE_OPTIONS.find(lang => lang.value === r.lang)?.flag}</span>
                          {r.lang?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${
                            r.publikovane 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            <Eye size={12} />
                            {r.publikovane ? rt.publishedLabel : rt.draftLabel}
                          </span>
                          {hasAudioContent(r) && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium rounded-full">
                              <Headphones size={12} />
                              {rt.audioLabel}
                            </span>
                          )}
                          {r.ilustracny_obrazok && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-medium rounded-full">
                              <FileText size={12} />
                              {rt.imageLabel}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-2.5 text-[#40467b] hover:bg-indigo-100 rounded-lg transition-all hover:scale-105 active:scale-95"
                            title={rt.edit}
                            onClick={() => {
                              // Ulož aktuálny jazyk filtra pre návrat
                              localStorage.setItem('rosary_filter_lang', filterLang);
                              router.push(`/admin/rosary/${r.id}`);
                            }}
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            className="p-2.5 text-[#40467b] hover:bg-indigo-100 rounded-lg transition-all hover:scale-105 active:scale-95"
                            title={rt.copy}
                            onClick={() => setCopyDialog({ isOpen: true, ruzenec: r })}
                          >
                            <Copy size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id!)}
                            disabled={deletingId === r.id}
                            className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                            title={rt.delete}
                          >
                            {deletingId === r.id ? (
                              <LoadingSpinner size={4} />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stránkovanie */}
        {totalPages > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                {rt.showing} <span className="font-semibold text-gray-900">{(page - 1) * PAGE_SIZE + 1}</span> {rt.to}{" "}
                <span className="font-semibold text-gray-900">{Math.min(page * PAGE_SIZE, total)}</span> {rt.of}{" "}
                <span className="font-semibold text-gray-900">{total}</span> {rt.rosariesCount}
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <ArrowLeft size={16} />
                  {rt.previous}
                </button>
                
                <div className="flex items-center gap-2">
                  {(() => {
                    const maxVisible = 5;
                    
                    if (totalPages <= maxVisible) {
                      return Array.from({ length: totalPages }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={`page-${pageNum}`}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-lg transition-all font-medium ${
                              page === pageNum
                                ? "bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white shadow-md"
                                : "border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      });
                    }
                    
                    const startPage = Math.max(1, Math.min(page - 2, totalPages - maxVisible + 1));
                    const endPage = Math.min(totalPages, startPage + maxVisible - 1);
                    
                    const pages = [];
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={`page-${i}`}
                          onClick={() => setPage(i)}
                          className={`w-10 h-10 rounded-lg transition-all font-medium ${
                            page === i
                              ? "bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white shadow-md"
                              : "border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700"
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    
                    return pages;
                  })()}
                </div>
                
                <button
                  onClick={() => setPage(p => (p * PAGE_SIZE < total ? p + 1 : p))}
                  disabled={page * PAGE_SIZE >= total}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {rt.next}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}