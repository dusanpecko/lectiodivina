"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useParams, useRouter } from "next/navigation";

interface User {
  id?: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  provider?: string;
  created_at?: string;
  role?: string;
}

export default function UserEditPage() {
  const supabase = useSupabaseClient();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [user, setUser] = useState<User>(
    isNew
      ? { role: "user" }
      : {}
  );
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    if (isNew) return;
    const fetchUser = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) setUser(data);
      setLoading(false);
    };
    fetchUser();
  }, [id, supabase, isNew]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setUser((old) => ({ ...old!, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setMessageType(null);

    if (!user || !user.email) {
      setSaving(false);
      setMessage("Email je povinný");
      setMessageType("error");
      return;
    }

    if (isNew) {
      const { data, error } = await supabase
        .from("users")
        .insert([user])
        .select("id")
        .single();
      setSaving(false);
      if (!error && data?.id) {
        setMessage("Úspešne uložené");
        setMessageType("success");
        router.replace(`/admin/users/${data.id}`);
      } else {
        setMessage((error?.message ? error.message + " " : "") + "Chyba pri ukladaní");
        setMessageType("error");
      }
    } else {
      const { error } = await supabase
        .from("users")
        .update(user)
        .eq("id", id);
      setSaving(false);
      setMessage(error ? "Chyba pri ukladaní" : "Úspešne uložené");
      setMessageType(error ? "error" : "success");
    }
  };

  if (loading) return <div>Načítavam...</div>;
  if (!user) return <div>Používateľ nenájdený</div>;

  return (
    <main className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {isNew ? "Pridať používateľa" : `Upraviť používateľa ${user.email}`}
      </h1>
      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <label>
          Email:
          <input
            name="email"
            value={user.email || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
            required
            type="email"
          />
        </label>
        <label>
          Meno:
          <input
            name="full_name"
            value={user.full_name || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
            type="text"
          />
        </label>
        <label>
          Avatar URL:
          <input
            name="avatar_url"
            value={user.avatar_url || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
            type="url"
            placeholder="https://..."
          />
        </label>
        <label>
          Provider:
          <input
            name="provider"
            value={user.provider || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
            type="text"
            placeholder="google/facebook/email"
          />
        </label>
        <label>
          Rola:
          <select
            name="role"
            value={user.role || "user"}
            onChange={handleChange}
            className="border rounded w-full p-2"
          >
            <option value="user">Používateľ</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
          </select>
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
          disabled={saving}
        >
          {saving ? "Ukladám..." : "Uložiť"}
        </button>
        {message && (
          <div
            className={`mt-2 ${
              messageType === "error" ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </main>
  );
}
