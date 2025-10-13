# Testovacie dáta pre Bible Bulk Import

## Test 1: Pôvodný formát (jeden verš na riadok)
```
1 Hoci sa už mnohí pokúšali vyrozprávať rad-radom udalosti, ktoré sa u nás stali,
2 ako nám to podali tí, čo boli od začiatku očitými svedkami a služobníkmi slova,
3 predsa som aj ja uznal za dobré dôkladne a postupne prebádať všetko od začiatku a napísať ti, vznešený Teofil,
4 aby si poznal spoľahlivosť náuky, do ktorej ťa zasvätili.
```

## Test 2: Nový formát (viac veršov v jednom riadku)
```
1 Hoci sa už mnohí pokúšali vyrozprávať rad-radom udalosti, 2 ako nám to podali tí, čo boli od začiatku očitými svedkami, 3 predsa som aj ja uznal za dobré dôkladne a postupne prebádať všetko od začiatku a napísať ti, vznešený Teofil, 4 aby si poznal spoľahlivosť náuky, do kterej ťa zasvätili.
```

## Test 3: Kombinovaný formát
```
1 Hoci sa už mnohí pokúšali vyrozprávať rad-radom udalosti, ktoré sa u nás stali,
2 ako nám to podali tí, čo boli od začiatku očitými svedkami a služobníkmi slova, 3 predsa som aj ja uznal za dobré dôkladne a postupne prebádať všetko od začiatku a napísať ti, vznešený Teofil,
4 aby si poznal spoľahlivosť náuky, do ktorej ťa zasvätili.
```

## Test 4: Krátky test (všetko v jednom riadku)
```
1 Prvý verš textu, 2 Druhý verš textu, 3 Tretí verš textu.
```

## Očakávané Výsledky:
- Všetky testy by mali parsovať 4 verše (okrem Test 4, ktorý má 3 verše)
- Každý verš by mal mať správne číslo a text
- Náhľad by mal zobraziť všetky verše oddelene