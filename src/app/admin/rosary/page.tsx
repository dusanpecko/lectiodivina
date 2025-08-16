//admin/rosary/page.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { 
  BookOpen, Trash2, PlusCircle, Edit3, Download, Upload, 
  Filter, Search, ChevronDown, ChevronUp, Globe, Calendar, 
  Heart, Eye, Headphones, FileText, Scroll, ArrowLeft, ArrowRight,
  X, CheckCircle, AlertCircle, Crown, Star, Sun, Sparkles
} from "lucide-react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

interface LectioDivinaRuzenec {
  id?: string;
  created_at?: string;
  updated_at?: string;
  lang: string;
  biblicky_text: string;
  kategoria: string;
  ruzenec: string;
  uvod: string;
  ilustracny_obrazok?: string;
  uvodne_modlitby?: string;
  lectio_text: string;
  komentar?: string;
  meditatio_text: string;
  oratio_html: string;
  contemplatio_text: string;
  actio_text: string;
  audio_nahravka?: string;
  autor?: string;
  publikovane: boolean;
  poradie: number;
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

const ALL_FIELDS: (keyof LectioDivinaRuzenec)[] = [
  "lang", "biblicky_text", "kategoria", "ruzenec", "uvod", "ilustracny_obrazok",
  "uvodne_modlitby", "lectio_text", "komentar", "meditatio_text", "oratio_html",
  "contemplatio_text", "actio_text", "audio_nahravka", "autor", "publikovane", "poradie"
];

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

// Loading komponenta
const LoadingSpinner = ({ size = 6 }: { size?: number }) => (
  <div className={`w-${size} h-${size} border-2 border-emerald-600 border-t-transparent rounded-full animate-spin`} />
);

export default function RosaryAdminPage() {
  const { lang: appLang } = useLanguage();
  const t = translations[appLang];
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

  // Filtre a stránkovanie
  const [filterLang, setFilterLang] = useState<"sk" | "cz" | "en" | "es">("sk");
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
          ilustracny_obrazok, lectio_text, meditatio_text, oratio_html,
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
  useEffect(() => {
    fetchKategorie();
  }, [fetchKategorie]);

  useEffect(() => {
    fetchRuzence();
  }, [fetchRuzence]);

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

      showNotification("Ruženec bol úspešne vymazaný", "success");
      
      // Ak je posledný item na stránke, choď na predchádzajúcu
      if (ruzence.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        fetchRuzence();
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification("Chyba pri mazaní", "error");
    } finally {
      setDeletingId(null);
    }
  }, [supabase, ruzence.length, page, fetchRuzence, showNotification]);

  const clearFilters = useCallback(() => {
    setFilter({ kategoria: "", biblicky_text: "", autor: "", publikovane: "" });
    setGlobalSearch("");
    setPage(1);
  }, []);

  const handleExportExcel = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("lectio_divina_ruzenec")
        .select(ALL_FIELDS.join(","))
        .eq("lang", filterLang);

      if (error || !data) {
        throw new Error("Chyba pri exporte!");
      }

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Ruzence");
      XLSX.writeFile(wb, `ruzence_export_${filterLang}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
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
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        const newItems = json
          .map(row => Object.fromEntries(
            ALL_FIELDS.map(f => [f, row[f] ?? ""])
          ))
          .filter(item => item.ruzenec && item.lang && item.kategoria && item.biblicky_text);

        if (newItems.length === 0) {
          throw new Error("Nenašli sa žiadne validné záznamy na import");
        }

        const { error } = await supabase
          .from("lectio_divina_ruzenec")
          .insert(newItems);

        if (error) {
          throw new Error(error.message);
        }

        showNotification(`Úspešne importovaných ${newItems.length} ruženecov!`, "success");
        fetchRuzence();
      } catch (error) {
        console.error('Import error:', error);
        showNotification(`Chyba pri importe: ${error instanceof Error ? error.message : 'Neznáma chyba'}`, "error");
      } finally {
        setImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  }, [supabase, fetchRuzence, showNotification]);

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

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-100">
      {/* Notifikácie */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-7xl mx-auto p-6">
        {/* Hlavička */}
        <header className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Správa Lectio Divina Ruženec
                </h1>
                <p className="text-gray-600">Duchovné rozjímanie s ružencom</p>
              </div>
            </div>
            
            {/* Štatistiky */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-rose-600">{stats.total}</div>
                <div className="text-sm text-gray-500">Celkom</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.withAudio}</div>
                <div className="text-sm text-gray-500">S audio</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.published}</div>
                <div className="text-sm text-gray-500">Publikované</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {LANGUAGE_OPTIONS.find(l => l.value === filterLang)?.flag}
                </div>
                <div className="text-sm text-gray-500">Jazyk</div>
              </div>
            </div>
          </div>
        </header>

        {/* Ovládacie panely */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Výber jazyka */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe size={20} className="text-rose-600" />
              <h3 className="font-semibold text-gray-800">Jazyk Ruženec</h3>
            </div>
            <select
              value={filterLang}
              onChange={e => { 
                setFilterLang(e.target.value as any); 
                setPage(1); 
              }}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
            >
              {LANGUAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.flag} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Import/Export */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download size={20} className="text-green-600" />
              <h3 className="font-semibold text-gray-800">Import / Export</h3>
            </div>
            <div className="flex gap-2">
              <label className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer text-center text-sm flex items-center justify-center gap-2">
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
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm flex items-center justify-center gap-2"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Akcie */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <PlusCircle size={20} className="text-pink-600" />
              <h3 className="font-semibold text-gray-800">Akcie</h3>
            </div>
            <button
              onClick={() => router.push("/admin/rosary/new")}
              className="w-full bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition flex items-center justify-center gap-2"
            >
              <PlusCircle size={16} />
              Pridať Ruženec
            </button>
          </div>
        </div>

        {/* Vyhľadávanie a filtre */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Search size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-800">Vyhľadávanie a filtre</h3>
              {hasActiveFilters && (
                <span className="bg-rose-100 text-rose-800 text-xs px-2 py-1 rounded-full">
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

          {/* Globálne vyhľadávanie */}
          <div className="mb-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={globalSearch}
                onChange={e => { 
                  setGlobalSearch(e.target.value); 
                  setPage(1); 
                }}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                placeholder="Vyhľadať v názvoch ruženec, biblických textoch a obsahu..."
              />
            </div>
          </div>

          {/* Detailné filtre */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Crown size={16} className="inline mr-1" />
                  Kategória
                </label>
                <select
                  value={filter.kategoria}
                  onChange={e => { 
                    setFilter(f => ({ ...f, kategoria: e.target.value })); 
                    setPage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                  disabled={!!globalSearch}
                >
                  <option value="">Všetky kategórie</option>
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
                  Biblický text
                </label>
                <input
                  type="text"
                  value={filter.biblicky_text}
                  onChange={e => { 
                    setFilter(f => ({ ...f, biblicky_text: e.target.value })); 
                    setPage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                  placeholder="Filtrovať biblické texty..."
                  disabled={!!globalSearch}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Autor</label>
                <input
                  type="text"
                  value={filter.autor}
                  onChange={e => { 
                    setFilter(f => ({ ...f, autor: e.target.value })); 
                    setPage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                  placeholder="Filtrovať autorov..."
                  disabled={!!globalSearch}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Publikované</label>
                <select
                  value={filter.publikovane}
                  onChange={e => { 
                    setFilter(f => ({ ...f, publikovane: e.target.value })); 
                    setPage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
                  disabled={!!globalSearch}
                >
                  <option value="">Všetky</option>
                  <option value="true">Publikované</option>
                  <option value="false">Nepublikované</option>
                </select>
              </div>
            </div>
          )}

          {/* Vyčistiť filtre */}
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

        {/* Tabuľka */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Crown size={16} />
                      Kategória
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} />
                      Ruženec
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Scroll size={16} />
                      Biblický text
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Globe size={16} />
                      Jazyk
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stav</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Akcie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <LoadingSpinner />
                        <span className="text-gray-500">Načítavam...</span>
                      </div>
                    </td>
                  </tr>
                ) : ruzence.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Sparkles size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Žiadne ruženec</p>
                        <p>Skúste zmeniť filtre alebo pridajte nový ruženec</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  ruzence.map(r => (
                    <tr key={r.id} className="hover:bg-rose-50 transition-colors">
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
                          {r.ruzenec?.length > 50 ? (
                            <span title={r.ruzenec}>{r.ruzenec.slice(0, 50)}...</span>
                          ) : (
                            r.ruzenec
                          )}
                        </div>
                        {r.uvod && (
                          <div className="text-sm text-gray-500 mt-1">
                            {r.uvod.length > 80 ? r.uvod.slice(0, 80) + "..." : r.uvod}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 text-sm bg-gray-100 px-2 py-1 rounded">
                          {r.biblicky_text?.length > 60 ? 
                            r.biblicky_text.slice(0, 60) + "..." : 
                            r.biblicky_text
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-rose-100 text-rose-800 text-sm font-medium rounded-full">
                          {LANGUAGE_OPTIONS.find(lang => lang.value === r.lang)?.flag}
                          {r.lang?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                            r.publikovane 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            <Eye size={12} />
                            {r.publikovane ? 'Publikované' : 'Koncept'}
                          </span>
                          {hasAudioContent(r) && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              <Headphones size={12} />
                              Audio
                            </span>
                          )}
                          {r.ilustracny_obrazok && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              <FileText size={12} />
                              Obrázok
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                            title="Upraviť"
                            onClick={() => router.push(`/admin/rosary/${r.id}`)}
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(r.id!)}
                            disabled={deletingId === r.id}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                            title="Vymazať"
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
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Zobrazujem <span className="font-medium">{(page - 1) * PAGE_SIZE + 1}</span> až{" "}
                <span className="font-medium">{Math.min(page * PAGE_SIZE, total)}</span> z{" "}
                <span className="font-medium">{total}</span> ruženecov
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft size={16} />
                  Predchádzajúca
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
                            className={`w-10 h-10 rounded-lg transition ${
                              page === pageNum
                                ? "bg-rose-600 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
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
                          className={`w-10 h-10 rounded-lg transition ${
                            page === i
                              ? "bg-rose-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
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
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Ďalšia
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