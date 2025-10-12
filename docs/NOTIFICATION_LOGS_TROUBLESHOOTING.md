# Riešenie chyby "Chyba pri načítavaní odoslaných notifikácií"

## Problém
Pri načítavaní stránky `/admin/notifications` sa zobrazuje chyba:
```
Chyba pri načítavaní odoslaných notifikácií.
```

## Príčina
Tabuľka `notification_logs` ešte neexistuje v Supabase databáze.

## Riešenie

### Krok 1: Vytvorte tabuľku v Supabase

1. **Otvorte Supabase Dashboard**
   - Prejdite na https://supabase.com/dashboard
   - Vyberte váš projekt

2. **Otvorte SQL Editor**
   - V ľavom menu kliknite na "SQL Editor"
   - Kliknite na "New query"

3. **Spustite SQL skript**
   - Skopírujte a vložte obsah súboru `sql/create_notification_logs_simple.sql`
   - Alebo použite tento SQL kód:

```sql
-- Rýchle vytvorenie tabuľky notification_logs
CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  locale_id integer,
  topic text NOT NULL,
  fcm_message_id text,
  subscriber_count integer DEFAULT 0,
  image_url text,
  created_at timestamp with time zone DEFAULT now()
);

-- Indexy pre výkon
CREATE INDEX IF NOT EXISTS idx_notification_logs_created_at ON notification_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_locale_id ON notification_logs(locale_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_topic ON notification_logs(topic);

-- Vypnúť RLS (API používa service role key)
ALTER TABLE notification_logs DISABLE ROW LEVEL SECURITY;
```

4. **Kliknite "Run"** (alebo Cmd/Ctrl + Enter)

5. **Overte úspech**
   - Mali by ste vidieť správu "Success. No rows returned"
   - To znamená, že tabuľka bola úspešne vytvorená

### Krok 2: Overte funkčnosť

1. **Obnovte stránku** `/admin/notifications`
2. **Sekcia "História odoslaných notifikácií"** by sa mala načítať bez chyby
3. Ak ešte nemáte žiadne notifikácie, uvidíte prázdny zoznam s ikonou

## Automatické logovanie

Od tejto chvíle sa **každá odoslaná notifikácia** automaticky uloží do tabuľky `notification_logs`.

### Testovanie
1. Prejdite na `/admin/notifications/new`
2. Vytvorte a odošlite novú notifikáciu
3. Vráťte sa na `/admin/notifications`
4. V sekcii "História" by ste mali vidieť práve odoslanú notifikáciu

## Ak stále vidíte chybu

### Overenie 1: Skontrolujte tabuľku v Supabase
```sql
SELECT * FROM notification_logs LIMIT 10;
```
Tento SQL príkaz by mal fungovať bez chyby.

### Overenie 2: Skontrolujte API endpoint
V browser console (F12) skontrolujte network tab:
- Hľadajte request na `/api/admin/notification-logs`
- Pozrite si response - mali by byť `{ logs: [], total: 0 }`

### Overenie 3: Skontrolujte server logy
V termináli, kde beží `npm run dev`, by mali byť viditeľné prípadné chyby.

## API Response

### Ak tabuľka neexistuje:
```json
{
  "logs": [],
  "total": 0
}
```
*(API teraz vracia prázdny zoznam namiesto chyby)*

### Ak tabuľka existuje ale je prázdna:
```json
{
  "logs": [],
  "total": 0
}
```

### Ak tabuľka obsahuje dáta:
```json
{
  "logs": [
    {
      "id": "uuid",
      "title": "Nadpis",
      "body": "Obsah",
      "topic": "regular",
      "locale_name": "Slovenčina",
      "locale_code": "sk",
      "subscriber_count": 150,
      "created_at": "2025-10-11T10:30:00Z"
    }
  ],
  "total": 1
}
```

## Poznámky

- ✅ API endpoint teraz gracefully zvláda prípad, keď tabuľka neexistuje
- ✅ Automatické logovanie začne fungovať hneď po vytvorení tabuľky
- ✅ Staré notifikácie (pred vytvorením tabuľky) sa nedajú spätne doplniť
- ✅ RLS je vypnuté, pretože API používa service role key

## Podpora

Ak problém pretrváva, skontrolujte:
1. **Environment variables** - `NEXT_PUBLIC_SUPABASE_URL` a `SUPABASE_SERVICE_ROLE_KEY`
2. **Admin token** - `NEXT_PUBLIC_ADMIN_TOKEN`
3. **Supabase connection** - či sa dá pripojiť k databáze

Prípadne spustite test script:
```bash
./test-notification-logs.sh
```
