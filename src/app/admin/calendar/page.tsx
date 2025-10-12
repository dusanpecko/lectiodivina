"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import { useSupabase } from "@/app/components/SupabaseProvider"; // ← ZMENA: náš provider
import { translations } from "@/app/i18n";
import {
  BookOpen,
  CalendarDays,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Download,
  Edit3,
  Eraser,
  Filter,
  Globe,
  PlusCircle,
  Save,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Users2,
  X
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

interface CalendarDay {
  id: number;
  date: string;
  name_day: string;
  liturgical_day: string;
  saints: string;
  lang: string;
}

const PAGE_SIZE = 20;

const languageOptions = [
  { value: "sk", label: "Slovenčina", flag: "🇸🇰" },
  { value: "cz", label: "Čeština", flag: "🇨🇿" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇪🇸" },
];

export default function CalendarAdminPage() {
  const { lang: appLang } = useLanguage();
  const t = translations[appLang];

  const [filterLang, setFilterLang] = useState<"sk" | "cz" | "en" | "es">("sk");
  const { supabase } = useSupabase(); // ← ZMENA: náš provider namiesto useSupabaseClient
  const [days, setDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Inline editácia
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<CalendarDay>>({});
  const [editLoading, setEditLoading] = useState(false);

  // Filtre a vyhľadávanie
  const [showFilters, setShowFilters] = useState(false);
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
      alert(t.error_add || "Chýbajú povinné polia");
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
      alert(t.error_add || "Chyba pri pridávaní");
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
    if (!confirm(t.confirm_delete || "Naozaj chcete vymazať tento záznam?")) return;
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
      const json: Record<string, string | number>[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      const newItems = json.map(row => ({
        date: row[t.date] || row["Dátum"] || "",
        name_day: row[t.name] || row["Meno"] || "",
        liturgical_day: row[t.liturgical_day] || row["Liturgický deň"] || "",
        saints: row[t.saints] || row["Svätí"] || "",
        lang: row[t.lang] || row["Jazyk"] || filterLang,
      })).filter(item => item.date && item.name_day && item.liturgical_day && item.saints && item.lang);

      if (newItems.length === 0) {
        alert(t.error_import + ": " + (t.no_records || "Žiadne záznamy"));
        return;
      }

      const { error } = await supabase.from("calendar_info").insert(newItems);

      if (error) {
        alert((t.error_import || "Chyba importu") + ": " + error.message);
      } else {
        alert(t.imported || "Import úspešný");
        fetchDays();
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Export do Excelu
  const handleExportExcel = () => {
    const exportData = days.map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...exportItem } = item;
      return exportItem;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Calendar");
    XLSX.writeFile(wb, `calendar_export_${filterLang}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Vyčistiť všetky filtre
  const clearFilters = () => {
    setFilter({ name_day: "", liturgical_day: "", saints: "", dateFrom: "", dateTo: "" });
    setGlobalSearch("");
    setPage(1);
  };

  const hasActiveFilters = globalSearch || Object.values(filter).some(f => f !== "");

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hlavička */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] px-8 py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <CalendarIcon size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    {t.calendar_admin_title || "Správa kalendára"}
                  </h1>
                  <p className="text-indigo-100 mt-1">Liturgické dni a svätí</p>
                </div>
              </div>
              
              {/* Štatistiky */}
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{total}</div>
                  <div className="text-sm text-indigo-100 mt-1">Celkom záznamov</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">
                    {languageOptions.find(l => l.value === filterLang)?.flag}
                  </div>
                  <div className="text-sm text-indigo-100 mt-1">Aktívny jazyk</div>
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
              <Globe size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Filter jazyka</h3>
            </div>
            <select
              value={filterLang}
              onChange={e => { setFilterLang(e.target.value as "sk" | "cz" | "en" | "es"); setPage(1); }}
              className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              {languageOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.flag} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Import/Export */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Import / Export</h3>
            </div>
            <div className="flex gap-3">
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
                onClick={handleExportExcel}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2.5 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium shadow-sm"
              >
                <Download size={18} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Akcie */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <PlusCircle size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Pridať záznam</h3>
            </div>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-sm"
            >
              <PlusCircle size={18} />
              {showAdd ? "Zrušiť pridanie" : "Pridať záznam"}
            </button>
          </div>
        </div>

        {/* Vyhľadávanie a filtre */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Search size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Vyhľadávanie a filtre</h3>
              {hasActiveFilters && (
                <span className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full">
                  Aktívne filtre
                </span>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                showFilters || hasActiveFilters 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
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
                onChange={e => { setGlobalSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Vyhľadať vo všetkých poliach..."
              />
            </div>
          </div>

          {/* Detailné filtre */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Meno dňa
                  </label>
                  <input
                    type="text"
                    value={filter.name_day}
                    onChange={e => { setFilter(f => ({ ...f, name_day: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Filtrovať..."
                    disabled={!!globalSearch}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Liturgický deň
                  </label>
                  <input
                    type="text"
                    value={filter.liturgical_day}
                    onChange={e => { setFilter(f => ({ ...f, liturgical_day: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Filtrovať..."
                    disabled={!!globalSearch}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Svätí
                  </label>
                  <input
                    type="text"
                    value={filter.saints}
                    onChange={e => { setFilter(f => ({ ...f, saints: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Filtrovať..."
                    disabled={!!globalSearch}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Dátum od</label>
                  <input
                    type="date"
                    value={filter.dateFrom}
                    onChange={e => { setFilter(f => ({ ...f, dateFrom: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    disabled={!!globalSearch}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Dátum do</label>
                  <input
                    type="date"
                    value={filter.dateTo}
                    onChange={e => { setFilter(f => ({ ...f, dateTo: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    disabled={!!globalSearch}
                  />
                </div>
              </div>
              
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <Eraser size={16} />
                  Vyčistiť filtre
                </button>
              )}
            </div>
          )}
        </div>

        {/* Formulár na pridanie */}
        {showAdd && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-lg p-6 mb-6 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <PlusCircle size={20} className="text-purple-600" />
              <h3 className="font-semibold text-gray-800">Pridať nový záznam</h3>
            </div>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Dátum *</label>
                <input
                  required
                  type="date"
                  value={addData.date || ""}
                  onChange={e => setAddData(a => ({ ...a, date: e.target.value }))}
                  className="w-full border-2 border-purple-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Meno dňa *</label>
                <input
                  required
                  value={addData.name_day || ""}
                  onChange={e => setAddData(a => ({ ...a, name_day: e.target.value }))}
                  className="w-full border-2 border-purple-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Názov dňa"
                />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Liturgický deň *</label>
                <input
                  required
                  value={addData.liturgical_day || ""}
                  onChange={e => setAddData(a => ({ ...a, liturgical_day: e.target.value }))}
                  className="w-full border-2 border-purple-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Liturgický deň"
                />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Svätí *</label>
                <input
                  required
                  value={addData.saints || ""}
                  onChange={e => setAddData(a => ({ ...a, saints: e.target.value }))}
                  className="w-full border-2 border-purple-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Svätí"
                />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Jazyk *</label>
                <select
                  value={addData.lang || filterLang}
                  onChange={e => setAddData(a => ({ ...a, lang: e.target.value }))}
                  className="w-full border-2 border-purple-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                >
                  {languageOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.flag} {option.value.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-1 flex items-end">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {addLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Pridávam...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Pridať
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabuľka */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Dátum
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Meno dňa
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Liturgický deň
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Users2 size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Svätí
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Jazyk
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Edit3 size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Akcie
                      </span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500">Načítavam...</span>
                      </div>
                    </td>
                  </tr>
                ) : days.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Žiadne záznamy</p>
                        <p>Skúste zmeniť filtre alebo pridajte nový záznam</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  days.map(day =>
                    editingId === day.id ? (
                      <tr key={day.id} className="bg-yellow-50 border-l-4 border-yellow-400">
                        <td className="px-6 py-4">
                          <input
                            type="date"
                            value={editData.date || ""}
                            onChange={e => setEditData(ed => ({ ...ed, date: e.target.value }))}
                            className="w-full border-2 border-yellow-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            value={editData.name_day || ""}
                            onChange={e => setEditData(ed => ({ ...ed, name_day: e.target.value }))}
                            className="w-full border-2 border-yellow-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            value={editData.liturgical_day || ""}
                            onChange={e => setEditData(ed => ({ ...ed, liturgical_day: e.target.value }))}
                            className="w-full border-2 border-yellow-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            value={editData.saints || ""}
                            onChange={e => setEditData(ed => ({ ...ed, saints: e.target.value }))}
                            className="w-full border-2 border-yellow-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={editData.lang || ""}
                            onChange={e => setEditData(ed => ({ ...ed, lang: e.target.value }))}
                            className="w-full border-2 border-yellow-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                          >
                            {languageOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.flag} {option.value.toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={saveEdit}
                              disabled={editLoading}
                              className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50 flex items-center gap-2"
                            >
                              {editLoading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Save size={16} />
                              )}
                              Uložiť
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-400 text-white px-3 py-2 rounded-lg hover:bg-gray-500 transition flex items-center gap-2"
                            >
                              <X size={16} />
                              Zrušiť
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      <tr key={day.id} className="border-b border-gray-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {new Date(day.date + 'T00:00:00').toLocaleDateString('sk-SK', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 font-medium">{day.name_day}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-700">{day.liturgical_day}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-700">{day.saints}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                            {languageOptions.find(l => l.value === day.lang)?.flag}
                            {day.lang.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/admin/calendar/${day.id}`}>
                              <button
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                title="Upraviť detail"
                              >
                                <Edit3 size={18} />
                              </button>
                            </Link>
                            <button
                              onClick={() => startEdit(day)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                              title="Rýchla editácia"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(day.id)}
                              disabled={deletingId === day.id}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                              title="Vymazať"
                            >
                              {deletingId === day.id ? (
                                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <Trash2 size={18} />
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
        </div>

        {/* Stránkovanie */}
        {!loading && days.length > 0 && Math.ceil(total / PAGE_SIZE) > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">
                Zobrazené {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} z {total} záznamov
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <ChevronDown size={16} className="rotate-90 inline mr-1" />
                  Predchádzajúca
                </button>
                
                <div className="flex items-center gap-2">
                  {(() => {
                    const totalPages = Math.ceil(total / PAGE_SIZE);
                    const maxVisible = 5;
                    
                    // Ak je menej stránok ako maxVisible, zobraz všetky
                    if (totalPages <= maxVisible) {
                      return Array.from({ length: totalPages }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={`page-${pageNum}`}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-lg font-medium transition-all ${
                              page === pageNum
                                ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm"
                                : "bg-white border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      });
                    }
                    
                    // Pre viac stránok, zobraz smart pagination
                    const startPage = Math.max(1, Math.min(page - 2, totalPages - maxVisible + 1));
                    const endPage = Math.min(totalPages, startPage + maxVisible - 1);
                    
                    const pages = [];
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={`page-${i}`}
                          onClick={() => setPage(i)}
                          className={`w-10 h-10 rounded-lg font-medium transition-all ${
                            page === i
                              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm"
                              : "bg-white border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
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
                  className="px-4 py-2 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-300 hover:bg-indigo-50"
                >
                  Ďalšia
                  <ChevronDown size={16} className="-rotate-90 inline ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}