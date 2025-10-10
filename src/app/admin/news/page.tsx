"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import Link from "next/link";
import { Pencil, Trash2, PlusCircle, Eraser, PencilLine, Download, Upload, Search, Calendar, Filter, Eye, Heart, Clock, Database, Tag, Settings } from "lucide-react";
import * as XLSX from "xlsx";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";

interface News {
  id: number;
  created_at: string;
  title: string;
  summary: string;
  image_url: string;
  content: string;
  published_at: string;
  likes: number;
  updated_at: string;
  lang: string;
}

const PAGE_SIZE = 20;

export default function NewsAdminPage() {
  const { lang: appLang } = useLanguage();
  const t = translations[appLang];

  const [filterLang, setFilterLang] = useState<"sk" | "cz" | "en" | "es">("sk");
  const { supabase } = useSupabase();
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Inline editácia
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<News>>({});
  const [editLoading, setEditLoading] = useState(false);

  // Multivyhľadávanie
  const [filter, setFilter] = useState({
    title: "",
    summary: "",
    content: "",
    dateFrom: "",
    dateTo: "",
  });
  const [globalSearch, setGlobalSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Formulár na pridanie
  const [showAdd, setShowAdd] = useState(false);
  const [addData, setAddData] = useState<Partial<News>>({
    title: "",
    summary: "",
    image_url: "",
    content: "",
    published_at: "",
    lang: filterLang,
  });
  const [addLoading, setAddLoading] = useState(false);

  // Aktualizácia lang v addData pri zmene filterLang
  useEffect(() => {
    setAddData(a => ({ ...a, lang: filterLang }));
  }, [filterLang]);

  // Načítanie dát
  const fetchNews = async () => {
    setLoading(true);

    let dataQuery = supabase
      .from("news")
      .select("*")
      .eq("lang", filterLang);

    let countQuery = supabase
      .from("news")
      .select("*", { count: "exact", head: true })
      .eq("lang", filterLang);

    if (globalSearch) {
      const val = `%${globalSearch}%`;
      dataQuery = dataQuery.or(
        `title.ilike.${val},summary.ilike.${val},content.ilike.${val},lang.ilike.${val}`
      );
      countQuery = countQuery.or(
        `title.ilike.${val},summary.ilike.${val},content.ilike.${val},lang.ilike.${val}`
      );
    } else {
      if (filter.title) {
        dataQuery = dataQuery.ilike("title", `%${filter.title}%`);
        countQuery = countQuery.ilike("title", `%${filter.title}%`);
      }
      if (filter.summary) {
        dataQuery = dataQuery.ilike("summary", `%${filter.summary}%`);
        countQuery = countQuery.ilike("summary", `%${filter.summary}%`);
      }
      if (filter.content) {
        dataQuery = dataQuery.ilike("content", `%${filter.content}%`);
        countQuery = countQuery.ilike("content", `%${filter.content}%`);
      }
      if (filter.dateFrom) {
        dataQuery = dataQuery.gte("published_at", filter.dateFrom);
        countQuery = countQuery.gte("published_at", filter.dateFrom);
      }
      if (filter.dateTo) {
        dataQuery = dataQuery.lte("published_at", filter.dateTo);
        countQuery = countQuery.lte("published_at", filter.dateTo);
      }
    }

    dataQuery = dataQuery.order("published_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    const { data, error } = await dataQuery;
    const { count, error: countError } = await countQuery;

    if (!error && !countError) {
      setNews(data as News[]);
      setTotal(count || 0);
    } else {
      setNews([]);
      setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNews();
  }, [filterLang, filter, globalSearch, page, supabase]);

  // Pridať položku
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);

    const cleanData = Object.fromEntries(
      Object.entries(addData).filter(([_, v]) => v !== undefined && v !== "")
    );

    if (!cleanData.title || !cleanData.content || !cleanData.lang) {
      alert(t.error_add || "Chýbajú povinné polia.");
      setAddLoading(false);
      return;
    }

    const { error } = await supabase.from("news").insert([cleanData]);
    setAddLoading(false);
    if (!error) {
      setShowAdd(false);
      setAddData({ title: "", summary: "", image_url: "", content: "", published_at: "", lang: filterLang });
      fetchNews();
    } else {
      alert(t.error_add + ": " + (error.message || JSON.stringify(error)));
    }
  };

  // Inline editácia
  const startEdit = (n: News) => {
    setEditingId(n.id);
    setEditData({ ...n });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    setEditLoading(true);
    const { error } = await supabase
      .from("news")
      .update(editData)
      .eq("id", editingId);
    setEditLoading(false);
    if (!error) {
      setEditingId(null);
      setEditData({});
      fetchNews();
    } else {
      alert(t.error_edit || "Chyba pri ukladaní.");
    }
  };

  // Vymazať položku
  const handleDelete = async (id: number) => {
    if (!confirm(t.confirm_delete || "Naozaj chcete vymazať tento článok?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("news").delete().eq("id", id);
    if (!error) {
      if (news.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        fetchNews();
      }
    }
    setDeletingId(null);
  };

  // Import z Excelu
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      const newItems = json.map(row => ({
        title: row[t.title] || row["title"] || "",
        summary: row[t.summary] || row["summary"] || "",
        image_url: row["image_url"] || "",
        content: row[t.content] || row["content"] || "",
        published_at: row["published_at"] || "",
        lang: row[t.lang] || row["lang"] || filterLang,
      })).filter(item => item.title && item.content && item.lang);

      if (newItems.length === 0) {
        alert(t.error_import + ": " + (t.no_records || "Žiadne záznamy"));
        return;
      }

      const { error } = await supabase.from("news").insert(newItems);

      if (error) {
        alert((t.error_import || "Chyba importu") + ": " + error.message);
      } else {
        alert(t.imported || "Úspešne importované");
        fetchNews();
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Export do Excelu
  const handleExportExcel = () => {
    const exportData = news.map(({ id, ...item }) => item);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "News");
    XLSX.writeFile(wb, "news_export.xlsx");
  };

  // Vyčistiť všetky filtre
  const clearFilters = () => {
    setFilter({ title: "", summary: "", content: "", dateFrom: "", dateTo: "" });
    setGlobalSearch("");
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('sk-SK');
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return "-";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const getStatusBadge = (publishedAt: string) => {
    if (!publishedAt) return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
        <Clock size={12} className="mr-1" />
        Koncept
      </span>
    );
    
    const publishDate = new Date(publishedAt);
    const now = new Date();
    
    if (publishDate > now) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100" style={{ color: '#40467b' }}>
          <Calendar size={12} className="mr-1" />
          Naplánované
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100" style={{ color: '#40467b' }}>
        <Eye size={12} className="mr-1" />
        Publikované
      </span>
    );
  };

  const activeFiltersCount = Object.values(filter).filter(v => v !== "").length + (globalSearch ? 1 : 0);

  // Statistics
  const stats = {
    total: total,
    published: news.filter(n => n.published_at && new Date(n.published_at) <= new Date()).length,
    draft: news.filter(n => !n.published_at || new Date(n.published_at) > new Date()).length,
    thisMonth: news.filter(n => {
      const publishDate = new Date(n.published_at);
      const now = new Date();
      return publishDate.getMonth() === now.getMonth() && publishDate.getFullYear() === now.getFullYear();
    }).length,
    totalLikes: news.reduce((sum, n) => sum + (n.likes || 0), 0),
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hlavička */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] px-8 py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <PencilLine size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    Správa Noviniek
                  </h1>
                  <p className="text-indigo-100 mt-1">Novinky a aktuality pre používateľov</p>
                </div>
              </div>
              
              {/* Štatistiky */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.total}</div>
                  <div className="text-sm text-indigo-100 mt-1">Celkom</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.published}</div>
                  <div className="text-sm text-indigo-100 mt-1">Publikované</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.draft}</div>
                  <div className="text-sm text-indigo-100 mt-1">Koncepty</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.thisMonth}</div>
                  <div className="text-sm text-indigo-100 mt-1">Tento mesiac</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow flex items-center justify-center gap-1">
                    <Heart size={20} fill="white" />
                    {stats.totalLikes}
                  </div>
                  <div className="text-sm text-indigo-100 mt-1">Celkom lajkov</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Ovládacie panely */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Výber jazyka */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filter jazyka</h3>
            </div>
            <select
              value={filterLang}
              onChange={e => { setFilterLang(e.target.value as any); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              <option value="sk">🇸🇰 Slovenčina</option>
              <option value="cz">🇨🇿 Čeština</option>
              <option value="en">🇬🇧 English</option>
              <option value="es">🇪🇸 Español</option>
            </select>
          </div>

          {/* Import / Export */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Import / Export</h3>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-2.5 rounded-lg hover:from-indigo-700 hover:to-indigo-800 transition-all cursor-pointer font-medium shadow-sm">
                <Upload size={18} />
                <span>Import</span>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleExcelImport}
                  className="hidden"
                />
              </label>
              
              <button
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2.5 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium shadow-sm"
                onClick={handleExportExcel}
                type="button"
              >
                <Download size={18} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Nový článok */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <PlusCircle size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Pridať novú novinku</h3>
            </div>
            <Link href="/admin/news/new">
              <button
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-sm"
                type="button"
              >
                <PlusCircle size={18} />
                {t.add_item || "Nový článok"}
              </button>
            </Link>
          </div>
        </div>

        {/* Vyhľadávanie a filtre */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={globalSearch}
                onChange={e => { setGlobalSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={t.global_search || "Hľadať v článkoch..."}
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                showFilters || activeFiltersCount > 0 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
              type="button"
            >
              <Filter size={18} />
              Filtre {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    {t.title || "Nadpis"}
                  </label>
                  <input
                    type="text"
                    value={filter.title}
                    onChange={e => { setFilter(f => ({ ...f, title: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Hľadať v nadpisoch..."
                    disabled={!!globalSearch}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    {t.summary || "Súhrn"}
                  </label>
                  <input
                    type="text"
                    value={filter.summary}
                    onChange={e => { setFilter(f => ({ ...f, summary: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Hľadať v súhrnoch..."
                    disabled={!!globalSearch}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    {t.content || "Obsah"}
                  </label>
                  <input
                    type="text"
                    value={filter.content}
                    onChange={e => { setFilter(f => ({ ...f, content: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Hľadať v obsahu..."
                    disabled={!!globalSearch}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    {t.date_from || "Od dátumu"}
                  </label>
                  <input
                    type="date"
                    value={filter.dateFrom}
                    onChange={e => { setFilter(f => ({ ...f, dateFrom: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    disabled={!!globalSearch}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    {t.date_to || "Do dátumu"}
                  </label>
                  <input
                    type="date"
                    value={filter.dateTo}
                    onChange={e => { setFilter(f => ({ ...f, dateTo: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    disabled={!!globalSearch}
                  />
                </div>
              </div>
              
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                type="button"
              >
                <Eraser size={16} />
                {t.clear_filters || "Vymazať filtre"}
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <PencilLine size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t.title || "Nadpis"}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Eye size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t.summary || "Súhrn"}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Dátum
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left w-32">
                    <div className="flex items-center gap-2">
                      <Heart size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Páči sa
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Settings size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t.actions || "Akcie"}
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                        <span className="text-gray-500 font-medium">
                          {t.loading || "Načítavam články..."}
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : news.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="text-6xl">📰</div>
                        <div className="text-xl font-semibold text-gray-600">
                          {t.no_records || "Žiadne články"}
                        </div>
                        <p className="text-gray-500">
                          Skúste zmeniť filtre alebo pridajte nový článok.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  news.map(n =>
                    editingId === n.id ? (
                      <tr key={n.id} className="border-b border-gray-200 bg-yellow-50 hover:bg-yellow-100 transition-all">
                        <td className="px-6 py-4">
                          <input
                            value={editData.title || ""}
                            onChange={e => setEditData(ed => ({ ...ed, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="Nadpis článku..."
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            value={editData.summary || ""}
                            onChange={e => setEditData(ed => ({ ...ed, summary: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                            placeholder="Súhrn článku..."
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="date"
                            value={editData.published_at?.slice(0, 10) || ""}
                            onChange={e => setEditData(ed => ({ ...ed, published_at: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-500">-</span>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={editData.lang || ""}
                            onChange={e => setEditData(ed => ({ ...ed, lang: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                          >
                            <option value="sk">🇸🇰 SK</option>
                            <option value="cz">🇨🇿 CZ</option>
                            <option value="en">🇬🇧 EN</option>
                            <option value="es">🇪🇸 ES</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 items-center justify-center">
                            <button
                              onClick={saveEdit}
                              disabled={editLoading}
                              className="inline-flex items-center px-3 py-1 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50"
                              style={{ backgroundColor: '#40467b' }}
                            >
                              {editLoading ? "💾" : "✅"} {t.save || "Uložiť"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="inline-flex items-center px-3 py-1 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                            >
                              ❌ {t.cancel || "Zrušiť"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={n.id} className="border-b border-gray-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all">
                        <td className="px-6 py-4">
                          <div className="flex items-start space-x-3">
                            {n.image_url && (
                              <img 
                                src={n.image_url} 
                                alt="" 
                                className="w-12 h-12 rounded-lg object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <div className="font-semibold text-gray-900 mb-1">
                                {truncateText(n.title, 40)}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center">
                                <span className="mr-1">🌍</span>
                                {n.lang.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-700">
                            {truncateText(n.summary, 60)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {formatDate(n.published_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-pink-600">
                            <Heart size={16} className="mr-1" />
                            <span className="font-medium">{n.likes || 0}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(n.published_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2 items-center justify-center">
                            <Link href={`/admin/news/${n.id}`}>
                              <button
                                className="p-2 rounded-lg hover:bg-gray-100 transition group"
                                title="Upraviť v editore"
                              >
                                <PencilLine size={18} className="text-emerald-600 group-hover:text-emerald-700" />
                              </button>
                            </Link>
                            <button
                              className="p-2 rounded-lg hover:bg-gray-100 transition group"
                              title="Rýchla úprava"
                              onClick={() => startEdit(n)}
                            >
                              <Pencil size={18} className="text-blue-600 group-hover:text-blue-700" />
                            </button>
                            <button
                              onClick={() => handleDelete(n.id)}
                              disabled={deletingId === n.id}
                              className="p-2 rounded-lg hover:bg-red-100 transition group disabled:opacity-50"
                              title="Vymazať článok"
                            >
                              {deletingId === n.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                              ) : (
                                <Trash2 size={18} className="text-red-500 group-hover:text-red-600" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!loading && news.length > 0 && Math.ceil(total / PAGE_SIZE) > 1 && (
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t-2 border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">
                Zobrazené {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} z {total} záznamov
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-300 hover:bg-indigo-50"
                >
                  ← Predchádzajúca
                </button>
                <span className="px-4 py-2 text-sm font-bold text-indigo-700">
                  Strana {page} z {Math.ceil(total / PAGE_SIZE)}
                </span>
                <button
                  onClick={() => setPage(p => (p * PAGE_SIZE < total ? p + 1 : p))}
                  disabled={page * PAGE_SIZE >= total}
                  className="px-4 py-2 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-300 hover:bg-indigo-50"
                >
                  Ďalšia →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}