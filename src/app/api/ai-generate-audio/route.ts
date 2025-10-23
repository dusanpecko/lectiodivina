import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Voice mapping pre jednotlivé jazyky - použijeme rovnaké ako pre lectio-sources
const VOICE_MAPPING = {
  sk: {
    voice_id: "scOwDtmlUjD3prqpp97I", // Sam
    model: "eleven_v3",
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.2
  },
  cz: {
    voice_id: "scOwDtmlUjD3prqpp97I", // Sam
    model: "eleven_v3",
    stability: 0.4,
    similarity_boost: 0.85,
    style: 0.1
  },
  en: {
    voice_id: "21m00Tcm4TlvDq8ikWAM", // Rachel
    model: "eleven_v3",
    stability: 0.5,
    similarity_boost: 0.9,
    style: 0.0
  },
  de: {
    voice_id: "jsCqWAovK2LkecY7zXl4", // Freya
    model: "eleven_v3",
    stability: 0.6,
    similarity_boost: 0.8,
    style: 0.1
  },
  it: {
    voice_id: "XB0fDUnXU5powFXDhCwa", // Chiara
    model: "eleven_v3",
    stability: 0.5,
    similarity_boost: 0.85,
    style: 0.2
  },
  es: {
    voice_id: "6bNjXphfWPUDHuFkgDt3", // Efrayn
    model: "eleven_v3",
    stability: 0.5,
    similarity_boost: 0.8,
    style: 0.2
  },
  pt: {
    voice_id: "6bNjXphfWPUDHuFkgDt3", // Efrayn
    model: "eleven_v3",
    stability: 0.5,
    similarity_boost: 0.85,
    style: 0.15
  }
};

// Convert HTML to plain text for TTS
function htmlToPlainText(html: string): string {
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, ' ');
  
  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
  
  // Remove multiple spaces and trim
  text = text.replace(/\s+/g, ' ').trim();
  
  return text;
}

// Split text into chunks for long articles
function splitTextIntoChunks(text: string, maxChunkSize: number = 1500): string[] {
  if (text.length <= maxChunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let currentChunk = '';
  
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Generate filename for news audio
function generateAudioFilename(newsId: string, language: string): string {
  const timestamp = Date.now();
  return `news_${newsId}_${language}_${timestamp}.mp3`;
}

interface GenerateAudioRequest {
  newsId: string;
  title: string;
  content: string;
  language: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateAudioRequest = await req.json();
    const { newsId, title, content, language } = body;

    // Validation
    if (!newsId || !title || !content || !language) {
      return NextResponse.json(
        { error: "Chýbajú povinné parametre (newsId, title, content, language)" },
        { status: 400 }
      );
    }

    if (!process.env.ELEVENLABS_API_KEY) {
      return NextResponse.json(
        { error: "ElevenLabs API kľúč nie je nakonfigurovaný" },
        { status: 500 }
      );
    }

    const voiceConfig = VOICE_MAPPING[language as keyof typeof VOICE_MAPPING];
    
    if (!voiceConfig) {
      return NextResponse.json(
        { error: `Nepodporovaný jazyk: ${language}` },
        { status: 400 }
      );
    }

    // Convert HTML to plain text
    const plainTitle = htmlToPlainText(title);
    const plainContent = htmlToPlainText(content);
    
    // Combine title and content with pause
    const fullText = `${plainTitle}. ${plainContent}`;
    
    console.log(`🎙️ Generating audio for news article ${newsId} in ${language}`);
    console.log(`📝 Text length: ${fullText.length} characters`);

    // Split into chunks if needed
    const textChunks = splitTextIntoChunks(fullText, 1500);
    console.log(`📦 Processing ${textChunks.length} chunks`);
    
    const audioBuffers: Buffer[] = [];
    
    // Generate audio for each chunk
    for (let i = 0; i < textChunks.length; i++) {
      const chunk = textChunks[i];
      console.log(`🔄 Processing chunk ${i + 1}/${textChunks.length} (${chunk.length} chars)`);
      
      const ttsResponse = await fetch(
        `${ELEVENLABS_API_URL}/text-to-speech/${voiceConfig.voice_id}`,
        {
          method: "POST",
          headers: {
            Accept: "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": process.env.ELEVENLABS_API_KEY!,
          },
          body: JSON.stringify({
            text: chunk,
            model_id: voiceConfig.model,
            voice_settings: {
              stability: voiceConfig.stability,
              similarity_boost: voiceConfig.similarity_boost,
              style: voiceConfig.style,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!ttsResponse.ok) {
        const errorData = await ttsResponse.text();
        console.error("❌ ElevenLabs API error:", errorData);
        throw new Error(`ElevenLabs API error: ${ttsResponse.status}`);
      }

      const chunkBuffer = Buffer.from(await ttsResponse.arrayBuffer());
      audioBuffers.push(chunkBuffer);
      
      // Delay between chunks to avoid rate limiting
      if (i < textChunks.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Combine all audio buffers
    const audioBuffer = Buffer.concat(audioBuffers);
    
    if (!audioBuffer || audioBuffer.length === 0) {
      return NextResponse.json(
        { error: "Nepodarilo sa vygenerovať audio súbor" },
        { status: 500 }
      );
    }

    console.log(`✅ Audio generated: ${Math.round(audioBuffer.length / 1024)}KB`);

    // Upload to Supabase Storage
    const filename = generateAudioFilename(newsId, language);
    const filePath = `news/${filename}`;

    console.log(`☁️ Uploading to Supabase: ${filePath}`);

    const { error: uploadError } = await supabase.storage
      .from("audio-files")
      .upload(filePath, audioBuffer, {
        contentType: "audio/mpeg",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: `Chyba pri nahrávaní: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("audio-files")
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return NextResponse.json(
        { error: "Nepodarilo sa získať public URL" },
        { status: 500 }
      );
    }

    console.log(`🎉 Audio uploaded successfully: ${urlData.publicUrl}`);

    return NextResponse.json({
      audioUrl: urlData.publicUrl,
      filename: filename,
      language: language,
      voiceUsed: voiceConfig.voice_id,
      model: voiceConfig.model,
      fileSize: audioBuffer.length,
      textLength: fullText.length,
      chunksProcessed: textChunks.length,
      duration: Math.round((fullText.length / 15) * 1000) / 1000, // Estimate: ~15 chars per second
    });
  } catch (error) {
    console.error("❌ TTS Generation error:", error);
    
    const err = error as { status?: number; message?: string };

    if (err?.status === 401) {
      return NextResponse.json(
        { error: "Neplatný ElevenLabs API kľúč" },
        { status: 401 }
      );
    }
    
    if (err?.status === 429) {
      return NextResponse.json(
        { error: "Prekročený limit API požiadaviek. Skúste neskôr." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Chyba pri generovaní audio: " + (err?.message || "Neznáma chyba") },
      { status: 500 }
    );
  }
}
