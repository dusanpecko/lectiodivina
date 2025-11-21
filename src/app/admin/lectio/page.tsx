//src/app/admin/lectio/page.tsx
"use client";

import { useSupabase } from "@/app/components/SupabaseProvider"; // ✅ OPRAVA
import {
    AlertCircle,
    BookOpen,
    Calendar,
    CheckCircle,
    Download,
    Edit3,
    Eye,
    FileText,
    Filter,
    Globe,
    Headphones,
    Heart,
    PlusCircle,
    RefreshCw,
    Search,
    Settings,
    Trash2,
    Upload,
    X
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";

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
  complete: number;
  completePercentage: number;
}

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

type FilterState = {
  hlava: string;
  suradnice_pismo: string;
  datumFrom: string;
  datumTo: string;
};

type NotificationType = 'success' | 'error' | 'info';

const PAGE_SIZE = 20;

const ALL_FIELDS: (keyof Lectio)[] = [
  "datum", "lang", "hlava", "suradnice_pismo", "uvod", "uvod_audio", "video",
  "modlitba_uvod", "modlitba_audio", "nazov_biblia_1", "biblia_1", "biblia_1_audio",
  "nazov_biblia_2", "biblia_2", "biblia_2_audio", "nazov_biblia_3", "biblia_3", "biblia_3_audio",
  "lectio_text", "lectio_audio", "meditatio_text", "meditatio_audio", "oratio_text", "oratio_audio",
  "contemplatio_text", "contemplatio_audio", "actio_text", "actio_audio",
  "modlitba_zaver", "audio_5_min", "zaver", "pozehnanie"
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

// Loading komponenta
const LoadingSpinner = ({ size = 6 }: { size?: number }) => (
  <div className={`w-${size} h-${size} border-2 border-emerald-600 border-t-transparent rounded-full animate-spin`} />
);

// Progress Bar komponenta
const ProgressBar = ({ current, total, isActive }: { current: number; total: number; isActive: boolean }) => {
  if (!isActive) return null;
  
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg p-4 shadow-lg min-w-80">
      <div className="flex items-center gap-3 mb-2">
        <LoadingSpinner size={4} />
        <span className="font-medium">Synchronizujem záznamy...</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-sm text-gray-600 mt-1">
        {current} z {total} ({percentage}%)
      </div>
    </div>
  );
};

// Results Modal komponenta
const SyncResultsModal = ({ 
  results, 
  onClose 
}: { 
  results: {
    success: number;
    errors: number;
    notFound: number;
    details: { type: 'success' | 'error' | 'notFound'; message: string }[];
  } | null;
  onClose: () => void;
}) => {
  if (!results) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Výsledky synchronizácie
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-800">{results.success}</div>
              <div className="text-sm text-green-600">Úspešné</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-800">{results.notFound}</div>
              <div className="text-sm text-yellow-600">Nenájdené</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-800">{results.errors}</div>
              <div className="text-sm text-red-600">Chyby</div>
            </div>
          </div>

          {(results.notFound > 0 || results.errors > 0) && (
            <div className="max-h-60 overflow-y-auto">
              <h3 className="font-medium text-gray-900 mb-3">Detaily problémov:</h3>
              <div className="space-y-2">
                {results.details
                  .filter(d => d.type !== 'success')
                  .map((detail, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded text-sm ${
                        detail.type === 'notFound' 
                          ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {detail.message}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Zavrieť
          </button>
        </div>
      </div>
    </div>
  );
};

export default function LectioAdminPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useSupabase();

  // State
  const [lectios, setLectios] = useState<Lectio[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);

  // Filtre a stránkovanie - inicializuj page z URL
  const [filterLang, setFilterLang] = useState<"sk" | "cz" | "en" | "es">("sk");
  const [page, setPage] = useState(() => {
    const pageParam = searchParams?.get('page');
    const pageNum = pageParam ? parseInt(pageParam, 10) : 1;
    return pageNum > 0 ? pageNum : 1;
  });
  const [total, setTotal] = useState(0);
  const [detailedStats, setDetailedStats] = useState<DetailedStats | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);
  
  // Progress tracking pre bulk sync
  const [syncProgress, setSyncProgress] = useState<{
    current: number;
    total: number;
    isActive: boolean;
  }>({ current: 0, total: 0, isActive: false });
  
  // Results modal state
  const [syncResults, setSyncResults] = useState<{
    show: boolean;
    success: number;
    errors: number;
    notFound: number;
    details: { type: 'success' | 'error' | 'notFound'; message: string }[];
  } | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    hlava: "",
    suradnice_pismo: "",
    datumFrom: "",
    datumTo: "",
  });
  const [globalSearch, setGlobalSearch] = useState("");

  // Helper pre zmenu stránky s aktualizáciou URL
  const updatePage = useCallback((newPage: number) => {
    setPage(newPage);
    if (newPage > 1) {
      router.push(`/admin/lectio?page=${newPage}`, { scroll: false });
    } else {
      router.push('/admin/lectio', { scroll: false });
    }
  }, [router]);

  // Load page from URL on mount or from localStorage if returning from edit
  useEffect(() => {
    const pageParam = searchParams?.get('page');
    
    // Ak nie je stránka v URL, skús načítať z localStorage (návrat z editácie)
    if (!pageParam) {
      const returnPage = localStorage.getItem('lectio_return_page');
      const returnLang = localStorage.getItem('lectio_return_lang');
      
      if (returnLang) {
        setFilterLang(returnLang as "sk" | "cz" | "en" | "es");
      }
      
      if (returnPage) {
        const pageNum = parseInt(returnPage, 10);
        if (pageNum > 0) {
          updatePage(pageNum); // Používame updatePage aby sa aktualizoval aj URL
        }
        // Vymaž localStorage po použití
        localStorage.removeItem('lectio_return_page');
      }
      
      if (returnLang) {
        localStorage.removeItem('lectio_return_lang');
      }
    }
  }, [searchParams, updatePage]);

  // Load detailed statistics
  const fetchDetailedStats = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("lectio")
        .select("id, nazov_biblia_1, biblia_1, nazov_biblia_2, biblia_2, nazov_biblia_3, biblia_3, lectio_text, meditatio_text, oratio_text, contemplatio_text, actio_text, uvod_audio, lectio_audio, meditatio_audio, oratio_audio, contemplatio_audio, actio_audio, biblia_1_audio, biblia_2_audio, biblia_3_audio, audio_5_min")
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
          audio: data.filter((l) => l.uvod_audio || l.lectio_audio || l.meditatio_audio || l.oratio_audio || l.contemplatio_audio || l.actio_audio || l.biblia_1_audio || l.biblia_2_audio || l.biblia_3_audio || l.audio_5_min).length,
          complete: data.filter((l) => {
            const hasBiblia1 = l.biblia_1 || l.nazov_biblia_1;
            const hasBiblia2 = l.biblia_2 || l.nazov_biblia_2;
            const hasBiblia3 = l.biblia_3 || l.nazov_biblia_3;
            const hasAudio = l.uvod_audio || l.lectio_audio || l.meditatio_audio || l.oratio_audio || l.contemplatio_audio || l.actio_audio || l.biblia_1_audio || l.biblia_2_audio || l.biblia_3_audio || l.audio_5_min;
            return hasBiblia1 && hasBiblia2 && hasBiblia3 && l.lectio_text && l.meditatio_text && l.oratio_text && l.contemplatio_text && l.actio_text && hasAudio;
          }).length,
          completePercentage: 0
        };
        
        stats.completePercentage = stats.total > 0 ? Math.round((stats.complete / stats.total) * 100) : 0;
        
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

  // Notifikácie helper
  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
  }, []);

  // Fetch data s optimalizáciou
  const fetchLectios = useCallback(async () => {
    setLoading(true);
    
    try {
      let dataQuery = supabase
        .from("lectio")
        .select("id, datum, lang, hlava, suradnice_pismo, uvod, lectio_text, meditatio_text, oratio_text, contemplatio_text, actio_text, nazov_biblia_1, biblia_1, nazov_biblia_2, biblia_2, nazov_biblia_3, biblia_3, uvod_audio, lectio_audio, meditatio_audio, oratio_audio, contemplatio_audio, actio_audio")
        .eq("lang", filterLang);

      let countQuery = supabase
        .from("lectio")
        .select("*", { count: "exact", head: true })
        .eq("lang", filterLang);

      // Aplikovať filtre
      if (globalSearch) {
        const searchPattern = `%${globalSearch}%`;
        const searchCondition = `hlava.ilike.${searchPattern},suradnice_pismo.ilike.${searchPattern},uvod.ilike.${searchPattern},lectio_text.ilike.${searchPattern}`;
        dataQuery = dataQuery.or(searchCondition);
        countQuery = countQuery.or(searchCondition);
      } else {
        if (filter.hlava) {
          dataQuery = dataQuery.ilike("hlava", `%${filter.hlava}%`);
          countQuery = countQuery.ilike("hlava", `%${filter.hlava}%`);
        }
        if (filter.suradnice_pismo) {
          dataQuery = dataQuery.ilike("suradnice_pismo", `%${filter.suradnice_pismo}%`);
          countQuery = countQuery.ilike("suradnice_pismo", `%${filter.suradnice_pismo}%`);
        }
        if (filter.datumFrom) {
          dataQuery = dataQuery.gte("datum", filter.datumFrom);
          countQuery = countQuery.gte("datum", filter.datumFrom);
        }
        if (filter.datumTo) {
          dataQuery = dataQuery.lte("datum", filter.datumTo);
          countQuery = countQuery.lte("datum", filter.datumTo);
        }
      }

      dataQuery = dataQuery.order("datum", { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      const [{ data, error }, { count, error: countError }] = await Promise.all([
        dataQuery,
        countQuery
      ]);

      if (error || countError) {
        throw new Error(error?.message || countError?.message || "Chyba pri načítavaní dát");
      }

      setLectios(data as Lectio[]);
      setTotal(count || 0);
    } catch (error) {
      console.error('Fetch error:', error);
      showNotification("Chyba pri načítavaní dát", "error");
      setLectios([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [supabase, filterLang, filter, globalSearch, page, showNotification]);

  // Effects
  useEffect(() => {
    fetchLectios();
  }, [fetchLectios]);

  // Handlers
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("Naozaj chcete vymazať túto Lectio Divina? Táto akcia sa nedá vrátiť späť.")) {
      return;
    }

    setDeletingId(id);
    
    try {
      const { error } = await supabase.from("lectio").delete().eq("id", id);
      
      if (error) {
        throw new Error(error.message);
      }

      showNotification("Lectio Divina bola úspešne vymazaná", "success");
      
      // Ak je posledný item na stránke, choď na predchádzajúcu
      if (lectios.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        fetchLectios();
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification("Chyba pri mazaní", "error");
    } finally {
      setDeletingId(null);
    }
  }, [supabase, lectios.length, page, fetchLectios, showNotification]);

  // Synchronizácia dát z lectio-sources
  const handleSyncFromSources = useCallback(async (lectioItem: Lectio) => {
    if (!lectioItem.id) return;
    
    setSyncingId(lectioItem.id);
    
    try {
      // Nájdi zodpovedajúci záznam v lectio-sources na základe hlava a jazyka
      const { data: sourceData, error: sourceError } = await supabase
        .from("lectio_sources")
        .select("*")
        .eq("hlava", lectioItem.hlava)
        .eq("lang", lectioItem.lang)
        .single();

      if (sourceError) {
        if (sourceError.code === 'PGRST116') {
          throw new Error(`Nenašiel sa zodpovedajúci záznam v lectio-sources pre "${lectioItem.hlava}"`);
        }
        throw new Error(sourceError.message);
      }

      if (!sourceData) {
        throw new Error(`Nenašiel sa záznam v lectio-sources pre "${lectioItem.hlava}"`);
      }

      // Priprav dáta na aktualizáciu - prekopíruj všetko okrem id a datum
      const updateData = {
        lang: sourceData.lang,
        hlava: sourceData.hlava,
        suradnice_pismo: sourceData.suradnice_pismo,
        uvod: sourceData.uvod || "",
        uvod_audio: sourceData.uvod_audio || "",
        video: sourceData.video || "",
        modlitba_uvod: sourceData.modlitba_uvod || "",
        modlitba_audio: sourceData.modlitba_audio || "",
        nazov_biblia_1: sourceData.nazov_biblia_1 || "",
        biblia_1: sourceData.biblia_1 || "",
        biblia_1_audio: sourceData.biblia_1_audio || "",
        nazov_biblia_2: sourceData.nazov_biblia_2 || "",
        biblia_2: sourceData.biblia_2 || "",
        biblia_2_audio: sourceData.biblia_2_audio || "",
        nazov_biblia_3: sourceData.nazov_biblia_3 || "",
        biblia_3: sourceData.biblia_3 || "",
        biblia_3_audio: sourceData.biblia_3_audio || "",
        lectio_text: sourceData.lectio_text || "",
        lectio_audio: sourceData.lectio_audio || "",
        meditatio_text: sourceData.meditatio_text || "",
        meditatio_audio: sourceData.meditatio_audio || "",
        oratio_text: sourceData.oratio_text || "",
        oratio_audio: sourceData.oratio_audio || "",
        contemplatio_text: sourceData.contemplatio_text || "",
        contemplatio_audio: sourceData.contemplatio_audio || "",
        actio_text: sourceData.actio_text || "",
        actio_audio: sourceData.actio_audio || "",
        modlitba_zaver: sourceData.modlitba_zaver || "",
        audio_5_min: sourceData.audio_5_min || "",
        zaver: sourceData.zaver || "",
        pozehnanie: sourceData.pozehnanie || ""
        // datum sa necháva bez zmeny!
      };

      // Aktualizuj záznam v lectio
      const { error: updateError } = await supabase
        .from("lectio")
        .update(updateData)
        .eq("id", lectioItem.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      showNotification(
        `Dáta pre "${lectioItem.hlava}" boli úspešne synchronizované z lectio-sources`, 
        "success"
      );
      
      // Obnoviť zoznam
      fetchLectios();
      
    } catch (error) {
      console.error('Sync error:', error);
      showNotification(
        `Chyba pri synchronizácii: ${error instanceof Error ? error.message : 'Neznáma chyba'}`, 
        "error"
      );
    } finally {
      setSyncingId(null);
    }
  }, [supabase, showNotification, fetchLectios]);

  // Hromadná synchronizácia všetkých záznamov v databáze
  const handleBulkSyncFromSources = useCallback(async () => {
    if (!confirm(`Naozaj chcete synchronizovať VŠETKY záznamy v databáze lectio (jazyk: ${filterLang}) z lectio-sources? Táto akcia prepíše všetky údaje okrem dátumu.`)) {
      return;
    }

    setSyncingId(-1); // Použijeme -1 pre bulk sync
    let successCount = 0;
    let errorCount = 0;
    let notFoundCount = 0;
    const details: { type: 'success' | 'error' | 'notFound'; message: string }[] = [];

    try {
      // Najprv získaj VŠETKY záznamy z lectio pre daný jazyk
      const { data: allLectios, error: fetchError } = await supabase
        .from("lectio")
        .select("id, hlava, lang, datum")
        .eq("lang", filterLang);

      if (fetchError) {
        throw new Error(`Chyba pri načítavaní záznamov: ${fetchError.message}`);
      }

      if (!allLectios || allLectios.length === 0) {
        showNotification(`Nenašli sa žiadne záznamy pre jazyk ${filterLang}`, "info");
        return;
      }

      // Inicializuj progress tracking
      setSyncProgress({
        current: 0,
        total: allLectios.length,
        isActive: true
      });

      showNotification(`Spúšťam synchronizáciu ${allLectios.length} záznamov...`, "info");

      for (let i = 0; i < allLectios.length; i++) {
        const lectioItem = allLectios[i];
        
        // Update progress
        setSyncProgress(prev => ({
          ...prev,
          current: i + 1
        }));

        try {
          // Nájdi zodpovedajúci záznam v lectio-sources
          const { data: sourceData, error: sourceError } = await supabase
            .from("lectio_sources")
            .select("*")
            .eq("hlava", lectioItem.hlava)
            .eq("lang", lectioItem.lang)
            .single();

          if (sourceError) {
            if (sourceError.code === 'PGRST116') {
              notFoundCount++;
              details.push({
                type: 'notFound',
                message: `"${lectioItem.hlava}": Nenašiel sa v lectio-sources`
              });
              continue;
            }
            throw new Error(sourceError.message);
          }

          if (!sourceData) {
            notFoundCount++;
            details.push({
              type: 'notFound',
              message: `"${lectioItem.hlava}": Nenašiel sa v lectio-sources`
            });
            continue;
          }

          // Priprav dáta na aktualizáciu (rovnaká logika ako v individual sync)
          const updateData = {
            lang: sourceData.lang,
            hlava: sourceData.hlava,
            suradnice_pismo: sourceData.suradnice_pismo,
            uvod: sourceData.uvod || "",
            uvod_audio: sourceData.uvod_audio || "",
            video: sourceData.video || "",
            modlitba_uvod: sourceData.modlitba_uvod || "",
            modlitba_audio: sourceData.modlitba_audio || "",
            nazov_biblia_1: sourceData.nazov_biblia_1 || "",
            biblia_1: sourceData.biblia_1 || "",
            biblia_1_audio: sourceData.biblia_1_audio || "",
            nazov_biblia_2: sourceData.nazov_biblia_2 || "",
            biblia_2: sourceData.biblia_2 || "",
            biblia_2_audio: sourceData.biblia_2_audio || "",
            nazov_biblia_3: sourceData.nazov_biblia_3 || "",
            biblia_3: sourceData.biblia_3 || "",
            biblia_3_audio: sourceData.biblia_3_audio || "",
            lectio_text: sourceData.lectio_text || "",
            lectio_audio: sourceData.lectio_audio || "",
            meditatio_text: sourceData.meditatio_text || "",
            meditatio_audio: sourceData.meditatio_audio || "",
            oratio_text: sourceData.oratio_text || "",
            oratio_audio: sourceData.oratio_audio || "",
            contemplatio_text: sourceData.contemplatio_text || "",
            contemplatio_audio: sourceData.contemplatio_audio || "",
            actio_text: sourceData.actio_text || "",
            actio_audio: sourceData.actio_audio || "",
            modlitba_zaver: sourceData.modlitba_zaver || "",
            audio_5_min: sourceData.audio_5_min || "",
            zaver: sourceData.zaver || "",
            pozehnanie: sourceData.pozehnanie || ""
          };

          // Aktualizuj záznam
          const { error: updateError } = await supabase
            .from("lectio")
            .update(updateData)
            .eq("id", lectioItem.id);

          if (updateError) {
            errorCount++;
            details.push({
              type: 'error',
              message: `"${lectioItem.hlava}": ${updateError.message}`
            });
          } else {
            successCount++;
            details.push({
              type: 'success',
              message: `"${lectioItem.hlava}": Úspešne synchronizované`
            });
          }

        } catch (error) {
          errorCount++;
          details.push({
            type: 'error',
            message: `"${lectioItem.hlava}": ${error instanceof Error ? error.message : 'Neznáma chyba'}`
          });
        }
      }

      // Zobraziť výsledky v modal okne
      setSyncResults({
        show: true,
        success: successCount,
        errors: errorCount,
        notFound: notFoundCount,
        details: details
      });

      // Obnoviť zoznam
      fetchLectios();

    } catch (error) {
      console.error('Bulk sync error:', error);
      showNotification("Chyba pri hromadnej synchronizácii", "error");
    } finally {
      setSyncingId(null);
      setSyncProgress(prev => ({ ...prev, isActive: false }));
    }
  }, [supabase, filterLang, showNotification, fetchLectios]);

  const clearFilters = useCallback(() => {
    setFilter({ hlava: "", suradnice_pismo: "", datumFrom: "", datumTo: "" });
    setGlobalSearch("");
    setPage(1);
  }, []);

  const handleExportExcel = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("lectio")
        .select(ALL_FIELDS.join(","))
        .eq("lang", filterLang);

      if (error || !data) {
        throw new Error("Chyba pri exporte!");
      }

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Lectio");
      XLSX.writeFile(wb, `lectio_export_${filterLang}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
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
          .filter(item => item.datum && item.lang && item.hlava && item.suradnice_pismo);

        if (newItems.length === 0) {
          throw new Error("Nenašli sa žiadne validné záznamy na import");
        }

        const { error } = await supabase.from("lectio").insert(newItems);

        if (error) {
          throw new Error(error.message);
        }

        showNotification(`Úspešne importovaných ${newItems.length} Lectio Divina!`, "success");
        fetchLectios();
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
  }, [supabase, fetchLectios, showNotification]);

  // Computed values
  const hasActiveFilters = useMemo(() => 
    globalSearch || Object.values(filter).some(f => f !== ""), 
    [globalSearch, filter]
  );

  const hasAudioContent = useCallback((lectio: Lectio) => {
    return !!(lectio.uvod_audio || lectio.lectio_audio || lectio.meditatio_audio || 
             lectio.oratio_audio || lectio.contemplatio_audio);
  }, []);

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hlavička */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] px-8 py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <BookOpen size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    Správa Lectio Divina
                  </h1>
                  <p className="text-indigo-100 mt-1">Kompletná Lectio Divina pre používateľov</p>
                </div>
              </div>
              
              {/* Štatistiky */}
              {detailedStats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
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

        {/* Ovládacie panely */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Výber jazyka */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Globe size={20} style={{ color: '#40467b' }} />
              </div>
              <h3 className="font-semibold text-gray-800">Jazyk Lectio</h3>
            </div>
            <select
              value={filterLang}
              onChange={e => { setFilterLang(e.target.value as "sk" | "cz" | "en" | "es"); setPage(1); }}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b] transition"
            >
              {LANGUAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.flag} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Import/Export + Akcie */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Download size={20} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Import / Export</h3>
            </div>
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
          </div>

          {/* Akcie */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <PlusCircle size={20} style={{ color: '#40467b' }} />
              </div>
              <h3 className="font-semibold text-gray-800">Akcie</h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => {
                  localStorage.setItem('lectio_return_page', page.toString());
                  localStorage.setItem('lectio_return_lang', filterLang);
                  router.push("/admin/lectio/new");
                }}
                className="w-full bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white px-4 py-2.5 rounded-lg hover:from-[#686ea3] hover:to-[#40467b] transition flex items-center justify-center gap-2 shadow-sm font-medium"
              >
                <PlusCircle size={18} />
                Pridať Lectio
              </button>
              <button
                onClick={handleBulkSyncFromSources}
                disabled={syncingId !== null}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition flex items-center justify-center gap-2 shadow-sm font-medium disabled:opacity-50"
              >
                {syncingId !== null ? <LoadingSpinner size={4} /> : <RefreshCw size={18} />}
                Sync všetko
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={globalSearch}
                onChange={e => { setGlobalSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 transition-all focus:outline-none focus:ring-2 focus:ring-[#40467b]"
                placeholder="Hľadať v názvoch, súradniciach a textoch..."
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all border ${
                showFilters || hasActiveFilters 
                  ? 'bg-indigo-50 border-indigo-200 text-[#40467b]' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              type="button"
            >
              <Filter size={18} />
              Filtre {hasActiveFilters && `(${Object.values(filter).filter(v => v !== "").length})`}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  📝 Nadpis
                </label>
                <input
                  type="text"
                  value={filter.hlava}
                  onChange={e => { setFilter(f => ({ ...f, hlava: e.target.value })); setPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b]"
                  placeholder="Filtrovať nadpisy..."
                  disabled={!!globalSearch}
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  📜 Súradnice Písma
                </label>
                <input
                  type="text"
                  value={filter.suradnice_pismo}
                  onChange={e => { setFilter(f => ({ ...f, suradnice_pismo: e.target.value })); setPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b]"
                  placeholder="Mt 5,1-12..."
                  disabled={!!globalSearch}
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  📅 Dátum od
                </label>
                <input
                  type="date"
                  value={filter.datumFrom}
                  onChange={e => { setFilter(f => ({ ...f, datumFrom: e.target.value })); setPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b]"
                  disabled={!!globalSearch}
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  📅 Dátum do
                </label>
                <input
                  type="date"
                  value={filter.datumTo}
                  onChange={e => { setFilter(f => ({ ...f, datumTo: e.target.value })); setPage(1); }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#40467b] focus:border-[#40467b]"
                  disabled={!!globalSearch}
                />
              </div>
            </div>
            
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)', color: '#40467b' }}
              type="button"
            >
              <X size={16} />
              Vymazať filtre
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    Dátum
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FileText size={16} />
                    Nadpis
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} />
                    Súradnice
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Globe size={16} />
                    Jazyk
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Obsah</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <div className="flex items-center justify-center gap-2">
                    <Settings size={16} />
                    Akcie
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <LoadingSpinner />
                        <span className="text-gray-500">Načítavam...</span>
                      </div>
                    </td>
                  </tr>
                ) : lectios.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Žiadne Lectio Divina</p>
                        <p>Skúste zmeniť filtre alebo pridajte novú Lectio</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  lectios.map(l => (
                    <tr key={l.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {new Date(l.datum + 'T00:00:00').toLocaleDateString('sk-SK', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 font-medium">
                          {l.hlava?.length > 50 ? (
                            <span title={l.hlava}>{l.hlava.slice(0, 50)}...</span>
                          ) : (
                            l.hlava
                          )}
                        </div>
                        {l.uvod && (
                          <div className="text-sm text-gray-500 mt-1">
                            {l.uvod.length > 80 ? l.uvod.slice(0, 80) + "..." : l.uvod}
                          </div>
                        )}
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
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              <Headphones size={12} />
                              Audio
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                            title="Upraviť"
                            onClick={() => {
                              localStorage.setItem('lectio_return_page', page.toString());
                              localStorage.setItem('lectio_return_lang', filterLang);
                              router.push(`/admin/lectio/${l.id}`);
                            }}
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handleSyncFromSources(l)}
                            disabled={syncingId === l.id}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition disabled:opacity-50"
                            title="Synchronizovať z lectio-sources"
                          >
                            {syncingId === l.id ? (
                              <LoadingSpinner size={4} />
                            ) : (
                              <RefreshCw size={18} />
                            )}
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

      {/* Pagination */}
      {!loading && lectios.length > 0 && Math.ceil(total / PAGE_SIZE) > 1 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Zobrazené {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} z {total} záznamov
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
                style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)', color: '#40467b' }}
              >
                ← Predchádzajúca
              </button>
              <span className="px-4 py-2 text-sm font-medium" style={{ color: '#40467b' }}>
                Stránka {page} z {Math.ceil(total / PAGE_SIZE)}
              </span>
              <button
                onClick={() => setPage(p => (p * PAGE_SIZE < total ? p + 1 : p))}
                disabled={page * PAGE_SIZE >= total}
                className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-80"
                style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)', color: '#40467b' }}
              >
                Ďalšia →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <ProgressBar 
        current={syncProgress.current}
        total={syncProgress.total}
        isActive={syncProgress.isActive}
      />

      {/* Results Modal */}
      <SyncResultsModal
        results={syncResults}
        onClose={() => setSyncResults(null)}
      />
      </div>
    </div>
  );
}