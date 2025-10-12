"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import { useSupabase } from "@/app/components/SupabaseProvider"; // ← ZMENA: náš provider
import { translations } from "@/app/i18n";
import { ChevronDown, ChevronUp, Download, Eraser, Eye, Filter, Lightbulb, Mail, Search, TestTube, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

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

  const { supabase } = useSupabase(); // ← ZMENA: náš provider namiesto useSupabaseClient
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
  const [showFilters, setShowFilters] = useState(false);

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
    const exportData = members.map((member) => ({
      name: member.name,
      email: member.email,
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

  // Aktívne filtre
  const hasActiveFilters = 
    filter.name || filter.email || filter.message || 
    filter.dateFrom || filter.dateTo || 
    filter.want_testing || filter.want_newsletter || filter.has_idea;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hlavička */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] px-8 py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Users size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    {t.community_admin_title || "Správa členov komunity"}
                  </h1>
                  <p className="text-indigo-100 mt-1">Členovia a záujemcovia o komunitu</p>
                </div>
              </div>
              
              {/* Štatistiky */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.total}</div>
                  <div className="text-sm text-indigo-100 mt-1">Celkom členov</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.testers}</div>
                  <div className="text-sm text-indigo-100 mt-1">Testeri</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.newsletter}</div>
                  <div className="text-sm text-indigo-100 mt-1">Newsletter</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.ideas}</div>
                  <div className="text-sm text-indigo-100 mt-1">Nápady</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Export tlačidlo */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Export dát</h3>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2.5 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all font-medium shadow-sm"
              onClick={handleExportExcel}
              aria-label="Exportovať Excel"
              type="button"
            >
              <Download size={18} />
              <span>{t.export_excel || "Exportovať Excel"}</span>
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
                placeholder={t.global_search || "Hľadať vo všetkých poliach..."}
              />
            </div>
          </div>

          {/* Detailné filtre */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                {t.name || "Meno"}
              </label>
              <input
                type="text"
                value={filter.name}
                onChange={e => { setFilter(f => ({ ...f, name: e.target.value })); setPage(1); }}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder={t.name || "Meno"}
                disabled={!!globalSearch}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                {t.email || "Email"}
              </label>
              <input
                type="email"
                value={filter.email}
                onChange={e => { setFilter(f => ({ ...f, email: e.target.value })); setPage(1); }}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                placeholder={t.email || "Email"}
                disabled={!!globalSearch}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Testovanie
              </label>
              <select
                value={filter.want_testing}
                onChange={e => { setFilter(f => ({ ...f, want_testing: e.target.value })); setPage(1); }}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                disabled={!!globalSearch}
              >
                <option value="">Všetci</option>
                <option value="true">Áno</option>
                <option value="false">Nie</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Newsletter
              </label>
              <select
                value={filter.want_newsletter}
                onChange={e => { setFilter(f => ({ ...f, want_newsletter: e.target.value })); setPage(1); }}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                disabled={!!globalSearch}
              >
                <option value="">Všetci</option>
                <option value="true">Áno</option>
                <option value="false">Nie</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Nápady
              </label>
              <select
                value={filter.has_idea}
                onChange={e => { setFilter(f => ({ ...f, has_idea: e.target.value })); setPage(1); }}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                disabled={!!globalSearch}
              >
                <option value="">Všetci</option>
                <option value="true">Áno</option>
                <option value="false">Nie</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                {t.date_from || "Dátum od"}
              </label>
              <input
                type="date"
                value={filter.dateFrom}
                onChange={e => { setFilter(f => ({ ...f, dateFrom: e.target.value })); setPage(1); }}
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                disabled={!!globalSearch}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                {t.date_to || "Dátum do"}
              </label>
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
                  type="button"
                  aria-label={t.clear_filters}
                >
                  <Eraser size={16} />
                  {t.clear_filters || "Vymazať filtre"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tabuľka */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t.name || "Meno"}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t.email || "Email"}
                      </span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Záujmy
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {t.message || "Správa"}
                    </span>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Dátum registrácie
                    </span>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Trash2 size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {t.actions || "Akcie"}
                      </span>
                    </div>
                  </th>
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
                <tr key={member.id} className="border-b border-gray-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all">
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
        </div>

        {/* Stránkovanie */}
        {!loading && members.length > 0 && Math.ceil(total / PAGE_SIZE) > 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">
                Zobrazené {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} z {total} členov
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  className="px-4 py-2 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-300 hover:bg-indigo-50"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  aria-label={t.previous || "Predchádzajúca"}
                >
                  {t.previous || "Predchádzajúca"}
                </button>
                <span className="text-sm font-bold text-indigo-700">
                  {t.page || "Strana"} {page} {t.of || "z"} {Math.ceil(total / PAGE_SIZE) || 1}
                </span>
                <button
                  className="px-4 py-2 rounded-lg bg-white border-2 border-gray-200 text-gray-700 font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:border-indigo-300 hover:bg-indigo-50"
                  onClick={() => setPage(p => (p * PAGE_SIZE < total ? p + 1 : p))}
                  disabled={page * PAGE_SIZE >= total}
                  aria-label={t.next || "Ďalšia"}
                >
                  {t.next || "Ďalšia"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}