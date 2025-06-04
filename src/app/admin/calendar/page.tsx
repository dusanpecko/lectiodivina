"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { Pencil, Trash2, PlusCircle, Eraser, PencilLine } from "lucide-react";
import * as XLSX from "xlsx";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";

interface CalendarDay {
  id: number;
  date: string;
  name_day: string;
  liturgical_day: string;
  saints: string;
  lang: string;
}

const PAGE_SIZE = 20;

export default function CalendarAdminPage() {
  const { lang: appLang } = useLanguage();
  const t = translations[appLang];

  const [filterLang, setFilterLang] = useState<"sk" | "cz" | "en" | "es">("sk");
  const supabase = useSupabaseClient();
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Inline editácia
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<CalendarDay>>({});
  const [editLoading, setEditLoading] = useState(false);

  // Multivyhľadávanie vrátane dátumu od-do
  const [filter, setFilter] = useState({
    name_day: "",
    liturgical_day: "",
    saints: "",
    dateFrom: "",
    dateTo: "",
  });
  const [globalSearch, setGlobalSearch] = useState("");

  // Formulár na pridanie
  const [showAdd, setShowAdd] = useState(false);
  const [addData, setAddData] = useState<Partial<CalendarDay>>({
    date: "",
    name_day: "",
    liturgical_day: "",
    saints: "",
    lang: filterLang,
  });
  const [addLoading, setAddLoading] = useState(false);

  // Aktualizácia lang v addData pri zmene filterLang
  useEffect(() => {
    setAddData(a => ({ ...a, lang: filterLang }));
  }, [filterLang]);

  // Načítanie dát
  const fetchDays = async () => {
    setLoading(true);

    let dataQuery = supabase
      .from("calendar_info")
      .select("*")
      .eq("lang", filterLang);

    let countQuery = supabase
      .from("calendar_info")
      .select("*", { count: "exact", head: true })
      .eq("lang", filterLang);

    if (globalSearch) {
      const val = `%${globalSearch}%`;
      dataQuery = dataQuery.or(
        `name_day.ilike.${val},liturgical_day.ilike.${val},saints.ilike.${val},lang.ilike.${val},date.ilike.${val}`
      );
      countQuery = countQuery.or(
        `name_day.ilike.${val},liturgical_day.ilike.${val},saints.ilike.${val},lang.ilike.${val},date.ilike.${val}`
      );
    } else {
      if (filter.name_day) {
        dataQuery = dataQuery.ilike("name_day", `%${filter.name_day}%`);
        countQuery = countQuery.ilike("name_day", `%${filter.name_day}%`);
      }
      if (filter.liturgical_day) {
        dataQuery = dataQuery.ilike("liturgical_day", `%${filter.liturgical_day}%`);
        countQuery = countQuery.ilike("liturgical_day", `%${filter.liturgical_day}%`);
      }
      if (filter.saints) {
        dataQuery = dataQuery.ilike("saints", `%${filter.saints}%`);
        countQuery = countQuery.ilike("saints", `%${filter.saints}%`);
      }
      // --- Filtrovanie podľa dátumu od-do ---
      if (filter.dateFrom) {
        dataQuery = dataQuery.gte("date", filter.dateFrom);
        countQuery = countQuery.gte("date", filter.dateFrom);
      }
      if (filter.dateTo) {
        dataQuery = dataQuery.lte("date", filter.dateTo);
        countQuery = countQuery.lte("date", filter.dateTo);
      }
    }

    dataQuery = dataQuery.order("date", { ascending: true })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    // Dôležitá oprava: countQuery NESMIE mať .range ani .limit!

    const { data, error } = await dataQuery;
    const { count, error: countError } = await countQuery;

    if (!error && !countError) {
      setDays(data as CalendarDay[]);
      setTotal(count || 0);
    } else {
      setDays([]);
      setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLang, filter, globalSearch, page, supabase]);

  // Pridať položku
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);

    if (!addData.date || !addData.name_day || !addData.liturgical_day || !addData.saints || !addData.lang) {
      alert(t.error_add);
      setAddLoading(false);
      return;
    }

    const { error } = await supabase.from("calendar_info").insert([addData]);
    setAddLoading(false);
    if (!error) {
      setShowAdd(false);
      setAddData({ date: "", name_day: "", liturgical_day: "", saints: "", lang: filterLang });
      fetchDays();
    } else {
      alert(t.error_add);
    }
  };

  // Inline editácia
  const startEdit = (day: CalendarDay) => {
    setEditingId(day.id);
    setEditData({ ...day });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const saveEdit = async () => {
    setEditLoading(true);
    const { error } = await supabase
      .from("calendar_info")
      .update(editData)
      .eq("id", editingId);
    setEditLoading(false);
    if (!error) {
      setEditingId(null);
      setEditData({});
      fetchDays();
    } else {
      alert(t.error_edit || "Chyba pri ukladaní.");
    }
  };

  // Vymazať položku
  const handleDelete = async (id: number) => {
    if (!confirm(t.confirm_delete)) return;
    setDeletingId(id);
    const { error } = await supabase.from("calendar_info").delete().eq("id", id);
    if (!error) {
      if (days.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        fetchDays();
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
        date: row[t.date] || row["Dátum"] || "",
        name_day: row[t.name] || row["Meno"] || "",
        liturgical_day: row[t.liturgical_day] || row["Liturgický deň"] || "",
        saints: row[t.saints] || row["Svätí"] || "",
        lang: row[t.lang] || row["Jazyk"] || filterLang,
      })).filter(item => item.date && item.name_day && item.liturgical_day && item.saints && item.lang);

      if (newItems.length === 0) {
        alert(t.error_import + ": " + t.no_records);
        return;
      }

      const { error } = await supabase.from("calendar_info").insert(newItems);

      if (error) {
        alert(t.error_import + ": " + error.message);
      } else {
        alert(t.imported);
        fetchDays();
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Export do Excelu
  const handleExportExcel = () => {
    const exportData = days.map(({ id, ...item }) => item);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Calendar");
    XLSX.writeFile(wb, "calendar_export.xlsx");
  };

  // Vyčistiť všetky filtre (aj dátumové!)
  const clearFilters = () => {
    setFilter({ name_day: "", liturgical_day: "", saints: "", dateFrom: "", dateTo: "" });
    setGlobalSearch("");
    setPage(1);
  };

  return (
    <main>
      <h1 className="text-2xl font-bold mb-6">{t.calendar_admin_title}</h1>
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
        <button
          className="flex items-center gap-2 bg-green-500 text-white px-3 py-2 h-11 rounded hover:bg-green-600 transition ml-auto"
          onClick={() => setShowAdd(a => !a)}
          aria-label={t.add_item}
        >
          <PlusCircle size={20} /> {t.add_item}
        </button>
      </div>

      {/* Filtre */}
      <div className="flex gap-4 mb-4 flex-wrap items-end">
        <div>
          <label className="block text-xs">{t.global_search}</label>
          <input
            type="text"
            value={globalSearch}
            onChange={e => { setGlobalSearch(e.target.value); setPage(1); }}
            className="border rounded px-2 py-1 h-10 min-w-[200px]"
            placeholder={t.global_search}
          />
        </div>
        <div>
          <label className="block text-xs">{t.search_name}</label>
          <input
            type="text"
            value={filter.name_day}
            onChange={e => { setFilter(f => ({ ...f, name_day: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder={t.search_name}
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">{t.search_liturgical}</label>
          <input
            type="text"
            value={filter.liturgical_day}
            onChange={e => { setFilter(f => ({ ...f, liturgical_day: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder={t.search_liturgical}
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">{t.search_saints}</label>
          <input
            type="text"
            value={filter.saints}
            onChange={e => { setFilter(f => ({ ...f, saints: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder={t.search_saints}
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
          <Eraser size={16} /> {t.clear_filters}
        </button>
      </div>

      {/* Formulár na pridanie */}
      {showAdd && (
        <form onSubmit={handleAdd} className="mb-4 flex flex-wrap gap-3 items-end bg-green-50 p-4 rounded shadow">
          <div>
            <label className="block text-sm">{t.date}</label>
            <input
              required
              type="date"
              value={addData.date || ""}
              onChange={e => setAddData(a => ({ ...a, date: e.target.value }))}
              className="border rounded px-2 py-2 h-11"
            />
          </div>
          <div>
            <label className="block text-sm">{t.name}</label>
            <input
              required
              value={addData.name_day || ""}
              onChange={e => setAddData(a => ({ ...a, name_day: e.target.value }))}
              className="border rounded px-2 py-2 h-11"
            />
          </div>
          <div>
            <label className="block text-sm">{t.liturgical_day}</label>
            <input
              required
              value={addData.liturgical_day || ""}
              onChange={e => setAddData(a => ({ ...a, liturgical_day: e.target.value }))}
              className="border rounded px-2 py-2 h-11"
            />
          </div>
          <div>
            <label className="block text-sm">{t.saints}</label>
            <input
              required
              value={addData.saints || ""}
              onChange={e => setAddData(a => ({ ...a, saints: e.target.value }))}
              className="border rounded px-2 py-2 h-11"
            />
          </div>
          <div>
            <label className="block text-sm">{t.lang}</label>
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
            aria-label={t.add}
          >
            {addLoading ? t.adding : t.add}
          </button>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">{t.date}</th>
              <th className="p-3">{t.name}</th>
              <th className="p-3">{t.liturgical_day}</th>
              <th className="p-3">{t.saints}</th>
              <th className="p-3">{t.lang}</th>
              <th className="p-3 text-center">{t.actions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  {t.loading || "Načítavam..."}
                </td>
              </tr>
            ) : days.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  {t.no_records}
                </td>
              </tr>
            ) : (
              days.map(day =>
                editingId === day.id ? (
                  <tr key={day.id} className="border-b bg-yellow-50">
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
                        value={editData.name_day || ""}
                        onChange={e => setEditData(ed => ({ ...ed, name_day: e.target.value }))}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        value={editData.liturgical_day || ""}
                        onChange={e => setEditData(ed => ({ ...ed, liturgical_day: e.target.value }))}
                        className="border rounded px-2 py-1"
                      />
                    </td>
                    <td className="p-3">
                      <input
                        value={editData.saints || ""}
                        onChange={e => setEditData(ed => ({ ...ed, saints: e.target.value }))}
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
                  <tr key={day.id} className="border-b hover:bg-blue-50 transition">
                    <td className="p-3">{day.date}</td>
                    <td className="p-3">{day.name_day}</td>
                    <td className="p-3">{day.liturgical_day}</td>
                    <td className="p-3">{day.saints}</td>
                    <td className="p-3">{day.lang}</td>
                    <td className="p-3 flex gap-2 items-center justify-center">
                      {/* Červená ceruzka s linkom na /admin/calendar/[id] */}
                      <Link href={`/admin/calendar/${day.id}`}>
                        <button
                          className="p-2 rounded hover:bg-red-100 transition"
                          title={t.edit}
                          aria-label={t.edit}
                        >
                          <PencilLine size={20} className="text-red-600" />
                        </button>
                      </Link>
                      {/* Ak chceš zachovať inline editáciu, nechaj aj nasledujúce tlačidlo */}
                      <button
                        className="p-2 rounded hover:bg-blue-100 transition"
                        title={t.edit}
                        aria-label={t.edit}
                        onClick={() => startEdit(day)}
                      >
                        <Pencil size={18} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(day.id)}
                        disabled={deletingId === day.id}
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