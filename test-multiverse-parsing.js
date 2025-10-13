/**
 * Test nového parsovacieho algoritmu pre viacero veršov v jednom riadku
 */

// Test dáta
const testCases = [
  {
    name: "Jeden verš na riadok (pôvodný formát)",
    input: `1 Hoci sa už mnohí pokúšali vyrozprávať rad-radom udalosti, ktoré sa u nás stali,
2 ako nám to podali tí, čo boli od začiatku očitými svedkami a služobníkmi slova,
3 predsa som aj ja uznal za dobré dôkladne a postupne prebádať všetko od začiatku a napísať ti, vznešený Teofil,
4 aby si poznal spoľahlivosť náuky, do ktorej ťa zasvätili.`,
    expected: 4
  },
  {
    name: "Viac veršov v jednom riadku",
    input: `1 Hoci sa už mnohí pokúšali vyrozprávať rad-radom udalosti, 2 ako nám to podali tí, čo boli od začiatku očitými svedkami,
3 predsa som aj ja uznal za dobré dôkladne a postupne prebádať všetko od začiatku a napísať ti, vznešený Teofil, 4 aby si poznal spoľahlivosť náuky, do ktorej ťa zasvätili.`,
    expected: 4
  },
  {
    name: "Kombinovaný formát",
    input: `1 Hoci sa už mnohí pokúšali vyrozprávať rad-radom udalosti, ktoré sa u nás stali,
2 ako nám to podali tí, čo boli od začiatku očitými svedkami a služobníkmi slova, 3 predsa som aj ja uznal za dobré dôkladne a postupne prebádať všetko,
4 aby si poznal spoľahlivosť náuky, do ktorej ťa zasvätili.`,
    expected: 4
  },
  {
    name: "Všetko v jednom riadku",
    input: `1 Prvý verš textu, 2 Druhý verš textu, 3 Tretí verš textu, 4 Štvrtý verš textu.`,
    expected: 4
  }
];

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
    
    // Parsovanie viacerých veršov v jednom riadku
    // Použijeme regex na nájdenie všetkých výskytov čísla nasledovaného textom
    const verseMatches = trimmedLine.matchAll(/(\d+)\s+([^0-9]*?)(?=\s*\d+\s+|$)/g);
    
    let foundVerses = false;
    for (const match of verseMatches) {
      const verseNumber = parseInt(match[1]);
      const verseText = match[2].trim();
      
      if (verseNumber > 0 && verseText) {
        verses.push({
          verse: verseNumber,
          text: verseText
        });
        foundVerses = true;
      }
    }
    
    // Ak sme nenašli žiadne verše pomocou nového algoritmu, skúsime starý spôsob
    if (!foundVerses) {
      const singleVerseMatch = trimmedLine.match(/^(\d+)\s+(.+)$/);
      
      if (singleVerseMatch) {
        const verseNumber = parseInt(singleVerseMatch[1]);
        const verseText = singleVerseMatch[2].trim();
        
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
  }

  return verses;
}

// Spustenie testov
console.log('=== TEST NOVÉHO PARSOVACIEHO ALGORITMU ===\n');

testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. Test: ${testCase.name}`);
  console.log('Input:');
  console.log(testCase.input);
  console.log('\nParsované verše:');
  
  const result = parseInputText(testCase.input);
  result.forEach((verse, i) => {
    console.log(`  ${i + 1}. Verš ${verse.verse}: "${verse.text}"`);
  });
  
  const success = result.length === testCase.expected;
  console.log(`\n✅ Očakávané: ${testCase.expected} veršov, Našli sme: ${result.length} veršov - ${success ? 'ÚSPECH' : 'CHYBA'}\n`);
  console.log('---\n');
});

console.log('=== KONIEC TESTOV ===');