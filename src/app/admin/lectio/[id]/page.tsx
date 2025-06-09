"use client";

import { useEffect, useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  { ssr: false }
);

interface Lectio {
  id?: number;
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
}

export default function LectioEditPage() {
  const supabase = useSupabaseClient();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { lang: appLang } = useLanguage();
  const t = translations[appLang];
  const isNew = id === "new";

  const [lectio, setLectio] = useState<Lectio | null>(
    isNew
      ? {
          datum: "",
          lang: appLang,
          hlava: "",
          suradnice_pismo: "",
          uvod: "",
          uvod_audio: "",
          video: "",
          modlitba_uvod: "",
          modlitba_audio: "",
          nazov_biblia_1: "",
          biblia_1: "",
          biblia_1_audio: "",
          nazov_biblia_2: "",
          biblia_2: "",
          biblia_2_audio: "",
          nazov_biblia_3: "",
          biblia_3: "",
          biblia_3_audio: "",
          lectio_text: "",
          lectio_audio: "",
          meditatio_text: "",
          meditatio_audio: "",
          oratio_text: "",
          oratio_audio: "",
          contemplatio_text: "",
          contemplatio_audio: "",
          actio_text: "",
          actio_audio: "",
          modlitba_zaver: "",
          audio_5_min: "",
          zaver: "",
          pozehnanie: "",
        }
      : null
  );
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    if (isNew) return;
    const fetchLectio = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("lectio")
        .select("*")
        .eq("id", id)
        .single();
      if (!error) setLectio(data);
      setLoading(false);
    };
    fetchLectio();
  }, [id, supabase, isNew]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setLectio((old) => ({ ...old!, [e.target.name]: e.target.value }));
  };

  // Pre textové polia s Editorom
  const handleEditorChange = (name: keyof Lectio, value: string) => {
    setLectio((old) => ({ ...old!, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setMessageType(null);
    if (!lectio) {
      setSaving(false);
      setMessage(t.save_error || "Chyba pri ukladaní");
      setMessageType("error");
      return;
    }
    if (isNew) {
      // INSERT NEW
      const { data, error } = await supabase
        .from("lectio")
        .insert([lectio])
        .select("id")
        .single();
      setSaving(false);
      if (!error && data?.id) {
        setMessage(t.save_success || "Úspešne uložené");
        setMessageType("success");
        router.replace(`/admin/lectio/${data.id}`);
      } else {
        setMessage(
          (error?.message ? error.message + " " : "") +
            (t.save_error || "Chyba pri ukladaní")
        );
        setMessageType("error");
      }
    } else {
      // UPDATE
      const { error } = await supabase
        .from("lectio")
        .update(lectio)
        .eq("id", id);
      setSaving(false);
      setMessage(
        error
          ? t.save_error || "Chyba pri ukladaní"
          : t.save_success || "Úspešne uložené"
      );
      setMessageType(error ? "error" : "success");
    }
  };

  if (loading) return <div>{t.loading || "Načítavam..."}</div>;
  if (!lectio) return <div>{t.item_not_found || "Položka nenájdená"}</div>;

  return (
    <main className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {isNew
          ? t.add_lectio_title || "Pridať nový Lectio záznam"
          : t.edit_lectio_title
          ? `${t.edit_lectio_title} ${lectio.hlava}`
          : `Upraviť Lectio: ${lectio.hlava}`}
      </h1>
      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {/* Základné info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label>
            {t.hlava || "Nadpis"}:
            <input
              name="hlava"
              value={lectio.hlava || ""}
              onChange={handleChange}
              className="border rounded w-full p-2"
              required
            />
          </label>
          <label>
            {t.suradnice_pismo || "Súradnice Písma"}:
            <input
              name="suradnice_pismo"
              value={lectio.suradnice_pismo || ""}
              onChange={handleChange}
              className="border rounded w-full p-2"
              required
            />
          </label>
          <label>
            {t.datum || "Dátum"}:
            <input
              name="datum"
              type="date"
              value={lectio.datum?.slice(0, 10) || ""}
              onChange={handleChange}
              className="border rounded w-full p-2"
              required
            />
          </label>
          <label>
            {t.lang || "Jazyk"}:
            <select
              name="lang"
              value={lectio.lang || appLang}
              onChange={handleChange}
              className="border rounded w-full p-2"
            >
              <option value="sk">Slovenčina</option>
              <option value="cz">Čeština</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </label>
        </div>

        {/* Audio, video, úvodné polia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label>
            {t.uvod || "Úvod"}:
            <textarea
              name="uvod"
              value={lectio.uvod || ""}
              onChange={handleChange}
              className="border rounded w-full p-2"
              rows={2}
            />
          </label>
          <label>
            {t.uvod_audio || "Úvod - audio (URL)"}:
            <input
              name="uvod_audio"
              value={lectio.uvod_audio || ""}
              onChange={handleChange}
              className="border rounded w-full p-2"
              type="url"
              placeholder="https://..."
            />
          </label>
          <label>
            {t.video || "Video (URL)"}:
            <input
              name="video"
              value={lectio.video || ""}
              onChange={handleChange}
              className="border rounded w-full p-2"
              type="url"
              placeholder="https://..."
            />
          </label>
        </div>

        {/* Dynamický editor pre hlavné časti */}
        <label>
          {t.lectio_text || "Lectio – text"}:
          <Editor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            init={{
              height: 250,
              toolbar:
                "undo redo | formatselect | bold italic | link image | alignleft aligncenter alignright | code paste",
              paste_data_images: true,
            }}
            value={lectio.lectio_text || ""}
            onEditorChange={(value) =>
              handleEditorChange("lectio_text", value)
            }
          />
        </label>

        <label>
          {t.meditatio_text || "Meditatio – text"}:
          <Editor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            init={{
              height: 200,
              plugins: "link image lists code paste",
              toolbar:
                "undo redo | formatselect | bold italic | link image | alignleft aligncenter alignright | code paste",
              paste_data_images: true,
            }}
            value={lectio.meditatio_text || ""}
            onEditorChange={(value) =>
              handleEditorChange("meditatio_text", value)
            }
          />
        </label>

        <label>
          {t.oratio_text || "Oratio – text"}:
          <Editor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            init={{
              height: 200,
              plugins: "link image lists code paste",
              toolbar:
                "undo redo | formatselect | bold italic | link image | alignleft aligncenter alignright | code paste",
              paste_data_images: true,
            }}
            value={lectio.oratio_text || ""}
            onEditorChange={(value) =>
              handleEditorChange("oratio_text", value)
            }
          />
        </label>

        <label>
          {t.contemplatio_text || "Contemplatio – text"}:
          <Editor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            init={{
              height: 200,
              plugins: "link image lists code paste",
              toolbar:
                "undo redo | formatselect | bold italic | link image | alignleft aligncenter alignright | code paste",
              paste_data_images: true,
            }}
            value={lectio.contemplatio_text || ""}
            onEditorChange={(value) =>
              handleEditorChange("contemplatio_text", value)
            }
          />
        </label>

        <label>
          {t.actio_text || "Actio – text"}:
          <Editor
            apiKey={process.env.NEXT_PUBLIC_TINYMCE_API_KEY}
            init={{
              height: 200,
              plugins: "link image lists code paste",
              toolbar:
                "undo redo | formatselect | bold italic | link image | alignleft aligncenter alignright | code paste",
              paste_data_images: true,
            }}
            value={lectio.actio_text || ""}
            onEditorChange={(value) =>
              handleEditorChange("actio_text", value)
            }
          />
        </label>

        {/* Ďalšie jednoduché polia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label>
            {t.modlitba_uvod || "Modlitba úvod"}:
            <textarea
              name="modlitba_uvod"
              value={lectio.modlitba_uvod || ""}
              onChange={handleChange}
              className="border rounded w-full p-2"
              rows={2}
            />
          </label>
          <label>
            {t.modlitba_audio || "Modlitba audio (URL)"}:
            <input
              name="modlitba_audio"
              value={lectio.modlitba_audio || ""}
              onChange={handleChange}
              className="border rounded w-full p-2"
              type="url"
              placeholder="https://..."
            />
          </label>
        </div>

        {/* Biblia bloky */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded p-3 my-2">
            <h3 className="font-semibold mb-2">
              {t[`biblia_${i}`] || `Biblia ${i}`}
            </h3>
            <label>
              {t[`nazov_biblia_${i}`] || "Názov"}:
              <input
                name={`nazov_biblia_${i}`}
                value={lectio[`nazov_biblia_${i}` as keyof Lectio] || ""}
                onChange={handleChange}
                className="border rounded w-full p-2"
              />
            </label>
            <label>
              {t[`biblia_${i}`] || "Text"}:
              <textarea
                name={`biblia_${i}`}
                value={lectio[`biblia_${i}` as keyof Lectio] || ""}
                onChange={handleChange}
                className="border rounded w-full p-2"
                rows={2}
              />
            </label>
            <label>
              {t[`biblia_${i}_audio`] || "Audio (URL)"}:
              <input
                name={`biblia_${i}_audio`}
                value={lectio[`biblia_${i}_audio` as keyof Lectio] || ""}
                onChange={handleChange}
                className="border rounded w-full p-2"
                type="url"
                placeholder="https://..."
              />
            </label>
          </div>
        ))}

        {/* Záver, požehnanie, extra audio */}
        <label>
          {t.modlitba_zaver || "Modlitba záver"}:
          <textarea
            name="modlitba_zaver"
            value={lectio.modlitba_zaver || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
            rows={2}
          />
        </label>
        <label>
          {t.audio_5_min || "Audio 5 minút (URL)"}:
          <input
            name="audio_5_min"
            value={lectio.audio_5_min || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
            type="url"
            placeholder="https://..."
          />
        </label>
        <label>
          {t.zaver || "Záver"}:
          <textarea
            name="zaver"
            value={lectio.zaver || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
            rows={2}
          />
        </label>
        <label>
          {t.pozehnanie || "Požehnanie"}:
          <textarea
            name="pozehnanie"
            value={lectio.pozehnanie || ""}
            onChange={handleChange}
            className="border rounded w-full p-2"
            rows={2}
          />
        </label>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded font-semibold"
          disabled={saving}
        >
          {saving ? t.saving || "Ukladám..." : t.save || "Uložiť"}
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
