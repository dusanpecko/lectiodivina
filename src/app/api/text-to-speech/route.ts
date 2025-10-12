import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Direct fetch approach since ElevenLabs SDK has compatibility issues
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

// Initialize Supabase client with service role key for file uploads
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Voice mapping pre jednotlivé jazyky s ElevenLabs v3 podporou
const VOICE_MAPPING = {
  // Slovenčina - Sam (najlepší pre slovenčinu) - správne voice ID
  sk: {
    voice_id: "scOwDtmlUjD3prqpp97I", // Sam - správne ID
    model: "eleven_v3", // v3 model pre profesionálnejší zvuk
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.2
  },
  // Čeština - Sam (dobre funguje aj pre češtinu)  
  cz: {
    voice_id: "scOwDtmlUjD3prqpp97I", // Sam - správne ID
    model: "eleven_v3",
    stability: 0.4,
    similarity_boost: 0.85,
    style: 0.1
  },
  // Angličtina - Rachel (natural female voice)
  en: {
    voice_id: "21m00Tcm4TlvDq8ikWAM", // Rachel
    model: "eleven_v3", // v3 model pre profesionálnejší zvuk
    stability: 0.5,
    similarity_boost: 0.9,
    style: 0.0
  },
  // Nemčina - Freya (German female)
  de: {
    voice_id: "jsCqWAovK2LkecY7zXl4", // Freya 
    model: "eleven_v3",
    stability: 0.6,
    similarity_boost: 0.8,
    style: 0.1
  },
  // Taliančina - Chiara (Italian female)
  it: {
    voice_id: "XB0fDUnXU5powFXDhCwa", // Chiara
    model: "eleven_v3",
    stability: 0.5,
    similarity_boost: 0.85,
    style: 0.2
  },
  // Francúzština - Charlotte (French female)
  fr: {
    voice_id: "XB0fDUnXU5powFXDhCwa", // Charlotte
    model: "eleven_v3", 
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.15
  },
  // Španielčina - Bella (Spanish female)
  es: {
    voice_id: "EXAVITQu4vr4xnSDxMaL", // Bella
    model: "eleven_v3",
    stability: 0.4,
    similarity_boost: 0.9,
    style: 0.2
  },
  // Portugalčina - Bella (works for PT too)
  pt: {
    voice_id: "EXAVITQu4vr4xnSDxMaL", // Bella
    model: "eleven_v3",
    stability: 0.5,
    similarity_boost: 0.85,
    style: 0.15
  },
  // Poľština - Sam (Sam handles Polish well)
  pl: {
    voice_id: "scOwDtmlUjD3prqpp97I", // Sam - správne ID
    model: "eleven_v3",
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.1
  },
  // Maďarčina - Daniel (male voice for Hungarian)
  hu: {
    voice_id: "onwK4e9ZLuTAKqWW03F9", // Daniel
    model: "eleven_v3",
    stability: 0.6,
    similarity_boost: 0.75,
    style: 0.1
  },
  // Chorvátčina - Sam (Sam handles Slavic languages well)
  hr: {
    voice_id: "scOwDtmlUjD3prqpp97I", // Sam - správne ID
    model: "eleven_v3",
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.15
  }
};

// Helper function to detect language from text or use provided language
function detectLanguage(text: string, providedLang?: string): string {
  if (providedLang && VOICE_MAPPING[providedLang as keyof typeof VOICE_MAPPING]) {
    return providedLang;
  }
  
  // Simple language detection based on common words
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('lectio') || lowerText.includes('meditatio') || lowerText.includes('biblia')) {
    return 'sk'; // Default to Slovak for liturgical content
  }
  
  // More sophisticated detection could be added here
  return 'sk'; // Default fallback
}

// Text chunking for long texts - split by sentences at reasonable points
function splitTextIntoChunks(text: string, maxChunkSize: number = 1500): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let currentChunk = '';
  
  // Split by sentences (. ! ?)
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  for (const sentence of sentences) {
    // If adding this sentence would exceed limit, save current chunk and start new one
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Generate unique filename
function generateAudioFilename(lectioId: string, fieldName: string, language: string): string {
  const timestamp = Date.now();
  const sanitizedField = fieldName.replace(/[^a-zA-Z0-9_]/g, '_');
  return `${lectioId}/${sanitizedField}_${language}_${timestamp}.mp3`;
}

export async function POST(request: NextRequest) {
  try {
    const { text, language, lectioId, fieldName, voice_id, model } = await request.json();

    // Validation
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text je povinný parameter" },
        { status: 400 }
      );
    }

    if (!lectioId || !fieldName) {
      return NextResponse.json(
        { error: "lectioId a fieldName sú povinné parametre" },
        { status: 400 }
      );
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "ElevenLabs API kľúč nie je nakonfigurovaný" },
        { status: 500 }
      );
    }

    // Detect or validate language
    const detectedLang = detectLanguage(text, language);
    const defaultVoiceConfig = VOICE_MAPPING[detectedLang as keyof typeof VOICE_MAPPING];
    
    if (!defaultVoiceConfig) {
      return NextResponse.json(
        { error: `Nepodporovaný jazyk: ${detectedLang}` },
        { status: 400 }
      );
    }

    // Use custom voice_id and model if provided, otherwise use defaults
    const voiceConfig = {
      voice_id: voice_id || "scOwDtmlUjD3prqpp97I", // Sam ako predvolený
      model: model || "eleven_v3", // v3 ako predvolený
      stability: defaultVoiceConfig.stability,
      similarity_boost: defaultVoiceConfig.similarity_boost,
      style: defaultVoiceConfig.style
    };

    // Split text into chunks if too long (helps with timeouts and ElevenLabs limits)
    const textChunks = splitTextIntoChunks(text.trim(), 1500);
    console.log(`Generating audio for language: ${detectedLang} with voice: ${voiceConfig.voice_id}, chunks: ${textChunks.length}`);
    
    const audioBuffers: Buffer[] = [];
    
    // Generate audio for each chunk
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      console.log(`Processing chunk ${i + 1}/${textChunks.length}, length: ${chunk.length} chars`);
      
      const ttsResponse = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceConfig.voice_id}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
        body: JSON.stringify({
          text: chunk,
          model_id: voiceConfig.model,
          voice_settings: {
            stability: voiceConfig.stability,
            similarity_boost: voiceConfig.similarity_boost,
            style: voiceConfig.style || 0,
            use_speaker_boost: true
          }
        })
      });

      if (!ttsResponse.ok) {
        const errorData = await ttsResponse.text();
        console.error("ElevenLabs API error:", errorData);
        throw new Error(`ElevenLabs API error: ${ttsResponse.status} - ${errorData}`);
      }

      // Convert response to buffer and store
      const chunkBuffer = Buffer.from(await ttsResponse.arrayBuffer());
      audioBuffers.push(chunkBuffer);
      
      // Small delay between chunks to avoid rate limiting
      if (i < textChunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Combine all audio buffers into one
    const audioBuffer = Buffer.concat(audioBuffers);
    
    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json(
        { error: "Nepodarilo sa vygenerovať audio súbor" },
        { status: 500 }
      );
    }

    // Generate filename and path
    const filename = generateAudioFilename(lectioId, fieldName, detectedLang);
    const storagePath = `audio-files/lectio/${filename}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(`lectio/${filename}`, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: `Chyba pri nahrávaní do storage: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('audio-files')
      .getPublicUrl(`lectio/${filename}`);

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { error: "Nepodarilo sa získať public URL pre audio súbor" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      audioUrl: urlData.publicUrl,
      filename: filename,
      language: detectedLang,
      voiceUsed: voiceConfig.voice_id,
      model: voiceConfig.model,
      fileSize: audioBuffer.length,
      textLength: text.length,
      chunksProcessed: textChunks.length,
      storagePath: uploadData.path
    });

  } catch (error: any) {
    console.error("TTS Generation error:", error);

    // Handle specific ElevenLabs errors
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "Neplatný ElevenLabs API kľúč" },
        { status: 401 }
      );
    }
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Prekročený limit API požiadaviek ElevenLabs. Skúste neskôr." },
        { status: 429 }
      );
    }

    if (error?.status === 422) {
      return NextResponse.json(
        { error: "Neplatný text alebo parametre pre TTS generáciu" },
        { status: 422 }
      );
    }
    
    return NextResponse.json(
      { error: "Chyba pri generovaní audio: " + (error?.message || "Neznáma chyba") },
      { status: 500 }
    );
  }
}