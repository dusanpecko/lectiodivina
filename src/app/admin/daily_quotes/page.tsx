"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { 
  Quote,
  Trash2, 
  PlusCircle, 
  Eraser, 
  Edit3,
  Download,
  Upload,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  Globe,
  Calendar,
  BookOpen,
  MessageSquare,
  Hash,
  X,
  Save
} from "lucide-react";
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

const languageOptions = [
  { value: "sk", label: "Slovenčina", flag: "🇸🇰" },
  { value: "cz", label: "Čeština", flag: "🇨🇿" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇪🇸" },
];

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

  // Filtre a vyhľadávanie
  const [showFilters, setShowFilters] = useState(false);
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
      alert("Chyba pri ukladaní");
    }
  };

  // Vymazať položku
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

  // Export do Excelu
  const handleExportExcel = () => {
    const exportData = quotes.map(({ id, ...item }) => item);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DailyQuotes");
    XLSX.writeFile(wb, `daily_quotes_export_${filterLang}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Vyčistiť všetky filtre
  const clearFilters = () => {
    setFilter({ quote: "", reference: "", dateFrom: "", dateTo: "" });
    setGlobalSearch("");
    setPage(1);
  };

  const hasActiveFilters = globalSearch || Object.values(filter).some(f => f !== "");

  // Získať štatistiky
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Hlavička */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Quote size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Správa denných citátov
                </h1>
                <p className="text-gray-600">Inšpirujúce citáty na každý deň</p>
              </div>
            </div>
            
            {/* Štatistiky */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
                <div className="text-sm text-gray-500">Celkom</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.today}</div>
                <div className="text-sm text-gray-500">Dnes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.thisMonth}</div>
                <div className="text-sm text-gray-500">Tento mesiac</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {languageOptions.find(l => l.value === filterLang)?.flag}
                </div>
                <div className="text-sm text-gray-500">Jazyk</div>
              </div>
            </div>
          </div>
        </div>

        {/* Ovládacie panely */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Výber jazyka */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe size={20} className="text-purple-600" />
              <h3 className="font-semibold text-gray-800">Jazyk citátov</h3>
            </div>
            <select
              value={filterLang}
              onChange={e => { setFilterLang(e.target.value as any); setPage(1); }}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            >
              {languageOptions.map(option => (
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
                <Upload size={16} />
                Import
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleExcelImport}
                  className="hidden"
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
              onClick={() => setShowAdd(!showAdd)}
              className="w-full bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition flex items-center justify-center gap-2"
            >
              <PlusCircle size={16} />
              {showAdd ? "Zrušiť pridanie" : "Pridať citát"}
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
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
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
                onChange={e => { setGlobalSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Vyhľadať v citátoch a referenciách..."
              />
            </div>
          </div>

          {/* Detailné filtre */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MessageSquare size={16} className="inline mr-1" />
                  Citát
                </label>
                <input
                  type="text"
                  value={filter.quote}
                  onChange={e => { setFilter(f => ({ ...f, quote: e.target.value })); setPage(1); }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Filtrovať citáty..."
                  disabled={!!globalSearch}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen size={16} className="inline mr-1" />
                  Referencia
                </label>
                <input
                  type="text"
                  value={filter.reference}
                  onChange={e => { setFilter(f => ({ ...f, reference: e.target.value })); setPage(1); }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  placeholder="Filtrovať referencie..."
                  disabled={!!globalSearch}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dátum od</label>
                <input
                  type="date"
                  value={filter.dateFrom}
                  onChange={e => { setFilter(f => ({ ...f, dateFrom: e.target.value })); setPage(1); }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  disabled={!!globalSearch}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dátum do</label>
                <input
                  type="date"
                  value={filter.dateTo}
                  onChange={e => { setFilter(f => ({ ...f, dateTo: e.target.value })); setPage(1); }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
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
                <Eraser size={16} />
                Vyčistiť filtre
              </button>
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
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      Dátum
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <MessageSquare size={16} />
                      Citát
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} />
                      Referencia
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Globe size={16} />
                      Jazyk
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Akcie</th>
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
                      <tr key={q.id} className="hover:bg-purple-50 transition-colors">
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
        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Zobrazujem <span className="font-medium">{(page - 1) * PAGE_SIZE + 1}</span> až{" "}
              <span className="font-medium">{Math.min(page * PAGE_SIZE, total)}</span> z{" "}
              <span className="font-medium">{total}</span> citátov
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronDown size={16} className="rotate-90" />
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
                          className={`w-10 h-10 rounded-lg transition ${
                            page === pageNum
                              ? "bg-purple-600 text-white"
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
                            ? "bg-purple-600 text-white"
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
                <ChevronDown size={16} className="-rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}