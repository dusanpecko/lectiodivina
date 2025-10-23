import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import sharp from "sharp";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Mapovanie typov článkov na kresťanskú symboliku
const ARTICLE_SYMBOLISM = {
  biblical_commentary: "open Bible book with glowing pages, gentle divine light rays from above, peaceful reading atmosphere",
  lectio_divina_practice: "praying hands silhouette, peaceful path leading upward, contemplative prayer scene with heavenly light",
  theological_article: "cathedral window shapes, architectural church elements, balanced composition with wisdom and faith theme",
  spiritual_meditation: "kneeling figure in prayer, gentle heavenly light beams, peaceful Christian contemplation scene with ethereal glow",
  church_history: "ancient church building silhouettes, historical cathedral shapes, timeline with Gothic architecture elements",
  sacraments_liturgy: "altar table shape, communion chalice silhouette, baptismal font, liturgical candles, sacred ritual elements",
  lectio_news: "church bell tower, announcement scroll, modern faith community symbols, news and updates theme",
};

interface GenerateImageRequest {
  topic: string;
  articleType: keyof typeof ARTICLE_SYMBOLISM;
  customPrompt?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateImageRequest = await req.json();
    const { topic, articleType, customPrompt } = body;

    if (!topic || !articleType) {
      return NextResponse.json(
        { error: "Chýba téma alebo typ článku" },
        { status: 400 }
      );
    }

    // Vytvorenie AI promptu pre DALL-E
    const symbolism = ARTICLE_SYMBOLISM[articleType];
    
    const imagePrompt = customPrompt || `Create a minimalist, contemplative illustration for: "${topic}"

Visual style:
- Clean vector art with flat geometric shapes
- 16:9 landscape format
- Rounded corners on all elements
- Single focal point centered
- 30-40% empty negative space
- Soft, barely visible shadows
- Calm, balanced composition

Color scheme (use ONLY these):
- Deep purple-blue: #4A5085
- Soft grey-lavender: #686EA3  
- Pale lilac background: #EDE7F6
- Dark purple accents: #181225 and #241A35
- White highlights
- Only use gentle tints and shades of these exact colors

Visual elements: ${symbolism}

Design rules:
- Maximum 3-4 main geometric shapes
- Center the focal element
- Abundant breathing space around objects
- Abstract and symbolic representation only
- No text, no detailed faces, no realistic imagery
- Simple geometric forms with smooth edges

Atmosphere: Peaceful, contemplative, modern minimalism, timeless elegance

Style inspiration: Contemporary flat design, geometric abstraction, clean editorial illustration`;

    console.log("🎨 Generating image with DALL-E 3...");
    
    // Generovanie obrázka pomocou DALL-E 3
    const dalleResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1792x1024", // 16:9 formát
      quality: "standard", // "standard" alebo "hd" - standard je lacnejší
      style: "vivid", // "vivid" alebo "natural"
    });

    const dalleImageUrl = dalleResponse.data?.[0]?.url;
    if (!dalleImageUrl) {
      throw new Error("DALL-E nevrátila URL obrázka");
    }

    console.log("✅ DALL-E image generated:", dalleImageUrl);

    // Stiahnutie obrázka z DALL-E
    const imageResponse = await fetch(dalleImageUrl);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

    console.log("🔄 Converting to WebP and optimizing...");

    // Konverzia na WebP a optimalizácia pomocou Sharp
    const webpBuffer = await sharp(imageBuffer)
      .resize(1920, 1080, { // 16:9 formát, Full HD
        fit: "cover",
        position: "center",
      })
      .webp({
        quality: 85, // Dobrá rovnováha medzi kvalitou a veľkosťou
        effort: 6, // Vyššie číslo = lepšia kompresia (0-6)
      })
      .toBuffer();

    console.log(`📦 Original size: ${imageBuffer.length} bytes`);
    console.log(`📦 WebP size: ${webpBuffer.length} bytes`);
    console.log(`💾 Size reduction: ${Math.round((1 - webpBuffer.length / imageBuffer.length) * 100)}%`);

    // Upload do Supabase Storage
    const fileName = `ai-generated-${Date.now()}-${Math.random().toString(36).substring(7)}.webp`;
    const filePath = `images/${fileName}`;

    console.log("☁️ Uploading to Supabase storage...");

    const { error: uploadError } = await supabase.storage
      .from("news")
      .upload(filePath, webpBuffer, {
        contentType: "image/webp",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Supabase upload error:", uploadError);
      throw new Error(`Chyba pri nahrávaní do Supabase: ${uploadError.message}`);
    }

    // Získanie verejnej URL
    const { data: publicUrlData } = supabase.storage
      .from("news")
      .getPublicUrl(filePath);

    const finalImageUrl = publicUrlData.publicUrl;

    console.log("✅ Image uploaded successfully:", finalImageUrl);

    return NextResponse.json({
      imageUrl: finalImageUrl,
      prompt: imagePrompt,
      dalleUrl: dalleImageUrl,
      fileName: fileName,
      filePath: filePath,
      size: {
        original: imageBuffer.length,
        webp: webpBuffer.length,
        reduction: Math.round((1 - webpBuffer.length / imageBuffer.length) * 100),
      },
    });
  } catch (error) {
    console.error("❌ Error generating image:", error);
    const errorMessage = error instanceof Error ? error.message : "Chyba pri generovaní obrázka";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
