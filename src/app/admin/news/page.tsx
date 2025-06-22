"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import Link from "next/link";
import { Pencil, Trash2, PlusCircle, Eraser, PencilLine, Download, Upload, Search, Calendar, Filter, Eye, Heart, Clock } from "lucide-react";
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
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <Calendar size={12} className="mr-1" />
          Naplánované
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <Eye size={12} className="mr-1" />
        Publikované
      </span>
    );
  };

  const activeFiltersCount = Object.values(filter).filter(v => v !== "").length + (globalSearch ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <span className="mr-3">📰</span>
                {t.news_admin_title || "Správa článkov"}
              </h1>
              <p className="text-gray-600 flex items-center">
                <span className="mr-2">📊</span>
                Celkom {total} článkov v jazyku {filterLang.toUpperCase()}
              </p>
            </div>
            <div className="text-5xl">📝</div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Language Filter */}
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🌍</span>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  {t.language || "Jazyk"}
                </label>
                <select
                  value={filterLang}
                  onChange={e => { setFilterLang(e.target.value as any); setPage(1); }}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="sk">🇸🇰 Slovenčina</option>
                  <option value="cz">🇨🇿 Čeština</option>
                  <option value="en">🇬🇧 English</option>
                  <option value="es">🇪🇸 Español</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 ml-auto">
              <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer shadow-md">
                <Upload size={18} />
                <span className="font-medium">{t.import_excel || "Import Excel"}</span>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleExcelImport}
                  className="hidden"
                />
              </label>
              
              <button
                className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition shadow-md"
                onClick={handleExportExcel}
                type="button"
              >
                <Download size={18} />
                <span className="font-medium">{t.export_excel || "Export Excel"}</span>
              </button>
              
              <Link href="/admin/news/new">
                <button
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition shadow-md font-medium"
                  type="button"
                >
                  <PlusCircle size={18} />
                  {t.add_item || "Nový článok"}
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Global Search */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={globalSearch}
                onChange={e => { setGlobalSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder={t.global_search || "Hľadať v článkoch..."}
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
                showFilters || activeFiltersCount > 0
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300"
              }`}
              type="button"
            >
              <Filter size={18} />
              Filtre {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    📝 {t.title || "Nadpis"}
                  </label>
                  <input
                    type="text"
                    value={filter.title}
                    onChange={e => { setFilter(f => ({ ...f, title: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Hľadať v nadpisoch..."
                    disabled={!!globalSearch}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    📄 {t.summary || "Súhrn"}
                  </label>
                  <input
                    type="text"
                    value={filter.summary}
                    onChange={e => { setFilter(f => ({ ...f, summary: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Hľadať v súhrnoch..."
                    disabled={!!globalSearch}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    📖 {t.content || "Obsah"}
                  </label>
                  <input
                    type="text"
                    value={filter.content}
                    onChange={e => { setFilter(f => ({ ...f, content: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Hľadať v obsahu..."
                    disabled={!!globalSearch}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    📅 {t.date_from || "Od dátumu"}
                  </label>
                  <input
                    type="date"
                    value={filter.dateFrom}
                    onChange={e => { setFilter(f => ({ ...f, dateFrom: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    disabled={!!globalSearch}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    📅 {t.date_to || "Do dátumu"}
                  </label>
                  <input
                    type="date"
                    value={filter.dateTo}
                    onChange={e => { setFilter(f => ({ ...f, dateTo: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    disabled={!!globalSearch}
                  />
                </div>
              </div>
              
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
                type="button"
              >
                <Eraser size={16} />
                {t.clear_filters || "Vymazať filtre"}
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold">
                    <div className="flex items-center">
                      <span className="mr-2">📝</span>
                      {t.title || "Nadpis"}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    <div className="flex items-center">
                      <span className="mr-2">📄</span>
                      {t.summary || "Súhrn"}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      Dátum
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    <div className="flex items-center">
                      <span className="mr-2">❤️</span>
                      Páči sa
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    <div className="flex items-center">
                      <span className="mr-2">🏷️</span>
                      Status
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    <div className="flex items-center justify-center">
                      <span className="mr-2">⚙️</span>
                      {t.actions || "Akcie"}
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
                      <tr key={n.id} className="border-b bg-yellow-50 hover:bg-yellow-100 transition-colors">
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
                              className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
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
                      <tr key={n.id} className="border-b hover:bg-emerald-50 transition-colors">
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
                                className="p-2 rounded-lg hover:bg-emerald-100 transition group"
                                title="Upraviť v editore"
                              >
                                <PencilLine size={18} className="text-emerald-600 group-hover:text-emerald-700" />
                              </button>
                            </Link>
                            <button
                              className="p-2 rounded-lg hover:bg-blue-100 transition group"
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
          {!loading && news.length > 0 && (
            <div className="border-t bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Zobrazené <span className="font-medium">{(page - 1) * PAGE_SIZE + 1}</span> až{" "}
                  <span className="font-medium">{Math.min(page * PAGE_SIZE, total)}</span> z{" "}
                  <span className="font-medium">{total}</span> článkov
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ← {t.previous || "Predchádzajúca"}
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, Math.ceil(total / PAGE_SIZE)) }, (_, i) => {
                      const pageNum = Math.max(1, page - 2) + i;
                      if (pageNum > Math.ceil(total / PAGE_SIZE)) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            pageNum === page
                              ? "bg-emerald-600 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    onClick={() => setPage(p => (p * PAGE_SIZE < total ? p + 1 : p))}
                    disabled={page * PAGE_SIZE >= total}
                  >
                    {t.next || "Ďalšia"} →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Celkom článkov</p>
                  <p className="text-3xl font-bold text-gray-900">{total}</p>
                </div>
                <div className="text-3xl">📰</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Publikované</p>
                  <p className="text-3xl font-bold text-green-600">
                    {news.filter(n => n.published_at && new Date(n.published_at) <= new Date()).length}
                  </p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Koncepty</p>
                  <p className="text-3xl font-bold text-gray-600">
                    {news.filter(n => !n.published_at).length}
                  </p>
                </div>
                <div className="text-3xl">📝</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Celkové páči sa</p>
                  <p className="text-3xl font-bold text-pink-600">
                    {news.reduce((sum, n) => sum + (n.likes || 0), 0)}
                  </p>
                </div>
                <div className="text-3xl">❤️</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}