"use client";

import { Sparkles, Zap } from "lucide-react";
import { useState } from "react";

interface LectioAIGeneratorProps {
  bibliaText: string;
  suradnicePismo: string;
  onGenerated: (data: {
    lectio: string;
    meditatio: string;
    oratio: string;
    contemplatio: string;
  }) => void;
  disabled?: boolean;
}

export default function LectioAIGenerator({
  bibliaText,
  suradnicePismo,
  onGenerated,
  disabled = false,
}: LectioAIGeneratorProps) {
  const [sourceMaterial, setSourceMaterial] = useState("");
  const [generating, setGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gpt-4o' | 'gpt-4o-mini'>('gpt-4o');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleGenerate = async () => {
    if (!bibliaText && !sourceMaterial) {
      setMessage({ text: 'Zadajte biblický text alebo zdrojový materiál', type: 'error' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setGenerating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/generate-lectio-divina', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_material: sourceMaterial,
          perikopa_ref: suradnicePismo,
          perikopa_text: bibliaText,
          model: selectedModel,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onGenerated(result.data);
        setMessage({ 
          text: `✨ Vygenerované s ${selectedModel} (${result.usage.tokens} tokenov)`, 
          type: 'success' 
        });
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
      setGenerating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border-2 border-purple-200 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="text-3xl mr-3">🤖</span>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              AI Generátor Lectio Divina
            </h3>
            <p className="text-sm text-gray-600">
              Automatické spracovanie biblického textu s OpenAI GPT-4o
            </p>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Model AI
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSelectedModel('gpt-4o')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              selectedModel === 'gpt-4o'
                ? 'border-purple-500 bg-purple-50 text-purple-800'
                : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles size={18} />
              <div className="text-left">
                <div className="font-bold">GPT-4o</div>
                <div className="text-xs opacity-75">Najlepšia kvalita</div>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setSelectedModel('gpt-4o-mini')}
            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
              selectedModel === 'gpt-4o-mini'
                ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Zap size={18} />
              <div className="text-left">
                <div className="font-bold">GPT-4o Mini</div>
                <div className="text-xs opacity-75">Rýchlejší & lacnejší</div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Source Material Input */}
      <div className="space-y-2 mb-4">
        <label className="block text-sm font-semibold text-gray-700">
          Zdrojový materiál (voliteľné)
          <span className="text-xs font-normal text-gray-500 ml-2">
            Zadajte dodatočný text, komentár alebo úvahy na spracovanie
          </span>
        </label>
        <textarea
          value={sourceMaterial}
          onChange={(e) => setSourceMaterial(e.target.value)}
          disabled={disabled || generating}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none disabled:bg-gray-50"
          placeholder="Vložte text s komentármi, úvahami alebo dodatočný biblický text..."
          rows={6}
        />
        <p className="text-xs text-gray-500">
          💡 Tip: Biblický text z poľa &quot;biblia_1&quot; sa automaticky použije. Sem môžete pridať komentáre, úvahy alebo dodatočný kontext.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-white rounded-lg p-4 mb-4 border border-purple-200">
        <p className="text-sm text-gray-700">
          <strong>Automaticky sa použije:</strong>
        </p>
        <ul className="text-sm text-gray-600 mt-2 space-y-1">
          <li>📖 <strong>Biblický text:</strong> {bibliaText ? `${bibliaText.substring(0, 50)}...` : 'Nie je zadaný'}</li>
          <li>📍 <strong>Súradnice:</strong> {suradnicePismo || 'Nie je zadané'}</li>
        </ul>
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

      {/* Generate Button */}
      <button
        type="button"
        onClick={handleGenerate}
        disabled={disabled || generating || (!bibliaText && !sourceMaterial)}
        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 font-semibold text-lg"
      >
        {generating ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Generujem s {selectedModel}...
          </>
        ) : (
          <>
            <Sparkles size={22} />
            Generovať Lectio Divina
          </>
        )}
      </button>

      <p className="text-xs text-center text-gray-500 mt-3">
        AI vygeneruje všetky 4 sekcie: Lectio, Meditatio (+ 2 reflexné otázky), Oratio, Contemplatio
      </p>
    </div>
  );
}
