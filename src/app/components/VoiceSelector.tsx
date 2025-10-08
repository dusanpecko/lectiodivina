import React, { useState } from 'react';

// Dostupné hlasy z ElevenLabs
const AVAILABLE_VOICES = [
  { id: "scOwDtmlUjD3prqpp97I", name: "Sam", description: "Muž - univerzálny (predvolený)", gender: "male", languages: "všetky" },
  { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", description: "Žena - anglický prízvuk", gender: "female", languages: "en" },
  { id: "jsCqWAovK2LkecY7zXl4", name: "Freya", description: "Žena - nemecký prízvuk", gender: "female", languages: "de" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Chiara/Charlotte", description: "Žena - taliančina/francúzština", gender: "female", languages: "it, fr" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella", description: "Žena - španielčina/portugalčina", gender: "female", languages: "es, pt" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", description: "Muž - maďarčina", gender: "male", languages: "hu" }
];

// Dostupné modely
const AVAILABLE_MODELS = [
  { id: "eleven_v3", name: "Eleven V3", description: "Najnovší model (predvolený)", quality: "highest" },
  { id: "eleven_multilingual_v2", name: "Multilingual V2", description: "Viacejazyčný model", quality: "high" },
  { id: "eleven_multilingual_v1", name: "Multilingual V1", description: "Starší viacejazyčný", quality: "medium" },
  { id: "eleven_monolingual_v1", name: "Monolingual V1", description: "Jednojazyčný model", quality: "medium" }
];

interface VoiceSelectorProps {
  selectedVoiceId: string;
  selectedModel: string;
  onVoiceChange: (voiceId: string) => void;
  onModelChange: (model: string) => void;
  language?: string;
  className?: string;
}

export default function VoiceSelector({
  selectedVoiceId = "scOwDtmlUjD3prqpp97I", // Sam ako predvolený
  selectedModel = "eleven_v3", // V3 ako predvolený
  onVoiceChange,
  onModelChange,
  language = 'sk',
  className = ""
}: VoiceSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const selectedVoice = AVAILABLE_VOICES.find(v => v.id === selectedVoiceId) || AVAILABLE_VOICES[0];
  const selectedModelInfo = AVAILABLE_MODELS.find(m => m.id === selectedModel) || AVAILABLE_MODELS[0];

  // Filter voices that are recommended for the current language
  const getRecommendedVoices = () => {
    if (!language) return AVAILABLE_VOICES;
    
    return AVAILABLE_VOICES.filter(voice => 
      voice.languages === "všetky" || 
      voice.languages.includes(language) ||
      language === 'sk' // Sam je najlepší pre slovenčinu
    );
  };

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            🎭 Nastavenia hlasu a modelu
          </h3>
          <div className="text-xs text-gray-600">
            <div><strong>Hlas:</strong> {selectedVoice.name} - {selectedVoice.description}</div>
            <div><strong>Model:</strong> {selectedModelInfo.name} - {selectedModelInfo.description}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={toggleExpanded}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {isExpanded ? '▼ Skryť' : '▶ Zmeniť'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
          {/* Voice Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Výber hlasu:
            </label>
            <div className="space-y-2">
              {getRecommendedVoices().map((voice) => (
                <label
                  key={voice.id}
                  className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="voice"
                    value={voice.id}
                    checked={selectedVoiceId === voice.id}
                    onChange={(e) => onVoiceChange(e.target.value)}
                    className="mr-3 text-blue-600"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <span className="font-medium text-sm">
                        {voice.name}
                      </span>
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        voice.gender === 'male' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-pink-100 text-pink-800'
                      }`}>
                        {voice.gender === 'male' ? '👨' : '👩'}
                      </span>
                      {voice.id === "scOwDtmlUjD3prqpp97I" && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                          Predvolený
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {voice.description} • Jazyky: {voice.languages}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Výber modelu:
            </label>
            <div className="space-y-2">
              {AVAILABLE_MODELS.map((model) => (
                <label
                  key={model.id}
                  className="flex items-center p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="model"
                    value={model.id}
                    checked={selectedModel === model.id}
                    onChange={(e) => onModelChange(e.target.value)}
                    className="mr-3 text-blue-600"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <span className="font-medium text-sm">
                        {model.name}
                      </span>
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        model.quality === 'highest' 
                          ? 'bg-green-100 text-green-800'
                          : model.quality === 'high'
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {model.quality === 'highest' ? '⭐ Najlepší' : 
                         model.quality === 'high' ? '👍 Dobrý' : '👌 Základný'}
                      </span>
                      {model.id === "eleven_v3" && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                          Predvolený
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      {model.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
            <strong>💡 Tip:</strong> Hlas "Sam" a model "Eleven V3" sú predvolené pre všetky jazyky a poskytujú najlepšiu kvalitu.
          </div>
        </div>
      )}
    </div>
  );
}