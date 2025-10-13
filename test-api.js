/**
 * Test API endpoint pre bible bulk import
 */

const testApiRequest = async () => {
  const testData = {
    locale_id: 1, // Testujeme s ID 1 pre slovenčinu
    translation_id: 1, // Testujeme s ID 1 pre SSV
    book_id: 1, // Testujeme s nejakým existujúcim book_id
    chapter: 999, // Používame veľké číslo kapitoly aby sa vyhli konfliktu
    verses: [
      {
        verse: 1,
        text: "Hoci sa už mnohí pokúšali vyrozprávať rad-radom udalosti, ktoré sa u nás stali,"
      },
      {
        verse: 2,
        text: "ako nám to podali tí, čo boli od začiatku očitými svedkami a služobníkmi slova,"
      },
      {
        verse: 3,
        text: "predsa som aj ja uznal za dobré dôkladne a postupne prebádať všetko od začiatku a napísať ti, vznešený Teofil,"
      },
      {
        verse: 4,
        text: "aby si poznal spoľahlivosť náuky, do ktorej ťa zasvätili."
      }
    ]
  };

  try {
    console.log('Odosielam request na API...');
    console.log('Data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:3000/api/admin/bible-bulk-import', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    console.log('\n=== ODPOVEĎ API ===');
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('\n✅ ÚSPECH! Import bol dokončený.');
      console.log(`Importovaných veršov: ${result.importedCount}`);
      if (result.skippedCount > 0) {
        console.log(`Preskočených veršov: ${result.skippedCount}`);
      }
    } else {
      console.log('\n❌ CHYBA pri importe.');
      console.log('Chyba:', result.message);
      if (result.errors) {
        console.log('Detaily chýb:', result.errors);
      }
    }
    
  } catch (error) {
    console.error('❌ Chyba pri volaní API:', error.message);
  }
};

// Spustenie testu
testApiRequest();