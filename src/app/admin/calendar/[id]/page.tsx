"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useParams, useRouter } from "next/navigation";

export default function CalendarEditPage() {
  const supabase = useSupabaseClient();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [day, setDay] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDay = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("calendar_info")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setDay(data);
      setLoading(false);
    };
    fetchDay();
  }, [id, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setDay({ ...day, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from("calendar_info")
      .update({
        date: day.date,
        name_day: day.name_day,
        liturgical_day: day.liturgical_day,
        saints: day.saints,
        lang: day.lang
      })
      .eq("id", id);
    setSaving(false);
    setMessage(error ? "Chyba pri ukladaní" : "Úspešne uložené");
  };

  if (loading) return <div>Načítavam...</div>;
  if (!day) return <div>Dátum nenájdený</div>;

  return (
    <main className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upraviť deň {day.date}</h1>
      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <label>
          Dátum:
          <input name="date" type="date" value={day.date} onChange={handleChange} className="border rounded w-full p-2"/>
        </label>
        <label>
          Meno:
          <input name="name_day" value={day.name_day} onChange={handleChange} className="border rounded w-full p-2"/>
        </label>
        <label>
          Liturgický deň:
          <input name="liturgical_day" value={day.liturgical_day} onChange={handleChange} className="border rounded w-full p-2"/>
        </label>
        <label>
          Svätí:
          <input name="saints" value={day.saints} onChange={handleChange} className="border rounded w-full p-2"/>
        </label>
        <label>
          Jazyk:
          <select name="lang" value={day.lang} onChange={handleChange} className="border rounded w-full p-2">
            <option value="sk">Slovenčina</option>
            <option value="cz">Čeština</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </label>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold" disabled={saving}>
          {saving ? "Ukladám..." : "Uložiť"}
        </button>
        {message && <div className="mt-2 text-green-600">{message}</div>}
      </form>
    </main>
  );
}
