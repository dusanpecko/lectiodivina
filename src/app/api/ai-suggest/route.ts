import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompts pre rôzne typy návrhov
const SUGGESTION_PROMPTS = {
  continuation: (text: string, fieldType: string) => {
    const contextMap: Record<string, string> = {
      spiritual: 'duchovný',
      prayer: 'modlitebný',
      bible: 'biblický',
      reference: 'referenčný'
    };
    
    const context = contextMap[fieldType] || 'duchovný';
    
    return `Pokračuj v tomto ${context} texte prirodzeným spôsobom. Návr max 1-2 vety (max 50 slov), ktoré logicky nadväzujú. Píš v rovnakom tóne a štýle.

Text doteraz:
"${text}"

Navrhnuté pokračovanie (iba text, bez úvodzoviek):`;
  },

  enhancement: (text: string, fieldType: string) => `Tento duchovný text zlepši pridaním jednej výstižnej vety na konci, ktorá prehĺbi myšlienku:

"${text}"

Pridaj jednu vetu (typ: ${fieldType}):`,

  correction: (text: string) => `Skontroluj tento text a navrhni jemné gramatické a štylistické úpravy. Zachovaj pôvodný význam a tón:

"${text}"

Opravený text:`,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      text, 
      fieldType = 'spiritual',
      suggestionType = 'continuation' // 'continuation', 'enhancement', 'correction'
    } = body;

    // Validation
    if (!text || text.trim().length < 50) {
      return NextResponse.json(
        { error: 'Text musí mať aspoň 50 znakov pre AI návrhy' },
        { status: 400 }
      );
    }

    // Vyber správny prompt
    const promptFunction = SUGGESTION_PROMPTS[suggestionType as keyof typeof SUGGESTION_PROMPTS];
    if (!promptFunction) {
      return NextResponse.json(
        { error: 'Neplatný typ návrhu' },
        { status: 400 }
      );
    }

    const userPrompt = typeof promptFunction === 'function' 
      ? promptFunction(text, fieldType)
      : promptFunction;

    // Call OpenAI API - používame GPT-4o-mini pre lacnejšie live suggestions
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'Si asistent pre písanie duchovných textov v slovenčine. Píšeš prirodzene, s citom a bez zbytočných fráz.' 
        },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 100, // Krátke návrhy
    });

    const suggestion = completion.choices[0]?.message?.content?.trim();

    if (!suggestion) {
      throw new Error('AI nevygenerovala návrh');
    }

    // Odstráň úvodzovky ak ich AI pridala
    const cleanSuggestion = suggestion.replace(/^["']|["']$/g, '');

    return NextResponse.json({
      success: true,
      suggestion: cleanSuggestion,
      tokens: completion.usage?.total_tokens || 0,
      model: 'gpt-4o-mini'
    });

  } catch (error: unknown) {
    console.error('Error generating AI suggestion:', error);
    
    return NextResponse.json(
      { 
        error: 'Chyba pri generovaní AI návrhu',
        details: error instanceof Error ? error.message : 'Neznáma chyba'
      },
      { status: 500 }
    );
  }
}
