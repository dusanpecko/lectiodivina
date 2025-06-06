"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { Pencil, Trash2, PlusCircle, Eraser } from "lucide-react";
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

export default function ContentCardsAdminPage() {
  const supabase = useSupabaseClient();
  const [cards, setCards] = useState<ContentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtre, pridaj lang
  const [filter, setFilter] = useState({
    title: "",
    priority: "",
    visible_from: "",
    visible_to: "",
    lang: "sk", // predvolene SK
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
      if (filter.title)
        dataQuery = dataQuery.ilike("title", `%${filter.title}%`);
      if (filter.priority)
        dataQuery = dataQuery.eq("priority", filter.priority);
      if (filter.visible_from)
        dataQuery = dataQuery.gte("visible_from", filter.visible_from);
      if (filter.visible_to)
        dataQuery = dataQuery.lte("visible_to", filter.visible_to);
      if (filter.lang)
        dataQuery = dataQuery.eq("lang", filter.lang);
      if (filter.lang)
        countQuery = countQuery.eq("lang", filter.lang);
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

  // Vymazať položku
  const handleDelete = async (id: number) => {
    if (!confirm("Naozaj vymazať?")) return;
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

  // EXPORT vrátane lang
  const handleExportExcel = () => {
    const exportData = cards.map(({ id, created_at, ...item }) => item);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "content_cards");
    XLSX.writeFile(wb, "content_cards_export.xlsx");
  };

  // IMPORT s lang
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
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      // podpora lang, defaultne z filtra
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
        alert("Importované!");
        fetchCards();
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <main>
      <h1 className="text-2xl font-bold mb-6">Správa kariet (content_cards)</h1>
      <div className="flex items-center gap-4 mb-4">
        <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 h-11 rounded hover:bg-blue-700 transition cursor-pointer">
          <span>Import Excel</span>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleExcelImport}
            className="hidden"
            disabled={importLoading}
          />
        </label>
        <button
          className="inline-flex items-center gap-2 bg-yellow-500 text-white px-3 py-2 h-11 rounded hover:bg-yellow-600 transition"
          onClick={handleExportExcel}
          aria-label="Exportovať Excel"
          type="button"
        >
          Export Excel
        </button>
        <Link href="/admin/content-cards/new">
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 h-11 rounded hover:bg-blue-700 transition ml-auto"
            aria-label="Pridať kartu"
            type="button"
          >
            <PlusCircle size={20} /> Pridať kartu
          </button>
        </Link>
      </div>

      {/* Filtre */}
      <div className="flex gap-4 mb-4 flex-wrap items-end">
        <div>
          <label className="block text-xs">Hľadaj</label>
          <input
            type="text"
            value={globalSearch}
            onChange={e => { setGlobalSearch(e.target.value); setPage(1); }}
            className="border rounded px-2 py-1 h-10 min-w-[200px]"
            placeholder="Hľadaj"
          />
        </div>
        <div>
          <label className="block text-xs">Nadpis</label>
          <input
            type="text"
            value={filter.title}
            onChange={e => { setFilter(f => ({ ...f, title: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder="Nadpis"
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">Priorita</label>
          <input
            type="number"
            value={filter.priority}
            onChange={e => { setFilter(f => ({ ...f, priority: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder="Priorita"
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">Viditeľné od</label>
          <input
            type="date"
            value={filter.visible_from}
            onChange={e => { setFilter(f => ({ ...f, visible_from: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">Viditeľné do</label>
          <input
            type="date"
            value={filter.visible_to}
            onChange={e => { setFilter(f => ({ ...f, visible_to: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">Jazyk</label>
          <select
            value={filter.lang}
            onChange={e => { setFilter(f => ({ ...f, lang: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
          >
            <option value="sk">Slovenčina</option>
            <option value="cz">Čeština</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
        <button
          onClick={clearFilters}
          className="flex gap-1 items-center px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm font-semibold transition"
          type="button"
        >
          <Eraser size={16} /> Vymazať filtre
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Nadpis</th>
              <th className="p-3">Obrázok 1</th>
              <th className="p-3">Obrázok 2</th>
              <th className="p-3">Viditeľné od</th>
              <th className="p-3">Viditeľné do</th>
              <th className="p-3">Priorita</th>
              <th className="p-3">Jazyk</th>
              <th className="p-3 text-center">Akcie</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">
                  Načítavam...
                </td>
              </tr>
            ) : cards.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-6 text-center text-gray-400">
                  Žiadne záznamy
                </td>
              </tr>
            ) : (
              cards.map(card => (
                <tr key={card.id} className="border-b hover:bg-blue-50 transition">
                  <td className="p-3">{card.title}</td>
                  <td className="p-3">
                    {card.image_url ? <img src={card.image_url} alt="" style={{ maxWidth: 64 }} /> : ""}
                  </td>
                  <td className="p-3">
                    {card.image_url_2 ? <img src={card.image_url_2} alt="" style={{ maxWidth: 64 }} /> : ""}
                  </td>
                  <td className="p-3">{card.visible_from}</td>
                  <td className="p-3">{card.visible_to}</td>
                  <td className="p-3">{card.priority}</td>
                  <td className="p-3">{card.lang}</td>
                  <td className="p-3 flex gap-2 items-center justify-center">
                    <Link href={`/admin/content-cards/${card.id}`}>
                      <button
                        className="p-2 rounded hover:bg-blue-100 transition"
                        title="Edit"
                        aria-label="Edit"
                      >
                        <Pencil size={18} className="text-blue-600" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(card.id!)}
                      disabled={deletingId === card.id}
                      className="p-2 rounded hover:bg-red-100 transition disabled:opacity-50"
                      title="Delete"
                      aria-label="Delete"
                    >
                      <Trash2 size={18} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              ))
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
        >
          Predošlá
        </button>
        <span>
          Strana <b>{page}</b> z <b>{Math.ceil(total / PAGE_SIZE) || 1}</b>
        </span>
        <button
          className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
          onClick={() => setPage(p => (p * PAGE_SIZE < total ? p + 1 : p))}
          disabled={page * PAGE_SIZE >= total}
        >
          Ďalšia
        </button>
      </div>
    </main>
  );
}
