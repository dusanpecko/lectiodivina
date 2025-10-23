import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, fieldType = 'spiritual' } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text je povinný' },
        { status: 400 }
      );
    }

    // Customize prompt based on field type
    const fieldInstructions: Record<string, string> = {
      spiritual: 'duchovný text (Lectio, Meditatio, Oratio, Contemplatio)',
      prayer: 'modlitba',
      reference: 'biblické referencie',
      bible: 'biblický text',
    };

    const systemPrompt = `Si expert na slovenskú gramatiku a štýl. Tvoja úloha je skontrolovať a opraviť gramatické chyby, preklepy a štylizáciu textu.

Text je: ${fieldInstructions[fieldType] || 'duchovný text'}

Pravidlá:
- Oprav gramatické chyby, preklepy a interpunkciu
- Zachovaj originálny význam a tón
- Zlepši plynulosť a čitateľnosť
- Pre duchovné texty zachovaj pastoračný, tichý tón
- Neprepisuj celý text, len vylepši čo je potrebné
- Vráť iba opravený text bez vysvetlení

Vráť výsledok vo formáte JSON:
{
  "corrected_text": "<opravený text>",
  "changes_made": "<krátky popis zmien, alebo 'Žiadne zmeny potrebné'"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Používame mini pre gramatiku (lacnejšie)
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.3, // Nízka teplota pre konzistentnosť
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('Prázdna odpoveď z OpenAI');
    }

    const result = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      data: {
        corrected_text: result.corrected_text,
        changes_made: result.changes_made
      },
      usage: {
        tokens: completion.usage?.total_tokens || 0
      }
    });

  } catch (error: unknown) {
    console.error('Error checking grammar:', error);
    
    return NextResponse.json(
      { 
        error: 'Chyba pri kontrole gramatiky',
        details: error instanceof Error ? error.message : 'Neznáma chyba'
      },
      { status: 500 }
    );
  }
}
