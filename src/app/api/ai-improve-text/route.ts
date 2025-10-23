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

interface ImproveTextRequest {
  text: string;
  lang: keyof typeof LANGUAGES;
  type?: "title" | "content";
}

export async function POST(req: NextRequest) {
  try {
    const body: ImproveTextRequest = await req.json();
    const { text, lang, type = "content" } = body;

    if (!text || !lang) {
      return NextResponse.json(
        { error: "Chýba text alebo jazyk" },
        { status: 400 }
      );
    }

    const langName = LANGUAGES[lang];

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "title") {
      // Vylepšenie nadpisu
      systemPrompt = `Si expert na tvorbu výstižných, SEO-optimalizovaných nadpisov pre kresťanské a teologické články.
Tvoja úloha je vytvoriť lepší, pútavejší nadpis v jazyku: ${langName}.`;

      userPrompt = `Vylepši tento nadpis v jazyku ${langName}:

"${text}"

Požiadavky:
- Musí byť výstižný a pútavý
- Zachovať duchovný a teologický charakter
- Jazyk: ${langName}
- Optimalizovaný pre vyhľadávače (SEO)
- Ideálna dĺžka: 40-60 znakov

Vráť iba vylepšený nadpis, bez úvodzoviek a bez dodatočného textu.`;
    } else {
      // Vylepšenie obsahu
      systemPrompt = `Si expert na editáciu a vylepšovanie kresťanských a teologických textov.
Tvoja úloha je vylepšiť text v jazyku: ${langName}.

Čo robíš:
- Opravíš gramatické chyby
- Zlepšíš formulácie a plynulosť textu
- Pridáš duchovnú hĺbku tam, kde chýba
- Zachováš pôvodnú štruktúru a HTML formátovanie
- Pridáš biblické odkazy tam, kde je to vhodné (vo formáte: napr. Ján 3:16)`;

      userPrompt = `Vylepši tento text v jazyku ${langName}:

${text}

Požiadavky:
- Zachovaj HTML formátovanie (<h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>)
- Oprav gramatické chyby
- Zlepši formulácie
- Zachovaj pôvodnú dĺžku (približne)
- Jazyk: ${langName}

Vráť iba vylepšený HTML text, bez dodatočných komentárov.`;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
    });

    const improvedText = completion.choices[0].message.content;
    if (!improvedText) {
      throw new Error("AI nevrátila vylepšený text");
    }

    return NextResponse.json({
      improvedText: improvedText.trim(),
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
    });
  } catch (error) {
    console.error("Chyba pri vylepšovaní textu:", error);
    const errorMessage = error instanceof Error ? error.message : "Chyba pri vylepšovaní textu";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
