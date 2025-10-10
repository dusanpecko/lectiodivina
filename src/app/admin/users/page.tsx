"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import Link from "next/link";
import { Pencil, Trash2, PlusCircle, Eraser, Download, Upload, Search, Filter, User, Mail, Shield, Calendar, Users, Crown, UserCheck, Clock } from "lucide-react";
import * as XLSX from "xlsx";

interface User {
  id?: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  provider?: string;
  created_at?: string;
  role?: string;
}

const PAGE_SIZE = 20;

export default function UsersAdminPage() {
  const { supabase } = useSupabase();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [filter, setFilter] = useState({
    email: "",
    full_name: "",
    role: "",
    provider: "",
    dateFrom: "",
    dateTo: "",
  });
  const [globalSearch, setGlobalSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // FETCH
  const fetchUsers = async () => {
    setLoading(true);

    let dataQuery = supabase.from("users").select("*");
    let countQuery = supabase.from("users").select("*", { count: "exact", head: true });

    if (globalSearch) {
      const val = `%${globalSearch}%`;
      dataQuery = dataQuery.or(
        `email.ilike.${val},full_name.ilike.${val},role.ilike.${val},provider.ilike.${val}`
      );
      countQuery = countQuery.or(
        `email.ilike.${val},full_name.ilike.${val},role.ilike.${val},provider.ilike.${val}`
      );
    } else {
      if (filter.email)
        dataQuery = dataQuery.ilike("email", `%${filter.email}%`);
      if (filter.full_name)
        dataQuery = dataQuery.ilike("full_name", `%${filter.full_name}%`);
      if (filter.role)
        dataQuery = dataQuery.eq("role", filter.role);
      if (filter.provider)
        dataQuery = dataQuery.eq("provider", filter.provider);
      if (filter.dateFrom) {
        dataQuery = dataQuery.gte("created_at", filter.dateFrom);
        countQuery = countQuery.gte("created_at", filter.dateFrom);
      }
      if (filter.dateTo) {
        dataQuery = dataQuery.lte("created_at", filter.dateTo);
        countQuery = countQuery.lte("created_at", filter.dateTo);
      }
    }

    dataQuery = dataQuery.order("created_at", { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

    const { data, error } = await dataQuery;
    const { count, error: countError } = await countQuery;

    if (!error && !countError) {
      setUsers(data as User[]);
      setTotal(count || 0);
    } else {
      setUsers([]);
      setTotal(0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [filter, globalSearch, page, supabase]);

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("Naozaj vymazať používateľa? Táto akcia sa nedá vrátiť späť.")) return;
    setDeletingId(id);
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (!error) {
      if (users.length === 1 && page > 1) setPage(p => p - 1);
      else fetchUsers();
    }
    setDeletingId(null);
  };

  // FILTERS
  const clearFilters = () => {
    setFilter({ email: "", full_name: "", role: "", provider: "", dateFrom: "", dateTo: "" });
    setGlobalSearch("");
    setPage(1);
  };

  // EXPORT
  const handleExportExcel = () => {
    const exportData = users.map(({ id, ...item }) => item);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "users");
    XLSX.writeFile(wb, "users_export.xlsx");
  };

  // IMPORT
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

      const newItems = json.map(row => ({
        email: row["email"] || "",
        full_name: row["full_name"] || "",
        avatar_url: row["avatar_url"] || "",
        provider: row["provider"] || "",
        created_at: row["created_at"] || "",
        role: row["role"] || "",
      })).filter(item => item.email);

      if (newItems.length === 0) {
        alert("Nenašli sa žiadne validné záznamy na import.");
        setImportLoading(false);
        return;
      }

      const { error } = await supabase.from("users").insert(newItems);

      setImportLoading(false);
      if (error) {
        alert("Chyba pri importe: " + error.message);
      } else {
        alert("Importované!");
        fetchUsers();
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('sk-SK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-700 border-red-200', icon: '👑', label: 'Admin' },
      moderator: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: '🛡️', label: 'Moderátor' },
      editor: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '✏️', label: 'Editor' },
      user: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '👤', label: 'Používateľ' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const getProviderBadge = (provider: string) => {
    const providerConfig = {
      google: { color: 'bg-red-50 text-red-700', icon: '🔴', label: 'Google' },
      facebook: { color: 'bg-blue-50 text-blue-700', icon: '🔵', label: 'Facebook' },
      github: { color: 'bg-gray-50 text-gray-700', icon: '⚫', label: 'GitHub' },
      email: { color: 'bg-green-50 text-green-700', icon: '✉️', label: 'Email' },
    };

    const config = providerConfig[provider as keyof typeof providerConfig] || { color: 'bg-gray-50 text-gray-700', icon: '❓', label: provider || 'Neznámy' };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const activeFiltersCount = Object.values(filter).filter(v => v !== "").length + (globalSearch ? 1 : 0);

  const usersByRole = users.reduce((acc, user) => {
    const role = user.role || 'user';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const usersByProvider = users.reduce((acc, user) => {
    const provider = user.provider || 'unknown';
    acc[provider] = (acc[provider] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Stats */}
        <header className="mb-8">
          <div className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] rounded-2xl shadow-xl p-8 text-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Users size={28} />
                  <h1 className="text-3xl font-bold">Správa používateľov</h1>
                </div>
                <p className="text-white/90">Správa používateľských účtov a oprávnení</p>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={20} className="text-white/80" />
                  <span className="text-sm font-medium text-white/80">Celkom</span>
                </div>
                <div className="text-2xl font-bold">{total}</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Crown size={20} className="text-white/80" />
                  <span className="text-sm font-medium text-white/80">Admini</span>
                </div>
                <div className="text-2xl font-bold">{usersByRole.admin || 0}</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={20} className="text-white/80" />
                  <span className="text-sm font-medium text-white/80">Moderátori</span>
                </div>
                <div className="text-2xl font-bold">{usersByRole.moderator || 0}</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Pencil size={20} className="text-white/80" />
                  <span className="text-sm font-medium text-white/80">Editori</span>
                </div>
                <div className="text-2xl font-bold">{usersByRole.editor || 0}</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UserCheck size={20} className="text-white/80" />
                  <span className="text-sm font-medium text-white/80">Používatelia</span>
                </div>
                <div className="text-2xl font-bold">{usersByRole.user || 0}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Control Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Import Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Upload size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Import dát</h3>
            </div>
            <label className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg hover:shadow-lg hover:scale-105 transition-all cursor-pointer w-full">
              <Upload size={16} />
              <span className="font-medium text-sm">
                {importLoading ? "Importujem..." : "Import Excel"}
              </span>
              <input
                type="file"
                accept=".xlsx"
                onChange={handleExcelImport}
                className="hidden"
                disabled={importLoading}
              />
            </label>
          </div>

          {/* Export Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Download size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Export dát</h3>
            </div>
            <button
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2.5 rounded-lg hover:shadow-lg hover:scale-105 transition-all w-full"
              onClick={handleExportExcel}
              type="button"
            >
              <Download size={16} />
              <span className="font-medium text-sm">Export Excel</span>
            </button>
          </div>

          {/* Add User Panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <PlusCircle size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-900">Nový používateľ</h3>
            </div>
            <Link href="/admin/users/new">
              <button
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#40467b] to-[#5a5f8f] text-white px-4 py-2.5 rounded-lg hover:shadow-lg hover:scale-105 transition-all w-full"
                type="button"
              >
                <PlusCircle size={16} />
                <span className="font-medium text-sm">Pridať používateľa</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Search size={20} className="text-gray-600" />
            <h3 className="font-semibold text-gray-900">Vyhľadávanie a filtre</h3>
          </div>

          {/* Global Search */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={globalSearch}
                onChange={e => { setGlobalSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border-2 border-gray-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Hľadať používateľov..."
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                showFilters || activeFiltersCount > 0
                  ? "bg-indigo-50 text-indigo-700"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
              type="button"
            >
              <Filter size={18} />
              Filtre {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Email
                  </label>
                  <input
                    type="text"
                    value={filter.email}
                    onChange={e => { setFilter(f => ({ ...f, email: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Hľadať v emailoch..."
                    disabled={!!globalSearch}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Meno
                  </label>
                  <input
                    type="text"
                    value={filter.full_name}
                    onChange={e => { setFilter(f => ({ ...f, full_name: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Hľadať v menách..."
                    disabled={!!globalSearch}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Rola
                  </label>
                  <select
                    value={filter.role}
                    onChange={e => { setFilter(f => ({ ...f, role: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                    disabled={!!globalSearch}
                  >
                    <option value="">Všetky roly</option>
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderátor</option>
                    <option value="editor">Editor</option>
                    <option value="user">Používateľ</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Provider
                  </label>
                  <select
                    value={filter.provider}
                    onChange={e => { setFilter(f => ({ ...f, provider: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900"
                    disabled={!!globalSearch}
                  >
                    <option value="">Všetky providery</option>
                    <option value="google">Google</option>
                    <option value="facebook">Facebook</option>
                    <option value="github">GitHub</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Od dátumu
                  </label>
                  <input
                    type="date"
                    value={filter.dateFrom}
                    onChange={e => { setFilter(f => ({ ...f, dateFrom: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    disabled={!!globalSearch}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Do dátumu
                  </label>
                  <input
                    type="date"
                    value={filter.dateTo}
                    onChange={e => { setFilter(f => ({ ...f, dateTo: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    disabled={!!globalSearch}
                  />
                </div>
              </div>
              
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all"
                type="button"
              >
                <Eraser size={16} />
                Vymazať filtre
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Používateľ</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Provider</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Crown size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Rola</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-600" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Vytvorené</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Akcie</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        <span className="text-gray-500 font-medium">Načítavam používateľov...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <Users size={48} className="text-gray-300" />
                        <div className="text-xl font-semibold text-gray-600">Žiadni používatelia</div>
                        <p className="text-gray-500">Skúste zmeniť filtre alebo pridajte nového používateľa.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {u.avatar_url ? (
                            <img 
                              src={u.avatar_url} 
                              alt="" 
                              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User size={20} className="text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">
                              {u.full_name || "Bez mena"}
                            </div>
                            <div className="text-xs text-gray-500 flex items-center">
                              <span className="mr-1">🆔</span>
                              {u.id?.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-900">
                          <Mail size={16} className="mr-2 text-gray-600" />
                          {u.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getProviderBadge(u.provider || '')}
                      </td>
                      <td className="px-6 py-4">
                        {getRoleBadge(u.role || 'user')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar size={16} className="mr-2 text-gray-600" />
                          {formatDate(u.created_at || '')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 items-center justify-center">
                          <Link href={`/admin/users/${u.id}`}>
                            <button
                              className="p-2 rounded-lg bg-gradient-to-r from-[#40467b] to-[#5a5f8f] text-white hover:shadow-lg hover:scale-105 transition-all"
                              title="Upraviť používateľa"
                            >
                              <Pencil size={16} />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(u.id!)}
                            disabled={deletingId === u.id}
                            className="p-2 rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                            title="Vymazať používateľa"
                          >
                            {deletingId === u.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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

          {/* Pagination */}
          {!loading && users.length > 0 && Math.ceil(total / PAGE_SIZE) > 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Zobrazené <span className="font-medium">{(page - 1) * PAGE_SIZE + 1}</span> až{" "}
                  <span className="font-medium">{Math.min(page * PAGE_SIZE, total)}</span> z{" "}
                  <span className="font-medium">{total}</span> používateľov
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:shadow-md hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ← Predošlá
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, Math.ceil(total / PAGE_SIZE)) }, (_, i) => {
                      const pageNum = Math.max(1, page - 2) + i;
                      if (pageNum > Math.ceil(total / PAGE_SIZE)) return null;
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            pageNum === page
                              ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md"
                              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:shadow-md hover:scale-105 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => setPage(p => (p * PAGE_SIZE < total ? p + 1 : p))}
                    disabled={page * PAGE_SIZE >= total}
                  >
                    Ďalšia →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>



        {/* Role Distribution Chart */}
        {!loading && users.length > 0 && Object.keys(usersByRole).length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Rozdelenie podľa rolí
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(usersByRole).map(([role, count]) => {
                const percentage = ((count / total) * 100).toFixed(1);
                const roleConfig = {
                  admin: { color: 'bg-red-500', icon: '👑', label: 'Administrátori' },
                  moderator: { color: 'bg-orange-500', icon: '🛡️', label: 'Moderátori' },
                  editor: { color: 'bg-blue-500', icon: '✏️', label: 'Editori' },
                  user: { color: 'bg-gray-500', icon: '👤', label: 'Používatelia' },
                };
                const config = roleConfig[role as keyof typeof roleConfig] || { color: 'bg-gray-500', icon: '❓', label: role };
                
                return (
                  <div key={role} className="text-center">
                    <div className="text-2xl mb-1">{config.icon}</div>
                    <div className="text-lg font-bold text-gray-900">{count}</div>
                    <div className="text-xs text-gray-600">{config.label}</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`${config.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Provider Distribution Chart */}
        {!loading && users.length > 0 && Object.keys(usersByProvider).length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">🔐</span>
              Rozdelenie podľa providerov
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(usersByProvider).map(([provider, count]) => {
                const percentage = ((count / total) * 100).toFixed(1);
                const providerConfig = {
                  google: { color: 'bg-red-500', icon: '🔴', label: 'Google' },
                  facebook: { color: 'bg-blue-500', icon: '🔵', label: 'Facebook' },
                  github: { color: 'bg-gray-800', icon: '⚫', label: 'GitHub' },
                  email: { color: 'bg-green-500', icon: '✉️', label: 'Email' },
                };
                const config = providerConfig[provider as keyof typeof providerConfig] || { color: 'bg-gray-500', icon: '❓', label: provider };
                
                return (
                  <div key={provider} className="text-center">
                    <div className="text-2xl mb-1">{config.icon}</div>
                    <div className="text-lg font-bold text-gray-900">{count}</div>
                    <div className="text-xs text-gray-600">{config.label}</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className={`${config.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}