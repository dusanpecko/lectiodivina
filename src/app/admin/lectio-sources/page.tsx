"use client";

import BulkBibleImportModal from "@/app/admin/components/BulkBibleImportModal";
import { useSupabase } from "@/app/components/SupabaseProvider";
import {
  AlertCircle,
  ArrowLeft, ArrowRight,
  Book,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown, ChevronUp,
  Copy,
  Download,
  Edit3,
  Eye,
  FileText,
  Filter,
  Globe,
  Headphones,
  Heart,
  PlusCircle,
  Search,
  Trash2,
  Upload,
  X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";

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
  reference: string;
  checked?: number; // 0 = nezaškrtnuté, 1 = zaškrtnuté
  created_at?: string;
  updated_at?: string;
}

type FilterState = {
  hlava: string;
  suradnice_pismo: string;
  checked: string; // "" = všetky, "0" = nezaškrtnuté, "1" = zaškrtnuté
  created_at: string; // dátum filter
};

type NotificationType = 'success' | 'error' | 'info';

interface DetailedStats {
  total: number;
  biblia1: number;
  biblia2: number;
  biblia3: number;
  lectio: number;
  meditatio: number;
  oratio: number;
  contemplatio: number;
  actio: number;
  audio: number;
  checked: number;
  complete: number;
  completePercentage: number;
  checkedPercentage: number;
}

const PAGE_SIZE = 20;

const ALL_FIELDS: (keyof LectioSource)[] = [
  "lang", "kniha", "kapitola", "hlava", "suradnice_pismo", 
  "nazov_biblia_1", "biblia_1", "biblia_1_audio",
  "nazov_biblia_2", "biblia_2", "biblia_2_audio", 
  "nazov_biblia_3", "biblia_3", "biblia_3_audio",
  "lectio_text", "lectio_audio", "meditatio_text", "meditatio_audio", 
  "oratio_text", "oratio_audio", "contemplatio_text", "contemplatio_audio", 
  "actio_text", "actio_audio", "modlitba_zaver", "audio_5_min", "reference", "checked"
];

const LANGUAGE_OPTIONS = [
  { value: "sk" as const, label: "Slovenčina", flag: "🇸🇰" },
  { value: "cz" as const, label: "Čeština", flag: "🇨🇿" },
  { value: "en" as const, label: "English", flag: "🇺🇸" },
  { value: "es" as const, label: "Español", flag: "🇪🇸" },
];

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
    success: 'bg-gray-50 border-gray-200',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-gray-50 border-gray-200'
  }[type];
  
  const textColor = {
    success: { color: '#40467b' },
    error: {},
    info: { color: '#40467b' }
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-lg p-4 shadow-lg ${bgColor} max-w-md`} style={textColor}>
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
  lectioSource 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCopy: (targetLang: string) => void;
  onCopyAndOpen: (targetLang: string) => void;
  currentLang: string;
  lectioSource: LectioSource | null;
}) => {
  const [selectedLang, setSelectedLang] = useState<string>("");
  
  useEffect(() => {
    if (isOpen) {
      // Reset selection when dialog opens
      setSelectedLang("");
    }
  }, [isOpen]);

  if (!isOpen || !lectioSource) return null;

  const availableLanguages = LANGUAGE_OPTIONS.filter(lang => lang.value !== currentLang);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Copy size={20} style={{ color: '#40467b' }} />
            Kopírovať do jazyka
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
            Kopírujete záznam: <span className="font-medium">{lectioSource.hlava}</span>
          </p>
          <p className="text-xs text-gray-500">
            Skopírujú sa: nadpis, súradnice, všetky texty (lectio, meditatio, oratio, contemplatio, actio) a referencie
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vybrať cieľový jazyk:
          </label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          >
            <option value="">-- Vyberte jazyk --</option>
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
            Zrušiť
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
            Kopírovať
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
            <span className="hidden sm:inline">Kopírovať a otvoriť</span>
            <span className="sm:hidden">Kopírovať & Editovať</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Bulk Copy Dialog komponenta
const BulkCopyDialog = ({ 
  isOpen, 
  onClose, 
  onBulkCopy,
  currentLang,
  selectedCount
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onBulkCopy: (targetLang: string) => void;
  currentLang: string;
  selectedCount: number;
}) => {
  const [selectedLang, setSelectedLang] = useState<string>("");
  const [copying, setCopying] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setSelectedLang("");
      setCopying(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const availableLanguages = LANGUAGE_OPTIONS.filter(lang => lang.value !== currentLang);

  const handleBulkCopy = async () => {
    if (!selectedLang) return;
    
    setCopying(true);
    try {
      await onBulkCopy(selectedLang);
    } finally {
      setCopying(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Copy size={20} style={{ color: '#40467b' }} />
            Skupinové kopírovanie
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={copying}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-3">
            Kopírujete <span className="font-bold text-emerald-600">{selectedCount}</span> označených záznamov
          </p>
          <p className="text-xs text-gray-500">
            Pre každý záznam sa skopírujú: nadpis, súradnice, všetky texty (lectio, meditatio, oratio, contemplatio, actio) a referencie
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vybrať cieľový jazyk:
          </label>
          <select
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            disabled={copying}
          >
            <option value="">-- Vyberte jazyk --</option>
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
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
            disabled={copying}
          >
            Zrušiť
          </button>
          <button
            onClick={handleBulkCopy}
            disabled={!selectedLang || copying}
            className="px-4 py-2 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: '#40467b' }}
          >
            {copying ? (
              <>
                <LoadingSpinner size={4} />
                Kopírujem...
              </>
            ) : (
              <>
                <Copy size={16} />
                Kopírovať všetky
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading komponenta
const LoadingSpinner = ({ size = 6 }: { size?: number }) => (
  <div className={`w-${size} h-${size} border-2 border-t-transparent rounded-full animate-spin`} style={{ borderColor: '#40467b', borderTopColor: 'transparent' }} />
);

export default function LectioSourcesAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useSupabase();

  // State
  const [lectioSources, setLectioSources] = useState<LectioSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);

  // Copy dialog state
  const [copyDialog, setCopyDialog] = useState<{
    isOpen: boolean;
    lectioSource: LectioSource | null;
  }>({ isOpen: false, lectioSource: null });

  // Bulk copy state
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [bulkCopyDialog, setBulkCopyDialog] = useState<{
    isOpen: boolean;
    selectedCount: number;
  }>({ isOpen: false, selectedCount: 0 });

  // Bulk Bible Import state  
  const [showBulkBibleImport, setShowBulkBibleImport] = useState(false);

  // Filtre a stránkovanie - inicializuj page z URL
  const [filterLang, setFilterLang] = useState<"sk" | "cz" | "en" | "es">("sk");
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    const pageNum = pageParam ? parseInt(pageParam, 10) : 1;
    return pageNum > 0 ? pageNum : 1;
  });
  const [total, setTotal] = useState(0);
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    hlava: "",
    suradnice_pismo: "",
    checked: "",
    created_at: ""
  });

  // Load detailed statistics
  const fetchDetailedStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("lectio_sources")
        .select("id, nazov_biblia_1, biblia_1, nazov_biblia_2, biblia_2, nazov_biblia_3, biblia_3, lectio_text, meditatio_text, oratio_text, contemplatio_text, actio_text, lectio_audio, meditatio_audio, oratio_audio, contemplatio_audio, actio_audio, biblia_1_audio, biblia_2_audio, biblia_3_audio, audio_5_min, checked")
        .eq("lang", filterLang);

      if (!error && data) {
        const stats = {
          total: data.length,
          biblia1: data.filter((l) => l.biblia_1 || l.nazov_biblia_1).length,
          biblia2: data.filter((l) => l.biblia_2 || l.nazov_biblia_2).length,
          biblia3: data.filter((l) => l.biblia_3 || l.nazov_biblia_3).length,
          lectio: data.filter((l) => l.lectio_text).length,
          meditatio: data.filter((l) => l.meditatio_text).length,
          oratio: data.filter((l) => l.oratio_text).length,
          contemplatio: data.filter((l) => l.contemplatio_text).length,
          actio: data.filter((l) => l.actio_text).length,
          audio: data.filter((l) => l.lectio_audio || l.meditatio_audio || l.oratio_audio || l.contemplatio_audio || l.actio_audio || l.biblia_1_audio || l.biblia_2_audio || l.biblia_3_audio || l.audio_5_min).length,
          checked: data.filter((l) => l.checked === 1).length,
          complete: data.filter((l) => {
            const hasBiblia1 = l.biblia_1 || l.nazov_biblia_1;
            const hasBiblia2 = l.biblia_2 || l.nazov_biblia_2;
            const hasBiblia3 = l.biblia_3 || l.nazov_biblia_3;
            const hasAudio = l.lectio_audio || l.meditatio_audio || l.oratio_audio || l.contemplatio_audio || l.actio_audio || l.biblia_1_audio || l.biblia_2_audio || l.biblia_3_audio || l.audio_5_min;
            return hasBiblia1 && hasBiblia2 && hasBiblia3 && l.lectio_text && l.meditatio_text && l.oratio_text && l.contemplatio_text && l.actio_text && hasAudio;
          }).length,
          completePercentage: 0,
          checkedPercentage: 0
        };
        
        stats.completePercentage = stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0;
        stats.checkedPercentage = stats.total > 0 ? Math.round((stats.checked / stats.total) * 100) : 0;
        
        setDetailedStats(stats);
      }
    } catch (error) {
      console.error('Chyba pri načítaní štatistík:', error);
    }
  }, [supabase, filterLang]);

  // Effect to load detailed stats when language changes
  useEffect(() => {
    fetchDetailedStats();
  }, [fetchDetailedStats]);

  // Helper pre zmenu stránky s aktualizáciou URL
  const updatePage = useCallback((newPage: number) => {
    setPage(newPage);
    if (newPage > 1) {
      router.push(`/admin/lectio-sources?page=${newPage}`, { scroll: false });
    } else {
      router.push('/admin/lectio-sources', { scroll: false });
    }
  }, [router]);

  // Notifikácie helper
  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
  }, []);

  // Load page from URL on mount or from localStorage if returning from edit
  useEffect(() => {
    const pageParam = searchParams.get('page');
    
    // Ak nie je stránka v URL, skús načítať z localStorage (návrat z editácie)
    if (!pageParam) {
      const returnPage = localStorage.getItem('lectio_sources_return_page');
      const returnLang = localStorage.getItem('lectio_sources_return_lang');
      
      if (returnLang) {
        setFilterLang(returnLang as "sk" | "cz" | "en" | "es");
      }
      
      if (returnPage) {
        const pageNum = parseInt(returnPage, 10);
        if (pageNum > 0) {
          updatePage(pageNum); // Používame updatePage aby sa aktualizoval aj URL
        }
        // Vymaž localStorage po použití
        localStorage.removeItem('lectio_sources_return_page');
      }
      
      if (returnLang) {
        localStorage.removeItem('lectio_sources_return_lang');
      }
    }
  }, [searchParams, updatePage]);

  // Fetch data s optimalizáciou
  const fetchLectioSources = useCallback(async () => {
    setLoading(true);
    
    try {
      let dataQuery = supabase
        .from("lectio_sources")
        .select("id, lang, kniha, kapitola, hlava, suradnice_pismo, lectio_text, meditatio_text, oratio_text, contemplatio_text, actio_text, nazov_biblia_1, biblia_1, nazov_biblia_2, biblia_2, nazov_biblia_3, biblia_3, lectio_audio, meditatio_audio, oratio_audio, contemplatio_audio, actio_audio, reference, checked, created_at")
        .eq("lang", filterLang);

      let countQuery = supabase
        .from("lectio_sources")
        .select("*", { count: "exact", head: true })
        .eq("lang", filterLang);

      // Aplikovať filtre
      if (filter.hlava) {
        dataQuery = dataQuery.ilike("hlava", `%${filter.hlava}%`);
        countQuery = countQuery.ilike("hlava", `%${filter.hlava}%`);
      }
      if (filter.suradnice_pismo) {
        dataQuery = dataQuery.ilike("suradnice_pismo", `%${filter.suradnice_pismo}%`);
        countQuery = countQuery.ilike("suradnice_pismo", `%${filter.suradnice_pismo}%`);
      }
      if (filter.checked !== "") {
        const checkedValue = parseInt(filter.checked);
        dataQuery = dataQuery.eq("checked", checkedValue);
        countQuery = countQuery.eq("checked", checkedValue);
      }
      if (filter.created_at) {
        // Filter podľa dátumu (YYYY-MM-DD)
        dataQuery = dataQuery.gte("created_at", `${filter.created_at}T00:00:00`);
        dataQuery = dataQuery.lt("created_at", `${filter.created_at}T23:59:59`);
        countQuery = countQuery.gte("created_at", `${filter.created_at}T00:00:00`);
        countQuery = countQuery.lt("created_at", `${filter.created_at}T23:59:59`);
      }

      dataQuery = dataQuery.order("created_at", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      const [{ data, error }, { count, error: countError }] = await Promise.all([
        dataQuery,
        countQuery
      ]);

      if (error || countError) {
        throw new Error(error?.message || countError?.message || "Chyba pri načítavaní dát");
      }

      setLectioSources(data as LectioSource[]);
      setTotal(count || 0);
    } catch (error) {
      console.error('Fetch error:', error);
      showNotification("Chyba pri načítavaní dát", "error");
      setLectioSources([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [supabase, filterLang, filter, page, showNotification]);

  // Effects
  useEffect(() => {
    fetchLectioSources();
  }, [fetchLectioSources]);

  // Vyčistiť označené riadky pri zmene stránky
  useEffect(() => {
    setSelectedRows(new Set());
  }, [page]);

  // Handlers
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("Naozaj chcete vymazať tento Lectio zdroj? Táto akcia sa nedá vrátiť späť.")) {
      return;
    }

    setDeletingId(id);
    
    try {
      const { error } = await supabase.from("lectio_sources").delete().eq("id", id);
      
      if (error) {
        throw new Error(error.message);
      }

      showNotification("Lectio zdroj bol úspešne vymazaný", "success");
      
      // Ak je posledný item na stránke, choď na predchádzajúcu
      if (lectioSources.length === 1 && page > 1) {
        updatePage(page - 1);
      } else {
        fetchLectioSources();
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification("Chyba pri mazaní", "error");
    } finally {
      setDeletingId(null);
    }
  }, [supabase, lectioSources.length, page, fetchLectioSources, showNotification, updatePage]);

  const handleCheckboxChange = useCallback(async (id: number, currentValue: number) => {
    const newValue = currentValue === 1 ? 0 : 1;
    
    try {
      const { error } = await supabase
        .from("lectio_sources")
        .update({ checked: newValue })
        .eq("id", id);
      
      if (error) {
        throw new Error(error.message);
      }

      // Aktualizovať lokálny state
      setLectioSources(prev => 
        prev.map(item => 
          item.id === id ? { ...item, checked: newValue } : item
        )
      );
      
      showNotification(
        newValue === 1 ? "Označené ako skontrolované" : "Označené ako neskontrolované", 
        "success"
      );
    } catch (error) {
      console.error('Checkbox update error:', error);
      showNotification("Chyba pri aktualizácii", "error");
    }
  }, [supabase, showNotification]);

  const clearFilters = useCallback(() => {
    setFilter({ hlava: "", suradnice_pismo: "", checked: "", created_at: "" });
    updatePage(1);
  }, [updatePage]);

  // Pomocná funkcia na vytvorenie nového lectio source objektu
  const createNewLectioSource = useCallback((original: LectioSource, targetLang: string) => {
    return {
      lang: targetLang,
      kniha: original.kniha || "", // Pridané aby splnilo NOT NULL constraint
      kapitola: original.kapitola || "", // Pridané aby splnilo NOT NULL constraint  
      hlava: original.hlava,
      suradnice_pismo: original.suradnice_pismo,
      lectio_text: original.lectio_text || "",
      meditatio_text: original.meditatio_text || "",
      oratio_text: original.oratio_text || "",
      contemplatio_text: original.contemplatio_text || "",
      actio_text: original.actio_text || "",
      reference: original.reference || "",
      // Všetky ostatné polia nastavíme na prázdne
      nazov_biblia_1: "",
      biblia_1: "",
      biblia_1_audio: "",
      nazov_biblia_2: "",
      biblia_2: "",
      biblia_2_audio: "",
      nazov_biblia_3: "",
      biblia_3: "",
      biblia_3_audio: "",
      lectio_audio: "",
      meditatio_audio: "",
      oratio_audio: "",
      contemplatio_audio: "",
      actio_audio: "",
      modlitba_zaver: "",
      audio_5_min: "",
      checked: 0
    };
  }, []);

  const handleCopyToLanguage = useCallback(async (targetLang: string) => {
    if (!copyDialog.lectioSource) return;

    const original = copyDialog.lectioSource;
    const newLectioSource = createNewLectioSource(original, targetLang);

    try {
      const { error } = await supabase
        .from("lectio_sources")
        .insert([newLectioSource]);

      if (error) {
        throw new Error(error.message);
      }

      const targetLangName = LANGUAGE_OPTIONS.find(l => l.value === targetLang)?.label || targetLang;
      showNotification(
        `Lectio zdroj bol úspešne skopírovaný do jazyka ${targetLangName}`, 
        "success"
      );
      
      // Refresh data if we're viewing the target language
      if (filterLang === targetLang) {
        fetchLectioSources();
      }
    } catch (error) {
      console.error('Copy error:', error);
      showNotification("Chyba pri kopírovaní", "error");
    }
  }, [copyDialog.lectioSource, createNewLectioSource, supabase, showNotification, filterLang, fetchLectioSources]);

  const handleCopyAndOpen = useCallback(async (targetLang: string) => {
    if (!copyDialog.lectioSource) return;

    const original = copyDialog.lectioSource;
    const newLectioSource = createNewLectioSource(original, targetLang);

    try {
      const { data, error } = await supabase
        .from("lectio_sources")
        .insert([newLectioSource])
        .select("id")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const targetLangName = LANGUAGE_OPTIONS.find(l => l.value === targetLang)?.label || targetLang;
      showNotification(
        `Lectio zdroj bol úspešne skopírovaný do jazyka ${targetLangName}. Otváram na editáciu...`, 
        "success"
      );
      
      // Uložíme aktuálnu stránku a jazyk
      localStorage.setItem('lectio_sources_return_page', page.toString());
      localStorage.setItem('lectio_sources_return_lang', filterLang);
      
      // Presmerujeme na editáciu nového záznamu
      router.push(`/admin/lectio-sources/${data.id}`);
    } catch (error) {
      console.error('Copy and open error:', error);
      showNotification("Chyba pri kopírovaní", "error");
    }
  }, [copyDialog.lectioSource, createNewLectioSource, supabase, showNotification, page, router, filterLang]);

  // Bulk copy handlers
  const handleSelectAll = useCallback(() => {
    if (selectedRows.size === lectioSources.length) {
      // Ak sú všetky označené, odznač všetky
      setSelectedRows(new Set());
    } else {
      // Inak označ všetky
      setSelectedRows(new Set(lectioSources.map(l => l.id!)));
    }
  }, [selectedRows.size, lectioSources]);

  const handleRowSelect = useCallback((id: number) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const handleBulkCopy = useCallback(async (targetLang: string) => {
    const selectedSources = lectioSources.filter(l => selectedRows.has(l.id!));
    
    if (selectedSources.length === 0) {
      showNotification("Nie sú označené žiadne záznamy", "error");
      return;
    }

    try {
      const newLectioSources = selectedSources.map(original => 
        createNewLectioSource(original, targetLang)
      );

      const { error } = await supabase
        .from("lectio_sources")
        .insert(newLectioSources);

      if (error) {
        throw new Error(error.message);
      }

      const targetLangName = LANGUAGE_OPTIONS.find(l => l.value === targetLang)?.label || targetLang;
      showNotification(
        `${selectedSources.length} Lectio zdrojov bolo úspešne skopírovaných do jazyka ${targetLangName}`, 
        "success"
      );
      
      // Vyčistiť označené riadky
      setSelectedRows(new Set());
      
      // Refresh data if we're viewing the target language
      if (filterLang === targetLang) {
        fetchLectioSources();
      }
    } catch (error) {
      console.error('Bulk copy error:', error);
      showNotification("Chyba pri skupinovom kopírovaní", "error");
    }
  }, [lectioSources, selectedRows, createNewLectioSource, supabase, showNotification, filterLang, fetchLectioSources]);

  const handleExportExcel = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("lectio_sources")
        .select(ALL_FIELDS.join(","))
        .eq("lang", filterLang);

      if (error || !data) {
        throw new Error("Chyba pri exporte!");
      }

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "LectioSources");
      XLSX.writeFile(wb, `lectio_sources_export_${filterLang}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
      showNotification("Export bol úspešne dokončený", "success");
    } catch (error) {
      console.error('Export error:', error);
      showNotification("Chyba pri exporte", "error");
    }
  }, [supabase, filterLang, showNotification]);

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

        const newItems = json
          .map(row => Object.fromEntries(
            ALL_FIELDS.map(f => [f, row[f] ?? ""])
          ))
          .filter(item => item.lang && item.hlava && item.suradnice_pismo);

        if (newItems.length === 0) {
          throw new Error("Nenašli sa žiadne validné záznamy na import");
        }

        const { error } = await supabase.from("lectio_sources").insert(newItems);

        if (error) {
          throw new Error(error.message);
        }

        showNotification(`Úspešne importovaných ${newItems.length} Lectio zdrojov!`, "success");
        fetchLectioSources();
      } catch (error) {
        console.error('Import error:', error);
        showNotification(`Chyba pri importe: ${error instanceof Error ? error.message : 'Neznáma chyba'}`, "error");
      } finally {
        setImporting(false);
        // Reset file input
        e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  }, [supabase, fetchLectioSources, showNotification]);

  // Computed values
  const hasActiveFilters = useMemo(() => 
    Object.values(filter).some(f => f !== ""), 
    [filter]
  );

  const hasAudioContent = useCallback((lectio: LectioSource) => {
    return !!(lectio.lectio_audio || lectio.meditatio_audio || 
             lectio.oratio_audio || lectio.contemplatio_audio);
  }, []);

  return (
    <div className="min-h-screen">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <CopyDialog
        isOpen={copyDialog.isOpen}
        onClose={() => setCopyDialog({ isOpen: false, lectioSource: null })}
        onCopy={handleCopyToLanguage}
        onCopyAndOpen={handleCopyAndOpen}
        currentLang={filterLang}
        lectioSource={copyDialog.lectioSource}
      />

      <BulkCopyDialog
        isOpen={bulkCopyDialog.isOpen}
        onClose={() => setBulkCopyDialog({ isOpen: false, selectedCount: 0 })}
        onBulkCopy={handleBulkCopy}
        currentLang={filterLang}
        selectedCount={bulkCopyDialog.selectedCount}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hlavička */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] px-8 py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Book size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    Správa Lectio Zdrojov
                  </h1>
                  <p className="text-indigo-100 mt-1">Zdrojový obsah pre Lectio Divina</p>
                  {selectedRows.size > 0 && (
                    <p className="text-indigo-200 text-sm mt-2 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1 inline-block">
                      ✓ {selectedRows.size} záznamov označených pre skupinové kopírovanie
                    </p>
                  )}
                </div>
              </div>
              
              {/* Štatistiky */}
              {detailedStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{detailedStats.total}</div>
                    <div className="text-sm text-indigo-100 mt-1">Celkom</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{detailedStats.complete}</div>
                    <div className="text-sm text-indigo-100 mt-1">Kompletné</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{detailedStats.completePercentage}%</div>
                    <div className="text-sm text-indigo-100 mt-1">Dokončené</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{detailedStats.checkedPercentage}%</div>
                    <div className="text-sm text-indigo-100 mt-1">Skontrolované ✓</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">{detailedStats.audio}</div>
                    <div className="text-sm text-indigo-100 mt-1">Audio 🎧</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold text-white drop-shadow">
                      {LANGUAGE_OPTIONS.find(l => l.value === filterLang)?.flag}
                    </div>
                    <div className="text-sm text-indigo-100 mt-1">Jazyk</div>
                  </div>
                </div>
              )}
            </div>

            {/* Detailné štatistiky obsahu - mimo gradientu */}
            {detailedStats && (
              <div className="bg-gray-50 rounded-xl p-6 mx-6 -mt-4 mb-6 border-t border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <BookOpen size={18} style={{ color: '#40467b' }} />
                  Detailný prehľad obsahu
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-sm">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span className="text-cyan-800 text-xs">📖</span>
                    </div>
                    <div className="font-bold text-cyan-800">{detailedStats.biblia1}</div>
                    <div className="text-xs text-gray-500">Biblia 1</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span className="text-teal-800 text-xs">📖</span>
                    </div>
                    <div className="font-bold text-teal-800">{detailedStats.biblia2}</div>
                    <div className="text-xs text-gray-500">Biblia 2</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span className="text-lime-800 text-xs">📖</span>
                    </div>
                    <div className="font-bold text-lime-800">{detailedStats.biblia3}</div>
                    <div className="text-xs text-gray-500">Biblia 3</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span className="text-purple-800 text-xs">📖</span>
                    </div>
                    <div className="font-bold text-purple-800">{detailedStats.lectio}</div>
                    <div className="text-xs text-gray-500">Lectio</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span className="text-green-800 text-xs">👁️</span>
                    </div>
                    <div className="font-bold text-green-800">{detailedStats.meditatio}</div>
                    <div className="text-xs text-gray-500">Meditatio</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span className="text-orange-800 text-xs">❤️</span>
                    </div>
                    <div className="font-bold text-orange-800">{detailedStats.oratio}</div>
                    <div className="text-xs text-gray-500">Oratio</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span className="text-indigo-800 text-xs">👁️</span>
                    </div>
                    <div className="font-bold text-indigo-800">{detailedStats.contemplatio}</div>
                    <div className="text-xs text-gray-500">Contemplatio</div>
                  </div>
                  <div className="text-center">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <span className="text-pink-800 text-xs">❤️</span>
                    </div>
                    <div className="font-bold text-pink-800">{detailedStats.actio}</div>
                    <div className="text-xs text-gray-500">Actio</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Info banner pre bulk copy */}
        {selectedRows.size === 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                <Copy size={16} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Skupinové kopírovanie</h4>
                <p className="text-blue-700 text-sm">
                  Označte viacero riadkov pomocou checkboxov a následne ich môžete naraz skopírovať do iného jazyka. 
                  Použite checkbox v hlavičke pre označenie všetkých záznamov na stránke.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Ovládacie panely */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Globe size={20} style={{ color: '#40467b' }} />
              </div>
              <h3 className="font-semibold text-gray-800">Jazyk zdrojov</h3>
            </div>
            <select
              value={filterLang}
              onChange={e => { 
                setFilterLang(e.target.value as "sk" | "cz" | "en" | "es"); 
                setSelectedRows(new Set()); // Vyčistiť označené riadky pri zmene jazyka
                updatePage(1); 
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
              <h3 className="font-semibold text-gray-800">Import / Export</h3>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <label className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition cursor-pointer text-center text-sm flex items-center justify-center gap-2 shadow-sm">
                  {importing ? <LoadingSpinner size={4} /> : <Upload size={16} />}
                  {importing ? "Importujem..." : "Import"}
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
                  Export
                </button>
              </div>
              <button
                onClick={() => setShowBulkBibleImport(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2.5 rounded-lg hover:from-purple-700 hover:to-purple-800 transition text-sm flex items-center justify-center gap-2 shadow-sm"
                title="Automaticky vyplní prázdne biblické polia na základe súradníc"
              >
                <BookOpen size={16} />
                <span className="hidden sm:inline">Import biblických textov</span>
                <span className="sm:hidden">Biblia Import</span>
              </button>
            </div>
          </div>

          {/* Akcie a Bulk Copy */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <PlusCircle size={20} style={{ color: '#40467b' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">Akcie</h3>
                {selectedRows.size > 0 && (
                  <p className="text-xs text-emerald-600 mt-1">
                    {selectedRows.size} označených
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/admin/lectio-sources/new")}
                className="w-full bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white px-4 py-2.5 rounded-lg hover:from-[#686ea3] hover:to-[#40467b] transition flex items-center justify-center gap-2 shadow-sm font-medium"
              >
                <PlusCircle size={16} />
                Pridať Lectio Zdroj
              </button>
              
              {selectedRows.size > 0 && (
                <button
                  onClick={() => setBulkCopyDialog({ 
                    isOpen: true, 
                    selectedCount: selectedRows.size 
                  })}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 py-2.5 rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition flex items-center justify-center gap-2 shadow-sm font-medium"
                >
                  <Copy size={16} />
                  Kopírovať označené ({selectedRows.size})
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Search size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-800">Filtre</h3>
              {hasActiveFilters && (
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                  Aktívne filtre
                </span>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
            >
              <Filter size={16} />
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-1" />
                  Nadpis
                </label>
                <input
                  type="text"
                  value={filter.hlava}
                  onChange={e => { 
                    setFilter(f => ({ ...f, hlava: e.target.value })); 
                    updatePage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent transition"
                  style={{'--tw-ring-color': '#40467b'} as React.CSSProperties}
                  placeholder="Filtrovať nadpisy..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Súradnice
                </label>
                <input
                  type="text"
                  value={filter.suradnice_pismo}
                  onChange={e => { 
                    setFilter(f => ({ ...f, suradnice_pismo: e.target.value })); 
                    updatePage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent transition"
                  style={{'--tw-ring-color': '#40467b'} as React.CSSProperties}
                  placeholder="Mt 5,1-12..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CheckCircle size={16} className="inline mr-1" />
                  Skontrolované
                </label>
                <select
                  value={filter.checked}
                  onChange={e => { 
                    setFilter(f => ({ ...f, checked: e.target.value })); 
                    updatePage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent transition"
                  style={{'--tw-ring-color': '#40467b'} as React.CSSProperties}
                >
                  <option value="">Všetky</option>
                  <option value="0">Neskontrolované</option>
                  <option value="1">Skontrolované</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-1" />
                  Dátum vytvorenia
                </label>
                <input
                  type="date"
                  value={filter.created_at}
                  onChange={e => { 
                    setFilter(f => ({ ...f, created_at: e.target.value })); 
                    updatePage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent transition"
                  style={{'--tw-ring-color': '#40467b'} as React.CSSProperties}
                />
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <X size={16} />
                Vyčistiť filtre
              </button>
            </div>
          )}
        </div>

        {/* Pagination - Top */}
        {Math.ceil(total / PAGE_SIZE) > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center text-sm text-gray-600 mb-4">
              Zobrazujem <span className="font-bold">{(page - 1) * PAGE_SIZE + 1}</span> až{" "}
              <span className="font-bold">{Math.min(page * PAGE_SIZE, total)}</span> z{" "}
              <span className="font-bold">{total}</span> Lectio zdrojov
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button
                onClick={() => updatePage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Predchádzajúca</span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Stránka:</span>
                <select
                  value={page}
                  onChange={(e) => updatePage(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:border-transparent transition min-w-[80px]"
                  style={{'--tw-ring-color': '#40467b'} as React.CSSProperties}
                >
                  {Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <option key={pageNum} value={pageNum}>
                        {pageNum} / {Math.ceil(total / PAGE_SIZE)}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <button
                onClick={() => {
                  const nextPage = page * PAGE_SIZE < total ? page + 1 : page;
                  updatePage(nextPage);
                }}
                disabled={page * PAGE_SIZE >= total}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Ďalšia</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 w-12">
                    <input
                      type="checkbox"
                      checked={lectioSources.length > 0 && selectedRows.size === lectioSources.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-2 cursor-pointer"
                      style={{'--tw-ring-color': '#40467b', color: '#40467b'} as React.CSSProperties}
                      title="Označiť/odznačiť všetky"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      Nadpis
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      Súradnice
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Globe size={16} />
                      Jazyk
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Obsah</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle size={16} />
                      Skontrolované
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Akcie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <LoadingSpinner />
                        <span className="text-gray-500">Načítavam...</span>
                      </div>
                    </td>
                  </tr>
                ) : lectioSources.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Book size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Žiadne Lectio zdroje</p>
                        <p>Skúste zmeniť filtre alebo pridajte nový zdroj</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  lectioSources.map(l => (
                    <tr key={l.id} className={`hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all duration-200 ${selectedRows.has(l.id!) ? 'bg-emerald-50 border-l-4 border-emerald-400' : ''}`}>
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(l.id!)}
                          onChange={() => handleRowSelect(l.id!)}
                          className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-2 cursor-pointer"
                          style={{'--tw-ring-color': '#40467b', color: '#40467b'} as React.CSSProperties}
                          title="Označiť pre skupinové kopírovanie"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">
                          {l.hlava?.length > 50 ? (
                            <span title={l.hlava}>{l.hlava.slice(0, 50)}...</span>
                          ) : (
                            l.hlava
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {l.suradnice_pismo}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                          {LANGUAGE_OPTIONS.find(lang => lang.value === l.lang)?.flag}
                          {l.lang?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {(l.biblia_1 || l.nazov_biblia_1) && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-100 text-cyan-800 text-xs rounded-full">
                              <BookOpen size={12} />
                              Biblia 1
                            </span>
                          )}
                          {(l.biblia_2 || l.nazov_biblia_2) && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-800 text-xs rounded-full">
                              <BookOpen size={12} />
                              Biblia 2
                            </span>
                          )}
                          {(l.biblia_3 || l.nazov_biblia_3) && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-lime-100 text-lime-800 text-xs rounded-full">
                              <BookOpen size={12} />
                              Biblia 3
                            </span>
                          )}
                          {l.lectio_text && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              <BookOpen size={12} />
                              Lectio
                            </span>
                          )}
                          {l.meditatio_text && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              <Eye size={12} />
                              Meditatio
                            </span>
                          )}
                          {l.oratio_text && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                              <Heart size={12} />
                              Oratio
                            </span>
                          )}
                          {l.contemplatio_text && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                              <Eye size={12} />
                              Contemplatio
                            </span>
                          )}
                          {l.actio_text && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">
                              <Heart size={12} />
                              Actio
                            </span>
                          )}
                          {hasAudioContent(l) && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-xs rounded-full" style={{ color: '#40467b' }}>
                              <Headphones size={12} />
                              Audio
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={l.checked === 1}
                            onChange={() => handleCheckboxChange(l.id!, l.checked || 0)}
                            className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-2 cursor-pointer"
                            style={{'--tw-ring-color': '#40467b', color: '#40467b'} as React.CSSProperties}
                            title={l.checked === 1 ? "Skontrolované" : "Neskontrolované"}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                            title="Upraviť"
                            onClick={() => {
                              localStorage.setItem('lectio_sources_return_page', page.toString());
                              localStorage.setItem('lectio_sources_return_lang', filterLang);
                              router.push(`/admin/lectio-sources/${l.id}`);
                            }}
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            style={{ color: '#40467b' }}
                            title="Kopírovať do iného jazyka"
                            onClick={() => setCopyDialog({ isOpen: true, lectioSource: l })}
                          >
                            <Copy size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(l.id!)}
                            disabled={deletingId === l.id}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                            title="Vymazať"
                          >
                            {deletingId === l.id ? (
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

        {Math.ceil(total / PAGE_SIZE) > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <div className="text-center text-sm text-gray-600 mb-4">
              Zobrazujem <span className="font-bold">{(page - 1) * PAGE_SIZE + 1}</span> až{" "}
              <span className="font-bold">{Math.min(page * PAGE_SIZE, total)}</span> z{" "}
              <span className="font-bold">{total}</span> Lectio zdrojov
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button
                onClick={() => updatePage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Predchádzajúca</span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Stránka:</span>
                <select
                  value={page}
                  onChange={(e) => updatePage(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:border-transparent transition min-w-[80px]"
                  style={{'--tw-ring-color': '#40467b'} as React.CSSProperties}
                >
                  {Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <option key={pageNum} value={pageNum}>
                        {pageNum} / {Math.ceil(total / PAGE_SIZE)}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <button
                onClick={() => {
                  const nextPage = page * PAGE_SIZE < total ? page + 1 : page;
                  updatePage(nextPage);
                }}
                disabled={page * PAGE_SIZE >= total}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Ďalšia</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Bulk Bible Import Modal */}
        <BulkBibleImportModal
          isOpen={showBulkBibleImport}
          onClose={() => setShowBulkBibleImport(false)}
          onImportsCompleted={() => {
            fetchLectioSources();
            fetchDetailedStats();
          }}
          currentLang={filterLang}
        />
      </div>
    </div>
  );
}