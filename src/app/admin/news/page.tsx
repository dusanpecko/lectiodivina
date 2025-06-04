"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { Pencil, Trash2, PlusCircle, Eraser, PencilLine } from "lucide-react";
import * as XLSX from "xlsx";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";

// Typ podľa tvojej tabuľky v Supabase
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
  const supabase = useSupabaseClient();
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
      // Filtrovanie podľa dátumu od-do (published_at)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLang, filter, globalSearch, page, supabase]);

  // Pridať položku
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);

    // Čistenie dát: odosielaj len vyplnené polia
    const cleanData = Object.fromEntries(
      Object.entries(addData).filter(([_, v]) => v !== undefined && v !== "")
    );
    console.log('cleanData:', cleanData);

    // Povinné polia
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
    if (!confirm(t.confirm_delete)) return;
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
        alert(t.error_import + ": " + t.no_records);
        return;
      }

      const { error } = await supabase.from("news").insert(newItems);

      if (error) {
        alert(t.error_import + ": " + error.message);
      } else {
        alert(t.imported);
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

  // Vyčistiť všetky filtre (aj dátumové!)
  const clearFilters = () => {
    setFilter({ title: "", summary: "", content: "", dateFrom: "", dateTo: "" });
    setGlobalSearch("");
    setPage(1);
  };

  return (
    <main>
      <h1 className="text-2xl font-bold mb-6">{t.news_admin_title || "Správa noviniek"}</h1>
      <div className="flex items-center gap-4 mb-4">
        <div>
          <label className="mr-2">{t.language || "Jazyk dát"}:</label>
          <select
            value={filterLang}
            onChange={e => { setFilterLang(e.target.value as any); setPage(1); }}
            className="border rounded px-2 py-1 h-11"
          >
            <option value="sk">Slovenčina</option>
            <option value="cz">Čeština</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
        <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 h-11 rounded hover:bg-blue-700 transition cursor-pointer">
          <span>{t.import_excel}</span>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleExcelImport}
            className="hidden"
          />
        </label>
        <button
          className="inline-flex items-center gap-2 bg-yellow-500 text-white px-3 py-2 h-11 rounded hover:bg-yellow-600 transition"
          onClick={handleExportExcel}
          aria-label={t.export_excel || "Exportovať Excel"}
          type="button"
        >
          {t.export_excel || "Exportovať Excel"}
        </button>
        {/* ČERVENÉ TLAČIDLO "Nový článok" */}
        <Link href="/admin/news/new">
          <button
            className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 h-11 rounded hover:bg-red-700 transition ml-auto"
            aria-label="Pridať nový článok"
            type="button"
          >
            <PlusCircle size={20} /> {t.add_item || "Pridať položku"}
          </button>
        </Link>
      </div>

      {/* Filtre */}
      <div className="flex gap-4 mb-4 flex-wrap items-end">
        <div>
          <label className="block text-xs">{t.global_search || "Hľadaj"}</label>
          <input
            type="text"
            value={globalSearch}
            onChange={e => { setGlobalSearch(e.target.value); setPage(1); }}
            className="border rounded px-2 py-1 h-10 min-w-[200px]"
            placeholder={t.global_search || "Hľadaj"}
          />
        </div>
        <div>
          <label className="block text-xs">{t.title || "Nadpis"}</label>
          <input
            type="text"
            value={filter.title}
            onChange={e => { setFilter(f => ({ ...f, title: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder={t.title || "Nadpis"}
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">{t.summary || "Súhrn"}</label>
          <input
            type="text"
            value={filter.summary}
            onChange={e => { setFilter(f => ({ ...f, summary: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder={t.summary || "Súhrn"}
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">{t.content || "Obsah"}</label>
          <input
            type="text"
            value={filter.content}
            onChange={e => { setFilter(f => ({ ...f, content: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder={t.content || "Obsah"}
            disabled={!!globalSearch}
          />
        </div>
        {/* --- Filtrovanie podľa dátumu od/do --- */}
        <div>
          <label className="block text-xs">{t.date_from || "Dátum od"}</label>
          <input
            type="date"
            value={filter.dateFrom}
            onChange={e => { setFilter(f => ({ ...f, dateFrom: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder={t.date_from || "Dátum od"}
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">{t.date_to || "Dátum do"}</label>
          <input
            type="date"
            value={filter.dateTo}
            onChange={e => { setFilter(f => ({ ...f, dateTo: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder={t.date_to || "Dátum do"}
            disabled={!!globalSearch}
          />
        </div>
        <button
          onClick={clearFilters}
          className="flex gap-1 items-center px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-semibold transition"
          type="button"
          aria-label={t.clear_filters}
        >
          <Eraser size={16} /> {t.clear_filters || "Vymazať filtre"}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">{t.title || "Nadpis"}</th>
              <th className="p-3">{t.summary || "Súhrn"}</th>
              <th className="p-3">{t.published_at || "Publikované"}</th>
              <th className="p-3">{t.lang}</th>
              <th className="p-3 text-center">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  {t.loading || "Načítavam..."}
                </td>
              </tr>
            ) : news.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  {t.no_records}
                </td>
              </tr>
            ) : (
              news.map(n =>
                editingId === n.id ? (
                  <tr key={n.id} className="border-b bg-yellow-50">
                    <td className="p-3">
                      <input
                        value={editData.title || ""}
                        onChange={e => setEditData(ed => ({ ...ed, title: e.target.value }))}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        value={editData.summary || ""}
                        onChange={e => setEditData(ed => ({ ...ed, summary: e.target.value }))}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        type="date"
                        value={editData.published_at?.slice(0, 10) || ""}
                        onChange={e => setEditData(ed => ({ ...ed, published_at: e.target.value }))}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-3">
                      <select
                        value={editData.lang || ""}
                        onChange={e => setEditData(ed => ({ ...ed, lang: e.target.value }))}
                        className="border rounded px-2 py-1"
                      >
                        <option value="sk">SK</option>
                        <option value="cz">CZ</option>
                        <option value="en">EN</option>
                        <option value="es">ES</option>
                      </select>
                    </td>
                    <td className="p-3 flex gap-2 items-center justify-center">
                      <button
                        onClick={saveEdit}
                        disabled={editLoading}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        {t.save || "Uložiť"}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                      >
                        {t.cancel || "Zrušiť"}
                      </button>
                    </td>
                  </tr>
                ) : (
                  <tr key={n.id} className="border-b hover:bg-blue-50 transition">
                    <td className="p-3">{n.title}</td>
                    <td className="p-3">{n.summary}</td>
                    <td className="p-3">{n.published_at?.slice(0, 10)}</td>
                    <td className="p-3">{n.lang}</td>
                    <td className="p-3 flex gap-2 items-center justify-center">
                      <Link href={`/admin/news/${n.id}`}>
                        <button
                          className="p-2 rounded hover:bg-red-100 transition"
                          title={t.edit}
                          aria-label={t.edit}
                        >
                          <PencilLine size={20} className="text-red-600" />
                        </button>
                      </Link>
                      <button
                        className="p-2 rounded hover:bg-blue-100 transition"
                        title={t.edit}
                        aria-label={t.edit}
                        onClick={() => startEdit(n)}
                      >
                        <Pencil size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        disabled={deletingId === n.id}
                        className="p-2 rounded hover:bg-red-100 transition disabled:opacity-50"
                        title={t.delete}
                        aria-label={t.delete}
                      >
                        <Trash2 size={18} className="text-red-500" />
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Stránkovanie */}
      <div className="flex justify-center items-center gap-6 py-6">
        <button
          className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          aria-label={t.previous}
        >
          {t.previous}
        </button>
        <span>
          {t.page} <b>{page}</b> {t.of} <b>{Math.ceil(total / PAGE_SIZE) || 1}</b>
        </span>
        <button
          className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
          onClick={() => setPage(p => (p * PAGE_SIZE < total ? p + 1 : p))}
          disabled={page * PAGE_SIZE >= total}
          aria-label={t.next}
        >
          {t.next}
        </button>
      </div>
    </main>
  );
}
