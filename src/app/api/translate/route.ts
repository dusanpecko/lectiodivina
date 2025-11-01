import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

// Funkcia pre vyhľadávanie podobných liturgických textov v kalendári
async function findLiturgicalReference(text: string, targetLanguage: string): Promise<string[]> {
  if (!isLiturgicalText(text)) {
    return [];
  }

  try {
    // Hľadáme v poslednom roku (2025) pre referencie
    const currentYear = new Date().getFullYear();
    
    const { data, error } = await supabase
      .from('liturgical_calendar')
      .select('celebration_title')
      .eq('locale_code', targetLanguage)
      .gte('datum', `${currentYear}-01-01`)
      .lte('datum', `${currentYear}-12-31`)
      .not('celebration_title', 'is', null)
      .limit(50); // Obmedzíme na 50 príkladov

    if (!error && data) {
      return data
        .map(item => item.celebration_title)
        .filter(Boolean)
        .slice(0, 10); // Vezmeme prvých 10 ako referencie
    }
  } catch (error) {
    console.error('Error fetching liturgical references:', error);
  }

  return [];
}

// Vytvorenie špecializovaného promptu
function createPrompt(text: string, targetLanguageCode: string, fieldType?: string, sourceLanguageCode?: string, liturgicalReferences?: string[]): string {
  const isLiturgical = isLiturgicalText(text) || fieldType === 'liturgical' || fieldType === 'hlava';
  const targetLanguageName = languageNames[targetLanguageCode] || targetLanguageCode;
  
  let basePrompt = '';
  
  // Špeciálny handling pre taliansky liturgický preklad
  if (isLiturgical && targetLanguageCode === 'it') {
    let liturgicalExamples = '';
    if (liturgicalReferences && liturgicalReferences.length > 0) {
      liturgicalExamples = `\n6. RIFERIMENTI LITURGICI UFFICIALI IN ITALIANO DAL CALENDARIO:
${liturgicalReferences.map((ref, i) => `   ${i + 1}. "${ref}"`).join('\n')}
Usa questi come esempio per formulazioni liturgiche italiane corrette.\n`;
    }

    basePrompt = `Traduci questo testo liturgico in ITALIANO secondo le regole ufficiali della Chiesa Cattolica.

REGOLE CRITICHE PER L'ITALIANO:

1. FORMATO DEI GIORNI DELLA SETTIMANA:
   GIORNI FERIALI (lunedì-sabato):
   - "Štvrtok 28. týždňa v Cezročnom období" → "Giovedì della 28ª Settimana del Tempo Ordinario"
   - "Pondelok 5. týždňa v Cezročnom období" → "Lunedì della 5ª Settimana del Tempo Ordinario"
   - "Streda 12. adventného týždňa" → "Mercoledì della 12ª Settimana di Avvento"
   
   DOMENICHE (formato speciale):
   - "15. nedeľa v Cezročnom období" → "15ª Domenica del Tempo Ordinario"
   - "3. pôstna nedeľa" → "3ª Domenica di Quaresima"
   - "2. adventná nedeľa" → "2ª Domenica di Avvento"

2. SINTASSI LITURGICA OBBLIGATORIA IN ITALIANO:
   PER GIORNI FERIALI:
   - SEMPRE "della" tra giorno e numero: "Giovedì della 28ª Settimana"
   - SEMPRE "Settimana" (maiuscola, singolare)
   - SEMPRE "del Tempo Ordinario" o "di [Tempo]"
   - Usa numeri ordinali: 1ª, 2ª, 3ª, 4ª, 5ª, etc.
   
   PER DOMENICHE:
   - NUMERO + "ª Domenica" + tempo liturgico
   - "15ª Domenica del Tempo Ordinario" (con "del")
   - "3ª Domenica di Quaresima" (con "di" per i tempi)

3. ESEMPI CORRETTI:
   GIORNI FERIALI:
   ✓ "Giovedì della 28ª Settimana del Tempo Ordinario"
   ✓ "Lunedì della 5ª Settimana del Tempo Ordinario"
   ✓ "Venerdì della 15ª Settimana di Avvento"
   ✓ "Martedì della 3ª Settimana di Quaresima"
   
   DOMENICHE:
   ✓ "15ª Domenica del Tempo Ordinario"
   ✓ "3ª Domenica di Quaresima"
   ✓ "2ª Domenica di Avvento"
   ✓ "4ª Domenica di Pasqua"
   
   ❌ SBAGLIATO:
   ✗ "Giovedì 28 Settimana del Tempo Ordinario" (mancante "della")
   ✗ "Giovedì di 28ª Settimana del Tempo Ordinario" (dovrebbe essere "della")
   ✗ "15ª Domenica di Tempo Ordinario" (dovrebbe essere "del")

4. TEMPI LITURGICI IN ITALIANO:
   - "Cezročné obdobie" → "Tempo Ordinario"
   - "Advent" → "Avvento"
   - "Pôst" → "Quaresima"
   - "Veľká noc" → "Pasqua"
   - "Vianoce" → "Natale"

5. GIORNI DELLA SETTIMANA:
   - Pondelok → Lunedì
   - Utorok → Martedì
   - Streda → Mercoledì
   - Štvrtok → Giovedì
   - Piatok → Venerdì
   - Sobota → Sabato
   - Nedeľa → Domenica

6. NUMERI ORDINALI:
   - 1ª, 2ª, 3ª, 4ª, 5ª, 6ª, 7ª, 8ª, 9ª, 10ª
   - 11ª, 12ª, 13ª... 21ª, 22ª, 23ª, 24ª... 31ª, 32ª, 33ª, 34ª
${liturgicalExamples}
RESTITUISCI SOLO IL TESTO TRADOTTO SENZA PREFISSI O VIRGOLETTE.

Traduci: "${text}"`;
  } else if (isLiturgical && targetLanguageCode === 'pt') {
    let liturgicalExamples = '';
    if (liturgicalReferences && liturgicalReferences.length > 0) {
      liturgicalExamples = `\n6. REFERÊNCIAS LITÚRGICAS OFICIAIS EM PORTUGUÊS DO CALENDÁRIO:
${liturgicalReferences.map((ref, i) => `   ${i + 1}. "${ref}"`).join('\n')}
Use estas como exemplo para formulações litúrgicas portuguesas corretas.\n`;
    }

    basePrompt = `Traduza este texto litúrgico para PORTUGUÊS de acordo com as regras oficiais da Igreja Católica.

REGRAS CRÍTICAS PARA PORTUGUÊS:

1. FORMATO DOS DIAS DA SEMANA:
   DIAS DE SEMANA (segunda-sábado):
   - "Štvrtok 28. týždňa v Cezročnom období" → "Quinta-feira da 28ª Semana do Tempo Comum"
   - "Pondelok 5. týždňa v Cezročnom období" → "Segunda-feira da 5ª Semana do Tempo Comum"
   - "Streda 12. adventného týždňa" → "Quarta-feira da 12ª Semana do Advento"
   
   DOMINGOS (formato especial):
   - "15. nedeľa v Cezročnom období" → "15º Domingo do Tempo Comum"
   - "3. pôstna nedeľa" → "3º Domingo da Quaresma"
   - "2. adventná nedeľa" → "2º Domingo do Advento"

2. SINTAXE LITÚRGICA OBRIGATÓRIA EM PORTUGUÊS:
   PARA DIAS DE SEMANA:
   - SEMPRE "da" entre dia e número: "Quinta-feira da 28ª Semana"
   - SEMPRE "Semana" (maiúscula, singular)
   - SEMPRE "do Tempo Comum" ou "do/da [Tempo]"
   - Use números ordinais: 1ª, 2ª, 3ª, 4ª, 5ª, etc.
   
   PARA DOMINGOS:
   - NÚMERO + "º Domingo" + tempo litúrgico
   - "15º Domingo do Tempo Comum" (com "do")
   - "3º Domingo da Quaresma" (com "da" para tempos)

3. EXEMPLOS CORRETOS:
   DIAS DE SEMANA:
   ✓ "Quinta-feira da 28ª Semana do Tempo Comum"
   ✓ "Segunda-feira da 5ª Semana do Tempo Comum"
   ✓ "Sexta-feira da 15ª Semana do Advento"
   ✓ "Terça-feira da 3ª Semana da Quaresma"
   
   DOMINGOS:
   ✓ "15º Domingo do Tempo Comum"
   ✓ "3º Domingo da Quaresma"
   ✓ "2º Domingo do Advento"
   ✓ "4º Domingo da Páscoa"
   
   ❌ INCORRETO:
   ✗ "Quinta-feira 28 Semana do Tempo Comum" (faltando "da")
   ✗ "Quinta-feira de 28ª Semana do Tempo Comum" (deveria ser "da")
   ✗ "15º Domingo de Tempo Comum" (deveria ser "do")

4. TEMPOS LITÚRGICOS EM PORTUGUÊS:
   - "Cezročné obdobie" → "Tempo Comum"
   - "Advent" → "Advento"
   - "Pôst" → "Quaresma"
   - "Veľká noc" → "Páscoa"
   - "Vianoce" → "Natal"

5. DIAS DA SEMANA:
   - Pondelok → Segunda-feira
   - Utorok → Terça-feira
   - Streda → Quarta-feira
   - Štvrtok → Quinta-feira
   - Piatok → Sexta-feira
   - Sobota → Sábado
   - Nedeľa → Domingo

6. NÚMEROS ORDINAIS:
   - 1ª, 2ª, 3ª, 4ª, 5ª, 6ª, 7ª, 8ª, 9ª, 10ª
   - 11ª, 12ª, 13ª... 21ª, 22ª, 23ª, 24ª... 31ª, 32ª, 33ª, 34ª
   - Para domingos: 1º, 2º, 3º, 4º, 5º, etc.
${liturgicalExamples}
RETORNE APENAS O TEXTO TRADUZIDO SEM PREFIXOS OU ASPAS.

Traduza: "${text}"`;
  } else if (isLiturgical && targetLanguageCode === 'fr') {
    let liturgicalExamples = '';
    if (liturgicalReferences && liturgicalReferences.length > 0) {
      liturgicalExamples = `\n6. RÉFÉRENCES LITURGIQUES OFFICIELLES EN FRANÇAIS DU CALENDRIER:
${liturgicalReferences.map((ref, i) => `   ${i + 1}. "${ref}"`).join('\n')}
Utilisez ces exemples pour des formulations liturgiques françaises correctes.\n`;
    }

    basePrompt = `Traduisez ce texte liturgique en FRANÇAIS selon les règles officielles de l'Église catholique.

RÈGLES CRITIQUES POUR LE FRANÇAIS:

1. FORMAT DES JOURS DE LA SEMAINE:
   JOURS EN SEMAINE (lundi-samedi):
   - "Štvrtok 28. týždňa v Cezročnom období" → "Jeudi de la 28e Semaine du Temps Ordinaire"
   - "Pondelok 5. týždňa v Cezročnom období" → "Lundi de la 5e Semaine du Temps Ordinaire"
   - "Streda 12. adventného týždňa" → "Mercredi de la 12e Semaine de l'Avent"
   
   DIMANCHES (format spécial):
   - "15. nedeľa v Cezročnom období" → "15e Dimanche du Temps Ordinaire"
   - "3. pôstna nedeľa" → "3e Dimanche de Carême"
   - "2. adventná nedeľa" → "2e Dimanche de l'Avent"

2. SYNTAXE LITURGIQUE OBLIGATOIRE EN FRANÇAIS:
   POUR LES JOURS EN SEMAINE:
   - TOUJOURS "de la" entre le jour et le numéro: "Jeudi de la 28e Semaine"
   - TOUJOURS "Semaine" (majuscule, singulier)
   - TOUJOURS "du Temps Ordinaire" ou "de l'[Temps]" ou "de [Temps]"
   - Utilisez nombres ordinaux: 1re, 2e, 3e, 4e, 5e, etc.
   
   POUR LES DIMANCHES:
   - NUMÉRO + "e Dimanche" + temps liturgique
   - "15e Dimanche du Temps Ordinaire" (avec "du")
   - "3e Dimanche de Carême" (avec "de" pour les temps)
   - "2e Dimanche de l'Avent" (avec "de l'" pour l'Avent)

3. EXEMPLES CORRECTS:
   JOURS EN SEMAINE:
   ✓ "Jeudi de la 28e Semaine du Temps Ordinaire"
   ✓ "Lundi de la 5e Semaine du Temps Ordinaire"
   ✓ "Vendredi de la 15e Semaine de l'Avent"
   ✓ "Mardi de la 3e Semaine de Carême"
   
   DIMANCHES:
   ✓ "15e Dimanche du Temps Ordinaire"
   ✓ "3e Dimanche de Carême"
   ✓ "2e Dimanche de l'Avent"
   ✓ "4e Dimanche de Pâques"
   
   ❌ INCORRECT:
   ✗ "Jeudi 28 Semaine du Temps Ordinaire" (manque "de la")
   ✗ "Jeudi de 28e Semaine du Temps Ordinaire" (devrait être "de la")
   ✗ "15e Dimanche de Temps Ordinaire" (devrait être "du")

4. TEMPS LITURGIQUES EN FRANÇAIS:
   - "Cezročné obdobie" → "Temps Ordinaire"
   - "Advent" → "Avent"
   - "Pôst" → "Carême"
   - "Veľká noc" → "Pâques"
   - "Vianoce" → "Noël"

5. JOURS DE LA SEMAINE:
   - Pondelok → Lundi
   - Utorok → Mardi
   - Streda → Mercredi
   - Štvrtok → Jeudi
   - Piatok → Vendredi
   - Sobota → Samedi
   - Nedeľa → Dimanche

6. NOMBRES ORDINAUX:
   - 1re (première), 2e, 3e, 4e, 5e, 6e, 7e, 8e, 9e, 10e
   - 11e, 12e, 13e... 21e, 22e, 23e, 24e... 31e, 32e, 33e, 34e
${liturgicalExamples}
RETOURNEZ SEULEMENT LE TEXTE TRADUIT SANS PRÉFIXES OU GUILLEMETS.

Traduisez: "${text}"`;
  } else if (isLiturgical && targetLanguageCode === 'en') {
    let liturgicalExamples = '';
    if (liturgicalReferences && liturgicalReferences.length > 0) {
      liturgicalExamples = `\n6. OFFICIAL ENGLISH LITURGICAL REFERENCES FROM CALENDAR:
${liturgicalReferences.map((ref, i) => `   ${i + 1}. "${ref}"`).join('\n')}
Use these as examples for proper English liturgical formulations.\n`;
    }

    basePrompt = `Translate this liturgical text into ENGLISH according to official Catholic Church rules.

CRITICAL RULES FOR ENGLISH:

1. WEEKDAY FORMAT:
   WEEKDAYS (Monday-Saturday):
   - "Štvrtok 28. týždňa v Cezročnom období" → "Thursday of the 28th Week in Ordinary Time"
   - "Pondelok 5. týždňa v Cezročnom období" → "Monday of the 5th Week in Ordinary Time"
   - "Streda 12. adventného týždňa" → "Wednesday of the 12th Week of Advent"
   
   SUNDAYS (special format):
   - "15. nedeľa v Cezročnom období" → "15th Sunday in Ordinary Time"
   - "3. pôstna nedeľa" → "3rd Sunday of Lent"
   - "2. adventná nedeľa" → "2nd Sunday of Advent"

2. MANDATORY ENGLISH LITURGICAL SYNTAX:
   FOR WEEKDAYS:
   - ALWAYS "of the" between day and number: "Thursday of the 28th Week"
   - ALWAYS "Week" (capitalized, singular)
   - ALWAYS "in Ordinary Time" or "of [Season]"
   - Use ordinal numbers: 1st, 2nd, 3rd, 4th, 5th, etc.
   
   FOR SUNDAYS:
   - NUMBER + "Sunday" + liturgical season
   - "15th Sunday in Ordinary Time" (with "in")
   - "3rd Sunday of Lent" (with "of" for seasons)

3. CORRECT EXAMPLES:
   WEEKDAYS:
   ✓ "Thursday of the 28th Week in Ordinary Time"
   ✓ "Monday of the 5th Week in Ordinary Time"
   ✓ "Friday of the 15th Week of Advent"
   ✓ "Tuesday of the 3rd Week of Lent"
   
   SUNDAYS:
   ✓ "15th Sunday in Ordinary Time"
   ✓ "3rd Sunday of Lent"
   ✓ "2nd Sunday of Advent" 
   ✓ "4th Sunday of Easter"
   
   ❌ INCORRECT:
   ✗ "Thursday 28 Week in Ordinary Time" (missing "of the")
   ✗ "Thursday of 28th Week in Ordinary Time" (missing "the")
   ✗ "15th Sunday of Ordinary Time" (should be "in" not "of")

4. LITURGICAL SEASONS IN ENGLISH:
   - "Cezročné obdobie" → "Ordinary Time"
   - "Advent" → "Advent"
   - "Pôst" → "Lent"
   - "Veľká noc" → "Easter"
   - "Vianoce" → "Christmas"

5. DAYS OF THE WEEK:
   - Pondelok → Monday
   - Utorok → Tuesday
   - Streda → Wednesday
   - Štvrtok → Thursday
   - Piatok → Friday
   - Sobota → Saturday
   - Nedeľa → Sunday

6. ORDINAL NUMBERS:
   - 1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th, 10th
   - 11th, 12th, 13th... 21st, 22nd, 23rd, 24th... 31st, 32nd, 33rd, 34th
${liturgicalExamples}
RETURN ONLY THE TRANSLATED TEXT WITHOUT PREFIXES OR QUOTATION MARKS.

Translate: "${text}"`;
  } else if (isLiturgical && targetLanguageCode === 'es') {
    let liturgicalExamples = '';
    if (liturgicalReferences && liturgicalReferences.length > 0) {
      liturgicalExamples = `\n6. OFICIÁLNE ŠPANIELSKE LITURGICKÉ REFERENCIE Z KALENDÁRA:
${liturgicalReferences.map((ref, i) => `   ${i + 1}. "${ref}"`).join('\n')}
Použite tieto ako vzor pre správne španielske liturgické formulácie.\n`;
    }

    basePrompt = `Preložte tento liturgický text do ŠPANIELČINY podľa oficiálnych pravidiel katolíckej cirkvi.

KRITICKY DÔLEŽITÉ PRAVIDLÁ PRE ŠPANIELČINU:

1. FORMÁT DNI TÝŽDŇA:
   VŠEDNÉ DNI (pondelok-sobota):
   - "Štvrtok 28. týždňa v Cezročnom období" → "Jueves, 28 semana del Tiempo Ordinario"
   - "Pondelok 5. týždňa v Cezročnom období" → "Lunes, 5 semana del Tiempo Ordinario"
   - "Streda 12. adventného týždňa" → "Miércoles, 12 semana de Adviento"
   
   NEDELE (špeciálny formát):
   - "15. nedeľa v Cezročnom období" → "15º Domingo del Tiempo Ordinario"
   - "3. pôstna nedeľa" → "3º Domingo de Cuaresma"
   - "2. adventná nedeľa" → "2º Domingo de Adviento"

2. POVINNÁ ŠPANIELSKA LITURGICKÁ SYNTAX:
   PRE VŠEDNÉ DNI:
   - VŽDY čiarka po dni týždňa: "Jueves," (nie "Jueves de la")
   - ČÍSLO + "semana" (nie "semana del")  
   - "del Tiempo Ordinario" (s veľkým T)
   - BEZ predložky "de la" medzi dňom a číslom
   
   PRE NEDELE:
   - ORDINÁLNE ČÍSLO + "Domingo" + liturgické obdobie
   - "15º Domingo del Tiempo Ordinario" (s ordinálnym symbolom º)
   - "3º Domingo de Cuaresma" (vždy º za číslom)

3. SPRÁVNE PRÍKLADY:
   VŠEDNÉ DNI:
   ✓ "Jueves, 28 semana del Tiempo Ordinario"
   ✓ "Lunes, 5 semana del Tiempo Ordinario" 
   ✓ "Viernes, 15 semana de Adviento"
   ✓ "Martes, 3 semana de Cuaresma"
   
   NEDELE:
   ✓ "15º Domingo del Tiempo Ordinario"
   ✓ "3º Domingo de Cuaresma"
   ✓ "2º Domingo de Adviento"
   ✓ "4 Domingo de Pascua"
   
   ❌ NESPRÁVNE:
   ✗ "Jueves de la 28. semana del Tiempo Ordinario"
   ✗ "Jueves de la 28 semana del Tiempo Ordinario"
   ✗ "Jueves, 28. semana del Tiempo Ordinario"
   ✗ "Domingo, 15 semana del Tiempo Ordinario" (nesprávny formát pre nedele)

4. LITURGICKÉ OBDOBIA V ŠPANIELČINE:
   - "Cezročné obdobie" → "Tiempo Ordinario"
   - "Advent" → "Adviento"  
   - "Pôst" → "Cuaresma"
   - "Veľká noc" → "Pascua"
   - "Vianoce" → "Navidad"

5. DNI TÝŽDŇA:
   - Pondelok → Lunes
   - Utorok → Martes
   - Streda → Miércoles
   - Štvrtok → Jueves
   - Piatok → Viernes
   - Sobota → Sábado
   - Nedeľa → Domingo

6. ORDINÁLNE ČÍSLA PRE NEDELE:
   - 1º, 2º, 3º, 4º, 5º, 6º, 7º, 8º, 9º, 10º
   - 11º, 12º, 13º... 21º, 22º, 23º, 24º... 31º, 32º, 33º, 34º
   - VŽDY použite º symbol za číslom pre nedele
${liturgicalExamples}
VRÁTITE VÝHRADNE PRELOŽENÝ TEXT BEZ PREFIXOV, ÚVODZOVIEK ALEBO VYSVETLENÍ.

Preložte: "${text}"`;
  } else if (isLiturgical && sourceLanguageCode === 'cs' && targetLanguageCode === 'sk') {
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

    // Pre podporované jazyky načítajme liturgické referencie z kalendára
    let liturgicalReferences: string[] = [];
    if ((targetLanguage === 'es' || targetLanguage === 'en' || targetLanguage === 'pt' || targetLanguage === 'it') && (isLiturgicalText(text) || fieldType === 'hlava')) {
      liturgicalReferences = await findLiturgicalReference(text, targetLanguage);
    }

    // Vytvor prompt na základe typu obsahu
    const prompt = createPrompt(text, targetLanguage, fieldType, sourceLanguage, liturgicalReferences);

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