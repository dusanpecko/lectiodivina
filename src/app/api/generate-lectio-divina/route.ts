import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt pre generovanie Lectio Divina
const SYSTEM_PROMPT = `Pokyn pre AI: tvorba textov Lectio Divina (pre aplikáciu)

Účel

Vytvárať krátke, pastoračne citlivé texty Lectio Divina k zadanému biblickému úryvku v štvordielnej štruktúre:

Lectio – verný, stručný obsahový sumár perikopy

Meditatio – tichá, praktická reflexia (1 hlavná myšlienka) + na konci 2 osobné reflexné otázky

Oratio – krátka modlitba v 2. osobe k Ježišovi/Pánovi

Contemplatio – jednoduchý obraz + 1 „kotviaca" veta z textu v úvodzovkách

Výstup (formát)

Vráť iba JSON vo formáte:

{
  "lectio": "<text>",
  "meditatio": "<text>",
  "oratio": "<text>",
  "contemplatio": "<text>"
}

Štýl a tón

Jasný, tichý, povzbudzujúci. Bez moralizovania a bez „ťažkého" žargónu.

Verný textu: žiadne špekulácie mimo zadaného úryvku.

Jedno hlavné jadro v Meditatio, nie viacero tém naraz.

Konkrétnosť: praktické, každodenné premostenie (ale stručné).

Bez „fialového" pátosu; obraznosť striedma.

Neopravuj preklad Biblie. Ak cituješ, rob to krátko a presne.

Contemplatio: 1 obraz (predstava scény) + na konci 1 veta v úvodzovkách (kotva z úryvku).

Dĺžka (orientačne)

Lectio: 2–6 vety (≈ 70–100 slov)

Meditatio: 5–7 viet (≈ 90–140 slov), jedna hlavná línia + na konci 2 osobné reflexné otázky začínajúce na samostatných riadkoch s "• "

Oratio: 2–4 vety (≈ 40–70 slov)

Contemplatio: 1–2 vety (max 35 slov), posledná veta je kotva v úvodzovkách

Teologické a jazykové zásady

Rešpektuj katolícku/ekumenickú citlivosť.

Vyhni sa kontroverziám, polemikám a dogmatickým detailom mimo textu.

V modlitbe oslovuj: „Ježišu" alebo „Pane"; vykaj Bohu.

Vyhni sa zvláštnym či nešťastným spojeniam (napr. „neprogramuje ho", „znášať krsty každodennosti"). Použi prirodzené synonymá: „nenechá sa viesť strachom", „prejsť každodennými skúškami verne".

Ak úryvok obsahuje tvrdé výroky, podaj ich pravdivo a s nádejou.

Postup generovania

Prečítaj perikopu a identifikuj: kontext deja; kľúčové gestá/slová Ježiša; napätie/posolstvo.

Lectio: neutrálne, vecne pomenovať dej (bez rozvláčnosti, bez aplikácie).

Meditatio: vyber 1 nosnú myšlienku, prepoj so životom (rozhodnutie, vzťahy, služba…). Vyhni sa „zoznamu rád". Na konci pridaj 2 osobné reflexné otázky, ktoré povzbudzujú čitateľa k hlbšiemu zamysleniu nad textom. Každá otázka začína na novom riadku s "• ".

Oratio: krátka osobná modlitba – prosba o milosť žiť posolstvo dnes.

Contemplatio: 1 obraz v tichu + kotva (krátka veta z úryvku v úvodzovkách).

Kontrola: zachovaná štruktúra, tón, dĺžky, diakritika, bez nadbytočných vsuviek.

Kvalitárska kontrola (checklist pred výstupom)

✓ Štyri sekcie v správnom poradí a názvoch

✓ Lectio je súhrn deja, nie výklad

✓ Meditatio má jedno jadro a praktické premostenie + končí 2 reflexnými otázkami (každá na novom riadku s "• ")

✓ Oratio je krátka, osobná, adresuje posolstvo úryvku

✓ Contemplatio končí presnou vetou z úryvku v úvodzovkách

✓ Bez zvláštnych či nejasných fráz; prirodzená slovenčina

✓ Žiadne dodatočné sekcie ani poznámky`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      source_material, 
      perikopa_ref, 
      perikopa_text,
      model = 'gpt-4o' // Default to gpt-4o, can be overridden with gpt-4o-mini
    } = body;

    // Validation
    if (!source_material && !perikopa_text) {
      return NextResponse.json(
        { error: 'Zdrojový materiál alebo biblický text je povinný' },
        { status: 400 }
      );
    }

    // Build user prompt
    const userPrompt = `
Perikopa: ${perikopa_ref || 'Nie je zadané'}

Text: ${perikopa_text || source_material}

${source_material ? `\nDodatočný materiál na spracovanie:\n${source_material}` : ''}

Napíš Lectio Divina v štyroch sekciách (Lectio, Meditatio, Oratio, Contemplatio) podľa pokynov. Použi slovenčinu. Drž sa zadaného úryvku, nevymýšľaj mimo textu.

DÔLEŽITÉ pre Meditatio: Na konci textu pridaj 2 osobné reflexné otázky, ktoré pomôžu čitateľovi zamyslieť sa nad svojím životom vo svetle tohto úryvku. Každá otázka začína na novom riadku s "• ".

Vráť výsledok vo formáte JSON:
{
  "lectio": "<text>",
  "meditatio": "<text>",
  "oratio": "<text>",
  "contemplatio": "<text>"
}
`.trim();

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: model, // 'gpt-4o' or 'gpt-4o-mini'
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      throw new Error('Prázdna odpoveď z OpenAI');
    }

    // Parse JSON response
    const result = JSON.parse(responseText);

    // Validate response structure
    if (!result.lectio || !result.meditatio || !result.oratio || !result.contemplatio) {
      throw new Error('Neplatná štruktúra odpovede z AI');
    }

    return NextResponse.json({
      success: true,
      data: {
        lectio: result.lectio,
        meditatio: result.meditatio,
        oratio: result.oratio,
        contemplatio: result.contemplatio
      },
      usage: {
        model: model,
        tokens: completion.usage?.total_tokens || 0
      }
    });

  } catch (error: unknown) {
    console.error('Error generating Lectio Divina:', error);
    
    return NextResponse.json(
      { 
        error: 'Chyba pri generovaní Lectio Divina',
        details: error instanceof Error ? error.message : 'Neznáma chyba'
      },
      { status: 500 }
    );
  }
}
