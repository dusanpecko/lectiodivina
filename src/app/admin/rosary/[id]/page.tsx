"use client";

import { FormSection } from "@/app/admin/components";
import AudioGenerateButton from "@/app/components/AudioGenerateButton";
import BulkTranslateSection from "@/app/components/BulkTranslateSection";
import { useLanguage } from "@/app/components/LanguageProvider";
import { useSupabase } from "@/app/components/SupabaseProvider";
import TranslateButton from "@/app/components/TranslateButton";
import VoiceSelector from "@/app/components/VoiceSelector";
import { useFileUpload } from "@/app/hooks/useFileUpload";
import {
  BookOpen,
  Calendar,
  Crown,
  Eye,
  FileText,
  Globe,
  Headphones,
  Heart,
  Image as ImageIcon,
  Sparkles,
  Star, Sun,
  Volume2
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import DraftIndicator from "./components/DraftIndicator";
import MessageDisplay from "./components/MessageDisplay";
import RosaryHeader from "./components/RosaryHeader";
import SaveButtonsSection from "./components/SaveButtonsSection";
import { rosaryAdminTranslations } from "./translations";

// Interfaces pre Bible import
interface Locale {
  id: number;
  code: string;
  name: string;
  native_name: string;
  is_active: boolean;
}

interface Translation {
  id: number;
  code: string;
  name: string;
  locale_id: number;
  year_published?: number;
  publisher?: string;
  is_active?: boolean;
}

interface Book {
  id: number;
  code: string;
  name: string;
  full_name: string;
  order_number: number;
  locale_id: number;
  testament?: string;
  is_active?: boolean;
}

interface BibleVerse {
  id: number;
  chapter: number;
  verse: number;
  text: string;
  book: Book;
  translation: Translation;
}

interface LectioDivinaRuzenec {
  id?: string;
  created_at?: string;
  updated_at?: string;
  lang: string;
  biblicky_text: string;
  kategoria: string;
  ruzenec: string;
  uvod: string;
  uvod_audio?: string;
  ilustracny_obrazok?: string;
  uvodne_modlitby?: string;
  uvodne_modlitby_audio?: string;
  lectio_text: string;
  lectio_audio?: string;
  komentar?: string;
  komentar_audio?: string;
  meditatio_text: string;
  meditatio_audio?: string;
  oratio_html: string;
  oratio_audio?: string;
  contemplatio_text: string;
  contemplatio_audio?: string;
  actio_text: string;
  actio_audio?: string;
  audio_nahravka?: string;
  autor?: string;
  publikovane: boolean;
  poradie: number;
}

interface Kategoria {
  id: string;
  nazov: string;
  popis: string;
  farba: string;
}

const LANGUAGE_OPTIONS = [
  { value: "sk" as const, label: "Slovenčina", flag: "🇸🇰" },
  { value: "cz" as const, label: "Čeština", flag: "🇨🇿" },
  { value: "en" as const, label: "English", flag: "🇺🇸" },
  { value: "es" as const, label: "Español", flag: "🇪🇸" },
];

// Bible Import Modal Component
function BibleImportModal({ 
  isOpen, 
  onClose, 
  onImport, 
  currentLocaleId 
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (verses: string, reference: string, translationName: string) => void;
  currentLocaleId: number | null;
}) {
  const { supabase } = useSupabase();
  const [translationsList, setTranslationsList] = useState<Translation[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<number[]>([]);
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  
  const [selectedTranslation, setSelectedTranslation] = useState<string>("");
  const [selectedBook, setSelectedBook] = useState<string>("");
  const [selectedChapter, setSelectedChapter] = useState<string>("");
  const [selectedVerseStart, setSelectedVerseStart] = useState<string>("");
  const [selectedVerseEnd, setSelectedVerseEnd] = useState<string>("");
  const [multiVerseSpec, setMultiVerseSpec] = useState<string>("");
  const [previewText, setPreviewText] = useState<string>("");

  // RESET STATE ON OPEN
  useEffect(() => {
    if (isOpen) {
      setSelectedTranslation("");
      setSelectedBook("");
      setSelectedChapter("");
      setSelectedVerseStart("");
      setSelectedVerseEnd("");
      setMultiVerseSpec("");
      setPreviewText("");
      setBooks([]);
      setChapters([]);
      setVerses([]);
    }
  }, [isOpen]);

  // RESET CASCADE
  useEffect(() => {
    if (!isOpen) return;
    setSelectedBook("");
    setSelectedChapter("");
    setSelectedVerseStart("");
    setSelectedVerseEnd("");
    setMultiVerseSpec("");
    setChapters([]);
    setVerses([]);
    setPreviewText("");
  }, [selectedTranslation, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedChapter("");
    setSelectedVerseStart("");
    setSelectedVerseEnd("");
    setMultiVerseSpec("");
    setVerses([]);
    setPreviewText("");
  }, [selectedBook, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedVerseStart("");
    setSelectedVerseEnd("");
    setMultiVerseSpec("");
    setVerses([]);
    setPreviewText("");
  }, [selectedChapter, isOpen]);

  // Load data
  useEffect(() => {
    if (isOpen && currentLocaleId) {
      loadTranslations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentLocaleId]);

  useEffect(() => {
    if (selectedTranslation) {
      loadBooks();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTranslation]);

  useEffect(() => {
    if (selectedBook) {
      loadChapters();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook]);

  useEffect(() => {
    if (selectedBook && selectedChapter) {
      loadVerses();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBook, selectedChapter]);

  useEffect(() => {
    generatePreview();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verses, selectedVerseStart, selectedVerseEnd, multiVerseSpec]);

  const loadTranslations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('id, code, name, locale_id')
        .eq('locale_id', currentLocaleId)
        .eq('is_active', true);

      if (!error && data) {
        setTranslationsList(data);
      }
    } catch (error) {
      console.error('Chyba pri načítaní prekladov:', error);
    }
  }, [supabase, currentLocaleId]);

  const loadBooks = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('id, code, name, full_name, order_number, locale_id')
        .eq('locale_id', currentLocaleId)
        .eq('is_active', true)
        .order('order_number');

      if (!error && data) {
        setBooks(data);
      }
    } catch (error) {
      console.error('Chyba pri načítaní kníh:', error);
    }
  }, [supabase, currentLocaleId]);

  const loadChapters = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_distinct_chapters', {
          p_book_id: parseInt(selectedBook),
          p_translation_id: parseInt(selectedTranslation),
          p_is_active: true
        });

      if (error) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('bible_verses')
          .select('chapter')
          .eq('book_id', selectedBook)
          .eq('translation_id', selectedTranslation)
          .eq('is_active', true)
          .order('chapter');

        if (fallbackError) {
          console.error('Chyba pri načítaní kapitol:', fallbackError);
          return;
        }

        if (fallbackData && fallbackData.length > 0) {
          const uniqueChapters = [...new Set(fallbackData.map(v => v.chapter))].sort((a, b) => a - b);
          setChapters(uniqueChapters);
        } else {
          setChapters([]);
        }
      } else if (data) {
        const chapters = data.map((item: { chapter: number }) => item.chapter).sort((a: number, b: number) => a - b);
        setChapters(chapters);
      }
    } catch (error) {
      console.error('Chyba pri načítaní kapitol:', error);
      setChapters([]);
    }
  };

  const loadVerses = async () => {
    try {
      const { data, error } = await supabase
        .from('bible_verses')
        .select(`
          id,
          chapter,
          verse,
          text,
          books!inner(id, code, name, full_name, order_number, locale_id),
          translations!inner(id, code, name, locale_id)
        `)
        .eq('book_id', selectedBook)
        .eq('translation_id', selectedTranslation)
        .eq('chapter', selectedChapter)
        .eq('is_active', true)
        .order('verse');

      if (!error && data) {
        interface VerseWithJoins {
          id: number;
          chapter: number;
          verse: number;
          text: string;
          books: Book | Book[];
          translations: Translation | Translation[];
        }
        
        setVerses(data.map((v: VerseWithJoins) => ({
          id: v.id,
          chapter: v.chapter,
          verse: v.verse,
          text: v.text,
          book: Array.isArray(v.books) ? v.books[0] : v.books,
          translation: Array.isArray(v.translations) ? v.translations[0] : v.translations
        })));
      }
    } catch (error) {
      console.error('Chyba pri načítaní veršov:', error);
    }
  };

  // Multi-range parsing helpers
  type Range = [number, number];

  const cleanSpec = (specRaw: string) => {
    let spec = specRaw.trim();
    const commaIdx = spec.indexOf(",");
    if (commaIdx !== -1) {
      const before = spec.slice(0, commaIdx);
      if (/\d/.test(before)) {
        spec = spec.slice(commaIdx + 1);
      }
    }
    return spec;
  };

  const parseVerseSpec = (specRaw: string): Range[] => {
    const spec = cleanSpec(specRaw)
      .replace(/\s+/g, " ")
      .replace(/\s*;\s*/g, ".")
      .trim();

    if (!spec) return [];

    const parts = spec.split(".").map((p) => p.trim()).filter(Boolean);
    const ranges: Range[] = [];

    for (const part of parts) {
      const m = part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!m) continue;
      let a = parseInt(m[1], 10);
      let b = m[2] ? parseInt(m[2], 10) : a;
      if (a > b) [a, b] = [b, a];
      ranges.push([a, b]);
    }
    return ranges;
  };

  const normalizeSpec = (ranges: Range[]) => {
    return ranges
      .map(([a, b]) => (a === b ? `${a}` : `${a}-${b}`))
      .join(". ");
  };

  const generatePreview = () => {
    if (!verses.length) {
      setPreviewText("");
      return;
    }

    const specRanges = multiVerseSpec.trim() ? parseVerseSpec(multiVerseSpec) : [];
    if (specRanges.length) {
      const seen = new Set<number>();
      const bucket: BibleVerse[] = [];
      for (const [a, b] of specRanges) {
        for (const v of verses) {
          if (v.verse >= a && v.verse <= b && !seen.has(v.verse)) {
            seen.add(v.verse);
            bucket.push(v);
          }
        }
      }
      const text = bucket.map((v) => `${v.verse} ${v.text}`).join(" ");
      setPreviewText(text);
      return;
    }

    if (!selectedVerseStart) {
      setPreviewText("");
      return;
    }

    const startVerse = parseInt(selectedVerseStart);
    const endVerse = selectedVerseEnd ? parseInt(selectedVerseEnd) : startVerse;
    const selectedVerses = verses.filter(v => v.verse >= startVerse && v.verse <= endVerse);
    const text = selectedVerses.map(v => `${v.verse} ${v.text}`).join(' ');
    setPreviewText(text);
  };

  const handleImport = () => {
    if (!previewText || !selectedBook || !selectedChapter) {
      return;
    }

    const book = books.find(b => b.id.toString() === selectedBook);
    const translation = translationsList.find(t => t.id.toString() === selectedTranslation);

    let reference = `${book?.code} ${selectedChapter}`;
    const specRanges = multiVerseSpec.trim() ? parseVerseSpec(multiVerseSpec) : [];
    if (specRanges.length) {
      reference += `, ${normalizeSpec(specRanges)}`;
    } else if (selectedVerseStart) {
      const startVerse = parseInt(selectedVerseStart);
      const endVerse = selectedVerseEnd ? parseInt(selectedVerseEnd) : startVerse;
      if (startVerse === endVerse) {
        reference += `,${startVerse}`;
      } else {
        reference += `,${startVerse}-${endVerse}`;
      }
    }

    onImport(previewText, reference, translation?.name || "");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-rose-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📖</span>
              <h2 className="text-xl font-semibold">Import z Biblie</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Preklad Biblie
              </label>
              <select
                value={selectedTranslation}
                onChange={(e) => setSelectedTranslation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                disabled={!currentLocaleId}
              >
                <option value="">-- Vyberte preklad --</option>
                {translationsList.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Kniha Biblie
              </label>
              <select
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                disabled={!selectedTranslation}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100"
              >
                <option value="">-- Vyberte knihu --</option>
                {books.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Kapitola
              </label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                disabled={!selectedBook}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100"
              >
                <option value="">-- Kapitola --</option>
                {chapters.map(ch => (
                  <option key={ch} value={ch}>
                    Kapitola {ch}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Od verša
              </label>
              <select
                value={selectedVerseStart}
                onChange={(e) => setSelectedVerseStart(e.target.value)}
                disabled={!verses.length}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100"
              >
                <option value="">-- Od --</option>
                {verses.map(v => (
                  <option key={v.id} value={v.verse}>
                    Verš {v.verse}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Po verš (voliteľné)
              </label>
              <select
                value={selectedVerseEnd}
                onChange={(e) => setSelectedVerseEnd(e.target.value)}
                disabled={!selectedVerseStart}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100"
              >
                <option value="">-- Po (jeden verš) --</option>
                {verses
                  .filter(v => v.verse >= parseInt(selectedVerseStart || "0"))
                  .map(v => (
                    <option key={v.id} value={v.verse}>
                      Verš {v.verse}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Viac úsekov v kapitole (voliteľné)
            </label>
            <input
              type="text"
              value={multiVerseSpec}
              onChange={(e) => setMultiVerseSpec(e.target.value)}
              placeholder='napr. 12-17. 23-25'
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Oddelujte úseky <strong>bodkou</strong> alebo <strong>bodkočiarkou</strong>. Rozsah píšte pomocou <strong>pomlčky</strong>.
            </p>
          </div>

          {previewText && (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Náhľad textu
              </label>
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                <p className="text-gray-800 leading-relaxed">{previewText}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Zrušiť
            </button>
            <button
              onClick={handleImport}
              disabled={!previewText}
              className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Importovať
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RosaryEditPage() {
  const { supabase } = useSupabase();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { lang: appLang } = useLanguage();
  const rt = rosaryAdminTranslations[appLang as keyof typeof rosaryAdminTranslations] || rosaryAdminTranslations.sk;
  const isNew = id === "new";

  const formRef = useRef<HTMLFormElement>(null);
  
  // State pre formulár - controlled inputs
  const [formData, setFormData] = useState<Partial<LectioDivinaRuzenec>>({});
  const [dataLoaded, setDataLoaded] = useState(false);
  const [kategorie, setKategorie] = useState<Kategoria[]>([]);
  const [locales, setLocales] = useState<Locale[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isDraftAvailable, setIsDraftAvailable] = useState(false);

  // Voice and model settings pre TTS
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("scOwDtmlUjD3prqpp97I"); // Sam ako predvolený
  const [selectedModel, setSelectedModel] = useState<string>("eleven_v3"); // V3 ako predvolený

  // Bible import state
  const [showBibleImport, setShowBibleImport] = useState(false);
  
  // File upload hook
  const { uploadFile, isUploading, error: uploadError, clearError } = useFileUpload();

  // Konštanty
  const DRAFT_KEY = `rosary_draft_${id}`;

  // Stabilná funkcia na aktualizáciu formulára - presne ako v lectio-sources
  const updateFormField = useCallback((name: string, value: string | boolean | number) => {
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // Uložiť do localStorage s malým debounce
      setTimeout(() => {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
      }, 500);
      return updated;
    });
    setHasUnsavedChanges(true);
  }, [DRAFT_KEY]);

  // Small helper to show transient messages
  const showTempMessage = (text: string, type: "success" | "error" = "success", ms = 2500) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => { setMessage(null); setMessageType(null); }, ms);
  };

  // Translation handlers
  const handleSingleFieldTranslation = useCallback((fieldName: string, translatedText: string) => {
    updateFormField(fieldName, translatedText);
    showTempMessage(`Text bol preložený: ${fieldName}`, "success");
  }, [updateFormField]);

  const handleBulkTranslation = useCallback((updates: Record<string, string>) => {
    Object.entries(updates).forEach(([fieldName, translatedText]) => {
      updateFormField(fieldName, translatedText);
    });
    const count = Object.keys(updates).length;
    showTempMessage(`Preložených ${count} polí`, "success");
  }, [updateFormField]);

  // Audio generation handler
  const handleAudioGenerated = useCallback((fieldName: string, audioUrl: string) => {
    updateFormField(fieldName, audioUrl);
    showTempMessage(`Audio bolo vygenerované: ${fieldName}`, "success");
  }, [updateFormField]);

  // Bible import handler
  const handleBibleImport = (verses: string, reference: string) => {
    // Vložíme verše do lectio_text a referenciu do biblicky_text
    updateFormField('lectio_text', verses);
    updateFormField('biblicky_text', reference);
    showTempMessage("Biblický text bol importovaný do Lectio.", "success");
  };

  // === Odstránenie čísiel veršov ===
  const stripVerseNumbers = (text: string) => {
    let out = text;
    // Odstráni samostatné čísla veršov (1–3 cifry) na začiatkoch úsekov alebo po interpunkcii/medzere.
    out = out.replace(/(^|[^\p{L}\p{N}])\s*\d{1,3}(?=\s)/gmu, (_m, p1) => (p1 || ""));
    // Zlúči viacnásobné medzery
    out = out.replace(/\s{2,}/g, " ");
    // Opraví medzeru pred interpunkciou
    out = out.replace(/\s+([,.;:!?])/g, "$1");
    return out.trim();
  };

  const handleStripVerseNumbers = () => {
    const current = formData.lectio_text || "";
    const cleaned = stripVerseNumbers(current);
    updateFormField('lectio_text', cleaned);
    showTempMessage("Čísla veršov boli odstránené z Lectio textu.", "success");
  };

  const loadLocales = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('locales')
        .select('id, code, name, native_name, is_active')
        .eq('is_active', true)
        .order('name');

      if (!error && data) {
        setLocales(data);
      }
    } catch (error) {
      console.error('Chyba pri načítaní jazykov:', error);
    }
  }, [supabase]);

  // Load locales
  useEffect(() => {
    loadLocales();
  }, [loadLocales]);

  // Fetch kategórie
  useEffect(() => {
    const fetchKategorie = async () => {
      const { data, error } = await supabase
        .from("kategorie_ruzenec")
        .select("*")
        .order("nazov");
      
      if (!error && data) {
        setKategorie(data);
      }
    };
    fetchKategorie();
  }, [supabase]);

  // Načítanie dát
  useEffect(() => {
    const loadData = async () => {
      if (isNew) {
        // Pre nový záznam - skús načítať draft
        try {
          const savedDraft = localStorage.getItem(DRAFT_KEY);
          if (savedDraft) {
            const draftData = JSON.parse(savedDraft);
            setFormData(draftData);
            setIsDraftAvailable(true);
          } else {
            // Inicializácia pre nový záznam
            setFormData({
              lang: appLang,
              biblicky_text: "",
              kategoria: "radostné",
              ruzenec: "",
              uvod: "",
              uvod_audio: "",
              ilustracny_obrazok: "",
              uvodne_modlitby: "",
              uvodne_modlitby_audio: "",
              lectio_text: "",
              lectio_audio: "",
              komentar: "",
              komentar_audio: "",
              meditatio_text: "",
              meditatio_audio: "",
              oratio_html: "",
              oratio_audio: "",
              contemplatio_text: "",
              contemplatio_audio: "",
              actio_text: "",
              actio_audio: "",
              audio_nahravka: "",
              autor: "",
              publikovane: false,
              poradie: 0,
            });
          }
        } catch (error) {
          console.error('Chyba pri načítaní draft:', error);
        }
        setDataLoaded(true);
      } else {
        // Pre existujúci záznam
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from("lectio_divina_ruzenec")
            .select("*")
            .eq("id", id)
            .single();
          
          if (!error && data) {
            setFormData(data);
            setDataLoaded(true);
          }
        } catch (error) {
          console.error('Chyba pri načítaní:', error);
        }
        setLoading(false);
      }
    };

    loadData();
  }, [id, supabase, isNew, appLang, DRAFT_KEY]);

  // Page Visibility API
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasUnsavedChanges && dataLoaded) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
        console.log('Draft uložený pred skrytím stránky');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [formData, hasUnsavedChanges, dataLoaded, DRAFT_KEY]);

  // Upozornenie pred opustením
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && dataLoaded) {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
        e.preventDefault();
        e.returnValue = 'Máte neuložené zmeny. Chcete naozaj opustiť stránku?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, formData, dataLoaded, DRAFT_KEY]);

  // Vymazanie draft
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setIsDraftAvailable(false);
    setHasUnsavedChanges(false);
    
    if (isNew) {
      setFormData({
        lang: appLang,
        biblicky_text: "",
        kategoria: "radostné",
        ruzenec: "",
        uvod: "",
        uvod_audio: "",
        ilustracny_obrazok: "",
        uvodne_modlitby: "",
        uvodne_modlitby_audio: "",
        lectio_text: "",
        lectio_audio: "",
        komentar: "",
        komentar_audio: "",
        meditatio_text: "",
        meditatio_audio: "",
        oratio_html: "",
        oratio_audio: "",
        contemplatio_text: "",
        contemplatio_audio: "",
        actio_text: "",
        actio_audio: "",
        audio_nahravka: "",
        autor: "",
        publikovane: false,
        poradie: 0,
      });
    }
    
    setMessage(rt.messages.draftCleared);
    setMessageType("success");
  };

  // Upload súboru do Supabase Storage
  const handleFileUpload = async (file: File, type: 'image' | 'audio', inputName: string) => {
    try {
      clearError();
      const result = await uploadFile(supabase, file, type);
      
      if (result.success) {
        updateFormField(inputName, result.url);
        setMessage(type === 'image' ? rt.messages.imageUploaded : rt.messages.audioUploaded);
        setMessageType("success");
      } else {
        throw new Error(result.error || 'Upload zlyhal');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setMessage(`${rt.messages.uploadError} ${error instanceof Error ? error.message : 'Neznáma chyba'}`);
      setMessageType("error");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setMessageType(null);

    if (!formData.ruzenec || !formData.biblicky_text || !formData.lectio_text) {
      setSaving(false);
      setMessage(rt.messages.validationError);
      setMessageType("error");
      return;
    }

    try {
      // Validácia dĺžky polí pred uložením
      if (formData.ruzenec && formData.ruzenec.length > 150) {
        setMessage(`${rt.basicInfo.rosaryName} môže mať maximálne 150 znakov (aktuálne: ${formData.ruzenec.length})`);
        setMessageType("error");
        setSaving(false);
        return;
      }
      
      if (formData.autor && formData.autor.length > 100) {
        setMessage(`${rt.settings.author} môže mať maximálne 100 znakov (aktuálne: ${formData.autor.length})`);
        setMessageType("error");
        setSaving(false);
        return;
      }

      if (isNew) {
        const { data, error } = await supabase
          .from("lectio_divina_ruzenec")
          .insert([formData])
          .select("id")
          .single();
        
        if (!error && data?.id) {
          localStorage.removeItem(DRAFT_KEY);
          setHasUnsavedChanges(false);
          setIsDraftAvailable(false);
          setMessage(rt.messages.created);
          setMessageType("success");
          setTimeout(() => {
            router.replace(`/admin/rosary/${data.id}`);
          }, 1000);
        } else {
          throw new Error(error?.message || "Chyba pri vytváraní");
        }
      } else {
        const { error } = await supabase
          .from("lectio_divina_ruzenec")
          .update(formData)
          .eq("id", id);
        
        if (error) {
          throw new Error(error.message);
        }
        
        localStorage.removeItem(DRAFT_KEY);
        setHasUnsavedChanges(false);
        setIsDraftAvailable(false);
        setMessage(rt.messages.updated);
        setMessageType("success");
      }
    } catch (error: unknown) {
      console.error('Save error:', error);
      setMessage((error as Error)?.message || rt.messages.error);
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !dataLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          <span className="text-gray-700 font-medium">{rt.messages.loading}</span>
        </div>
      </div>
    );
  }

  if (!dataLoaded && !isNew) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {rt.messages.notFound}
          </h2>
          <p className="text-gray-600 mb-4">{rt.messages.notFoundDescription}</p>
          <button
            onClick={() => router.push('/admin/rosary')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            {rt.buttons.backToList}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <RosaryHeader 
          isNew={isNew}
          formData={formData}
          hasUnsavedChanges={hasUnsavedChanges}
          isDraftAvailable={isDraftAvailable}
        />

        <DraftIndicator 
          isDraftAvailable={isDraftAvailable}
          clearDraft={clearDraft}
        />

        <MessageDisplay
          message={message}
          messageType={messageType}
          uploadError={uploadError}
          clearError={clearError}
        />

        <form ref={formRef} onSubmit={handleSave} className="space-y-8">
          {/* Základné informácie */}
          <FormSection title={rt.basicInfo.title} icon={FileText}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="admin-edit-label">
                      <Sparkles size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                      {rt.basicInfo.rosaryName} <span className="text-red-500">*</span>
                    </label>
                    <TranslateButton
                      text={formData.ruzenec || ""}
                      fieldType="spiritual"
                      onTranslated={(translatedText) => handleSingleFieldTranslation('ruzenec', translatedText)}
                      disabled={saving}
                    />
                  </div>
                  <input
                    type="text"
                    name="ruzenec"
                    value={formData.ruzenec || ""}
                    onChange={(e) => updateFormField('ruzenec', e.target.value)}
                    className="admin-edit-input"
                    placeholder={rt.basicInfo.rosaryNamePlaceholder}
                    maxLength={150}
                    required
                  />
                  <p className={`text-xs mt-1 ${(formData.ruzenec?.length || 0) > 135 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                    {formData.ruzenec?.length || 0}/150 znakov
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="admin-edit-label">
                    <BookOpen size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    {rt.basicInfo.biblicalText} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="biblicky_text"
                    value={formData.biblicky_text || ""}
                    onChange={(e) => updateFormField('biblicky_text', e.target.value)}
                    className="admin-edit-input"
                    placeholder={rt.basicInfo.biblicalTextPlaceholder}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="admin-edit-label">
                    <Crown size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    {rt.basicInfo.category} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="kategoria"
                    value={formData.kategoria || "radostné"}
                    onChange={(e) => updateFormField('kategoria', e.target.value)}
                    className="admin-edit-input"
                    required
                  >
                    {kategorie.map(k => (
                      <option key={k.id} value={k.nazov}>
                        {k.nazov} - {k.popis}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="admin-edit-label">
                    <Globe size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
                    {rt.basicInfo.language} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="lang"
                    value={formData.lang || appLang}
                    onChange={(e) => updateFormField('lang', e.target.value)}
                    className="admin-edit-input"
                  >
                    {LANGUAGE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.flag} {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <FileText size={16} />
                      {rt.intro.title}
                    </div>
                  </label>
                  <TranslateButton
                    text={formData.uvod || ""}
                    fieldType="spiritual"
                    onTranslated={(translatedText) => handleSingleFieldTranslation('uvod', translatedText)}
                    disabled={saving}
                  />
                </div>
                <p className="text-xs text-gray-500">{rt.intro.description}</p>
                <textarea
                  name="uvod"
                  value={formData.uvod || ""}
                  onChange={(e) => updateFormField('uvod', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                  placeholder={rt.intro.placeholder}
                  rows={4}
                  style={{ height: '6rem' }}
                />
              </div>

              {/* Úvod Audio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Volume2 size={16} />
                      {rt.intro.audio}
                    </div>
                  </label>
                  <AudioGenerateButton
                    text={formData.uvod || ""}
                    language={formData.lang || "sk"}
                    lectioId={id || "new"}
                    fieldName="uvod_audio"
                    currentAudioUrl={formData.uvod_audio || ""}
                    onAudioGenerated={(audioUrl) => handleAudioGenerated("uvod_audio", audioUrl)}
                    disabled={saving}
                    voice_id={selectedVoiceId}
                    model={selectedModel}
                  />
                </div>
                <input
                  type="url"
                  name="uvod_audio"
                  value={formData.uvod_audio || ""}
                  onChange={(e) => updateFormField('uvod_audio', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder={rt.intro.audioPlaceholder}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Heart size={16} />
                      {rt.introductoryPrayers.title}
                    </div>
                  </label>
                  <TranslateButton
                    text={formData.uvodne_modlitby || ""}
                    fieldType="prayer"
                    onTranslated={(translatedText) => handleSingleFieldTranslation('uvodne_modlitby', translatedText)}
                    disabled={saving}
                  />
                </div>
                <p className="text-xs text-gray-500">{rt.introductoryPrayers.description}</p>
                <textarea
                  name="uvodne_modlitby"
                  value={formData.uvodne_modlitby || ""}
                  onChange={(e) => updateFormField('uvodne_modlitby', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none font-mono text-sm"
                  placeholder={rt.introductoryPrayers.placeholder}
                  rows={6}
                  style={{ height: '9rem' }}
                />
              </div>

              {/* Úvodné modlitby Audio */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Volume2 size={16} />
                      {rt.introductoryPrayers.audio}
                    </div>
                  </label>
                  <AudioGenerateButton
                    text={formData.uvodne_modlitby || ""}
                    language={formData.lang || "sk"}
                    lectioId={id || "new"}
                    fieldName="uvodne_modlitby_audio"
                    currentAudioUrl={formData.uvodne_modlitby_audio || ""}
                    onAudioGenerated={(audioUrl) => handleAudioGenerated("uvodne_modlitby_audio", audioUrl)}
                    disabled={saving}
                    voice_id={selectedVoiceId}
                    model={selectedModel}
                  />
                </div>
                <input
                  type="url"
                  name="uvodne_modlitby_audio"
                  value={formData.uvodne_modlitby_audio || ""}
                  onChange={(e) => updateFormField('uvodne_modlitby_audio', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder={rt.introductoryPrayers.audioPlaceholder}
                />
              </div>
            </div>
          </FormSection>

          {/* Lectio Divina obsah */}
          <FormSection title={rt.content.title} icon={BookOpen}>
            <div className="space-y-8">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <BookOpen size={20} className="mr-3 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">{rt.lectio.title}</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">
                        {rt.lectio.text} <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowBibleImport(true)}
                          disabled={!locales.length}
                          className="admin-edit-button-primary text-sm"
                        >
                          <span className="mr-2">📥</span>
                          {rt.biblicalText.importFromBible}
                        </button>
                        <button
                          type="button"
                          onClick={handleStripVerseNumbers}
                          disabled={!formData.lectio_text || saving}
                          className="admin-edit-button-primary text-sm"
                          title={rt.lectio.removeVerseNumbersTooltip}
                        >
                          <span className="mr-2">🧹</span>
                          {rt.lectio.removeVerseNumbers}
                        </button>
                        <TranslateButton
                          text={formData.lectio_text || ""}
                          fieldType="spiritual"
                          onTranslated={(translatedText) => handleSingleFieldTranslation('lectio_text', translatedText)}
                          disabled={saving}
                        />
                      </div>
                    </div>
                    <textarea
                      name="lectio_text"
                      value={formData.lectio_text || ""}
                      onChange={(e) => updateFormField('lectio_text', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                      placeholder={rt.lectio.textPlaceholder}
                      rows={8}
                      required
                      style={{ height: '12rem' }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">
                        {rt.lectio.audio}
                      </label>
                      <AudioGenerateButton
                        text={formData.lectio_text || ""}
                        language={formData.lang || "sk"}
                        lectioId={id || "new"}
                        fieldName="lectio_audio"
                        currentAudioUrl={formData.lectio_audio || ""}
                        onAudioGenerated={(audioUrl) => handleAudioGenerated("lectio_audio", audioUrl)}
                        disabled={saving}
                        voice_id={selectedVoiceId}
                        model={selectedModel}
                      />
                    </div>
                    <input
                      type="url"
                      name="lectio_audio"
                      value={formData.lectio_audio || ""}
                      onChange={(e) => updateFormField('lectio_audio', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder={rt.lectio.audioPlaceholder}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">
                        {rt.lectio.comment}
                      </label>
                      <TranslateButton
                        text={formData.komentar || ""}
                        fieldType="spiritual"
                        onTranslated={(translatedText) => handleSingleFieldTranslation('komentar', translatedText)}
                        disabled={saving}
                      />
                    </div>
                    <textarea
                      name="komentar"
                      value={formData.komentar || ""}
                      onChange={(e) => updateFormField('komentar', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                      placeholder={rt.lectio.commentPlaceholder}
                      rows={4}
                      style={{ height: '6rem' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">
                        {rt.lectio.commentAudio}
                      </label>
                      <AudioGenerateButton
                        text={formData.komentar || ""}
                        language={formData.lang || "sk"}
                        lectioId={id || "new"}
                        fieldName="komentar_audio"
                        currentAudioUrl={formData.komentar_audio || ""}
                        onAudioGenerated={(audioUrl) => handleAudioGenerated("komentar_audio", audioUrl)}
                        disabled={saving}
                        voice_id={selectedVoiceId}
                        model={selectedModel}
                      />
                    </div>
                    <input
                      type="url"
                      name="komentar_audio"
                      value={formData.komentar_audio || ""}
                      onChange={(e) => updateFormField('komentar_audio', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder={rt.lectio.commentAudioPlaceholder}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <Eye size={20} className="mr-3 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">{rt.meditatio.title}</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">
                        {rt.meditatio.text} <span className="text-red-500">*</span>
                      </label>
                      <TranslateButton
                        text={formData.meditatio_text || ""}
                        fieldType="spiritual"
                        onTranslated={(translatedText) => handleSingleFieldTranslation('meditatio_text', translatedText)}
                        disabled={saving}
                      />
                    </div>
                    <textarea
                      name="meditatio_text"
                      value={formData.meditatio_text || ""}
                      onChange={(e) => updateFormField('meditatio_text', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                      placeholder={rt.meditatio.textPlaceholder}
                      rows={8}
                      required
                      style={{ height: '12rem' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">
                        {rt.meditatio.audio}
                      </label>
                      <AudioGenerateButton
                        text={formData.meditatio_text || ""}
                        language={formData.lang || "sk"}
                        lectioId={id || "new"}
                        fieldName="meditatio_audio"
                        currentAudioUrl={formData.meditatio_audio || ""}
                        onAudioGenerated={(audioUrl) => handleAudioGenerated("meditatio_audio", audioUrl)}
                        disabled={saving}
                        voice_id={selectedVoiceId}
                        model={selectedModel}
                      />
                    </div>
                    <input
                      type="url"
                      name="meditatio_audio"
                      value={formData.meditatio_audio || ""}
                      onChange={(e) => updateFormField('meditatio_audio', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder={rt.meditatio.audioPlaceholder}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <Heart size={20} className="mr-3 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">{rt.oratio.title}</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">
                        {rt.oratio.html} <span className="text-red-500">*</span>
                      </label>
                      <TranslateButton
                        text={formData.oratio_html || ""}
                        fieldType="prayer"
                        onTranslated={(translatedText) => handleSingleFieldTranslation('oratio_html', translatedText)}
                        disabled={saving}
                      />
                    </div>
                    <textarea
                      name="oratio_html"
                      value={formData.oratio_html || ""}
                      onChange={(e) => updateFormField('oratio_html', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none font-mono text-sm"
                      placeholder={rt.oratio.htmlPlaceholder}
                      rows={10}
                      required
                      style={{ height: '15rem' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">
                        {rt.oratio.audio}
                      </label>
                      <AudioGenerateButton
                        text={formData.oratio_html || ""}
                        language={formData.lang || "sk"}
                        lectioId={id || "new"}
                        fieldName="oratio_audio"
                        currentAudioUrl={formData.oratio_audio || ""}
                        onAudioGenerated={(audioUrl) => handleAudioGenerated("oratio_audio", audioUrl)}
                        disabled={saving}
                        voice_id={selectedVoiceId}
                        model={selectedModel}
                      />
                    </div>
                    <input
                      type="url"
                      name="oratio_audio"
                      value={formData.oratio_audio || ""}
                      onChange={(e) => updateFormField('oratio_audio', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder={rt.oratio.audioPlaceholder}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <Star size={20} className="mr-3 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">{rt.contemplatio.title}</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">
                        {rt.contemplatio.text} <span className="text-red-500">*</span>
                      </label>
                      <TranslateButton
                        text={formData.contemplatio_text || ""}
                        fieldType="spiritual"
                        onTranslated={(translatedText) => handleSingleFieldTranslation('contemplatio_text', translatedText)}
                        disabled={saving}
                      />
                    </div>
                    <textarea
                      name="contemplatio_text"
                      value={formData.contemplatio_text || ""}
                      onChange={(e) => updateFormField('contemplatio_text', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                      placeholder={rt.contemplatio.textPlaceholder}
                      rows={6}
                      required
                      style={{ height: '9rem' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">
                        {rt.contemplatio.audio}
                      </label>
                      <AudioGenerateButton
                        text={formData.contemplatio_text || ""}
                        language={formData.lang || "sk"}
                        lectioId={id || "new"}
                        fieldName="contemplatio_audio"
                        currentAudioUrl={formData.contemplatio_audio || ""}
                        onAudioGenerated={(audioUrl) => handleAudioGenerated("contemplatio_audio", audioUrl)}
                        disabled={saving}
                        voice_id={selectedVoiceId}
                        model={selectedModel}
                      />
                    </div>
                    <input
                      type="url"
                      name="contemplatio_audio"
                      value={formData.contemplatio_audio || ""}
                      onChange={(e) => updateFormField('contemplatio_audio', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder={rt.contemplatio.audioPlaceholder}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <Sun size={20} className="mr-3 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">{rt.actio.title}</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">
                        {rt.actio.text} <span className="text-red-500">*</span>
                      </label>
                      <TranslateButton
                        text={formData.actio_text || ""}
                        fieldType="spiritual"
                        onTranslated={(translatedText) => handleSingleFieldTranslation('actio_text', translatedText)}
                        disabled={saving}
                      />
                    </div>
                    <textarea
                      name="actio_text"
                      value={formData.actio_text || ""}
                      onChange={(e) => updateFormField('actio_text', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
                      placeholder={rt.actio.textPlaceholder}
                      rows={6}
                      required
                      style={{ height: '9rem' }}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-gray-700">
                        {rt.actio.audio}
                      </label>
                      <AudioGenerateButton
                        text={formData.actio_text || ""}
                        language={formData.lang || "sk"}
                        lectioId={id || "new"}
                        fieldName="actio_audio"
                        currentAudioUrl={formData.actio_audio || ""}
                        onAudioGenerated={(audioUrl) => handleAudioGenerated("actio_audio", audioUrl)}
                        disabled={saving}
                        voice_id={selectedVoiceId}
                        model={selectedModel}
                      />
                    </div>
                    <input
                      type="url"
                      name="actio_audio"
                      value={formData.actio_audio || ""}
                      onChange={(e) => updateFormField('actio_audio', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder={rt.actio.audioPlaceholder}
                    />
                  </div>
                </div>
              </div>
            </div>
          </FormSection>

          {/* Médiá */}
          <FormSection title={rt.media.title} icon={Headphones}>
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <ImageIcon size={20} className="mr-3 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">{rt.media.illustrativeImage}</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {rt.media.imageUrl}
                    </label>
                    <p className="text-xs text-gray-500">{rt.media.imageUrlDescription}</p>
                    <input
                      type="url"
                      name="ilustracny_obrazok"
                      value={formData.ilustracny_obrazok || ""}
                      onChange={(e) => updateFormField('ilustracny_obrazok', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {rt.media.uploadImage}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          await handleFileUpload(file, 'image', 'ilustracny_obrazok');
                          e.target.value = ''; // Reset input
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      disabled={isUploading}
                    />
                    {isUploading && (
                      <p className="text-sm text-blue-600 mt-2">{rt.media.uploadingImage}</p>
                    )}
                  </div>

                  {formData.ilustracny_obrazok && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">{rt.media.preview}</p>
                      <Image 
                        src={formData.ilustracny_obrazok} 
                        alt="Náhľad"
                        width={128}
                        height={128} 
                        className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <Volume2 size={20} className="mr-3 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">{rt.media.audioRecording}</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {rt.media.audioUrl}
                    </label>
                    <p className="text-xs text-gray-500">{rt.media.audioUrlDescription}</p>
                    <input
                      type="url"
                      name="audio_nahravka"
                      value={formData.audio_nahravka || ""}
                      onChange={(e) => updateFormField('audio_nahravka', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      placeholder="https://example.com/audio.mp3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {rt.media.uploadAudio}
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          await handleFileUpload(file, 'audio', 'audio_nahravka');
                          e.target.value = ''; // Reset input
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                      disabled={isUploading}
                    />
                    {isUploading && (
                      <p className="text-sm text-green-600 mt-2">{rt.media.uploadingAudio}</p>
                    )}
                  </div>

                  {formData.audio_nahravka && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">{rt.media.audioPlayer}</p>
                      <audio 
                        controls 
                        src={formData.audio_nahravka}
                        className="w-full"
                      >
                        {rt.media.browserNotSupported}
                      </audio>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </FormSection>

          {/* Nastavenia */}
          <FormSection title={rt.settings.title} icon={Globe}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {rt.settings.author}
                  </label>
                  <p className="text-xs text-gray-500">{rt.settings.authorDescription}</p>
                  <input
                    type="text"
                    name="autor"
                    value={formData.autor || ""}
                    onChange={(e) => updateFormField('autor', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    placeholder={rt.settings.authorPlaceholder}
                    maxLength={100}
                  />
                  <p className={`text-xs mt-1 ${(formData.autor?.length || 0) > 90 ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
                    {formData.autor?.length || 0}/100 znakov
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {rt.settings.order}
                  </label>
                  <p className="text-xs text-gray-500">{rt.settings.orderDescription}</p>
                  <input
                    type="number"
                    name="poradie"
                    value={formData.poradie || 0}
                    onChange={(e) => updateFormField('poradie', parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                    placeholder={rt.settings.orderPlaceholder}
                  />
                </div>
              </div>

              <div 
                className={`rounded-lg p-6 border shadow-sm transition-colors duration-200 ${
                  formData.publikovane 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center mb-4">
                  <Eye size={20} className="mr-3 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">{rt.publishing.title}</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="publikovane"
                    checked={formData.publikovane || false}
                    onChange={(e) => updateFormField('publikovane', e.target.checked)}
                    className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {rt.publishing.publish}
                    </label>
                    <p className="text-xs text-gray-500">
                      {rt.publishing.publishDescription}
                    </p>
                  </div>
                </div>
              </div>

              {/* Voice and Model Settings */}
              <VoiceSelector
                selectedVoiceId={selectedVoiceId}
                selectedModel={selectedModel}
                onVoiceChange={setSelectedVoiceId}
                onModelChange={setSelectedModel}
                language={formData.lang}
                className="mb-6"
              />

              {/* BulkTranslateSection */}
              <BulkTranslateSection
                formData={formData}
                onFieldsUpdated={handleBulkTranslation}
                disabled={saving}
              />

              <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center mb-4">
                  <Calendar size={20} className="mr-3 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-800">{rt.recordInfo.title}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">{rt.recordInfo.created}:</span>
                    <p className="text-gray-600">
                      {formData.created_at 
                        ? new Date(formData.created_at).toLocaleDateString('sk-SK', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : rt.recordInfo.newRecord
                      }
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">{rt.recordInfo.updated}:</span>
                    <p className="text-gray-600">
                      {formData.updated_at 
                        ? new Date(formData.updated_at).toLocaleDateString('sk-SK', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : rt.recordInfo.never
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FormSection>

          <SaveButtonsSection
            saving={saving}
            isUploading={isUploading}
            isNew={isNew}
          />
        </form>

        {/* Bible Import Modal */}
        <BibleImportModal
          isOpen={showBibleImport}
          onClose={() => setShowBibleImport(false)}
          onImport={handleBibleImport}
          currentLocaleId={locales.find(l => l.code === formData.lang)?.id || null}
        />
      </div>
    </div>
  );
}