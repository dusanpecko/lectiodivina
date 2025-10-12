"use client";

import { useSupabase } from "@/app/components/SupabaseProvider"; // ✅ ZMENA
import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Edit3,
  Eraser,
  Filter,
  Globe,
  MessageSquare,
  PlusCircle,
  Quote,
  Save,
  Search,
  Trash2,
  Upload,
  X
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

// ... rozhrania a konštanty
interface DailyQuote {
  id: string;
  date: string;
  quote: string;
  reference: string;
  lang: string;
}

const PAGE_SIZE = 20;

const languageOptions = [
  { value: "sk", label: "Slovenčina", flag: "🇸🇰" },
  { value: "cz", label: "Čeština", flag: "🇨🇿" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇪🇸" },
];

export default function DailyQuotesAdminPage() {
  const { supabase } = useSupabase(); // ✅ ZMENA
  const [filterLang, setFilterLang] = useState<"sk" | "cz" | "en" | "es">("sk");
  const [quotes, setQuotes] = useState<DailyQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<DailyQuote>>({});
  const [editLoading, setEditLoading] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState({
    quote: "",
    reference: "",
    dateFrom: "",
    dateTo: "",
  });
  const [globalSearch, setGlobalSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [addData, setAddData] = useState<Partial<DailyQuote>>({
    date: "",
    quote: "",
    reference: "",
    lang: filterLang,
  });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    setAddData(a => ({ ...a, lang: filterLang }));
  }, [filterLang]);

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);

    if (!addData.date || !addData.quote || !addData.reference || !addData.lang) {
      alert("Chýbajú povinné polia");
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
      alert("Chyba pri pridávaní citátu");
    }
  };

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
      alert("Chyba pri ukladaní");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Naozaj chcete vymazať tento citát?")) return;
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

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      const newItems = json.map(row => ({
        date: row["date"] || "",
        quote: row["quote"] || "",
        reference: row["reference"] || "",
        lang: row["lang"] || filterLang,
      })).filter(item => item.date && item.quote && item.reference && item.lang);

      if (newItems.length === 0) {
        alert("Nenašli sa žiadne validné záznamy na import");
        return;
      }

      const { error } = await supabase.from("daily_quotes").insert(newItems);

      if (error) {
        alert("Chyba pri importe: " + error.message);
      } else {
        alert(`Úspešne importovaných ${newItems.length} citátov!`);
        fetchQuotes();
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExportExcel = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const exportData = quotes.map(({ id: _, ...item }) => item);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DailyQuotes");
    XLSX.writeFile(wb, `daily_quotes_export_${filterLang}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const clearFilters = () => {
    setFilter({ quote: "", reference: "", dateFrom: "", dateTo: "" });
    setGlobalSearch("");
    setPage(1);
  };

  const hasActiveFilters = globalSearch || Object.values(filter).some(f => f !== "");

  const getStats = () => {
    const today = new Date().toISOString().slice(0, 10);
    const thisMonth = new Date().toISOString().slice(0, 7);
    
    return {
      total: quotes.length,
      today: quotes.filter(q => q.date === today).length,
      thisMonth: quotes.filter(q => q.date.startsWith(thisMonth)).length,
      language: filterLang.toUpperCase(),
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hlavička */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] px-8 py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Quote size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    Správa denných citátov
                  </h1>
                  <p className="text-indigo-100 mt-1">Inšpirujúce citáty na každý deň</p>
                </div>
              </div>
              
              {/* Štatistiky */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.total}</div>
                  <div className="text-sm text-indigo-100 mt-1">Celkom citátov</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.today}</div>
                  <div className="text-sm text-indigo-100 mt-1">Dnes</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.thisMonth}</div>
                  <div className="text-sm text-indigo-100 mt-1">Tento mesiac</div>
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
              <h3 className="font-semibold text-gray-900">Pridať citát</h3>
            </div>
            <button
              onClick={() => setShowAdd(!showAdd)}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-lg hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-sm"
            >
              <PlusCircle size={18} />
              {showAdd ? "Zrušiť pridanie" : "Pridať citát"}
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
                placeholder="Vyhľadať v citátoch a referenciách..."
              />
            </div>
          </div>

          {/* Detailné filtre */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Citát
                  </label>
                  <input
                    type="text"
                    value={filter.quote}
                    onChange={e => { setFilter(f => ({ ...f, quote: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Filtrovať citáty..."
                    disabled={!!globalSearch}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Referencia
                  </label>
                  <input
                    type="text"
                    value={filter.reference}
                    onChange={e => { setFilter(f => ({ ...f, reference: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Filtrovať referencie..."
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
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl shadow-lg p-6 mb-6 border border-pink-200">
            <div className="flex items-center gap-3 mb-4">
              <PlusCircle size={20} className="text-pink-600" />
              <h3 className="font-semibold text-gray-800">Pridať nový citát</h3>
            </div>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dátum *</label>
                <input
                  required
                  type="date"
                  value={addData.date || ""}
                  onChange={e => setAddData(a => ({ ...a, date: e.target.value }))}
                  className="w-full border-2 border-pink-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Citát *</label>
                <input
                  required
                  value={addData.quote || ""}
                  onChange={e => setAddData(a => ({ ...a, quote: e.target.value }))}
                  className="w-full border-2 border-pink-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                  placeholder="Zadajte citát..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Referencia *</label>
                <input
                  required
                  value={addData.reference || ""}
                  onChange={e => setAddData(a => ({ ...a, reference: e.target.value }))}
                  className="w-full border-2 border-pink-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                  placeholder="Zdroj citátu..."
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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
                      <Calendar size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Dátum
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Citát
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Referencia
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
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500">Načítavam...</span>
                      </div>
                    </td>
                  </tr>
                ) : quotes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Quote size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Žiadne citáty</p>
                        <p>Skúste zmeniť filtre alebo pridajte nový citát</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  quotes.map(q =>
                    editingId === q.id ? (
                      <tr key={q.id} className="bg-yellow-50 border-l-4 border-yellow-400">
                        <td className="px-6 py-4">
                          <input
                            type="date"
                            value={editData.date || ""}
                            onChange={e => setEditData(ed => ({ ...ed, date: e.target.value }))}
                            className="w-full border-2 border-yellow-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <textarea
                            value={editData.quote || ""}
                            onChange={e => setEditData(ed => ({ ...ed, quote: e.target.value }))}
                            rows={3}
                            className="w-full border-2 border-yellow-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition resize-none"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            value={editData.reference || ""}
                            onChange={e => setEditData(ed => ({ ...ed, reference: e.target.value }))}
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
                      <tr key={q.id} className="border-b border-gray-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {new Date(q.date + 'T00:00:00').toLocaleDateString('sk-SK', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 leading-relaxed">
                            <Quote size={16} className="inline text-purple-400 mr-2" />
                            {q.quote.length > 100 ? (
                              <span title={q.quote}>{q.quote.slice(0, 100)}...</span>
                            ) : (
                              q.quote
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-700 font-medium">{q.reference}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                            {languageOptions.find(l => l.value === q.lang)?.flag}
                            {q.lang.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link href={`/admin/daily_quotes/${q.id}`}>
                              <button
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                                title="Upraviť detail"
                              >
                                <Edit3 size={18} />
                              </button>
                            </Link>
                            <button
                              onClick={() => startEdit(q)}
                              className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition"
                              title="Rýchla editácia"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(q.id)}
                              disabled={deletingId === q.id}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                              title="Vymazať"
                            >
                              {deletingId === q.id ? (
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
        {!loading && quotes.length > 0 && Math.ceil(total / PAGE_SIZE) > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">
                Zobrazené {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} z {total} citátov
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