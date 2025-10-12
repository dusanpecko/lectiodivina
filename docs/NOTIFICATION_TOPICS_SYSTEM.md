# Systém tém notifikácií

## Prehľad

Nový systém umožňuje:
- ✅ **Adminom vytvárať vlastné témy** notifikácií (namiesto pevných "regular"/"occasional")
- ✅ **Používateľom si vyberať**, ktoré témy chcú prijímať
- ✅ **Viacjazyčnú podporu** (SK, EN, CS)
- ✅ **Vizuálne prispôsobenie** (ikony, farby)
- ✅ **Štatistiky** (počet odberateľov, odoslaných notifikácií)

## Databázová štruktúra

### 1. `notification_topics` - Témy notifikácií
Obsahuje všetky dostupné témy, ktoré admin spravuje.

**Hlavné polia:**
- `name_sk/en/cs` - Názov v rôznych jazykoch
- `slug` - Jedinečný identifikátor (URL-friendly)
- `description_*` - Popis témy
- `icon` - Názov ikony
- `color` - Hex farba témy
- `is_active` - Či je téma aktívna
- `is_default` - Či sa automaticky priradí novým užívateľom
- `display_order` - Poradie zobrazovan ia
- `category` - Kategória (spiritual, educational, news, other)

**Predvolené témy:**
1. 🔵 **Denné čítania** (`daily-readings`) - pravidelné duchovné čítania
2. 🟡 **Príležitostné oznamy** (`special-occasions`) - špeciálne udalosti
3. 🟢 **Modlitby** (`prayers`) - modlitbové podnety
4. 🟣 **Ruženec** (`rosary`) - spoločné ružence
5. 🔴 **Udalosti** (`events`) - nadchádzajúce podujatia

### 2. `user_notification_preferences` - Používateľské nastavenia
Ukladá, ktoré témy má každý užívateľ povolené.

**Polia:**
- `user_id` - ID užívateľa
- `topic_id` - ID témy
- `is_enabled` - Či má užívateľ tému povolenú

**Logika:**
- Ak užívateľ NEMÁ záznam pre tému → použije sa `is_default` z témy
- Ak užívateľ MÁ záznam → použije sa jeho `is_enabled`

### 3. Aktualizované tabuľky
- `notification_logs` + stĺpec `topic_id`
- `scheduled_notifications` + stĺpec `topic_id`

## Inštalácia

### Krok 1: Spustite SQL migráciu
V Supabase SQL Editore spustite:
```sql
-- Obsah z sql/create_notification_topics_simple.sql
```

### Krok 2: Overte vytvorenie tabuliek
```sql
SELECT * FROM notification_topics;
SELECT * FROM user_notification_preferences;
```

Malo by sa zobraziť 5 predvolených tém.

## Admin rozhranie

### `/admin/notification-topics` - Zoznam tém
**Funkcie:**
- Tabuľka so všetkými témami
- Zobrazenie: názov, popis, farba, ikona, aktívne, počet odberateľov
- Tlačidlá: "Nová téma", "Upraviť", "Deaktivovať"
- Drag & drop pre zmenu poradia (budúca funkcia)

### `/admin/notification-topics/new` - Nová téma
**Formulár:**
- Názov (SK, EN, CS)
- Slug (auto-generovaný z názvu)
- Popis (SK, EN, CS)
- Ikona (výber z predvolenych)
- Farba (color picker)
- Kategória (dropdown)
- Predvolená (checkbox)
- Aktívna (checkbox)
- Poradie (number input)

### `/admin/notification-topics/[id]` - Úprava témy
- Rovnaký formulár ako pri vytváraní
- Zobrazenie štatistík (počet odberateľov, odoslaných notifikácií)
- Možnosť deaktivovať tému

## Používateľské rozhranie

### `/profile/notifications` alebo `/settings/notifications`
**Funkcie:**
- Zoznam všetkých aktívnych tém
- Prepínač (toggle) pre každú tému
- Zobrazenie ikony a farby témy
- Popis každej témy
- Automatické uloženie pri zmene

**Príklad UI:**
```
🔵 Denné čítania                    [ON]
   Pravidelné denné čítania z Písma

🟡 Príležitostné oznamy             [ON]
   Špeciálne udalosti a sviatky

🟢 Modlitby                         [OFF]
   Modlitbové podnety

🟣 Ruženec                          [OFF]
   Spoločné ružence

🔴 Udalosti                         [ON]
   Nadchádzajúce podujatia
```

## API Endpoints

### Admin API

#### `GET /api/admin/notification-topics`
Načíta všetky témy so štatistikami.

**Query params:**
- `active_only` (boolean) - len aktívne témy

**Response:**
```json
{
  "topics": [
    {
      "id": "uuid",
      "name_sk": "Denné čítania",
      "slug": "daily-readings",
      "color": "#4A5085",
      "is_active": true,
      "subscriber_count": 1250,
      "total_sent": 340
    }
  ],
  "total": 5
}
```

#### `POST /api/admin/notification-topics`
Vytvorí novú tému.

**Body:**
```json
{
  "name_sk": "Nová téma",
  "slug": "nova-tema",
  "description_sk": "Popis témy",
  "icon": "star",
  "color": "#3B82F6",
  "is_default": false,
  "category": "spiritual"
}
```

#### `PUT /api/admin/notification-topics/[id]`
Aktualizuje tému.

#### `DELETE /api/admin/notification-topics/[id]`
Vymaže tému (len ak nemá žiadne notifikácie).

### User API

#### `GET /api/user/notification-preferences`
Načíta preferencie prihláseného užívateľa.

**Response:**
```json
{
  "preferences": [
    {
      "topic_id": "uuid",
      "topic": {
        "name_sk": "Denné čítania",
        "slug": "daily-readings",
        "color": "#4A5085"
      },
      "is_enabled": true
    }
  ]
}
```

#### `POST /api/user/notification-preferences`
Aktualizuje preferencie.

**Body:**
```json
{
  "topic_id": "uuid",
  "is_enabled": true
}
```

## Aktualizácia odosielania notifikácií

### Starý systém (pred zmenou):
```typescript
// Pevné hodnoty
topic: 'regular' | 'occasional'
```

### Nový systém:
```typescript
// Dynamické témy z databázy
topic_id: string (UUID)

// Filtrovanie príjemcov
const { data: enabledUsers } = await supabase
  .from('user_notification_preferences')
  .select('user_id')
  .eq('topic_id', selectedTopicId)
  .eq('is_enabled', true);
```

### Logika odosielania:
1. Admin vyberie tému z dropdownu (namiesto "regular"/"occasional")
2. Backend načíta všetkých užívateľov, ktorí majú tému povolenú
3. Notifikácia sa odošle len týmto užívateľom
4. Ak téma má `is_default=true`, zahrnie aj užívateľov bez explicitných preferencií

## Migrácia zo starého systému

### Zachovanie kompatibility:
- Stĺpec `topic` (text) zostáva v tabuľkách
- Pridaný nový stĺpec `topic_id` (uuid)
- Stare notifikácie mapujú:
  - `'regular'` → tému `'daily-readings'`
  - `'occasional'` → tému `'special-occasions'`

### Migračný SQL:
```sql
UPDATE notification_logs 
SET topic_id = (SELECT id FROM notification_topics WHERE slug = 'daily-readings')
WHERE topic = 'regular';

UPDATE notification_logs 
SET topic_id = (SELECT id FROM notification_topics WHERE slug = 'special-occasions')
WHERE topic = 'occasional';
```

## Prípadné použitie

### Scenár 1: Admin pridá novú tému "Katechéza"
1. Admin ide na `/admin/notification-topics/new`
2. Vyplní formulár:
   - Názov: "Katechéza"
   - Slug: "catechesis"
   - Ikona: "book-open"
   - Farba: "#3B82F6"
   - Predvolená: `false`
3. Uloží tému
4. Téma sa objaví v admin liste a v užívateľských nastaveniach

### Scenár 2: Užívateľ si nastaví preferencie
1. Užívateľ ide na `/profile/notifications`
2. Vidí zoznam všetkých tém
3. Zapne "Modlitby", vypne "Ruženec"
4. Nastavenia sa automaticky uložia
5. Od teraz dostáva len notifikácie z povolených tém

### Scenár 3: Admin odošle notifikáciu
1. Admin ide na `/admin/notifications/new`
2. Vyplní nadpis a text
3. Vyberie tému "Modlitby" (dropdown namiesto "regular"/"occasional")
4. Odošle notifikáciu
5. Backend:
   - Načíta všetkých užívateľov s `is_enabled=true` pre tému "Modlitby"
   - Odošle im notifikáciu cez Firebase FCM
   - Uloží log do databázy

## Výhody nového systému

✅ **Flexibilita** - Admin môže vytvárať ľubovoľné témy  
✅ **Kontrola užívateľa** - Každý si nastaví, čo chce  
✅ **Viacjazyčnosť** - Názvy a popisy v SK/EN/CS  
✅ **Vizuálne rozlíšenie** - Ikony a farby pre každú tému  
✅ **Štatistiky** - Počet odberateľov a odoslaných notifikácií  
✅ **Škálovateľnosť** - Ľahko pridať nové témy bez zmeny kódu  
✅ **Backwards compatible** - Starý systém funguje ďalej  

## Ďalšie vylepšenia (budúcnosť)

- 📅 Plánovanie notifikácií podľa témy
- 📊 Detailné štatistiky (open rate, click rate)
- 🔔 Push notification settings (tichý režim, priorita)
- 🌐 Automatický preklad notifikácií podľa jazyka
- 👥 Segmentácia užívateľov (napr. len pre určité regióny)
- 📱 Predvolené nastavenia pri registrácii
- 🎨 Vlastné ikony (upload)
