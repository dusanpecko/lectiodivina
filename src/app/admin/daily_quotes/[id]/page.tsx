"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useParams, useRouter } from "next/navigation";

export default function DailyQuoteEditPage() {
  const supabase = useSupabaseClient();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("daily_quotes")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setQuote(data);
      setLoading(false);
    };
    fetchQuote();
  }, [id, supabase]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setQuote({ ...quote, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from("daily_quotes")
      .update({
        date: quote.date,
        quote: quote.quote,
        reference: quote.reference,
        lang: quote.lang
      })
      .eq("id", id);
    setSaving(false);
    setMessage(error ? "Chyba pri ukladaní" : "Úspešne uložené");
  };

  if (loading) return <div>Načítavam...</div>;
  if (!quote) return <div>Položka nenájdená</div>;

  return (
    <main className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upraviť citát {quote.date}</h1>
      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <label>
          Dátum:
          <input name="date" type="date" value={quote.date || ""} onChange={handleChange} className="border rounded w-full p-2"/>
        </label>
        <label>
          Citát:
          <textarea name="quote" value={quote.quote || ""} onChange={handleChange} className="border rounded w-full p-2" rows={3}/>
        </label>
        <label>
          Reference:
          <input name="reference" value={quote.reference || ""} onChange={handleChange} className="border rounded w-full p-2"/>
        </label>
        <label>
          Jazyk:
          <select name="lang" value={quote.lang || "sk"} onChange={handleChange} className="border rounded w-full p-2">
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
