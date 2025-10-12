"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { 
  BookOpen, Trash2, PlusCircle, Edit3, Download, Upload, 
  Filter, Search, ChevronDown, ChevronUp, Globe, Calendar, 
  Heart, Eye, Headphones, FileText, Video, ArrowLeft, ArrowRight,
  X, CheckCircle, AlertCircle, Star, Play, Clock, Users
} from "lucide-react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

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

type FilterState = {
  category: string;
  title: string;
  author: string;
  is_published: string;
};

type NotificationType = 'success' | 'error' | 'info';

const PAGE_SIZE = 20;

const ALL_FIELDS: (keyof Program)[] = [
  "title", "slug", "category", "description", "image_url", "author", 
  "lang", "is_featured", "is_published", "display_order"
];

const LANGUAGE_OPTIONS = [
  { value: "sk" as const, label: "Slovenčina", flag: "🇸🇰" },
  { value: "cz" as const, label: "Čeština", flag: "🇨🇿" },
  { value: "en" as const, label: "English", flag: "🇺🇸" },
  { value: "es" as const, label: "Español", flag: "🇪🇸" },
];

const CATEGORY_ICONS = {
  'featured': <Star className="w-4 h-4 text-yellow-500" />,
  'sleep_stories': <BookOpen className="w-4 h-4 text-purple-500" />,
  'meditation': <Heart className="w-4 h-4 text-green-500" />,
  'prayer': <Users className="w-4 h-4 text-blue-500" />,
  'bible_study': <FileText className="w-4 h-4 text-indigo-500" />,
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
  <div className={`w-${size} h-${size} border-2 border-blue-600 border-t-transparent rounded-full animate-spin`} />
);

export default function ProgramsAdminPage() {
  const { lang: appLang } = useLanguage();
  const t = translations[appLang];
  const router = useRouter();
  const { supabase } = useSupabase();

  // State
  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, setCategories] = useState<ProgramCategory[]>([]);
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
    category: "",
    title: "",
    author: "",
    is_published: "",
  });
  const [globalSearch, setGlobalSearch] = useState("");

  // Notifikácie helper
  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
  }, []);

  // Fetch kategórie
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("program_categories")
        .select("*")
        .eq("is_active", true)
        .order("display_order");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Categories fetch error:', error);
    }
  }, [supabase]);

  // Fetch data s optimalizáciou
  const fetchPrograms = useCallback(async () => {
    setLoading(true);
    
    try {
      let dataQuery = supabase
        .from("programs")
        .select(`
          id, created_at, updated_at, title, slug, category, description, 
          image_url, author, lang, total_sessions, total_duration_minutes,
          is_featured, is_published, display_order, published_at
        `)
        .eq("lang", filterLang);

      let countQuery = supabase
        .from("programs")
        .select("*", { count: "exact", head: true })
        .eq("lang", filterLang);

      // Aplikovať filtre
      if (globalSearch) {
        const searchPattern = `%${globalSearch}%`;
        const searchCondition = `title.ilike.${searchPattern},description.ilike.${searchPattern},author.ilike.${searchPattern}`;
        dataQuery = dataQuery.or(searchCondition);
        countQuery = countQuery.or(searchCondition);
      } else {
        if (filter.category) {
          dataQuery = dataQuery.eq("category", filter.category);
          countQuery = countQuery.eq("category", filter.category);
        }
        if (filter.title) {
          dataQuery = dataQuery.ilike("title", `%${filter.title}%`);
          countQuery = countQuery.ilike("title", `%${filter.title}%`);
        }
        if (filter.author) {
          dataQuery = dataQuery.ilike("author", `%${filter.author}%`);
          countQuery = countQuery.ilike("author", `%${filter.author}%`);
        }
        if (filter.is_published !== "") {
          const isPublished = filter.is_published === "true";
          dataQuery = dataQuery.eq("is_published", isPublished);
          countQuery = countQuery.eq("is_published", isPublished);
        }
      }

      dataQuery = dataQuery.order("is_featured", { ascending: false })
        .order("category", { ascending: true })
        .order("display_order", { ascending: true })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

      const [{ data, error }, { count, error: countError }] = await Promise.all([
        dataQuery,
        countQuery
      ]);

      if (error || countError) {
        throw new Error(error?.message || countError?.message || "Chyba pri načítavaní dát");
      }

      setPrograms(data as Program[]);
      setTotal(count || 0);
    } catch (error) {
      console.error('Fetch error:', error);
      showNotification("Chyba pri načítavaní dát", "error");
      setPrograms([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [supabase, filterLang, filter, globalSearch, page, showNotification]);

  // Effects
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  // Handlers
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Naozaj chcete vymazať tento program? Táto akcia sa nedá vrátiť späť.")) {
      return;
    }

    setDeletingId(id);
    
    try {
      const { error } = await supabase
        .from("programs")
        .delete()
        .eq("id", id);
      
      if (error) {
        throw new Error(error.message);
      }

      showNotification("Program bol úspešne vymazaný", "success");
      
      // Ak je posledný item na stránke, choď na predchádzajúcu
      if (programs.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        fetchPrograms();
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification("Chyba pri mazaní", "error");
    } finally {
      setDeletingId(null);
    }
  }, [supabase, programs.length, page, fetchPrograms, showNotification]);

  const clearFilters = useCallback(() => {
    setFilter({ category: "", title: "", author: "", is_published: "" });
    setGlobalSearch("");
    setPage(1);
  }, []);

  const handleExportExcel = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("programs")
        .select(ALL_FIELDS.join(","))
        .eq("lang", filterLang);

      if (error || !data) {
        throw new Error("Chyba pri exporte!");
      }

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Programs");
      XLSX.writeFile(wb, `programs_export_${filterLang}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
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
          .filter(item => item.title && item.slug && item.lang && item.category);

        if (newItems.length === 0) {
          throw new Error("Nenašli sa žiadne validné záznamy na import");
        }

        const { error } = await supabase
          .from("programs")
          .insert(newItems);

        if (error) {
          throw new Error(error.message);
        }

        showNotification(`Úspešne importovaných ${newItems.length} programov!`, "success");
        fetchPrograms();
      } catch (error) {
        console.error('Import error:', error);
        showNotification(`Chyba pri importe: ${error instanceof Error ? error.message : 'Neznáma chyba'}`, "error");
      } finally {
        setImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  }, [supabase, fetchPrograms, showNotification]);

  // Computed values
  const hasActiveFilters = useMemo(() => 
    globalSearch || Object.values(filter).some(f => f !== ""), 
    [globalSearch, filter]
  );

  const stats = useMemo(() => {
    return {
      total: programs.length,
      withSessions: programs.filter(p => p.total_sessions > 0).length,
      published: programs.filter(p => p.is_published).length,
      featured: programs.filter(p => p.is_featured).length,
      language: filterLang.toUpperCase(),
    };
  }, [programs, filterLang]);

  const formatDuration = useCallback((minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  }, []);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notifikácie */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-7xl mx-auto p-6">
        {/* Hlavička with gradient */}
        <header className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] rounded-xl shadow-lg p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                <Play size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Správa Programov & Kurzov
                </h1>
                <p className="text-white/80">LMS systém pre duchovný obsah</p>
              </div>
            </div>
          </div>
          
          {/* Štatistiky */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={20} className="text-white/80" />
                <span className="text-sm font-medium text-white/80">Celkom</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Video size={20} className="text-white/80" />
                <span className="text-sm font-medium text-white/80">S lekciami</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.withSessions}</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={20} className="text-white/80" />
                <span className="text-sm font-medium text-white/80">Publikované</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.published}</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star size={20} className="text-white/80" />
                <span className="text-sm font-medium text-white/80">Odporúčané</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.featured}</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={20} className="text-white/80" />
                <span className="text-sm font-medium text-white/80">Jazyk</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {LANGUAGE_OPTIONS.find(l => l.value === filterLang)?.flag} {filterLang.toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Ovládacie panely */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Výber jazyka */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe size={16} className="text-gray-600" />
              <h3 className="font-semibold text-gray-800">Jazyk Programov</h3>
            </div>
            <select
              value={filterLang}
              onChange={e => { 
                setFilterLang(e.target.value as any); 
                setPage(1); 
              }}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              {LANGUAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.flag} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Import/Export */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download size={16} className="text-gray-600" />
              <h3 className="font-semibold text-gray-800">Import / Export</h3>
            </div>
            <div className="flex gap-2">
              <label className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg transition cursor-pointer text-center text-sm flex items-center justify-center gap-2 shadow-sm">
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
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2.5 rounded-lg transition text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>

          {/* Akcie */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <PlusCircle size={16} className="text-gray-600" />
              <h3 className="font-semibold text-gray-800">Akcie</h3>
            </div>
            <button
              onClick={() => router.push("/admin/programs/new")}
              className="w-full bg-gradient-to-r from-[#40467b] to-[#686ea3] hover:from-[#686ea3] hover:to-[#40467b] text-white px-4 py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
            >
              <PlusCircle size={16} />
              Pridať Program
            </button>
          </div>
        </div>

        {/* Vyhľadávanie a filtre */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Search size={16} className="text-gray-600" />
              <h3 className="font-semibold text-gray-800">Vyhľadávanie a filtre</h3>
              {hasActiveFilters && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
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
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Vyhľadať v názvoch programov, popisoch a autoroch..."
              />
            </div>
          </div>

          {/* Detailné filtre */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen size={16} className="inline mr-1" />
                  Kategória
                </label>
                <select
                  value={filter.category}
                  onChange={e => { 
                    setFilter(f => ({ ...f, category: e.target.value })); 
                    setPage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={!!globalSearch}
                >
                  <option value="">Všetky kategórie</option>
                  {categories.map(k => (
                    <option key={k.id} value={k.slug}>
                      {k.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-1" />
                  Názov programu
                </label>
                <input
                  type="text"
                  value={filter.title}
                  onChange={e => { 
                    setFilter(f => ({ ...f, title: e.target.value })); 
                    setPage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Filtrovať názvy..."
                  disabled={!!globalSearch}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Autor</label>
                <input
                  type="text"
                  value={filter.author}
                  onChange={e => { 
                    setFilter(f => ({ ...f, author: e.target.value })); 
                    setPage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Filtrovať autorov..."
                  disabled={!!globalSearch}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Publikované</label>
                <select
                  value={filter.is_published}
                  onChange={e => { 
                    setFilter(f => ({ ...f, is_published: e.target.value })); 
                    setPage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-gray-600" />
                      Kategória
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Play size={16} className="text-gray-600" />
                      Program
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-gray-600" />
                      Obsah
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-gray-600" />
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
                ) : programs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Play size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Žiadne programy</p>
                        <p>Skúste zmeniť filtre alebo pridajte nový program</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  programs.map(p => (
                    <tr key={p.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {CATEGORY_ICONS[p.category as keyof typeof CATEGORY_ICONS] || <BookOpen className="w-4 h-4 text-gray-400" />}
                          <span className="font-medium text-gray-900 capitalize">
                            {categories.find(c => c.slug === p.category)?.name || p.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          {p.image_url && (
                            <img 
                              src={p.image_url} 
                              alt={p.title}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                            />
                          )}
                          <div className="flex-1">
                            <div className="text-gray-900 font-medium">
                              {p.title?.length > 50 ? (
                                <span title={p.title}>{p.title.slice(0, 50)}...</span>
                              ) : (
                                p.title
                              )}
                            </div>
                            {p.description && (
                              <div className="text-sm text-gray-500 mt-1">
                                {p.description.length > 80 ? p.description.slice(0, 80) + "..." : p.description}
                              </div>
                            )}
                            {p.author && (
                              <div className="text-xs text-gray-400 mt-1">
                                Autor: {p.author}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Video size={14} className="text-blue-500" />
                            <span className="font-medium">{p.total_sessions} lekcií</span>
                          </div>
                          {p.total_duration_minutes > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Clock size={14} />
                              <span>{formatDuration(p.total_duration_minutes)}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                          {LANGUAGE_OPTIONS.find(lang => lang.value === p.lang)?.flag}
                          {p.lang?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                            p.is_published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            <Eye size={12} />
                            {p.is_published ? 'Publikované' : 'Koncept'}
                          </span>
                          {p.is_featured && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              <Star size={12} />
                              Featured
                            </span>
                          )}
                          {p.total_sessions > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                              <Play size={12} />
                              Obsah
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-2 bg-gradient-to-r from-[#40467b] to-[#686ea3] hover:from-[#686ea3] hover:to-[#40467b] text-white rounded-lg transition shadow-sm"
                            title="Upraviť"
                            onClick={() => router.push(`/admin/programs/${p.id}`)}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            className="p-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition shadow-sm"
                            title="Spravovať lekcie"
                            onClick={() => router.push(`/admin/programs/${p.id}/sessions`)}
                          >
                            <Video size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id!)}
                            disabled={deletingId === p.id}
                            className="p-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition shadow-sm disabled:opacity-50"
                            title="Vymazať"
                          >
                            {deletingId === p.id ? (
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
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Zobrazujem <span className="font-medium text-gray-900">{(page - 1) * PAGE_SIZE + 1}</span> až{" "}
                <span className="font-medium text-gray-900">{Math.min(page * PAGE_SIZE, total)}</span> z{" "}
                <span className="font-medium text-gray-900">{total}</span> programov
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                                ? "bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white shadow-sm"
                                : "bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700"
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
                              ? "bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white shadow-sm"
                              : "bg-white border-2 border-gray-200 hover:bg-gray-50 text-gray-700"
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
                  className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
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