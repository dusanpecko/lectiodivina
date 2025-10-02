import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Liturgické slovníky pre rôzne jazyky
const liturgicalTerms = {
  sk: {
    'Cezročné obdobie': 'Ordinary Time',
    'Pôstne obdobie': 'Lenten Season',
    'Veľkonočné obdobie': 'Easter Season',
    'Adventné obdobie': 'Advent Season',
    'Vianočné obdobie': 'Christmas Season'
  },
  en: {
    'Ordinary Time': 'Tiempo Ordinario',
    'Lenten Season': 'Cuaresma',
    'Easter Season': 'Tiempo Pascual',
    'Advent Season': 'Adviento',
    'Christmas Season': 'Navidad'
  }
};

// Rozoznanie liturgického obsahu
function isLiturgicalText(text: string): boolean {
  const liturgicalKeywords = [
    'nedeľa', 'pondelok', 'utorok', 'streda', 'štvrtok', 'piatok', 'sobota',
    'týždeň', 'obdobie', 'sviatko', 'sviatok', 'advent', 'pôst', 'veľkonoc', 'vianoce',
    'cezročné', 'liturgický', 'rok A', 'rok B', 'rok C'
  ];
  
  const lowerText = text.toLowerCase();
  return liturgicalKeywords.some(keyword => lowerText.includes(keyword));
}

// Vytvorenie špecializovaného promptu
function createPrompt(text: string, targetLanguage: string, fieldType?: string): string {
  const isLiturgical = isLiturgicalText(text);
  
  let basePrompt = '';
  
  if (isLiturgical || fieldType === 'hlava') {
    // Liturgický prompt
    basePrompt = `Preložte tento liturgický text do jazyka ${targetLanguage}.

DÔLEŽITÉ PRAVIDLÁ:
- Používajte oficiálnu liturgickú terminológiu katolíckej cirkvi v danom jazyku
- Zachovajte presné názvy liturgických období a sviatkov
- Rešpektujte tradičné katolícke výrazy
- Pre liturgické kalendárne výrazy použite oficiálne formulácie
- Čísla týždňov a dní preložte správne podľa liturgického kalendára

Príklady správnych prekladov:
- "Pondelok 26. týždňa v Cezročnom období" → EN: "Monday of the 26th Week in Ordinary Time"
- "Prvá nedeľa adventu" → EN: "First Sunday of Advent"
- "Veľký piatok" → EN: "Good Friday"

Pôvodný text: "${text}"

Preložený text:`;
  } else {
    // Štandardný teologický/duchovný prompt
    basePrompt = `Preložte tento náboženský/duchovný text do jazyka ${targetLanguage}.

PRAVIDLÁ:
- Zachovajte duchovný a teologický význam
- Používajte príslušnú náboženskú terminológiu
- Preklad má byť prirodzený a čitateľný
- Rešpektujte kontext lectio divina (čítanie, meditácia, modlitba)
- Pre biblické odkazy zachovajte štandardné skratky

Pôvodný text: "${text}"

Preložený text:`;
  }
  
  return basePrompt;
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, fieldType } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Text a cieľový jazyk sú povinné" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API kľúč nie je nakonfigurovaný" },
        { status: 500 }
      );
    }

    // Vytvor prompt na základe typu obsahu
    const prompt = createPrompt(text, targetLanguage, fieldType);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Používam gpt-4o-mini pre lepšiu efektivitu
      messages: [
        {
          role: "system",
          content: "Si expert na liturgické a náboženské preklady. Tvoja úloha je poskytovať presné a kontextovo správne preklady náboženských textov, liturgických názvov a duchovných obsahov. Vždy zachovávaj oficiálnu terminológiu katolíckej cirkvi."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.3, // Nižšia teplota pre konzistentnejšie preklady
    });

    const translatedText = completion.choices[0]?.message?.content?.trim();

    if (!translatedText) {
      return NextResponse.json(
        { error: "Nepodarilo sa získať preklad z OpenAI" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      translatedText,
      originalText: text,
      targetLanguage,
      isLiturgical: isLiturgicalText(text) || fieldType === 'hlava'
    });

  } catch (error: any) {
    console.error("Chyba pri preklade:", error);
    
    // Špecifické error handling pre OpenAI
    if (error?.status === 401) {
      return NextResponse.json(
        { error: "Neplatný OpenAI API kľúč" },
        { status: 401 }
      );
    }
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "Prekročený limit API požiadaviek. Skúste neskôr." },
        { status: 429 }
      );
    }
    
    if (error?.status === 503) {
      return NextResponse.json(
        { error: "OpenAI služba momentálne nie je dostupná" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Chyba pri preklade: " + (error?.message || "Neznáma chyba") },
      { status: 500 }
    );
  }
}