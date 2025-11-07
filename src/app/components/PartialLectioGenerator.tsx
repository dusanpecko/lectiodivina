"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";

interface PartialLectioGeneratorProps {
  bibliaText: string;
  lectioText: string;
  meditatioText: string;
  oratioText: string;
  contemplatioText: string;
  suradnicePismo: string;
  onContemplatiooActioGenerated: (data: { contemplatio: string; actio: string }) => void;
  onActioGenerated: (data: { actio: string }) => void;
  disabled?: boolean;
}

export default function PartialLectioGenerator({
  bibliaText,
  lectioText,
  meditatioText,
  oratioText,
  contemplatioText,
  suradnicePismo,
  onContemplatiooActioGenerated,
  onActioGenerated,
  disabled = false,
}: PartialLectioGeneratorProps) {
  const [generatingMode, setGeneratingMode] = useState<'contemplatio-actio' | 'actio-only' | null>(null);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleGenerate = async (mode: 'contemplatio-actio' | 'actio-only') => {
    // Validácie
    if (!bibliaText || !lectioText) {
      setMessage({ text: 'Biblický text a Lectio sú povinné', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (mode === 'contemplatio-actio' && (!meditatioText || !oratioText)) {
      setMessage({ text: 'Pre generovanie Contemplatio + Actio sú potrebné aj Meditatio a Oratio', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (mode === 'actio-only' && (!meditatioText || !oratioText || !contemplatioText)) {
      setMessage({ text: 'Pre generovanie Actio sú potrebné všetky predchádzajúce sekcie', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setGeneratingMode(mode);
    setMessage(null);

    try {
      const response = await fetch('/api/generate-partial-lectio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          biblia_text: bibliaText,
          lectio_text: lectioText,
          meditatio_text: meditatioText,
          oratio_text: oratioText,
          contemplatio_text: contemplatioText,
          suradnice_pismo: suradnicePismo,
          model: 'gpt-4o-mini', // Používame mini pre čiastočné generovanie
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (mode === 'contemplatio-actio') {
          onContemplatiooActioGenerated(result.data);
          setMessage({ 
            text: `✨ Vygenerované Contemplatio + Actio (${result.usage.tokens} tokenov)`, 
            type: 'success' 
          });
        } else {
          onActioGenerated(result.data);
          setMessage({ 
            text: `✨ Vygenerované Actio (${result.usage.tokens} tokenov)`, 
            type: 'success' 
          });
        }
        setTimeout(() => setMessage(null), 5000);
      } else {
        throw new Error(result.error || 'Neznáma chyba');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setMessage({ 
        text: error instanceof Error ? error.message : 'Chyba pri generovaní', 
        type: 'error' 
      });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setGeneratingMode(null);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-6 border-2 border-blue-200 shadow-md">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">⚡</span>
        <div>
          <h3 className="text-lg font-bold text-gray-800">
            Rýchle AI generovanie
          </h3>
          <p className="text-sm text-gray-600">
            Vygeneruj len chýbajúce sekcie na základe existujúceho obsahu
          </p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleGenerate('contemplatio-actio')}
          disabled={disabled || generatingMode !== null}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold"
        >
          {generatingMode === 'contemplatio-actio' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generujem...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span className="text-sm">Generovať Contemplatio + Actio</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleGenerate('actio-only')}
          disabled={disabled || generatingMode !== null}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-semibold"
        >
          {generatingMode === 'actio-only' ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Generujem...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span className="text-sm">Generovať len Actio</span>
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="mt-4 text-xs text-gray-600 space-y-1">
        <p className="flex items-start gap-2">
          <span>💡</span>
          <span><strong>Contemplatio + Actio:</strong> Potrebuje Bibliu, Lectio, Meditatio a Oratio</span>
        </p>
        <p className="flex items-start gap-2">
          <span>💡</span>
          <span><strong>Len Actio:</strong> Potrebuje všetky predchádzajúce sekcie vrátane Contemplatio</span>
        </p>
      </div>
    </div>
  );
}
