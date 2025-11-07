import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt pre generovanie Contemplatio a Actio
const CONTEMPLATIO_ACTIO_PROMPT = `Si AI asistent pre tvorbu duchovných textov Lectio Divina.

Účel: Na základe existujúcich sekcií (Biblia, Lectio, Meditatio, Oratio) vygeneruj:
- Contemplatio – jednoduchý obraz + 1 „kotviaca" veta z biblického textu v úvodzovkách
- Actio – konkrétny, praktický návrh na prenesenie Slova do života (1 konkrétny skutok lásky)

Štýl: Jasný, tichý, povzbudzujúci. Verný existujúcim textom.

Dĺžka:
- Contemplatio: 1–2 vety (max 35 slov), posledná veta je kotva v úvodzovkách
- Actio: 1–3 vety (≈ 30–60 slov), jeden konkrétny skutok lásky

Actio pravidlá:
- Buď konkrétny a praktický: namiesto abstraktného "byť láskavejší" ponúkni konkrétny krok (napr. "zavolať mame a poďakovať jej").
- Nevnucuj jediný štartovací obrat — Actio môže byť formulované rôzne (napr. "Dnes...", "Môžem...", "Skús...", "Zváž...", "Urobím...") alebo aj v podobe jemnej výzvy/pozvania k činu.
- Preferuj jednoduché, realizovateľné skutky vyplývajúce z obsahu predchádzajúcich sekcií.
- Malé, okamžité kroky lásky sú preferované: zavolať, odpustiť, pomôcť, poďakovať, byť trpezlivý, napísať poznámku do denníka...

Vráť iba JSON vo formáte:
{
  "contemplatio": "<text>",
  "actio": "<text>"
}`;

// System prompt pre generovanie len Actio
const ACTIO_ONLY_PROMPT = `Si AI asistent pre tvorbu duchovných textov Lectio Divina.

Účel: Na základe existujúcich sekcií (Biblia, Lectio, Meditatio, Oratio, Contemplatio) vygeneruj:
- Actio – konkrétny, praktický návrh na prenesenie Slova do života

Štýl: Jasný, povzbudzujúcy, konkrétny.

Dĺžka: 1–3 vety (≈ 30–60 slov)

Actio pravidlá:
- Buď konkrétny a praktický: namiesto abstraktného "byť láskavejší" ponúkni konkrétny krok (napr. "zavolať kolegovi a ospravedlniť sa").
- Neobmedzuj štýl formulácie — Actio môže byť vyjadrené rôznymi spôsobmi (napr. "Dnes...," "Skús...", "Zváž...", "Urobím..." alebo jemná výzva) podľa tónu textu.
- Preferuj jednoduché, realizovateľné kroky, ktoré priamo vyplývajú zo zadaného obsahu.
- Dávaj prednosť malým skutkom lásky: zavolať, odpustiť, pomôcť, poďakovať, napísať poznámku, úkon starostlivosti...

Filozofia Actio:
"Dobré je tiež pripomenúť, že dynamika lectio divina sa nenapĺňa, kým neprejde do činnosti (actio), čím podnecuje život veriaceho, aby sa v láske stal darom pre druhých." (Pápež Benedikt XVI.)

Actio môže byť: zdieľanie, starostlivosť, viera, tiché skutky (zápis do denníka, list odpustenia), malé gestá lásky.

Vráť iba JSON vo formáte:
{
  "actio": "<text>"
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      mode, // 'contemplatio-actio' or 'actio-only'
      biblia_text,
      lectio_text,
      meditatio_text,
      oratio_text,
      contemplatio_text,
      suradnice_pismo,
      model = 'gpt-4o-mini' // Default to mini for partial generations
    } = body;

    // Validation
    if (!mode || !['contemplatio-actio', 'actio-only'].includes(mode)) {
      return NextResponse.json(
        { error: 'Neplatný režim generovania' },
        { status: 400 }
      );
    }

    if (!biblia_text || !lectio_text) {
      return NextResponse.json(
        { error: 'Biblický text a Lectio sú povinné' },
        { status: 400 }
      );
    }

    // Build user prompt based on mode
    let userPrompt = '';
    let systemPrompt = '';

    if (mode === 'contemplatio-actio') {
      systemPrompt = CONTEMPLATIO_ACTIO_PROMPT;
      userPrompt = `
Perikopa: ${suradnice_pismo || 'Nie je zadané'}

Biblický text:
${biblia_text}

Lectio:
${lectio_text}

Meditatio:
${meditatio_text || 'Nie je zadané'}

Oratio:
${oratio_text || 'Nie je zadané'}

Vygeneruj Contemplatio a Actio podľa pokynov.
`.trim();

    } else if (mode === 'actio-only') {
      systemPrompt = ACTIO_ONLY_PROMPT;
      userPrompt = `
Perikopa: ${suradnice_pismo || 'Nie je zadané'}

Biblický text:
${biblia_text}

Lectio:
${lectio_text}

Meditatio:
${meditatio_text || 'Nie je zadané'}

Oratio:
${oratio_text || 'Nie je zadané'}

Contemplatio:
${contemplatio_text || 'Nie je zadané'}

Vygeneruj Actio - konkrétny praktický skutok lásky vyplývajúci z tohto obsahu.
`.trim();
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('Prázdna odpoveď z OpenAI');
    }

    // Parse JSON response
    const result = JSON.parse(responseText);

    // Validate response structure based on mode
    if (mode === 'contemplatio-actio' && (!result.contemplatio || !result.actio)) {
      throw new Error('Neplatná štruktúra odpovede - chýba Contemplatio alebo Actio');
    }

    if (mode === 'actio-only' && !result.actio) {
      throw new Error('Neplatná štruktúra odpovede - chýba Actio');
    }

    return NextResponse.json({
      success: true,
      data: result,
      usage: {
        model: model,
        tokens: completion.usage?.total_tokens || 0
      }
    });

  } catch (error: unknown) {
    console.error('Error generating partial Lectio Divina:', error);
    
    return NextResponse.json(
      { 
        error: 'Chyba pri generovaní',
        details: error instanceof Error ? error.message : 'Neznáma chyba'
      },
      { status: 500 }
    );
  }
}
