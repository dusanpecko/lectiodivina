"use client";

import { useSupabase } from "@/app/components/SupabaseProvider";
import { Check, Download, Globe, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Jazykové možnosti
const LANGUAGE_OPTIONS = [
  { value: "sk", label: "Slovenčina", flag: "🇸🇰" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "cz", label: "Čeština", flag: "🇨🇿" },
  { value: "es", label: "Español", flag: "🇪🇸" },
];

// Polia, ktoré sa importujú (rovnaké ako pri hromadnom kopírovaní)
const IMPORT_FIELDS = [
  { key: "lectio_text", label: "Lectio", emoji: "📖" },
  { key: "meditatio_text", label: "Meditatio", emoji: "👁️" },
  { key: "oratio_text", label: "Oratio", emoji: "❤️" },
  { key: "contemplatio_text", label: "Contemplatio", emoji: "🙏" },
  { key: "actio_text", label: "Actio", emoji: "✨" },
  { key: "reference", label: "Reference", emoji: "📚" },
];

interface LectioMatch {
  id: number;
  lang: string;
  hlava: string;
  suradnice_pismo: string;
  rok: string;
  lectio_text: string | null;
  meditatio_text: string | null;
  oratio_text: string | null;
  contemplatio_text: string | null;
  actio_text: string | null;
  reference: string | null;
}

interface LectioImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: string;
  currentSuradnicePismo: string;
  onImport: (data: Record<string, string>) => void;
}

export default function LectioImportModal({
  isOpen,
  onClose,
  currentLang,
  currentSuradnicePismo,
  onImport,
}: LectioImportModalProps) {
  const { supabase } = useSupabase();

  const [selectedSourceLang, setSelectedSourceLang] = useState<string>("");
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState<LectioMatch[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<LectioMatch | null>(null);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(
    new Set(IMPORT_FIELDS.map((f) => f.key))
  );
  const [importing, setImporting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedSourceLang("");
      setMatches([]);
      setSelectedMatch(null);
      setSelectedFields(new Set(IMPORT_FIELDS.map((f) => f.key)));
      setSearching(false);
      setImporting(false);
    }
  }, [isOpen]);

  // Vyhľadanie zhôd podľa suradnice_pismo
  const searchMatches = useCallback(async () => {
    if (!selectedSourceLang || !currentSuradnicePismo) return;

    setSearching(true);
    setMatches([]);
    setSelectedMatch(null);

    try {
      const { data, error } = await supabase
        .from("lectio_sources")
        .select(
          "id, lang, hlava, suradnice_pismo, rok, lectio_text, meditatio_text, oratio_text, contemplatio_text, actio_text, reference"
        )
        .eq("lang", selectedSourceLang)
        .eq("suradnice_pismo", currentSuradnicePismo)
        .order("rok", { ascending: true });

      if (error) {
        console.error("Search error:", error);
      } else {
        setMatches(data || []);
        // Ak je len jeden výsledok, automaticky ho vyber
        if (data && data.length === 1) {
          setSelectedMatch(data[0]);
        }
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setSearching(false);
    }
  }, [supabase, selectedSourceLang, currentSuradnicePismo]);

  // Automaticky vyhľadaj keď sa zmení jazyk
  useEffect(() => {
    if (selectedSourceLang && currentSuradnicePismo) {
      searchMatches();
    }
  }, [selectedSourceLang, currentSuradnicePismo, searchMatches]);

  // Toggle výber poľa
  const toggleField = (fieldKey: string) => {
    setSelectedFields((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(fieldKey)) {
        newSet.delete(fieldKey);
      } else {
        newSet.add(fieldKey);
      }
      return newSet;
    });
  };

  // Vyber/odznač všetky polia
  const toggleAllFields = () => {
    if (selectedFields.size === IMPORT_FIELDS.length) {
      setSelectedFields(new Set());
    } else {
      setSelectedFields(new Set(IMPORT_FIELDS.map((f) => f.key)));
    }
  };

  // Import vybraných polí
  const handleImport = async () => {
    if (!selectedMatch || selectedFields.size === 0) return;

    setImporting(true);
    try {
      const importData: Record<string, string> = {};

      selectedFields.forEach((fieldKey) => {
        const value = selectedMatch[fieldKey as keyof LectioMatch];
        if (value && typeof value === "string") {
          importData[fieldKey] = value;
        }
      });

      onImport(importData);
      onClose();
    } catch (err) {
      console.error("Import error:", err);
    } finally {
      setImporting(false);
    }
  };

  // Skontroluj či má pole obsah
  const hasContent = (match: LectioMatch, fieldKey: string): boolean => {
    const value = match[fieldKey as keyof LectioMatch];
    return typeof value === "string" && value.trim().length > 0;
  };

  // Počet polí s obsahom vo vybranom matchi
  const getFieldsWithContentCount = (match: LectioMatch): number => {
    return IMPORT_FIELDS.filter((f) => hasContent(match, f.key)).length;
  };

  if (!isOpen) return null;

  const availableLanguages = LANGUAGE_OPTIONS.filter(
    (lang) => lang.value !== currentLang
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Download size={24} style={{ color: "#40467b" }} />
            Import textov z iného jazyka
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1"
            disabled={importing}
          >
            <X size={24} />
          </button>
        </div>

        {/* Current source info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={18} className="text-blue-600" />
            <span className="font-semibold text-blue-800">
              Aktuálny záznam ({currentLang.toUpperCase()})
            </span>
          </div>
          <p className="text-blue-700 font-mono bg-blue-100 rounded px-2 py-1 inline-block">
            {currentSuradnicePismo || "—"}
          </p>
        </div>

        {/* Step 1: Select source language */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            1. Vyberte zdrojový jazyk na import
          </label>
          <select
            value={selectedSourceLang}
            onChange={(e) => setSelectedSourceLang(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-lg"
            disabled={searching || importing}
          >
            <option value="">-- Vyberte jazyk --</option>
            {availableLanguages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.flag} {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Loading state */}
        {searching && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
            <span className="text-gray-600">Vyhľadávam zhody...</span>
          </div>
        )}

        {/* No matches found */}
        {!searching &&
          selectedSourceLang &&
          matches.length === 0 &&
          currentSuradnicePismo && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <Search size={48} className="mx-auto text-yellow-500 mb-4" />
              <h4 className="font-semibold text-yellow-800 mb-2">
                Žiadne zhody nenájdené
              </h4>
              <p className="text-yellow-700 text-sm">
                Pre súradnice &ldquo;{currentSuradnicePismo}&rdquo; neexistuje
                záznam v jazyku{" "}
                {
                  LANGUAGE_OPTIONS.find((l) => l.value === selectedSourceLang)
                    ?.label
                }
              </p>
            </div>
          )}

        {/* Step 2: Select from matches */}
        {!searching && matches.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              2. Vyberte záznam na import{" "}
              {matches.length > 1 && `(${matches.length} zhôd)`}
            </label>
            <div className="space-y-3">
              {matches.map((match) => (
                <div
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedMatch?.id === match.id
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {selectedMatch?.id === match.id && (
                          <Check size={18} className="text-emerald-600" />
                        )}
                        <span className="font-bold text-gray-900">
                          {match.hlava}
                        </span>
                        {match.rok && match.rok !== "N" && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            Rok {match.rok}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 font-mono">
                        {match.suradnice_pismo}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-500">
                        {getFieldsWithContentCount(match)}/{IMPORT_FIELDS.length}{" "}
                        polí
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Select fields to import */}
        {selectedMatch && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-700">
                3. Vyberte polia na import
              </label>
              <button
                type="button"
                onClick={toggleAllFields}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {selectedFields.size === IMPORT_FIELDS.length
                  ? "Odznačiť všetky"
                  : "Vybrať všetky"}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {IMPORT_FIELDS.map((field) => {
                const hasFieldContent = hasContent(selectedMatch, field.key);
                const isSelected = selectedFields.has(field.key);
                return (
                  <div
                    key={field.key}
                    onClick={() => hasFieldContent && toggleField(field.key)}
                    className={`border-2 rounded-lg p-3 transition-all ${
                      !hasFieldContent
                        ? "border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed"
                        : isSelected
                          ? "border-emerald-500 bg-emerald-50 cursor-pointer"
                          : "border-gray-200 hover:border-gray-300 cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected && hasFieldContent}
                        disabled={!hasFieldContent}
                        onChange={() => hasFieldContent && toggleField(field.key)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-lg">{field.emoji}</span>
                      <span
                        className={`text-sm font-medium ${
                          hasFieldContent ? "text-gray-800" : "text-gray-400"
                        }`}
                      >
                        {field.label}
                      </span>
                    </div>
                    {!hasFieldContent && (
                      <span className="text-xs text-gray-400 ml-6">
                        (prázdne)
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Preview of selected match */}
        {selectedMatch && selectedFields.size > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Download size={16} />
              Náhľad importu
            </h4>
            <div className="space-y-2 text-sm">
              {IMPORT_FIELDS.filter(
                (f) => selectedFields.has(f.key) && hasContent(selectedMatch, f.key)
              ).map((field) => {
                const value = selectedMatch[field.key as keyof LectioMatch];
                const text = typeof value === "string" ? value : "";
                return (
                  <div
                    key={field.key}
                    className="bg-white border border-gray-100 rounded p-2"
                  >
                    <div className="flex items-center gap-1 text-gray-600 mb-1">
                      <span>{field.emoji}</span>
                      <span className="font-medium">{field.label}</span>
                    </div>
                    <p className="text-gray-700 line-clamp-2 text-xs">
                      {text.substring(0, 150)}
                      {text.length > 150 && "..."}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
            disabled={importing}
          >
            Zrušiť
          </button>
          <button
            onClick={handleImport}
            disabled={
              !selectedMatch ||
              selectedFields.size === 0 ||
              importing ||
              !IMPORT_FIELDS.some(
                (f) =>
                  selectedFields.has(f.key) && hasContent(selectedMatch, f.key)
              )
            }
            className="px-6 py-2 text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ backgroundColor: "#40467b" }}
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Importujem...
              </>
            ) : (
              <>
                <Download size={18} />
                Importovať{" "}
                {
                  IMPORT_FIELDS.filter(
                    (f) =>
                      selectedFields.has(f.key) &&
                      selectedMatch &&
                      hasContent(selectedMatch, f.key)
                  ).length
                }{" "}
                polí
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

