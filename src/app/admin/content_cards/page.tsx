"use client";

import { useSupabase } from "@/app/components/SupabaseProvider"; // ← ZMENA: náš provider
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Download,
  Edit3,
  Eraser,
  Eye,
  EyeOff,
  Filter,
  Globe,
  Hash,
  Image as ImageIcon,
  PlusCircle,
  Search,
  Star,
  Trash2,
  Type,
  Upload
} from "lucide-react";
import Image from 'next/image';
import Link from "next/link";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

interface ContentCard {
  id?: number;
  created_at?: string;
  title?: string;
  image_url?: string;
  image_url_2?: string;
  description_1?: string;
  description_2?: string;
  description_3?: string;
  description_4?: string;
  description_5?: string;
  description_6?: string;
  visible_from?: string;
  visible_to?: string;
  published_at?: string;
  priority?: number;
  lang?: string;
}

const PAGE_SIZE = 20;

const languageOptions = [
  { value: "sk", label: "Slovenčina", flag: "🇸🇰" },
  { value: "cz", label: "Čeština", flag: "🇨🇿" },
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "es", label: "Español", flag: "🇪🇸" },
];

export default function ContentCardsAdminPage() {
  const { supabase } = useSupabase(); // ← ZMENA: náš provider namiesto useSupabaseClient
  const [cards, setCards] = useState<ContentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtre a vyhľadávanie
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState({
    title: "",
    priority: "",
    visible_from: "",
    visible_to: "",
    lang: "sk",
  });
  const [globalSearch, setGlobalSearch] = useState("");
  const [importLoading, setImportLoading] = useState(false);

  const fetchCards = async () => {
    setLoading(true);

    let dataQuery = supabase.from("content_cards").select("*");
    let countQuery = supabase.from("content_cards").select("*", { count: "exact", head: true });

    if (globalSearch) {
      const val = `%${globalSearch}%`;
      dataQuery = dataQuery.or(
        `title.ilike.${val},description_1.ilike.${val},description_2.ilike.${val},description_3.ilike.${val},lang.ilike.${val}`
      );
      countQuery = countQuery.or(
        `title.ilike.${val},description_1.ilike.${val},description_2.ilike.${val},description_3.ilike.${val},lang.ilike.${val}`
      );
    } else {
      if (filter.title) {
        dataQuery = dataQuery.ilike("title", `%${filter.title}%`);
        countQuery = countQuery.ilike("title", `%${filter.title}%`);
      }
      if (filter.priority) {
        dataQuery = dataQuery.eq("priority", filter.priority);
        countQuery = countQuery.eq("priority", filter.priority);
      }
      if (filter.visible_from) {
        dataQuery = dataQuery.gte("visible_from", filter.visible_from);
        countQuery = countQuery.gte("visible_from", filter.visible_from);
      }
      if (filter.visible_to) {
        dataQuery = dataQuery.lte("visible_to", filter.visible_to);
        countQuery = countQuery.lte("visible_to", filter.visible_to);
      }
      if (filter.lang) {
        dataQuery = dataQuery.eq("lang", filter.lang);
        countQuery = countQuery.eq("lang", filter.lang);
      }
    }

    dataQuery = dataQuery.order("priority", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    const { data, error } = await dataQuery;
    const { count, error: countError } = await countQuery;

    if (!error && !countError) {
      setCards(data as ContentCard[]);
      setTotal(count || 0);
    } else {
      setCards([]);
      setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, globalSearch, page, supabase]);

  // Vymazać položku
  const handleDelete = async (id: number) => {
    if (!confirm("Naozaj chcete vymazať túto kartu?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("content_cards").delete().eq("id", id);
    if (!error) {
      if (cards.length === 1 && page > 1) setPage(p => p - 1);
      else fetchCards();
    }
    setDeletingId(null);
  };

  const clearFilters = () => {
    setFilter({ title: "", priority: "", visible_from: "", visible_to: "", lang: filter.lang });
    setGlobalSearch("");
    setPage(1);
  };

  // Export
  const handleExportExcel = () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const exportData = cards.map(({ id, created_at, ...item }) => item);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "content_cards");
    XLSX.writeFile(wb, `content_cards_export_${filter.lang}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Import
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      const newItems = json.map(row => ({
        title: row["title"] || "",
        image_url: row["image_url"] || "",
        image_url_2: row["image_url_2"] || "",
        description_1: row["description_1"] || "",
        description_2: row["description_2"] || "",
        description_3: row["description_3"] || "",
        description_4: row["description_4"] || "",
        description_5: row["description_5"] || "",
        description_6: row["description_6"] || "",
        visible_from: row["visible_from"] || "",
        visible_to: row["visible_to"] || "",
        published_at: row["published_at"] || "",
        priority: row["priority"] ? Number(row["priority"]) : 0,
        lang: row["lang"] || filter.lang || "sk",
      })).filter(item => item.title && item.lang);

      if (newItems.length === 0) {
        alert("Nenašli sa žiadne validné záznamy na import.");
        setImportLoading(false);
        return;
      }

      const { error } = await supabase.from("content_cards").insert(newItems);

      setImportLoading(false);
      if (error) {
        alert("Chyba pri importe: " + error.message);
      } else {
        alert(`Úspešne importovaných ${newItems.length} kariet!`);
        fetchCards();
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const hasActiveFilters = globalSearch || Object.entries(filter).some(([key, value]) => key !== 'lang' && value !== "");

  // Zistiť, či je karta aktuálne viditeľná
  const isCardVisible = (card: ContentCard) => {
    const now = new Date();
    const visibleFrom = card.visible_from ? new Date(card.visible_from) : null;
    const visibleTo = card.visible_to ? new Date(card.visible_to) : null;
    
    if (visibleFrom && now < visibleFrom) return false;
    if (visibleTo && now > visibleTo) return false;
    return true;
  };

  // Získať štatistiky
  const getStats = () => {
    return {
      total: cards.length,
      visible: cards.filter(isCardVisible).length,
      hidden: cards.filter(card => !isCardVisible(card)).length,
      avgPriority: cards.length ? Math.round(cards.reduce((sum, card) => sum + (card.priority || 0), 0) / cards.length) : 0,
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Hlavička with gradient */}
        <header className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] rounded-xl shadow-lg p-8 mb-6">
          <div className="mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-lg">
                <CreditCard size={28} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Správa content kariet
                </h1>
                <p className="text-white/80">Obsah a multimedia karty</p>
              </div>
            </div>
          </div>
          
          {/* Štatistiky */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={20} className="text-white/80" />
                <span className="text-sm font-medium text-white/80">Celkom</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye size={20} className="text-white/80" />
                <span className="text-sm font-medium text-white/80">Viditeľné</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.visible}</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <EyeOff size={20} className="text-white/80" />
                <span className="text-sm font-medium text-white/80">Skryté</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.hidden}</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe size={20} className="text-white/80" />
                <span className="text-sm font-medium text-white/80">Jazyk</span>
              </div>
              <div className="text-2xl font-bold text-white">
                {languageOptions.find(l => l.value === filter.lang)?.flag} {filter.lang.toUpperCase()}
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
              <h3 className="font-semibold text-gray-800">Jazyk kariet</h3>
            </div>
            <select
              value={filter.lang}
              onChange={e => { setFilter(f => ({ ...f, lang: e.target.value })); setPage(1); }}
              className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            >
              {languageOptions.map(option => (
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
                <Upload size={16} />
                {importLoading ? "Importujem..." : "Import"}
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleExcelImport}
                  className="hidden"
                  disabled={importLoading}
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
            <Link href="/admin/content_cards/new">
              <button className="w-full bg-gradient-to-r from-[#40467b] to-[#686ea3] hover:from-[#686ea3] hover:to-[#40467b] text-white px-4 py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm">
                <PlusCircle size={16} />
                Pridať kartu
              </button>
            </Link>
          </div>
        </div>

        {/* Vyhľadávanie a filtre */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Search size={16} className="text-gray-600" />
              <h3 className="font-semibold text-gray-800">Vyhľadávanie a filtre</h3>
              {hasActiveFilters && (
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
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
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Vyhľadať v názvoch a popisoch..."
              />
            </div>
          </div>

          {/* Detailné filtre */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Type size={16} className="inline mr-1" />
                  Názov karty
                </label>
                <input
                  type="text"
                  value={filter.title}
                  onChange={e => { setFilter(f => ({ ...f, title: e.target.value })); setPage(1); }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Filtrovať..."
                  disabled={!!globalSearch}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash size={16} className="inline mr-1" />
                  Priorita
                </label>
                <input
                  type="number"
                  value={filter.priority}
                  onChange={e => { setFilter(f => ({ ...f, priority: e.target.value })); setPage(1); }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  placeholder="Priorita..."
                  disabled={!!globalSearch}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Viditeľné od</label>
                <input
                  type="date"
                  value={filter.visible_from}
                  onChange={e => { setFilter(f => ({ ...f, visible_from: e.target.value })); setPage(1); }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  disabled={!!globalSearch}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Viditeľné do</label>
                <input
                  type="date"
                  value={filter.visible_to}
                  onChange={e => { setFilter(f => ({ ...f, visible_to: e.target.value })); setPage(1); }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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

        {/* Tabuľka */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Type size={16} className="text-gray-600" />
                      Názov
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <ImageIcon size={16} className="text-gray-600" />
                      Obrázky
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-600" />
                      Viditeľnosť
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-gray-600" />
                      Priorita
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
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-500">Načítavam...</span>
                      </div>
                    </td>
                  </tr>
                ) : cards.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Žiadne karty</p>
                        <p>Skúste zmeniť filtre alebo pridajte novú kartu</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  cards.map(card => (
                    <tr key={card.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{card.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {card.description_1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {card.image_url && (
                            <Image 
                              src={card.image_url} 
                              alt="Obrázok 1" 
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200"
                            />
                          )}
                          {card.image_url_2 && (
                            <Image 
                              src={card.image_url_2} 
                              alt="Obrázok 2" 
                              width={48}
                              height={48}
                              className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200"
                            />
                          )}
                          {!card.image_url && !card.image_url_2 && (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ImageIcon size={16} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">
                          {card.visible_from && (
                            <div>Od: {new Date(card.visible_from).toLocaleDateString()}</div>
                          )}
                          {card.visible_to && (
                            <div>Do: {new Date(card.visible_to).toLocaleDateString()}</div>
                          )}
                          {!card.visible_from && !card.visible_to && (
                            <span className="text-gray-400">Vždy viditeľné</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                          (card.priority || 0) >= 5 
                            ? "bg-green-100 text-green-800" 
                            : (card.priority || 0) >= 3
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          <Star size={12} />
                          {card.priority || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full">
                          {languageOptions.find(l => l.value === card.lang)?.flag}
                          {card.lang?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isCardVisible(card) ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                            <Eye size={12} />
                            Viditeľné
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                            <EyeOff size={12} />
                            Skryté
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/admin/content_cards/${card.id}`}>
                            <button className="p-2 bg-gradient-to-r from-[#40467b] to-[#686ea3] hover:from-[#686ea3] hover:to-[#40467b] text-white rounded-lg transition shadow-sm">
                              <Edit3 size={16} />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(card.id!)}
                            disabled={deletingId === card.id}
                            className="p-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg transition shadow-sm disabled:opacity-50"
                          >
                            {deletingId === card.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 size={16} />
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
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Zobrazujem <span className="font-medium text-gray-900">{(page - 1) * PAGE_SIZE + 1}</span> až{" "}
              <span className="font-medium text-gray-900">{Math.min(page * PAGE_SIZE, total)}</span> z{" "}
              <span className="font-medium text-gray-900">{total}</span> kariet
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                <ChevronDown size={16} className="-rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}