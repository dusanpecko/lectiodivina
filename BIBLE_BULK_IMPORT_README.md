# Bible Bulk Import - Testovacie Inštrukcie

## Čo bolo vytvorené:

1. **Admin stránka**: `/admin/bible-bulk-import`
   - Automaticky parsuje text vo formáte "číslo_verša text"
   - Podporuje výber lokality, prekladu, knihy a kapitoly
   - Zobrazuje náhľad parsovaných veršov
   - Importuje do `dev_bible_verses` tabuľky

2. **API endpoint**: `/api/admin/bible-bulk-import`
   - POST metóda pre bulk import
   - Validácia všetkých vstupných parametrov
   - Kontrola duplikátov
   - Detailné chybové hlásenia

3. **Navigácia**: Pridané do admin panela s oranžovou Upload ikonou

## Testovanie:

### 1. Frontend test:
- Prejdite na `http://localhost:3002/admin` (alebo port na ktorom beží server)
- Kliknite na "Bible Import" kartu
- Vložte testový text v jednom z formátov:

**Jeden verš na riadok:**
```
1 Hoci sa už mnohí pokúšali vyrozprávať rad-radom udalosti, ktoré sa u nás stali,
2 ako nám to podali tí, čo boli od začiatku očitými svedkami a služobníkmi slova,
3 predsa som aj ja uznal za dobré dôkladne a postupne prebádať všetko od začiatku a napísať ti, vznešený Teofil,
4 aby si poznal spoľahlivosť náuky, do ktorej ťa zasvätili.
```

**Viac veršov v jednom riadku:**
```
1 Hoci sa už mnohí pokúšali vyrozprávať rad-radom udalosti, 2 ako nám to podali tí, čo boli od začiatku očitými svedkami, 3 predsa som aj ja uznal za dobré dôkladne a postupne prebádať všetko od začiatku a napísať ti, vznešený Teofil, 4 aby si poznal spoľahlivosť náuky, do ktorej ťa zasvätili.
```

### 2. API test (funkčný):
```bash
# Test validácie
curl -X POST -H "Content-Type: application/json" \
  -d '{"locale_id": 1}' \
  http://localhost:3000/api/admin/bible-bulk-import

# Očakávaná odpoveď: {"success":false,"message":"Chýbajú povinné parametre pre import."}
```

### 3. Parsovanie (testované):
- ✅ Správne parsuje verše vo formáte "číslo medzera text"
- ✅ Podporuje viac veršov v jednom riadku (napr. "1 text 2 text 3 text")
- ✅ Podporuje kombinovaný formát (niektoré riadky s jedným veršom, iné s viacerými)
- ✅ Filtruje prázdne riadky
- ✅ Validuje čísla veršov

### 4. Databáza:
- Verše sa ukladajú do `dev_bible_verses` tabuľky
- Automatická kontrola duplikátov
- Validácia závislostí (locale, translation, book)

## Funkcie:
- ✅ Automatické parsovanie textu
- ✅ Dropdown pre výber lokality/prekladu/knihy
- ✅ Náhľad parsovaných veršov
- ✅ Bulk import do databázy
- ✅ Kontrola duplikátov
- ✅ Detailné chybové hlásenia
- ✅ Responzívny dizajn

## Poznámky:
- Pre testovanie budete potrebovať existujúce záznamy v tabuľkách `locales`, `translations`, `books`
- Systém automaticky preskočí duplikáty
- Všetky verše sa označia ako `is_active = true`