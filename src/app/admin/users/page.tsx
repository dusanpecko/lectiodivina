"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
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
  const supabase = useSupabaseClient();
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
                <span className="mr-3">👥</span>
                Správa používateľov
              </h1>
              <p className="text-gray-600 flex items-center">
                <span className="mr-2">📊</span>
                Celkom {total} registrovaných používateľov
              </p>
            </div>
            <div className="text-5xl">🧑‍💼</div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Action Buttons */}
            <div className="flex items-center space-x-3 ml-auto">
              <label className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer shadow-md">
                <Upload size={18} />
                <span className="font-medium">
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
              
              <button
                className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition shadow-md"
                onClick={handleExportExcel}
                type="button"
              >
                <Download size={18} />
                <span className="font-medium">Export Excel</span>
              </button>
              
              <Link href="/admin/users/new">
                <button
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition shadow-md font-medium"
                  type="button"
                >
                  <PlusCircle size={18} />
                  Pridať používateľa
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Global Search */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={globalSearch}
                onChange={e => { setGlobalSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Hľadať používateľov..."
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition ${
                showFilters || activeFiltersCount > 0
                  ? "bg-purple-100 text-purple-700 border border-purple-300"
                  : "bg-gray-100 text-gray-700 border border-gray-300"
              }`}
              type="button"
            >
              <Filter size={18} />
              Filtre {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    ✉️ Email
                  </label>
                  <input
                    type="text"
                    value={filter.email}
                    onChange={e => { setFilter(f => ({ ...f, email: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Hľadať v emailoch..."
                    disabled={!!globalSearch}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    👤 Meno
                  </label>
                  <input
                    type="text"
                    value={filter.full_name}
                    onChange={e => { setFilter(f => ({ ...f, full_name: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Hľadať v menách..."
                    disabled={!!globalSearch}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    🏷️ Rola
                  </label>
                  <select
                    value={filter.role}
                    onChange={e => { setFilter(f => ({ ...f, role: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={!!globalSearch}
                  >
                    <option value="">Všetky roly</option>
                    <option value="admin">👑 Admin</option>
                    <option value="moderator">🛡️ Moderátor</option>
                    <option value="editor">✏️ Editor</option>
                    <option value="user">👤 Používateľ</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    🔐 Provider
                  </label>
                  <select
                    value={filter.provider}
                    onChange={e => { setFilter(f => ({ ...f, provider: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={!!globalSearch}
                  >
                    <option value="">Všetky providery</option>
                    <option value="google">🔴 Google</option>
                    <option value="facebook">🔵 Facebook</option>
                    <option value="github">⚫ GitHub</option>
                    <option value="email">✉️ Email</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    📅 Od dátumu
                  </label>
                  <input
                    type="date"
                    value={filter.dateFrom}
                    onChange={e => { setFilter(f => ({ ...f, dateFrom: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={!!globalSearch}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    📅 Do dátumu
                  </label>
                  <input
                    type="date"
                    value={filter.dateTo}
                    onChange={e => { setFilter(f => ({ ...f, dateTo: e.target.value })); setPage(1); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    disabled={!!globalSearch}
                  />
                </div>
              </div>
              
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
                type="button"
              >
                <Eraser size={16} />
                Vymazać filtre
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold">
                    <div className="flex items-center">
                      <span className="mr-2">👤</span>
                      Používateľ
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    <div className="flex items-center">
                      <span className="mr-2">✉️</span>
                      Email
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    <div className="flex items-center">
                      <span className="mr-2">🔐</span>
                      Provider
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    <div className="flex items-center">
                      <span className="mr-2">🏷️</span>
                      Rola
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      Vytvorené
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    <div className="flex items-center justify-center">
                      <span className="mr-2">⚙️</span>
                      Akcie
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        <span className="text-gray-500 font-medium">Načítavam používateľov...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="text-6xl">👥</div>
                        <div className="text-xl font-semibold text-gray-600">Žiadni používatelia</div>
                        <p className="text-gray-500">Skúste zmeniť filtre alebo pridajte nového používateľa.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id} className="border-b hover:bg-purple-50 transition-colors">
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
                        <div className="flex items-center text-gray-700">
                          <Mail size={16} className="mr-2 text-gray-400" />
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
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar size={16} className="mr-2 text-gray-400" />
                          {formatDate(u.created_at || '')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 items-center justify-center">
                          <Link href={`/admin/users/${u.id}`}>
                            <button
                              className="p-2 rounded-lg hover:bg-purple-100 transition group"
                              title="Upraviť používateľa"
                            >
                              <Pencil size={18} className="text-purple-600 group-hover:text-purple-700" />
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(u.id!)}
                            disabled={deletingId === u.id}
                            className="p-2 rounded-lg hover:bg-red-100 transition group disabled:opacity-50"
                            title="Vymazať používateľa"
                          >
                            {deletingId === u.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <Trash2 size={18} className="text-red-500 group-hover:text-red-600" />
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
          {!loading && users.length > 0 && (
            <div className="border-t bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Zobrazené <span className="font-medium">{(page - 1) * PAGE_SIZE + 1}</span> až{" "}
                  <span className="font-medium">{Math.min(page * PAGE_SIZE, total)}</span> z{" "}
                  <span className="font-medium">{total}</span> používateľov
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            pageNum === page
                              ? "bg-purple-600 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    className="inline-flex items-center px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
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

        {/* Stats Cards */}
        {!loading && users.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Celkom používateľov</p>
                  <p className="text-3xl font-bold text-gray-900">{total}</p>
                </div>
                <div className="text-3xl">👥</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Administrátori</p>
                  <p className="text-3xl font-bold text-red-600">{usersByRole.admin || 0}</p>
                </div>
                <div className="text-3xl">👑</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Google účty</p>
                  <p className="text-3xl font-bold text-blue-600">{usersByProvider.google || 0}</p>
                </div>
                <div className="text-3xl">🔴</div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Email registrácie</p>
                  <p className="text-3xl font-bold text-green-600">{usersByProvider.email || 0}</p>
                </div>
                <div className="text-3xl">✉️</div>
              </div>
            </div>
          </div>
        )}

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