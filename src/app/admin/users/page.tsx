"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { Pencil, Trash2, PlusCircle, Eraser } from "lucide-react";
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
  });
  const [globalSearch, setGlobalSearch] = useState("");
  const [importLoading, setImportLoading] = useState(false);

  // FETCH
  const fetchUsers = async () => {
    setLoading(true);

    let dataQuery = supabase.from("users").select("*");
    let countQuery = supabase.from("users").select("*", { count: "exact", head: true });

    if (globalSearch) {
      const val = `%${globalSearch}%`;
      dataQuery = dataQuery.or(
        `email.ilike.${val},full_name.ilike.${val},role.ilike.${val}`
      );
      countQuery = countQuery.or(
        `email.ilike.${val},full_name.ilike.${val},role.ilike.${val}`
      );
    } else {
      if (filter.email)
        dataQuery = dataQuery.ilike("email", `%${filter.email}%`);
      if (filter.full_name)
        dataQuery = dataQuery.ilike("full_name", `%${filter.full_name}%`);
      if (filter.role)
        dataQuery = dataQuery.eq("role", filter.role);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, globalSearch, page, supabase]);

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("Naozaj vymazať používateľa?")) return;
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
    setFilter({ email: "", full_name: "", role: "" });
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

      // povinné pole email
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

  return (
    <main>
      <h1 className="text-2xl font-bold mb-6">Správa používateľov</h1>
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
        <Link href="/admin/users/new">
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 h-11 rounded hover:bg-blue-700 transition ml-auto"
            aria-label="Pridať používateľa"
            type="button"
          >
            <PlusCircle size={20} /> Pridať používateľa
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
          <label className="block text-xs">Email</label>
          <input
            type="text"
            value={filter.email}
            onChange={e => { setFilter(f => ({ ...f, email: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder="Email"
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">Meno</label>
          <input
            type="text"
            value={filter.full_name}
            onChange={e => { setFilter(f => ({ ...f, full_name: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder="Meno"
            disabled={!!globalSearch}
          />
        </div>
        <div>
          <label className="block text-xs">Rola</label>
          <input
            type="text"
            value={filter.role}
            onChange={e => { setFilter(f => ({ ...f, role: e.target.value })); setPage(1); }}
            className="border rounded px-2 py-1 h-10"
            placeholder="Rola"
            disabled={!!globalSearch}
          />
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
              <th className="p-3">Email</th>
              <th className="p-3">Meno</th>
              <th className="p-3">Provider</th>
              <th className="p-3">Rola</th>
              <th className="p-3">Vytvorené</th>
              <th className="p-3">Akcie</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Načítavam...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-400">
                  Žiadni používatelia
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="border-b hover:bg-blue-50 transition">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.full_name}</td>
                  <td className="p-3">{u.provider}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u.created_at?.slice(0, 19).replace("T", " ")}</td>
                  <td className="p-3 flex gap-2 items-center justify-center">
                    <Link href={`/admin/users/${u.id}`}>
                      <button
                        className="p-2 rounded hover:bg-blue-100 transition"
                        title="Edit"
                        aria-label="Edit"
                      >
                        <Pencil size={18} className="text-blue-600" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(u.id!)}
                      disabled={deletingId === u.id}
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
