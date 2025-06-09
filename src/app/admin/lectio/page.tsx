"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Pencil, Trash2, PlusCircle, Eraser } from "lucide-react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

interface Lectio {
  datum: string;
  lang: string;
  hlava: string;
  suradnice_pismo: string;
  uvod: string;
  uvod_audio: string;
  video: string;
  modlitba_uvod: string;
  modlitba_audio: string;
  nazov_biblia_1: string;
  biblia_1: string;
  biblia_1_audio: string;
  nazov_biblia_2: string;
  biblia_2: string;
  biblia_2_audio: string;
  nazov_biblia_3: string;
  biblia_3: string;
  biblia_3_audio: string;
  lectio_text: string;
  lectio_audio: string;
  meditatio_text: string;
  meditatio_audio: string;
  oratio_text: string;
  oratio_audio: string;
  contemplatio_text: string;
  contemplatio_audio: string;
  actio_text: string;
  actio_audio: string;
  modlitba_zaver: string;
  audio_5_min: string;
  zaver: string;
  pozehnanie: string;
  id?: number;
}

const PAGE_SIZE = 20;

const ALL_FIELDS: (keyof Lectio)[] = [
  "datum", "lang", "hlava", "suradnice_pismo", "uvod", "uvod_audio", "video",
  "modlitba_uvod", "modlitba_audio", "nazov_biblia_1", "biblia_1", "biblia_1_audio",
  "nazov_biblia_2", "biblia_2", "biblia_2_audio", "nazov_biblia_3", "biblia_3", "biblia_3_audio",
  "lectio_text", "lectio_audio", "meditatio_text", "meditatio_audio", "oratio_text", "oratio_audio",
  "contemplatio_text", "contemplatio_audio", "actio_text", "actio_audio",
  "modlitba_zaver", "audio_5_min", "zaver", "pozehnanie"
];

export default function LectioAdminPage() {
  const { lang: appLang } = useLanguage();
  const t = translations[appLang];
  const router = useRouter();

  const [filterLang, setFilterLang] = useState<"sk" | "cz" | "en" | "es">("sk");
  const supabase = useSupabaseClient();
  const [lectios, setLectios] = useState<Lectio[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState({
    hlava: "",
    suradnice_pismo: "",
    datumFrom: "",
    datumTo: "",
  });
  const [globalSearch, setGlobalSearch] = useState("");
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchLectios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterLang, filter, globalSearch, page, supabase]);

  const fetchLectios = async () => {
    setLoading(true);
    let dataQuery = supabase
      .from("lectio")
      .select("id, datum, lang, hlava, suradnice_pismo")
      .eq("lang", filterLang);

    let countQuery = supabase
      .from("lectio")
      .select("*", { count: "exact", head: true })
      .eq("lang", filterLang);

    if (globalSearch) {
      const val = `%${globalSearch}%`;
      dataQuery = dataQuery.or(
        `hlava.ilike.${val},suradnice_pismo.ilike.${val}`
      );
      countQuery = countQuery.or(
        `hlava.ilike.${val},suradnice_pismo.ilike.${val}`
      );
    } else {
      if (filter.hlava) {
        dataQuery = dataQuery.ilike("hlava", `%${filter.hlava}%`);
        countQuery = countQuery.ilike("hlava", `%${filter.hlava}%`);
      }
      if (filter.suradnice_pismo) {
        dataQuery = dataQuery.ilike("suradnice_pismo", `%${filter.suradnice_pismo}%`);
        countQuery = countQuery.ilike("suradnice_pismo", `%${filter.suradnice_pismo}%`);
      }
      if (filter.datumFrom) {
        dataQuery = dataQuery.gte("datum", filter.datumFrom);
        countQuery = countQuery.gte("datum", filter.datumFrom);
      }
      if (filter.datumTo) {
        dataQuery = dataQuery.lte("datum", filter.datumTo);
        countQuery = countQuery.lte("datum", filter.datumTo);
      }
    }

    dataQuery = dataQuery.order("datum", { ascending: false }).range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);
    const { data, error } = await dataQuery;
    const { count, error: countError } = await countQuery;

    if (!error && !countError) {
      setLectios(data as Lectio[]);
      setTotal(count || 0);
    } else {
      setLectios([]);
      setTotal(0);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t.confirm_delete)) return;
    setDeletingId(id);
    const { error } = await supabase.from("lectio").delete().eq("id", id);
    if (!error) {
      if (lectios.length === 1 && page > 1) setPage(p => p - 1);
      else fetchLectios();
    }
    setDeletingId(null);
  };

  const clearFilters = () => {
    setFilter({ hlava: "", suradnice_pismo: "", datumFrom: "", datumTo: "" });
    setGlobalSearch("");
    setPage(1);
  };

  // Export všetkých polí okrem id
  const handleExportExcel = async () => {
    const { data, error } = await supabase
      .from("lectio")
      .select(ALL_FIELDS.join(","))
      .eq("lang", filterLang);

    if (error || !data) {
      alert(t.error_export || "Chyba pri exporte!");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Lectio");
    XLSX.writeFile(wb, "lectio_export.xlsx");
  };

  // Import všetkých polí
  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });

      const newItems = json.map(row =>
        Object.fromEntries(
          ALL_FIELDS.map(f => [f, row[f] ?? ""])
        )
      ).filter(item =>
        item.datum && item.lang && item.hlava && item.suradnice_pismo
      );

      if (newItems.length === 0) {
        alert(t.error_import + ": " + t.no_records);
        setImporting(false);
        return;
      }

      const { error } = await supabase.from("lectio").insert(newItems);

      setImporting(false);

      if (error) {
        alert(t.error_import + ": " + error.message);
      } else {
        alert(t.imported);
        fetchLectios();
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <main>
      <h1 className="text-2xl font-bold mb-6">{t.lectio_admin_title || "Správa Lectio Divina"}</h1>
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
            disabled={importing}
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
          className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 h-11 rounded hover:bg-red-700 transition ml-auto"
          onClick={() => router.push("/admin/lectio/new")}
          type="button"
        >
          <PlusCircle size={20} /> {t.add_item || "Pridať položku"}
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
          <label className="block text-xs">{t.hlava || "Nadpis"}</label>
          <input
            type="text"
            value={filter.hlava}
            onChange={e => { setFilter(f => ({ ...f, hlava: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder={t.hlava || "Nadpis"}
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">{t.suradnice_pismo || "Súradnice Písma"}</label>
          <input
            type="text"
            value={filter.suradnice_pismo}
            onChange={e => { setFilter(f => ({ ...f, suradnice_pismo: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder={t.suradnice_pismo || "Súradnice Písma"}
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">{t.date_from || "Dátum od"}</label>
          <input
            type="date"
            value={filter.datumFrom}
            onChange={e => { setFilter(f => ({ ...f, datumFrom: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder={t.date_from || "Dátum od"}
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">{t.date_to || "Dátum do"}</label>
          <input
            type="date"
            value={filter.datumTo}
            onChange={e => { setFilter(f => ({ ...f, datumTo: e.target.value })); setPage(1); }}
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
              <th className="p-3">{t.datum || "Dátum"}</th>
              <th className="p-3">{t.hlava || "Nadpis"}</th>
              <th className="p-3">{t.suradnice_pismo || "Súradnice Písma"}</th>
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
            ) : lectios.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  {t.no_records}
                </td>
              </tr>
            ) : (
              lectios.map(l => (
                <tr key={l.id} className="border-b hover:bg-blue-50 transition">
                  <td className="p-3">{l.datum?.slice(0, 10)}</td>
                  <td className="p-3">{l.hlava}</td>
                  <td className="p-3">{l.suradnice_pismo}</td>
                  <td className="p-3">{l.lang}</td>
                  <td className="p-3 flex gap-2 items-center justify-center">
                    <button
                      className="p-2 rounded hover:bg-blue-100 transition"
                      title={t.edit}
                      aria-label={t.edit}
                      onClick={() => router.push(`/admin/lectio/${l.id}`)}
                    >
                      <Pencil size={18} className="text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(l.id!)}
                      disabled={deletingId === l.id}
                      className="p-2 rounded hover:bg-red-100 transition disabled:opacity-50"
                      title={t.delete}
                      aria-label={t.delete}
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
