/**
 * Test script pre parsovanie biblických veršov
 */

const testText = `1 Hoci sa už mnohí pokúšali vyrozprávať rad-radom udalosti, ktoré sa u nás stali,
2 ako nám to podali tí, čo boli od začiatku očitými svedkami a služobníkmi slova,
3 predsa som aj ja uznal za dobré dôkladne a postupne prebádať všetko od začiatku a napísať ti, vznešený Teofil,
4 aby si poznal spoľahlivosť náuky, do ktorej ťa zasvätili.`;

function parseInputText(inputText) {
  const text = inputText.trim();
  if (!text) {
    return [];
  }

  const verses = [];
  
  // Rozdelíme text na riadky a pokúsime sa parsovať každý riadok
  const lines = text.split('\n').filter(line => line.trim());
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Pokúsime sa nájsť číslo verša na začiatku riadku
    const verseMatch = trimmedLine.match(/^(\d+)\s+(.+)$/);
    
    if (verseMatch) {
      const verseNumber = parseInt(verseMatch[1]);
      const verseText = verseMatch[2].trim();
      
      if (verseNumber > 0 && verseText) {
        verses.push({
          verse: verseNumber,
          text: verseText
        });
      }
    } else {
      // Ak nemôžeme parsovať číslo verša, pridáme to ako poznámku
      console.warn('Nemožno parsovať riadok:', trimmedLine);
    }
  }

  return verses;
}

// Test
console.log('=== TEST PARSOVANIE BIBLICKÝCH VERŠOV ===');
console.log('Pôvodný text:');
console.log(testText);
console.log('\n=== PARSOVANÉ VERŠE ===');

const parsedVerses = parseInputText(testText);
parsedVerses.forEach((verse, index) => {
  console.log(`${index + 1}. Verš ${verse.verse}: "${verse.text}"`);
});

console.log(`\nCelkovo parsovaných veršov: ${parsedVerses.length}`);

// Test API requestu (simulácia)
const apiRequestData = {
  locale_id: 1, // Predpokladáme ID slovenčiny
  translation_id: 1, // Predpokladáme ID SSV
  book_id: 42, // Predpokladáme ID Lukáša
  chapter: 1,
  verses: parsedVerses,
};

console.log('\n=== SIMULÁCIA API REQUESTU ===');
console.log(JSON.stringify(apiRequestData, null, 2));

export { parseInputText, parsedVerses, testText };
