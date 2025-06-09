"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  { ssr: false }
);

interface ContentCard {
  id?: number;
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
}

export default function ContentCardEditPage() {
  const supabase = useSupabaseClient();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const isNew = id === "new";

  const [card, setCard] = useState<ContentCard>(
    isNew
      ? { priority: 0 }
      : {}
  );
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    if (isNew) return;
    const fetchCard = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("content_cards")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setCard(data);
      setLoading(false);
    };
    fetchCard();
  }, [id, supabase, isNew]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setCard((old) => ({ ...old!, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setMessageType(null);
    if (!card) {
      setSaving(false);
      setMessage("Chyba pri ukladaní");
      setMessageType("error");
      return;
    }
    if (isNew) {
      const { data, error } = await supabase
        .from("content_cards")
        .insert([card])
        .select("id")
        .single();
      setSaving(false);
      if (!error && data?.id) {
        setMessage("Úspešne uložené");
        setMessageType("success");
        router.replace(`/admin/content_cards/${data.id}`);
      } else {
        setMessage((error?.message ? error.message + " " : "") + "Chyba pri ukladaní");
        setMessageType("error");
      }
    } else {
      const { error } = await supabase
        .from("content_cards")
        .update(card)
        .eq("id", id);
      setSaving(false);
      setMessage(error ? "Chyba pri ukladaní" : "Úspešne uložené");
      setMessageType(error ? "error" : "success");
    }
  };

  if (loading) return <div>Načítavam...</div>;
  if (!card) return <div>Položka nenájdená</div>;

  return (
    <main className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {isNew ? "Pridať kartu" : `Upraviť kartu ${card.title}`}
      </h1>
      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <label>
          Nadpis:
          <input
            name="title"
            value={card.title || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
            required
          />
        </label>
        <label>
          Obrázok URL 1:
          <input
            name="image_url"
            value={card.image_url || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
            type="url"
            placeholder="https://..."
          />
        </label>
        <label>
          Obrázok URL 2:
          <input
            name="image_url_2"
            value={card.image_url_2 || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
            type="url"
            placeholder="https://..."
          />
        </label>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <label key={i}>
            Popis {i}:
            <Editor
              apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
              init={{
                height: 200,
                toolbar: "undo redo | bold italic | code paste",
                menubar: false,
              }}
              value={card[`description_${i}` as keyof ContentCard] !== undefined ? String(card[`description_${i}` as keyof ContentCard]) : ""}
              onEditorChange={(value) =>
                setCard((old) => ({
                  ...old!,
                  [`description_${i}`]: value,
                }))
              }
            />
          </label>
        ))}
        <label>
          Viditeľné od:
          <input
            name="visible_from"
            type="date"
            value={card.visible_from?.slice(0, 10) || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />
        </label>
        <label>
          Viditeľné do:
          <input
            name="visible_to"
            type="date"
            value={card.visible_to?.slice(0, 10) || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />
        </label>
        <label>
          Publikované:
          <input
            name="published_at"
            type="date"
            value={card.published_at?.slice(0, 10) || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />
        </label>
        <label>
          Priorita:
          <input
            name="priority"
            type="number"
            value={card.priority ?? 0}
            onChange={handleChange}
            className="border rounded w-full p-2"
          />
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
