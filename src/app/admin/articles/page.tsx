"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { 
  FileText, Trash2, PlusCircle, Edit3, Download, Upload, 
  Filter, Search, ChevronDown, ChevronUp, Globe, Calendar, 
  Heart, Eye, Tag, User, Grid, ArrowLeft, ArrowRight,
  X, CheckCircle, AlertCircle, BookOpen, Layers
} from "lucide-react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

interface Article {
  id?: number;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  status: 'draft' | 'published' | 'archived';
  lang: 'sk' | 'cz' | 'en' | 'es';
  author_id: string;
  category_id: number;
  tags: string[];
  seo_title: string;
  seo_description: string;
  view_count: number;
  like_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  category_name?: string;
  category_color?: string;
  author_name?: string;
  blocks_count?: number;
  total_views?: number;
  total_likes?: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

type FilterState = {
  title: string;
  category_id: string;
  status: string;
  author_id: string;
  dateFrom: string;
  dateTo: string;
};

type NotificationType = 'success' | 'error' | 'info';

const PAGE_SIZE = 20;

const LANGUAGE_OPTIONS = [
  { value: "sk" as const, label: "Slovenčina", flag: "🇸🇰" },
  { value: "cz" as const, label: "Čeština", flag: "🇨🇿" },
  { value: "en" as const, label: "English", flag: "🇺🇸" },
  { value: "es" as const, label: "Español", flag: "🇪🇸" },
];

// Status options will be dynamically created with translations

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

export default function ArticlesAdminPage() {
  const { lang: appLang } = useLanguage();
  const t = translations[appLang];
  const router = useRouter();
  const { supabase } = useSupabase();

  // Dynamic STATUS_OPTIONS with translations
  const STATUS_OPTIONS = [
    { value: "draft", label: t.article_status.draft, color: "bg-gray-100 text-gray-800", icon: "📝" },
    { value: "published", label: t.article_status.published, color: "bg-green-100 text-green-800", icon: "✅" },
    { value: "archived", label: t.article_status.archived, color: "bg-red-100 text-red-800", icon: "📦" },
  ];

  // State
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<{ id: string; full_name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
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
    title: "",
    category_id: "",
    status: "",
    author_id: "",
    dateFrom: "",
    dateTo: "",
  });
  const [globalSearch, setGlobalSearch] = useState("");

  // Notifikácie helper
  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
  }, []);

  // Fetch categories and authors
  const fetchMetadata = useCallback(async () => {
    try {
      const [categoriesRes, authorsRes] = await Promise.all([
        supabase.from("article_categories").select("id, name, slug, color"),
        supabase.from("users").select("id, full_name").eq("role", "admin")
      ]);

      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (authorsRes.data) setAuthors(authorsRes.data);
    } catch (error) {
      console.error('Metadata fetch error:', error);
    }
  }, [supabase]);

  // Fetch articles s optimalizáciou
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    
    try {
      let dataQuery = supabase
        .from("articles_with_stats")
        .select("*")
        .eq("lang", filterLang);

      let countQuery = supabase
        .from("articles")
        .select("*", { count: "exact", head: true })
        .eq("lang", filterLang);

      // Aplikovať filtre
      if (globalSearch) {
        const searchPattern = `%${globalSearch}%`;
        const searchCondition = `title.ilike.${searchPattern},excerpt.ilike.${searchPattern},category_name.ilike.${searchPattern}`;
        dataQuery = dataQuery.or(searchCondition);
        countQuery = countQuery.or(`title.ilike.${searchPattern},excerpt.ilike.${searchPattern}`);
      } else {
        if (filter.title) {
          dataQuery = dataQuery.ilike("title", `%${filter.title}%`);
          countQuery = countQuery.ilike("title", `%${filter.title}%`);
        }
        if (filter.category_id) {
          dataQuery = dataQuery.eq("category_id", filter.category_id);
          countQuery = countQuery.eq("category_id", filter.category_id);
        }
        if (filter.status) {
          dataQuery = dataQuery.eq("status", filter.status);
          countQuery = countQuery.eq("status", filter.status);
        }
        if (filter.author_id) {
          dataQuery = dataQuery.eq("author_id", filter.author_id);
          countQuery = countQuery.eq("author_id", filter.author_id);
        }
        if (filter.dateFrom) {
          dataQuery = dataQuery.gte("created_at", filter.dateFrom);
          countQuery = countQuery.gte("created_at", filter.dateFrom);
        }
        if (filter.dateTo) {
          dataQuery = dataQuery.lte("created_at", filter.dateTo);
          countQuery = countQuery.lte("created_at", filter.dateTo);
        }
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

      setArticles(data as Article[]);
      setTotal(count || 0);
    } catch (error) {
      console.error('Fetch error:', error);
      showNotification("Chyba pri načítavaní dát", "error");
      setArticles([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [supabase, filterLang, filter, globalSearch, page, showNotification]);

  // Effects
  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Handlers
  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("Naozaj chcete vymazať tento článok? Táto akcia sa nedá vrátiť späť.")) {
      return;
    }

    setDeletingId(id);
    
    try {
      const { error } = await supabase.from("articles").delete().eq("id", id);
      
      if (error) {
        throw new Error(error.message);
      }

      showNotification("Článok bol úspešne vymazaný", "success");
      
      // Ak je posledný item na stránke, choď na predchádzajúcu
      if (articles.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        fetchArticles();
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification("Chyba pri mazaní", "error");
    } finally {
      setDeletingId(null);
    }
  }, [supabase, articles.length, page, fetchArticles, showNotification]);

  const handleStatusChange = useCallback(async (id: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("articles")
        .update({ 
          status: newStatus,
          published_at: newStatus === 'published' ? new Date().toISOString() : null
        })
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      showNotification(`Článok bol ${newStatus === 'published' ? 'publikovaný' : 'aktualizovaný'}`, "success");
      fetchArticles();
    } catch (error) {
      console.error('Status change error:', error);
      showNotification("Chyba pri zmene stavu", "error");
    }
  }, [supabase, fetchArticles, showNotification]);

  const clearFilters = useCallback(() => {
    setFilter({ 
      title: "", 
      category_id: "", 
      status: "", 
      author_id: "", 
      dateFrom: "", 
      dateTo: "" 
    });
    setGlobalSearch("");
    setPage(1);
  }, []);

  const handleExportExcel = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("articles_with_stats")
        .select("*")
        .eq("lang", filterLang);

      if (error || !data) {
        throw new Error("Chyba pri exporte!");
      }

      const exportData = data.map(article => ({
        ID: article.id,
        Názov: article.title,
        Slug: article.slug,
        Perex: article.excerpt,
        Stav: article.status,
        Jazyk: article.lang,
        Kategória: article.category_name,
        Autor: article.author_name,
        Tagy: article.tags?.join(', '),
        Zobrazenia: article.view_count,
        Lajky: article.like_count,
        'Počet blokov': article.blocks_count,
        Vytvorené: new Date(article.created_at).toLocaleDateString('sk-SK'),
        Publikované: article.published_at ? new Date(article.published_at).toLocaleDateString('sk-SK') : '',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Articles");
      XLSX.writeFile(wb, `articles_export_${filterLang}_${new Date().toISOString().slice(0, 10)}.xlsx`);
      
      showNotification("Export bol úspešne dokončený", "success");
    } catch (error) {
      console.error('Export error:', error);
      showNotification("Chyba pri exporte", "error");
    }
  }, [supabase, filterLang, showNotification]);

  // Computed values
  const hasActiveFilters = useMemo(() => 
    globalSearch || Object.values(filter).some(f => f !== ""), 
    [globalSearch, filter]
  );

  const stats = useMemo(() => {
    const thisMonth = new Date().toISOString().slice(0, 7);
    return {
      total: articles.length,
      published: articles.filter(a => a.status === 'published').length,
      thisMonth: articles.filter(a => a.created_at?.startsWith(thisMonth)).length,
      language: filterLang.toUpperCase(),
      totalViews: articles.reduce((sum, a) => sum + (a.view_count || 0), 0),
      totalLikes: articles.reduce((sum, a) => sum + (a.like_count || 0), 0),
    };
  }, [articles, filterLang]);

  const getStatusConfig = useCallback((status: string) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];
  }, []);

  const getCategoryColor = useCallback((categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#3B82F6';
  }, [categories]);

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
                <FileText size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Správa článkov
                </h1>
                <p className="text-white/80">Blokový editor pre články a novinky</p>
              </div>
            </div>
          </div>
          
          {/* Štatistiky */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={20} className="text-white/80" />
                <span className="text-sm font-medium text-white/80">Celkom</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
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
                <Calendar size={20} className="text-white/80" />
                <span className="text-sm font-medium text-white/80">Tento mesiac</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.thisMonth}</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={20} className="text-white/80" />
                <span className="text-sm font-medium text-white/80">Zobrazenia</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalViews}</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart size={20} className="text-white/80" />
                <span className="text-sm font-medium text-white/80">Lajky</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalLikes}</div>
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
              <h3 className="font-semibold text-gray-800">Jazyk článkov</h3>
            </div>
            <select
              value={filterLang}
              onChange={e => { 
                setFilterLang(e.target.value as any); 
                setPage(1); 
              }}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              {LANGUAGE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.flag} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Export */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download size={16} className="text-gray-600" />
              <h3 className="font-semibold text-gray-800">Export dát</h3>
            </div>
            <button
              onClick={handleExportExcel}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2.5 rounded-lg transition text-sm flex items-center justify-center gap-2 shadow-sm"
            >
              <Download size={16} />
              Exportovať Excel
            </button>
          </div>

          {/* Akcie */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <PlusCircle size={16} className="text-gray-600" />
              <h3 className="font-semibold text-gray-800">Akcie</h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/admin/articles/new")}
                className="w-full bg-gradient-to-r from-[#40467b] to-[#686ea3] hover:from-[#686ea3] hover:to-[#40467b] text-white px-4 py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
              >
                <PlusCircle size={16} />
                Nový článok
              </button>
              <button
                onClick={() => router.push("/admin/articles/categories")}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-4 py-2.5 rounded-lg transition flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <Grid size={16} />
                Správa kategórií
              </button>
            </div>
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
                placeholder="Vyhľadať v názvoch, perexe a kategóriách..."
              />
            </div>
          </div>

          {/* Detailné filtre */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-1" />
                  Názov článku
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag size={16} className="inline mr-1" />
                  Kategória
                </label>
                <select
                  value={filter.category_id}
                  onChange={e => { 
                    setFilter(f => ({ ...f, category_id: e.target.value })); 
                    setPage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={!!globalSearch}
                >
                  <option value="">Všetky kategórie</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stav</label>
                <select
                  value={filter.status}
                  onChange={e => { 
                    setFilter(f => ({ ...f, status: e.target.value })); 
                    setPage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={!!globalSearch}
                >
                  <option value="">Všetky stavy</option>
                  {STATUS_OPTIONS.map(status => (
                    <option key={status.value} value={status.value}>
                      {status.icon} {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-1" />
                  Autor
                </label>
                <select
                  value={filter.author_id}
                  onChange={e => { 
                    setFilter(f => ({ ...f, author_id: e.target.value })); 
                    setPage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={!!globalSearch}
                >
                  <option value="">Všetci autori</option>
                  {authors.map(author => (
                    <option key={author.id} value={author.id}>{author.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dátum od</label>
                <input
                  type="date"
                  value={filter.dateFrom}
                  onChange={e => { 
                    setFilter(f => ({ ...f, dateFrom: e.target.value })); 
                    setPage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={!!globalSearch}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dátum do</label>
                <input
                  type="date"
                  value={filter.dateTo}
                  onChange={e => { 
                    setFilter(f => ({ ...f, dateTo: e.target.value })); 
                    setPage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={!!globalSearch}
                />
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
                      <FileText size={16} className="text-gray-600" />
                      Článok
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-gray-600" />
                      Kategória & Stav
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-600" />
                      Autor
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-600" />
                      Dátumy
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Eye size={16} className="text-gray-600" />
                      Štatistiky
                    </div>
                  </th>
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
                ) : articles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Žiadne články</p>
                        <p>Skúste zmeniť filtre alebo pridajte nový článok</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  articles.map(article => {
                    const statusConfig = getStatusConfig(article.status);
                    const categoryColor = getCategoryColor(article.category_id);
                    
                    return (
                      <tr key={article.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            {article.featured_image && (
                              <img 
                                src={article.featured_image} 
                                alt={article.title}
                                className="w-16 h-12 object-cover rounded-lg border"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900 mb-1">
                                {article.title?.length > 60 ? (
                                  <span title={article.title}>
                                    {article.title.slice(0, 60)}...
                                  </span>
                                ) : (
                                  article.title
                                )}
                              </div>
                              {article.excerpt && (
                                <div className="text-sm text-gray-500 mb-2">
                                  {article.excerpt.length > 100 ? 
                                    article.excerpt.slice(0, 100) + "..." : 
                                    article.excerpt
                                  }
                                </div>
                              )}
                              {article.tags && article.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {article.tags.slice(0, 3).map((tag, index) => (
                                    <span 
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                    >
                                      #{tag}
                                    </span>
                                  ))}
                                  {article.tags.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{article.tags.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            {article.category_name && (
                              <div 
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full text-white"
                                style={{ backgroundColor: categoryColor }}
                              >
                                <Tag size={12} />
                                {article.category_name}
                              </div>
                            )}
                            <div>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
                                <span>{statusConfig.icon}</span>
                                {statusConfig.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                {LANGUAGE_OPTIONS.find(lang => lang.value === article.lang)?.flag}
                                {article.lang?.toUpperCase()}
                              </span>
                              {article.blocks_count !== undefined && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  <Layers size={12} />
                                  {article.blocks_count} blokov
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {article.author_name || 'Neznámy autor'}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="text-sm space-y-1">
                            <div className="font-medium text-gray-900">
                              {new Date(article.created_at).toLocaleDateString('sk-SK', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </div>
                            {article.published_at && (
                              <div className="text-gray-500">
                                Publikované: {new Date(article.published_at).toLocaleDateString('sk-SK')}
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-blue-600">
                              <Eye size={14} />
                              {article.view_count || 0}
                            </div>
                            <div className="flex items-center gap-1 text-red-600">
                              <Heart size={14} />
                              {article.like_count || 0}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="p-2 bg-gradient-to-r from-[#40467b] to-[#686ea3] hover:from-[#686ea3] hover:to-[#40467b] text-white rounded-lg transition shadow-sm"
                              title="Upraviť"
                              onClick={() => router.push(`/admin/articles/${article.id}`)}
                            >
                              <Edit3 size={16} />
                            </button>
                            
                            {/* Status quick change */}
                            <div className="relative group">
                              <button className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition">
                                {statusConfig.icon}
                              </button>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                {STATUS_OPTIONS.map(status => (
                                  <button
                                    key={status.value}
                                    onClick={() => handleStatusChange(article.id!, status.value)}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                                      article.status === status.value ? 'bg-gray-100' : ''
                                    }`}
                                  >
                                    {status.icon} {status.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handleDelete(article.id!)}
                              disabled={deletingId === article.id}
                              className="p-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition shadow-sm disabled:opacity-50"
                              title="Vymazať"
                            >
                              {deletingId === article.id ? (
                                <LoadingSpinner size={4} />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
                <span className="font-medium text-gray-900">{total}</span> článkov
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