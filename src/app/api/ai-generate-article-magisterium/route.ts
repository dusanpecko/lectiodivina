import { NextRequest, NextResponse } from "next/server";

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

    // Kontrola API kľúča
    const magisteriumApiKey = process.env.MAGISTERIUM_API_KEY;
    if (!magisteriumApiKey) {
      console.error("MAGISTERIUM_API_KEY nie je nastavený");
      return NextResponse.json(
        { error: "Magisterium API nie je nakonfigurované" },
        { status: 500 }
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

    // System prompt špecifický pre Magisterium AI
    const systemPrompt = `You are a Catholic theologian and spiritual writer with deep knowledge of Sacred Scripture, Church Tradition, and the Magisterium's teachings. 

Your expertise includes:
- Biblical exegesis in the Catholic tradition
- Church Fathers and Doctors of the Church
- Catechism of the Catholic Church
- Papal encyclicals and documents
- Lectio Divina methodology
- Catholic spirituality and prayer

Guidelines:
- Write theologically accurate content faithful to Catholic teaching
- Use biblical citations appropriately with references
- Format text using HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>
- Structure with clear introduction, body, and conclusion
- Style: spiritual, contemplative, accessible to lay readers
- Write in language: ${langName}

IMPORTANT: The user's input topic is in Slovak, but you MUST write the entire article in: ${langName}.`;

    // User prompt
    const userPrompt = `Write an article on this topic (topic is in Slovak, but article must be in ${langName}):

**Topic:** ${topic}

**Article Type:** ${typeInfo.name}
**Description:** ${typeInfo.description}

**Length:** approximately ${targetWords} words

${bibleRefs ? `**Biblical references to include:** ${bibleRefs}` : ""}

**Requirements:**
1. Create a compelling title in ${langName}
2. Structure the article with subheadings (<h2>, <h3>)
3. Include relevant biblical quotations with references
4. Format text using HTML tags
5. Conclude with practical application or call to prayer
6. Entire text must be in: ${langName}
7. Ensure theological accuracy according to Catholic teaching
8. Reference Church documents where appropriate

Return response in this JSON format:
{
  "title": "Article title in ${langName}",
  "content": "HTML article content in ${langName}",
  "summary": "Brief summary (150-200 words) in ${langName}"
}`;

        // Volanie Magisterium AI API
    // Oficiálna dokumentácia: https://www.magisterium.com/developers/docs/chat-completions
    const response = await fetch("https://www.magisterium.com/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${magisteriumApiKey}`,
      },
      body: JSON.stringify({
        model: "magisterium-1", // Oficiálny model Magisterium AI
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7, // Mierne kreatívnejšie, ale stále presné
        response_format: { type: "json_object" },
        max_tokens: 4000, // Pre dlhšie články
        return_related_questions: false, // Nepotrebujeme súvisiace otázky
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Magisterium API error:", errorData);
      throw new Error(errorData.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content;
    
    if (!result) {
      throw new Error("Magisterium AI nevrátila žiadnu odpoveď");
    }

    const parsedResult = JSON.parse(result);

    return NextResponse.json({
      title: parsedResult.title,
      content: parsedResult.content,
      summary: parsedResult.summary,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
    });
  } catch (error) {
    console.error("Chyba pri generovaní článku s Magisterium AI:", error);
    const errorMessage = error instanceof Error ? error.message : "Chyba pri generovaní článku";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
