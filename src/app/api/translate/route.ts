import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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

// Mapa kódov jazykov na názvy
const languageNames: Record<string, string> = {
  'en': 'angličtina',
  'cs': 'čeština',
  'es': 'španielčina',
  'de': 'nemčina',
  'it': 'taliančina',
  'fr': 'francúzština',
  'pt': 'portugalčina',
  'pl': 'poľština',
  'hu': 'maďarčina',
  'hr': 'chorvátčina'
};

// Vytvorenie špecializovaného promptu
function createPrompt(text: string, targetLanguageCode: string, fieldType?: string, sourceLanguageCode?: string): string {
  const isLiturgical = isLiturgicalText(text) || fieldType === 'liturgical';
  const targetLanguageName = languageNames[targetLanguageCode] || targetLanguageCode;
  
  let basePrompt = '';
  
  // Špeciálny handling pre česko-slovenský liturgický preklad
  if (isLiturgical && sourceLanguageCode === 'cs' && targetLanguageCode === 'sk') {
    basePrompt = `Preložte tento ČESKÝ liturgický text do SLOVENČINY podľa pravidiel katolíckej cirkvi.

DÔLEŽITÉ PRAVIDLÁ PRE ČESKO-SLOVENSKÝ PREKLAD:
1. Dodržujte slovenské liturgické pravidlá:
   - "neděle" → "nedeľa"
   - "pondělí" → "pondelok"
   - "úterý" → "utorok"
   - "středa" → "streda"
   - "čtvrtek" → "štvrtok"
   - "pátek" → "piatok"
   - "sobota" → "sobota"

2. Poradie slov v slovenčine:
   - "1. neděle postní" → "1. pôstna nedeľa"
   - "Pondělí po 1. neděli postní" → "Pondelok po 1. pôstnej nedeli"
   - "2. týden v Cezročním období" → "2. týždeň v Cezročnom období"

3. Liturgické obdobia - VŽDY používajte plný slovenský názov:
   - "postní" → "pôstna/pôstne/pôstnej" (podľa pádu)
   - "velikonoční" → "veľkonočná/veľkonočné/veľkonočnej"
   - "adventní" → "adventná/adventné/adventnej"
   
   KRITICKY DÔLEŽITÉ - Cezročné obdobie:
   - "v Cezročním období" → "v Cezročnom období" (NIKDY nie "v medziobdobí")
   - "Cezročním období" → "Cezročnom období" (NIKDY nie "medziobdobí")
   - "1. týden v Cezročním období" → "1. týždeň v Cezročnom období"
   - "Středa 2. týdne v Cezročním období" → "Streda 2. týždňa v Cezročnom období"
   - Cezročné obdobie je OFICIÁLNY slovenský liturgický termín

4. Sviatky:
   - "Narození Páně" → "Narodenie Pána"
   - "Zjevení Páně" → "Zjavenie Pána"
   - "Nanebevstoupení Páně" → "Nanebovstúpenie Pána"

KONKRÉTNE PRÍKLADY CELÝCH PREKLADOV:
✓ "Středa 1. týdne v Cezročním období" → "Streda 1. týždňa v Cezročnom období"
✓ "Pátek 10. týdne v Cezročním období" → "Piatok 10. týždňa v Cezročnom období"  
✓ "2. neděle v Cezročním období" → "2. nedeľa v Cezročnom období"
✗ NEPOUŽÍVAŤ: "medziobdobie", "v medziobdobí" - toto je NESPRÁVNE

VRÁTITE VÝHRADNE PRELOŽENÝ TEXT BEZ PREFIXOV, ÚVODZOVIEK ALEBO VYSVETLENÍ.

Preložte: "${text}"`;
  } else if (isLiturgical || fieldType === 'hlava') {
    // Liturgický prompt
    basePrompt = `Preložte tento liturgický text do jazyka ${targetLanguageName}.

DÔLEŽITÉ PRAVIDLÁ:
- Používajte oficiálnu liturgickú terminológiu katolíckej cirkvi v danom jazyku
- Zachovajte presné názvy liturgických období a sviatkov
- Rešpektujte tradičné katolícke výrazy
- Pre liturgické kalendárne výrazy použite oficiálne formulácie
- Čísla týždňov a dní preložte správne podľa liturgického kalendára
- VRÁTITE VÝHRADNE PRELOŽENÝ TEXT BEZ AKÝCHKOĽVEK PREFIXOV ALEBO ÚVODZOVIEK

Príklady správnych prekladov:
- "Pondelok 26. týždňa v Cezročnom období" → Monday of the 26th Week in Ordinary Time
- "Prvá nedeľa adventu" → First Sunday of Advent
- "Veľký piatok" → Good Friday

Preložte: "${text}"`;
  } else {
    // Štandardný teologický/duchovný prompt
    basePrompt = `Preložte tento náboženský/duchovný text do jazyka ${targetLanguageName}.

PRAVIDLÁ:
- Zachovajte duchovný a teologický význam
- Používajte príslušnú náboženskú terminológiu
- Preklad má byť prirodzený a čitateľný
- Rešpektujte kontext lectio divina (čítanie, meditácia, modlitba)
- Pre biblické odkazy zachovajte štandardné skratky
- VRÁTITE VÝHRADNE PRELOŽENÝ TEXT BEZ AKÝCHKOĽVEK PREFIXOV ALEBO ÚVODZOVIEK

Preložte: "${text}"`;
  }
  
  return basePrompt;
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLanguage, fieldType, sourceLanguage } = await request.json();

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
    const prompt = createPrompt(text, targetLanguage, fieldType, sourceLanguage);

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

    const rawTranslatedText = completion.choices[0]?.message?.content?.trim();

    if (!rawTranslatedText) {
      return NextResponse.json(
        { error: "Nepodarilo sa získať preklad z OpenAI" },
        { status: 500 }
      );
    }

    // Vyčistenie odpovede od nežiadúcich prefixov a úvodzoviek
    let translatedText = rawTranslatedText;
    
    // Odstránenie bežných prefixov
    const prefixesToRemove = [
      'Preložený text:',
      'Preklad:',
      'Translation:',
      'Translated text:',
      'Resultado:'
    ];
    
    for (const prefix of prefixesToRemove) {
      if (translatedText.startsWith(prefix)) {
        translatedText = translatedText.substring(prefix.length).trim();
        break;
      }
    }
    
    // Odstránenie úvodzoviek na začiatku a konci
    if ((translatedText.startsWith('"') && translatedText.endsWith('"')) ||
        (translatedText.startsWith("'") && translatedText.endsWith("'"))) {
      translatedText = translatedText.slice(1, -1);
    }

    return NextResponse.json({
      translatedText: translatedText.trim(),
      originalText: text,
      targetLanguage,
      isLiturgical: isLiturgicalText(text) || fieldType === 'hlava'
    });

  } catch (error: unknown) {
    console.error("Chyba pri preklade:", error);
    
    // Špecifické error handling pre OpenAI
    const err = error as { status?: number; message?: string };
    if (err?.status === 401) {
      return NextResponse.json(
        { error: "Neplatný OpenAI API kľúč" },
        { status: 401 }
      );
    }
    
    if (err?.status === 429) {
      return NextResponse.json(
        { error: "Prekročený limit API požiadaviek. Skúste neskôr." },
        { status: 429 }
      );
    }
    
    if (err?.status === 503) {
      return NextResponse.json(
        { error: "OpenAI služba momentálne nie je dostupná" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Chyba pri preklade: " + (err?.message || "Neznáma chyba") },
      { status: 500 }
    );
  }
}