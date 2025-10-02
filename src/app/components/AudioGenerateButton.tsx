import React, { useState, useRef } from 'react';

interface AudioGenerateButtonProps {
  text: string;
  language?: string;
  lectioId: string | number;
  fieldName: string;
  currentAudioUrl?: string;
  onAudioGenerated: (audioUrl: string) => void;
  disabled?: boolean;
  className?: string;
}

interface AudioGenerationResult {
  audioUrl: string;
  filename: string;
  language: string;
  voiceUsed: string;
  model: string;
  fileSize: number;
  textLength: number;
}

export default function AudioGenerateButton({
  text,
  language = 'sk',
  lectioId,
  fieldName,
  currentAudioUrl,
  onAudioGenerated,
  disabled = false,
  className = ""
}: AudioGenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationResult, setGenerationResult] = useState<AudioGenerationResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGenerate = async () => {
    if (!text.trim()) {
      setError("Žiadny text na konverziu");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationResult(null);

    try {
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          language,
          lectioId: lectioId.toString(),
          fieldName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Chyba ${response.status}`);
      }

      setGenerationResult(data);
      onAudioGenerated(data.audioUrl);
      setShowPreview(true);
      
    } catch (error: any) {
      console.error('Audio generation error:', error);
      setError(error.message || 'Chyba pri generovaní audio');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
    if (showPreview && audioRef.current) {
      audioRef.current.pause();
    }
  };

  const isTextEmpty = !text || text.trim().length === 0;
  const hasAudio = currentAudioUrl || generationResult?.audioUrl;
  const textLength = text?.length || 0;
  const estimatedSeconds = Math.ceil(textLength / 10); // Roughly 10 chars per second speech

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={disabled || isTextEmpty || isGenerating}
          className={`
            inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg border
            ${isTextEmpty 
              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
              : hasAudio
                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500'
                : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500'
            }
            ${disabled || isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
            ${className}
          `}
          title={
            isTextEmpty 
              ? "Najprv zadajte text" 
              : hasAudio 
                ? "Pregenerovať audio" 
                : "Generovať audio súbor"
          }
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
              Generujem...
            </>
          ) : (
            <>
              <span className="mr-2">
                {hasAudio ? '🔄' : '🎵'}
              </span>
              {hasAudio ? 'Pregenerovať' : 'Generovať audio'}
            </>
          )}
        </button>

        {hasAudio && (
          <button
            type="button"
            onClick={togglePreview}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <span className="mr-1">
              {showPreview ? '🔇' : '🎧'}
            </span>
            {showPreview ? 'Skryť' : 'Prehrať'}
          </button>
        )}
      </div>

      {/* Text info */}
      {!isTextEmpty && (
        <div className="mt-1 text-xs text-gray-500">
          {textLength} znakov • ~{estimatedSeconds}s reči
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          <div className="flex items-start">
            <span className="mr-2">❌</span>
            <div>
              <div className="font-semibold">Chyba generovania:</div>
              <div>{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Generation result info */}
      {generationResult && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
          <div className="flex items-start">
            <span className="mr-2">✅</span>
            <div>
              <div className="font-semibold">Audio vygenerované</div>
              <div className="grid grid-cols-2 gap-1 text-xs mt-1">
                <div>Jazyk: {generationResult.language.toUpperCase()}</div>
                <div>Model: {generationResult.model}</div>
                <div>Hlas: {generationResult.voiceUsed.slice(0, 8)}...</div>
                <div>Veľkosť: {Math.round(generationResult.fileSize / 1024)}KB</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audio preview */}
      {showPreview && hasAudio && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-blue-800">
              🎧 Audio náhľad
            </span>
            <button
              type="button"
              onClick={togglePreview}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ✕
            </button>
          </div>
          
          <audio
            ref={audioRef}
            controls
            className="w-full"
            src={generationResult?.audioUrl || currentAudioUrl}
            preload="metadata"
          >
            <source 
              src={generationResult?.audioUrl || currentAudioUrl} 
              type="audio/mpeg" 
            />
            Váš prehliadač nepodporuje prehrávanie audio súborov.
          </audio>
          
          {generationResult && (
            <div className="mt-2 text-xs text-blue-600">
              <div>Súbor: {generationResult.filename}</div>
              <div>URL: {generationResult.audioUrl}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}