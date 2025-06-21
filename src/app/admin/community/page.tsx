"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { Eye, Trash2, Users, Mail, TestTube, Lightbulb, Eraser, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";

// Typ podľa community_members tabuľky
interface CommunityMember {
  id: string;
  created_at: string;
  name: string;
  email: string;
  message: string | null;
  want_testing: boolean;
  want_newsletter: boolean;
  has_idea: boolean;
  updated_at: string;
}

const PAGE_SIZE = 20;

export default function CommunityAdminPage() {
  const { lang: appLang } = useLanguage();
  const t = translations[appLang];

  const supabase = useSupabaseClient();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filtrovacie možnosti
  const [filter, setFilter] = useState({
    name: "",
    email: "",
    message: "",
    dateFrom: "",
    dateTo: "",
    want_testing: "",
    want_newsletter: "",
    has_idea: "",
  });
  const [globalSearch, setGlobalSearch] = useState("");

  // Načítanie dát
  const fetchMembers = async () => {
    setLoading(true);

    let dataQuery = supabase
      .from("community_members")
      .select("*");

    let countQuery = supabase
      .from("community_members")
      .select("*", { count: "exact", head: true });

    if (globalSearch) {
      const val = `%${globalSearch}%`;
      dataQuery = dataQuery.or(
        `name.ilike.${val},email.ilike.${val},message.ilike.${val}`
      );
      countQuery = countQuery.or(
        `name.ilike.${val},email.ilike.${val},message.ilike.${val}`
      );
    } else {
      // Aplikuj individuálne filtre
      if (filter.name) {
        dataQuery = dataQuery.ilike("name", `%${filter.name}%`);
        countQuery = countQuery.ilike("name", `%${filter.name}%`);
      }
      if (filter.email) {
        dataQuery = dataQuery.ilike("email", `%${filter.email}%`);
        countQuery = countQuery.ilike("email", `%${filter.email}%`);
      }
      if (filter.message) {
        dataQuery = dataQuery.ilike("message", `%${filter.message}%`);
        countQuery = countQuery.ilike("message", `%${filter.message}%`);
      }
      if (filter.dateFrom) {
        dataQuery = dataQuery.gte("created_at", filter.dateFrom);
        countQuery = countQuery.gte("created_at", filter.dateFrom);
      }
      if (filter.dateTo) {
        dataQuery = dataQuery.lte("created_at", filter.dateTo);
        countQuery = countQuery.lte("created_at", filter.dateTo);
      }
      if (filter.want_testing !== "") {
        const value = filter.want_testing === "true";
        dataQuery = dataQuery.eq("want_testing", value);
        countQuery = countQuery.eq("want_testing", value);
      }
      if (filter.want_newsletter !== "") {
        const value = filter.want_newsletter === "true";
        dataQuery = dataQuery.eq("want_newsletter", value);
        countQuery = countQuery.eq("want_newsletter", value);
      }
      if (filter.has_idea !== "") {
        const value = filter.has_idea === "true";
        dataQuery = dataQuery.eq("has_idea", value);
        countQuery = countQuery.eq("has_idea", value);
      }
    }

    dataQuery = dataQuery.order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    const { data, error } = await dataQuery;
    const { count, error: countError } = await countQuery;

    if (!error && !countError) {
      setMembers(data as CommunityMember[]);
      setTotal(count || 0);
    } else {
      setMembers([]);
      setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, globalSearch, page, supabase]);

  // Vymazať člena
  const handleDelete = async (id: string) => {
    if (!confirm(t.confirm_delete || "Naozaj chcete vymazať tohto člena?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("community_members").delete().eq("id", id);
    if (!error) {
      if (members.length === 1 && page > 1) {
        setPage(p => p - 1);
      } else {
        fetchMembers();
      }
    }
    setDeletingId(null);
  };

  // Export do Excelu
  const handleExportExcel = () => {
    const exportData = members.map(({ id, ...member }) => ({
      ...member,
      want_testing: member.want_testing ? "Áno" : "Nie",
      want_newsletter: member.want_newsletter ? "Áno" : "Nie",
      has_idea: member.has_idea ? "Áno" : "Nie",
      created_at: new Date(member.created_at).toLocaleString(),
      updated_at: new Date(member.updated_at).toLocaleString(),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Community Members");
    XLSX.writeFile(wb, `community_members_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Vyčistiť všetky filtre
  const clearFilters = () => {
    setFilter({ 
      name: "", 
      email: "", 
      message: "", 
      dateFrom: "", 
      dateTo: "",
      want_testing: "",
      want_newsletter: "",
      has_idea: "",
    });
    setGlobalSearch("");
    setPage(1);
  };

  // Získať štatistiky
  const getStats = () => {
    return {
      total: members.length,
      testers: members.filter(m => m.want_testing).length,
      newsletter: members.filter(m => m.want_newsletter).length,
      ideas: members.filter(m => m.has_idea).length,
    };
  };

  const stats = getStats();

  return (
    <main>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Users size={28} className="text-amber-600" />
        {t.community_admin_title || "Správa členov komunity"}
      </h1>

      {/* Štatistiky */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            <span className="text-sm text-blue-600 font-medium">Celkom členov</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TestTube size={20} className="text-green-600" />
            <span className="text-sm text-green-600 font-medium">Testeri</span>
          </div>
          <div className="text-2xl font-bold text-green-700">{stats.testers}</div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Mail size={20} className="text-purple-600" />
            <span className="text-sm text-purple-600 font-medium">Newsletter</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">{stats.newsletter}</div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Lightbulb size={20} className="text-orange-600" />
            <span className="text-sm text-orange-600 font-medium">Nápady</span>
          </div>
          <div className="text-2xl font-bold text-orange-700">{stats.ideas}</div>
        </div>
      </div>

      {/* Akcie */}
      <div className="flex items-center gap-4 mb-4">
        <button
          className="inline-flex items-center gap-2 bg-green-600 text-white px-3 py-2 h-11 rounded hover:bg-green-700 transition"
          onClick={handleExportExcel}
          aria-label="Exportovať Excel"
          type="button"
        >
          <Download size={20} />
          {t.export_excel || "Exportovať Excel"}
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
          <label className="block text-xs">{t.name || "Meno"}</label>
          <input
            type="text"
            value={filter.name}
            onChange={e => { setFilter(f => ({ ...f, name: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder={t.name || "Meno"}
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">{t.email || "Email"}</label>
          <input
            type="email"
            value={filter.email}
            onChange={e => { setFilter(f => ({ ...f, email: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder={t.email || "Email"}
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">Testovanie</label>
          <select
            value={filter.want_testing}
            onChange={e => { setFilter(f => ({ ...f, want_testing: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            disabled={!!globalSearch}
          >
            <option value="">Všetci</option>
            <option value="true">Áno</option>
            <option value="false">Nie</option>
          </select>
        </div>
        <div>
          <label className="block text-xs">Newsletter</label>
          <select
            value={filter.want_newsletter}
            onChange={e => { setFilter(f => ({ ...f, want_newsletter: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            disabled={!!globalSearch}
          >
            <option value="">Všetci</option>
            <option value="true">Áno</option>
            <option value="false">Nie</option>
          </select>
        </div>
        <div>
          <label className="block text-xs">Nápady</label>
          <select
            value={filter.has_idea}
            onChange={e => { setFilter(f => ({ ...f, has_idea: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            disabled={!!globalSearch}
          >
            <option value="">Všetci</option>
            <option value="true">Áno</option>
            <option value="false">Nie</option>
          </select>
        </div>
        <div>
          <label className="block text-xs">{t.date_from || "Dátum od"}</label>
          <input
            type="date"
            value={filter.dateFrom}
            onChange={e => { setFilter(f => ({ ...f, dateFrom: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
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

      {/* Tabuľka */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="w-full bg-white">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">{t.name || "Meno"}</th>
              <th className="p-3">{t.email || "Email"}</th>
              <th className="p-3">Záujmy</th>
              <th className="p-3">{t.message || "Správa"}</th>
              <th className="p-3">Dátum registrácie</th>
              <th className="p-3 text-center">{t.actions || "Akcie"}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  {t.loading || "Načítavam..."}
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  {t.no_records || "Žiadne záznamy"}
                </td>
              </tr>
            ) : (
              members.map(member => (
                <tr key={member.id} className="border-b hover:bg-blue-50 transition">
                  <td className="p-3 font-medium">{member.name}</td>
                  <td className="p-3">
                    <a 
                      href={`mailto:${member.email}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {member.email}
                    </a>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1 flex-wrap">
                      {member.want_testing && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <TestTube size={12} /> Testovanie
                        </span>
                      )}
                      {member.want_newsletter && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Mail size={12} /> Newsletter
                        </span>
                      )}
                      {member.has_idea && (
                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Lightbulb size={12} /> Nápad
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 max-w-xs">
                    <div className="truncate">
                      {member.message || <span className="text-gray-400 italic">Žiadna správa</span>}
                    </div>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex gap-2 items-center justify-center">
                    <Link href={`/admin/community/${member.id}`}>
                      <button
                        className="p-2 rounded hover:bg-blue-100 transition"
                        title="Zobraziť detail"
                        aria-label="Zobraziť detail"
                      >
                        <Eye size={18} className="text-blue-600" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(member.id)}
                      disabled={deletingId === member.id}
                      className="p-2 rounded hover:bg-red-100 transition disabled:opacity-50"
                      title={t.delete || "Vymazať"}
                      aria-label={t.delete || "Vymazať"}
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
          aria-label={t.previous || "Predchádzajúca"}
        >
          {t.previous || "Predchádzajúca"}
        </button>
        <span>
          {t.page || "Strana"} <b>{page}</b> {t.of || "z"} <b>{Math.ceil(total / PAGE_SIZE) || 1}</b>
        </span>
        <button
          className="px-3 py-1 rounded border bg-gray-100 hover:bg-gray-200 disabled:opacity-40"
          onClick={() => setPage(p => (p * PAGE_SIZE < total ? p + 1 : p))}
          disabled={page * PAGE_SIZE >= total}
          aria-label={t.next || "Ďalšia"}
        >
          {t.next || "Ďalšia"}
        </button>
      </div>
    </main>
  );
}