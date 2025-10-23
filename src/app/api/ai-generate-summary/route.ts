import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Jazyky
const LANGUAGES = {
  sk: "slovenčina",
  cz: "čeština",
  en: "angličtina",
  es: "španielčina",
  it: "taliančina",
  pt: "portugalčina",
  de: "nemčina",
};

interface GenerateSummaryRequest {
  content: string;
  lang: keyof typeof LANGUAGES;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateSummaryRequest = await req.json();
    const { content, lang } = body;

    if (!content || !lang) {
      return NextResponse.json(
        { error: "Chýba obsah alebo jazyk" },
        { status: 400 }
      );
    }

    // Odstránenie HTML tagov pre lepšiu analýzu
    const plainText = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

    if (plainText.length < 100) {
      return NextResponse.json(
        { error: "Obsah článku je príliš krátky na vytvorenie súhrnu" },
        { status: 400 }
      );
    }

    const langName = LANGUAGES[lang];

    const systemPrompt = `Si expert na tvorbu stručných, výstižných súhrnov článkov. 
Tvoja úloha je vytvoriť krátky súhrn (150-200 slov) v jazyku: ${langName}.
Súhrn musí byť formátovaný pomocou HTML tagov: <p>, <strong>, <em>.`;

    const userPrompt = `Vytvor stručný súhrn tohto článku v jazyku ${langName}:

${plainText.substring(0, 3000)} ${plainText.length > 3000 ? "..." : ""}

Požiadavky:
- Dĺžka: 150-200 slov
- Jazyk: ${langName}
- Formát: HTML (použiť <p>, <strong>, <em>)
- Zachyť hlavné myšlienky a posolstvo článku

Vráť iba HTML text súhrnu, bez JSON obalov.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const summary = completion.choices[0].message.content;
    if (!summary) {
      throw new Error("AI nevrátila súhrn");
    }

    return NextResponse.json({
      summary: summary.trim(),
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
    });
  } catch (error) {
    console.error("Chyba pri generovaní súhrnu:", error);
    const errorMessage = error instanceof Error ? error.message : "Chyba pri generovaní súhrnu";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
