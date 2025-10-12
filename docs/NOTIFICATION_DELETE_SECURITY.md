# Konfigurácia bezpečnostného kódu pre mazanie notifikácií

## Predvolený kód
- Predvolená hodnota: `587321`
- Tento kód je potrebný pre vymazanie histórie notifikácií

## Zmena bezpečnostného kódu

### Možnosť 1: Cez environment variable (odporúčané)
Nastavte v `.env.local`:
```env
NOTIFICATION_DELETE_CODE=vášNovýTajnýKód123
```

### Možnosť 2: Priamo v kóde
Upravte súbor `/src/app/api/admin/notification-logs/route.ts`:
```typescript
// Riadok ~10
const DELETE_SECURITY_CODE = process.env.NOTIFICATION_DELETE_CODE || 'váš-nový-kód';
```

## Bezpečnostné odporúčania

### ✅ Dobrý kód:
- Dlhý (minimálne 6 znakov)
- Kombinácia čísel a písmen
- Unikátny (nie rovnaký ako admin token)
- Nie je uvedený v dokumentácii ani kóde

Príklady:
- `xK9p2mQ7`
- `Secure2025!`
- `n0t1f1c@t10n`

### ❌ Zlý kód:
- `123456`
- `password`
- `admin`
- Akýkoľvek kód, ktorý je verejne známy

## Distribúcia kódu

### Kto by mal poznať kód:
✅ **Hlavný administrátor** - ten, kto má plný prístup k databáze
✅ **Vedúci tímu** - ak je zodpovedný za správu systému

### Kto by NEMAL poznať kód:
❌ **Bežní administrátori** - môžu posielať notifikácie, ale nemôžu mazať históriu
❌ **Externí dodávatelia** - nemajú potrebu mazať históriu
❌ **Dokumentácia** - kód sa nikdy nezapisuje do verejnej dokumentácie

## Ako bezpečne zdieľať kód

### 1. Osobne
- Pri stretnutí priamo povedať
- Napísať na papier a odovzdať

### 2. Šifrovaná komunikácia
- Signal, Telegram (secret chat)
- Šifrovaný email (PGP)
- Password manager so zdieľaním (1Password, Bitwarden)

### 3. NIE:
❌ Email bez šifrovania
❌ SMS
❌ Slack/Teams/Discord
❌ WhatsApp (nie je end-to-end pre skupiny)
❌ Papier na viditeľnom mieste

## Otestovanie zmeny

Po zmene kódu:

1. **Reštartujte server**
   ```bash
   npm run dev
   ```

2. **Otvorte** `/admin/notifications`

3. **Skúste vymazať** notifikáciu:
   - So starým kódom → mal by zlyhat ❌
   - S novým kódom → mal by uspieť ✅

4. **Overte v browser console** (F12):
   - Pri nesprávnom kóde: `403 Forbidden`
   - Pri správnom kóde: `200 OK`

## Bezpečnostné incidenty

### Ak kód unikol:
1. **Okamžite ho zmeňte** (cez ENV variable)
2. **Reštartujte produkčný server**
3. **Informujte tím**, že kód bol zmenený
4. **Skontrolujte audit logy** v Supabase

### Ako zistiť, či niekto použil kód:
Pozrite si Supabase logy:
```sql
-- Zoznam vymazaných notifikácií (neexistujúce ID)
SELECT * FROM audit_logs 
WHERE table_name = 'notification_logs' 
AND action_type = 'delete'
ORDER BY created_at DESC;
```

## Odporúčania pre produkciu

1. ✅ **Použite ENV variable** - nikdy nekódujte priamo do súboru
2. ✅ **Dlhý náhodný kód** - minimálne 12 znakov
3. ✅ **Zdieľajte len nevyhnutne** - čím menej ľudí, tým lepšie
4. ✅ **Mení pravidelne** - každých 3-6 mesiacov
5. ✅ **Dokumentujte zmeny** - kto, kedy a prečo zmenil kód

## Príklad produkčnej konfigurácie

`.env.local`:
```env
# Bezpečnostný kód pre mazanie notifikácií
# Posledná zmena: 2025-10-11 (hlavný admin)
# Platnosť: do 2026-01-11
NOTIFICATION_DELETE_CODE=xK9p2mQ7n1f8c@t0r
```

Poznámka v team wiki:
```
Bezpečnostný kód pre mazanie notifikácií existuje, ale nie je verejný.
Ak ho potrebujete, kontaktujte hlavného administrátora osobne.
Kód sa mení každých 3 mesiace.
```

## FAQ

**Q: Môžem použiť rovnaký kód ako admin token?**
A: Nie, mali by byť rôzne pre lepšiu bezpečnosť.

**Q: Môžem mať viac kódov?**
A: Momentálne nie, ale môžete upraviť kód pre podporu viacerých:
```typescript
const VALID_DELETE_CODES = (process.env.NOTIFICATION_DELETE_CODES || '587321').split(',');
if (!VALID_DELETE_CODES.includes(securityCode)) { ... }
```

**Q: Čo ak zabudnem kód?**
A: Môžete ho zmeniť cez ENV variable alebo priamo v kóde a reštartovať server.

**Q: Je kód šifrovaný v databáze?**
A: Kód sa NEukladá do databázy, overuje sa len pri DELETE requeste.

**Q: Môže niekto hacknut kód z frontendu?**
A: Nie, overenie prebieha výhradne na serveri. Frontend nepozná správnu hodnotu.
