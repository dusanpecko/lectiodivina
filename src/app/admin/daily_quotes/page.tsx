"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { Pencil, Trash2, PlusCircle, Eraser, PencilLine } from "lucide-react";
import * as XLSX from "xlsx";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";

interface DailyQuote {
  id: string;
  date: string;
  quote: string;
  reference: string;
  lang: string;
}

const PAGE_SIZE = 20;

export default function DailyQuotesAdminPage() {
  const { lang: appLang } = useLanguage();
  const t = translations[appLang];

  const [filterLang, setFilterLang] = useState<"sk" | "cz" | "en" | "es">("sk");
  const supabase = useSupabaseClient();
  const [quotes, setQuotes] = useState<DailyQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Inline editácia
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<DailyQuote>>({});
  const [editLoading, setEditLoading] = useState(false);

  // Multivyhľadávanie
  const [filter, setFilter] = useState({
    quote: "",
    reference: "",
    dateFrom: "",
    dateTo: "",
  });
  const [globalSearch, setGlobalSearch] = useState("");

  // Formulár na pridanie
  const [showAdd, setShowAdd] = useState(false);
  const [addData, setAddData] = useState<Partial<DailyQuote>>({
    date: "",
    quote: "",
    reference: "",
    lang: filterLang,
  });
  const [addLoading, setAddLoading] = useState(false);

  // Aktualizácia lang v addData pri zmene filterLang
  useEffect(() => {
    setAddData(a => ({ ...a, lang: filterLang }));
  }, [filterLang]);

  // Načítanie dát
  const fetchQuotes = async () => {
    setLoading(true);

    let dataQuery = supabase
      .from("daily_quotes")
      .select("*")
      .eq("lang", filterLang);

    let countQuery = supabase
      .from("daily_quotes")
      .select("*", { count: "exact", head: true })
      .eq("lang", filterLang);

    if (globalSearch) {
      const val = `%${globalSearch}%`;
      dataQuery = dataQuery.or(
        `quote.ilike.${val},reference.ilike.${val},date.ilike.${val},lang.ilike.${val}`
      );
      countQuery = countQuery.or(
        `quote.ilike.${val},reference.ilike.${val},date.ilike.${val},lang.ilike.${val}`
      );
    } else {
      if (filter.quote) {
        dataQuery = dataQuery.ilike("quote", `%${filter.quote}%`);
        countQuery = countQuery.ilike("quote", `%${filter.quote}%`);
      }
      if (filter.reference) {
        dataQuery = dataQuery.ilike("reference", `%${filter.reference}%`);
        countQuery = countQuery.ilike("reference", `%${filter.reference}%`);
      }
      // Filtrovanie podľa dátumu od/do
      if (filter.dateFrom) {
        dataQuery = dataQuery.gte("date", filter.dateFrom);
        countQuery = countQuery.gte("date", filter.dateFrom);
      }
      if (filter.dateTo) {
        dataQuery = dataQuery.lte("date", filter.dateTo);
        countQuery = countQuery.lte("date", filter.dateTo);
      }
    }

    dataQuery = dataQuery.order("date", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    const { data, error } = await dataQuery;
    const { count, error: countError } = await countQuery;

    if (!error && !countError) {
      setQuotes(data as DailyQuote[]);
      setTotal(count || 0);
    } else {
      setQuotes([]);
      setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLang, filter, globalSearch, page, supabase]);

  // Pridať položku
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);

    if (!addData.date || !addData.quote || !addData.reference || !addData.lang) {
      alert(t.error_add || "Chýbajú povinné polia.");
      setAddLoading(false);
      return;
    }

    const { error } = await supabase.from("daily_quotes").insert([addData]);
    setAddLoading(false);
    if (!error) {
      setShowAdd(false);
      setAddData({ date: "", quote: "", reference: "", lang: filterLang });
      fetchQuotes();
    } else {
      alert(t.error_add || "Chyba pri ukladaní.");
    }
  };

  // Inline editácia
  const startEdit = (q: DailyQuote) => {
    setEditingId(q.id);
    setEditData({ ...q });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    setEditLoading(true);
    const { error } = await supabase
      .from("daily_quotes")
      .update(editData)
      .eq("id", editingId);
    setEditLoading(false);
    if (!error) {
      setEditingId(null);
      setEditData({});
      fetchQuotes();
    } else {
      alert(t.error_edit || "Chyba pri ukladaní.");
    }
  };

  // Vymazať položku
  const handleDelete = async (id: string) => {
    if (!confirm(t.confirm_delete || "Naozaj vymazať?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("daily_quotes").delete().eq("id", id);
    if (!error) {
      if (quotes.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        fetchQuotes();
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
        date: row["date"] || "",
        quote: row["quote"] || "",
        reference: row["reference"] || "",
        lang: row["lang"] || filterLang,
      })).filter(item => item.date && item.quote && item.reference && item.lang);

      if (newItems.length === 0) {
        alert(t.error_import + ": " + t.no_records);
        return;
      }

      const { error } = await supabase.from("daily_quotes").insert(newItems);

      if (error) {
        alert(t.error_import + ": " + error.message);
      } else {
        alert(t.imported);
        fetchQuotes();
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Export do Excelu
  const handleExportExcel = () => {
    const exportData = quotes.map(({ id, ...item }) => item);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DailyQuotes");
    XLSX.writeFile(wb, "daily_quotes_export.xlsx");
  };

  // Vyčistiť všetky filtre (aj dátumové!)
  const clearFilters = () => {
    setFilter({ quote: "", reference: "", dateFrom: "", dateTo: "" });
    setGlobalSearch("");
    setPage(1);
  };

  return (
    <main>
      <h1 className="text-2xl font-bold mb-6">{t.daily_quotes_admin_title || "Denné citáty"}</h1>
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
          <span>{t.import_excel || "Importovať Excel"}</span>
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
        <button
          className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 h-11 rounded hover:bg-green-600 transition ml-auto"
          onClick={() => setShowAdd(a => !a)}
          aria-label={t.add_item}
        >
          <PlusCircle size={20} /> {t.add_item || "Pridať"}
        </button>
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
          <label className="block text-xs">Citát</label>
          <input
            type="text"
            value={filter.quote}
            onChange={e => { setFilter(f => ({ ...f, quote: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder="Citát"
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">Reference</label>
          <input
            type="text"
            value={filter.reference}
            onChange={e => { setFilter(f => ({ ...f, reference: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder="Odkaz"
            disabled={!!globalSearch}
          />
        </div>
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

      {/* Formulár na pridanie */}
      {showAdd && (
        <form onSubmit={handleAdd} className="mb-4 flex flex-wrap gap-3 items-end bg-green-50 p-4 rounded shadow">
          <div>
            <label className="block text-sm">{t.date || "Dátum"}</label>
            <input
              required
              type="date"
              value={addData.date || ""}
              onChange={e => setAddData(a => ({ ...a, date: e.target.value }))}
              className="border rounded px-2 py-2 h-11"
            />
          </div>
          <div>
            <label className="block text-sm">Citát</label>
            <input
              required
              value={addData.quote || ""}
              onChange={e => setAddData(a => ({ ...a, quote: e.target.value }))}
              className="border rounded px-2 py-2 h-11"
            />
          </div>
          <div>
            <label className="block text-sm">Reference</label>
            <input
              required
              value={addData.reference || ""}
              onChange={e => setAddData(a => ({ ...a, reference: e.target.value }))}
              className="border rounded px-2 py-2 h-11"
            />
          </div>
          <div>
            <label className="block text-sm">{t.lang || "Jazyk"}</label>
            <select
              value={addData.lang || filterLang}
              onChange={e => setAddData(a => ({ ...a, lang: e.target.value }))}
              className="border rounded px-2 py-2 h-11 min-w-[80px]"
            >
              <option value="sk">SK</option>
              <option value="cz">CZ</option>
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={addLoading}
            className="bg-green-600 text-white px-5 py-2 h-11 rounded hover:bg-green-700 transition"
            aria-label={t.add || "Pridať"}
          >
            {addLoading ? t.adding || "Pridávam..." : t.add || "Pridať"}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">{t.date || "Dátum"}</th>
              <th className="p-3">Citát</th>
              <th className="p-3">Reference</th>
              <th className="p-3">{t.lang || "Jazyk"}</th>
              <th className="p-3 text-center">{t.actions || "Akcie"}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  {t.loading || "Načítavam..."}
                </td>
              </tr>
            ) : quotes.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  {t.no_records || "Žiadne záznamy"}
                </td>
              </tr>
            ) : (
              quotes.map(q =>
                editingId === q.id ? (
                  <tr key={q.id} className="border-b bg-yellow-50">
                    <td className="p-3">
                      <input
                        type="date"
                        value={editData.date || ""}
                        onChange={e => setEditData(ed => ({ ...ed, date: e.target.value }))}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        value={editData.quote || ""}
                        onChange={e => setEditData(ed => ({ ...ed, quote: e.target.value }))}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        value={editData.reference || ""}
                        onChange={e => setEditData(ed => ({ ...ed, reference: e.target.value }))}
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
                  <tr key={q.id} className="border-b hover:bg-blue-50 transition">
                    <td className="p-3">{q.date}</td>
                    <td className="p-3">{q.quote}</td>
                    <td className="p-3">{q.reference}</td>
                    <td className="p-3">{q.lang}</td>
                    <td className="p-3 flex gap-2 items-center justify-center">
                      {/* Link na podstránku detail/edit */}
                      <Link href={`/admin/daily_quotes/${q.id}`}>
                        <button
                          className="p-2 rounded hover:bg-red-100 transition"
                          title={t.edit || "Editovať"}
                          aria-label={t.edit || "Editovať"}
                        >
                          <PencilLine size={20} className="text-red-600" />
                        </button>
                      </Link>
                      {/* Inline edit */}
                      <button
                        className="p-2 rounded hover:bg-blue-100 transition"
                        title={t.edit || "Editovať"}
                        aria-label={t.edit || "Editovať"}
                        onClick={() => startEdit(q)}
                      >
                        <Pencil size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(q.id)}
                        disabled={deletingId === q.id}
                        className="p-2 rounded hover:bg-red-100 transition disabled:opacity-50"
                        title={t.delete || "Vymazať"}
                        aria-label={t.delete || "Vymazať"}
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
          {t.previous || "<"}
        </button>
        <span>
          {t.page || "Strana"} <b>{page}</b> {t.of || "z"} <b>{Math.ceil(total / PAGE_SIZE) || 1}</b>
        </span>
        <button
          className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
          onClick={() => setPage(p => (p * PAGE_SIZE < total ? p + 1 : p))}
          disabled={page * PAGE_SIZE >= total}
          aria-label={t.next}
        >
          {t.next || ">"}
        </button>
      </div>
    </main>
  );
}
