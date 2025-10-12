# História odoslaných notifikácií

## Prehľad
Systém ukladá všetky odoslané push notifikácie do tabuľky `notification_logs` a umožňuje ich prezeranie a mazanie v admin rozhraní.

## Funkcie

### 1. Automatické logovanie
Každá odoslaná notifikácia sa automaticky uloží do databázy s týmito údajmi:
- **Nadpis a obsah** notifikácie
- **Jazyk** (locale_id)
- **Téma** (regular/occasional)
- **FCM Message ID** - jedinečný identifikátor z Firebase
- **Počet príjemcov** - koľko užívateľov notifikáciu dostalo
- **Obrázok** (ak bol priložený)
- **Časová pečiatka** (created_at)

### 2. Zobrazenie histórie
Admin rozhranie (`/admin/notifications`) zobrazuje:
- Zoznam posledných 50 odoslaných notifikácií
- Celkový počet zaznamenaných notifikácií
- Detaily každej notifikácie (jazyk, téma, počet príjemcov)
- Indikátor, či notifikácia obsahovala obrázok

### 3. Bezpečné mazanie
Administrátor môže vymazať záznamy s dvojitým overením:

#### Proces mazania:
1. **Klik na tlačidlo "Vymazať"** pri konkrétnej notifikácii
2. **Otvorenie dialógového okna** s detailmi notifikácie
3. **Zadanie tajného bezpečnostného kódu** (pozná len hlavný admin)
4. **Potvrdenie** - notifikácia sa vymaže z databázy

#### Bezpečnostné opatrenia:
- ✅ **Tajný bezpečnostný kód** - pozná ho len hlavný administrátor
- ✅ Kód sa **nezobrazuje v UI** (input type="password")
- ✅ Akcia je **nevratná**
- ✅ API vyžaduje **admin autorizáciu**
- ✅ Backend **overuje bezpečnostný kód**
- ✅ Kód: `587321` (konfigurovateľný v API route)

## API Endpoints

### GET `/api/admin/notification-logs`
Načíta zoznam odoslaných notifikácií.

**Query parametry:**
- `limit` (voliteľný, default: 50) - počet záznamov
- `offset` (voliteľný, default: 0) - posun pre stránkovanie

**Odpoveď:**
```json
{
  "logs": [
    {
      "id": "uuid",
      "title": "Nadpis",
      "body": "Obsah notifikácie",
      "topic": "regular",
      "locale_name": "Slovenčina",
      "locale_code": "sk",
      "subscriber_count": 150,
      "image_url": "https://...",
      "created_at": "2025-10-11T10:30:00Z"
    }
  ],
  "total": 245
}
```

### DELETE `/api/admin/notification-logs`
Vymaže konkrétnu notifikáciu z histórie.

**Request body:**
```json
{
  "id": "uuid-notifikacie",
  "securityCode": "587321"
}
```

**Odpoveď:**
```json
{
  "success": true,
  "message": "Notifikácia bola úspešne vymazaná"
}
```

**Chyby:**
- `403` - Nesprávny bezpečnostný kód
- `401` - Neautorizovaný prístup
- `400` - Chýbajúce ID notifikácie

## Databázová štruktúra

### Tabuľka: `notification_logs`
```sql
CREATE TABLE notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  locale_id bigint NOT NULL REFERENCES locales(id),
  topic text NOT NULL,
  fcm_message_id text NOT NULL,
  subscriber_count integer DEFAULT 0,
  image_url text,
  sent_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);
```

### Indexy
- `idx_notification_logs_sent_at` - pre triedenie podľa dátumu odoslania
- `idx_notification_logs_locale_id` - pre filtrovanie podľa jazyka

### Row Level Security (RLS)
- ✅ Povoľuje prístup len administrátorom
- ✅ Service role má plný prístup (pre API routes)

## Štatistiky
API endpoint `/api/admin/notification-stats` využíva dáta z `notification_logs` na generovanie štatistík:
- Celkový počet odoslaných notifikácií
- Rozdelenie podľa jazykov
- Rozdelenie podľa tém
- Rozdelenie podľa dátumov

## Bezpečnosť

### Autorizácia
- Všetky API volania vyžadujú admin token v hlavičke
- Backend overuje token pomocou `isValidAdminToken()`

### Bezpečnostný kód
- **Tajný kód**: `587321` (konfigurovateľný v `/api/admin/notification-logs/route.ts`)
- **Nezobrazuje sa v UI** - input používa type="password"
- Overuje sa **na serveri** (nie len na klientovi)
- Povinný pre každú DELETE operáciu
- Pozná ho len hlavný administrátor

### RLS politiky
- Databázové pravidlá obmedzujú prístup len pre administrátorov
- Service role má výnimku pre API operácie

## Použitie

### Zobrazenie histórie
1. Prejdite na `/admin/notifications`
2. Skrolujte k sekcii "História odoslaných notifikácií"
3. Uvidíte posledných 50 notifikácií s detailmi

### Vymazanie záznamu
1. V tabuľke histórie kliknite na "Vymazať"
2. V dialógu overte detaily notifikácie
3. Zadajte **tajný bezpečnostný kód** (pozná len hlavný admin)
4. Kliknite "Vymazať"

**Poznámka:** Kód sa v dialógu nezobrazuje - je to bezpečnostné opatrenie.

## Migrácie
Pre vytvorenie tabuľky spustite SQL migráciu:
```bash
psql -h <supabase-host> -U postgres -d postgres -f sql/create_notification_logs_table.sql
```

Alebo ju spustite priamo v Supabase SQL Editore.

## Poznámky
- História je nezávislá od naplánovaných notifikácií (`scheduled_notifications`)
- Vymazanie záznamu z histórie **neovplyvní** odoslané notifikácie v aplikáciách užívateľov
- Dáta slúžia len na auditovanie a štatistiky
