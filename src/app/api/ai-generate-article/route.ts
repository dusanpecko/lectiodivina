import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Typy článkov s ich popismi
const ARTICLE_TYPES = {
  biblical_commentary: {
    name: "Biblický výklad",
    description: "Podrobný výklad biblického textu s historickým a teologickým kontextom",
  },
  lectio_divina_practice: {
    name: "Lectio Divina praktiky",
    description: "Praktický návod na duchovné cvičenia a meditácie",
  },
  theological_article: {
    name: "Teologický článok",
    description: "Hlbší teologický rozbor tém viery a náuky",
  },
  spiritual_meditation: {
    name: "Duchovná meditácia",
    description: "Kontemplačný text na duchovný rast",
  },
  church_history: {
    name: "História cirkvi",
    description: "Historické udalosti a osobnosti kresťanstva",
  },
  sacraments_liturgy: {
    name: "Sviatosti a liturgia",
    description: "Výklad o sviatkoch, sviatostiach a liturgických praktikách",
  },
  lectio_news: {
    name: "Novinky Lectio.one",
    description: "Aktuality, novinky a oznámenia o aplikácii Lectio.one",
  },
};

// Jazyky s ich názvami
const LANGUAGES = {
  sk: "slovenčina",
  cz: "čeština",
  en: "angličtina",
  es: "španielčina",
  it: "taliančina",
  pt: "portugalčina",
  de: "nemčina",
};

interface GenerateArticleRequest {
  topic: string;
  articleType: keyof typeof ARTICLE_TYPES;
  length: "short" | "medium" | "long";
  targetLang: keyof typeof LANGUAGES;
  bibleRefs?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: GenerateArticleRequest = await req.json();
    const { topic, articleType, length, targetLang, bibleRefs } = body;

    // Validácia
    if (!topic || !articleType || !length || !targetLang) {
      return NextResponse.json(
        { error: "Chýbajú povinné polia" },
        { status: 400 }
      );
    }

    // Určenie dĺžky článku v slovách
    const wordCounts = {
      short: 500,
      medium: 1000,
      long: 2000,
    };
    const targetWords = wordCounts[length];

    // Opis typu článku
    const typeInfo = ARTICLE_TYPES[articleType];
    const langName = LANGUAGES[targetLang];

    // System prompt
    const systemPrompt = `Si expertný teológ a duchovný spisovateľ špecializujúci sa na kresťanskú spiritualitu, Lectio Divina a biblickú exegézu. 

Tvoje úlohy:
- Písať teologicky presné, duchovne hlboké a prakticky použiteľné články
- Používať biblické citáty tam, kde je to vhodné
- Formátovať text pomocou HTML tagov: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
- Článok musí byť štruktúrovaný s jasnou úvodnou časťou, hlavnou časťou a záverom
- Štýl: duchovný, kontemplačný, ale zrozumiteľný pre bežného čitateľa
- Písať v jazyku: ${langName}

DÔLEŽITÉ: Vstupný text od používateľa je v slovenčine, ale TY musíš písať výsledný článok v jazyku: ${langName}.`;

    // User prompt
    const userPrompt = `Napíš článok na túto tému (téma je po slovensky, ale článok musí byť v jazyku ${langName}):

**Téma:** ${topic}

**Typ článku:** ${typeInfo.name}
**Popis:** ${typeInfo.description}

**Dĺžka:** približne ${targetWords} slov

${bibleRefs ? `**Biblické odkazy na použitie:** ${bibleRefs}` : ""}

**Požiadavky:**
1. Vytvor výstižný nadpis v jazyku ${langName}
2. Štruktúruj článok s podnadpismi (<h2>, <h3>)
3. Použi biblické citáty tam, kde je to vhodné
4. Formátuj text pomocou HTML tagov
5. Ukonči článok praktickou aplikáciou alebo výzvou k modlitbe
6. Text musí byť celý v jazyku: ${langName}

Vráť odpoveď v tomto JSON formáte:
{
  "title": "Nadpis článku v jazyku ${langName}",
  "content": "HTML obsah článku v jazyku ${langName}",
  "summary": "Krátky súhrn (150-200 slov) v jazyku ${langName}"
}`;

    // Volanie OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Používame GPT-4 pre kvalitnejší obsah
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.8, // Trochu kreatívnejšie
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0].message.content;
    if (!result) {
      throw new Error("AI nevrátila žiadnu odpoveď");
    }

    const parsedResult = JSON.parse(result);

    return NextResponse.json({
      title: parsedResult.title,
      content: parsedResult.content,
      summary: parsedResult.summary,
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
    });
  } catch (error) {
    console.error("Chyba pri generovaní článku:", error);
    const errorMessage = error instanceof Error ? error.message : "Chyba pri generovaní článku";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
