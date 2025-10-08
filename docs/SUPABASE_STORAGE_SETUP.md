# Návod: Vytvorenie Storage Bucketu "news" v Supabase

## Krok 1: Otvorte Supabase Dashboard
1. Prejdite na [https://supabase.com](https://supabase.com)
2. Prihláste sa
3. Vyberte váš projekt "lectiodivina"

## Krok 2: Vytvorte Bucket
1. V ľavom menu kliknite na **"Storage"**
2. Kliknite na **"New bucket"** (zelené tlačidlo vpravo hore)
3. Vyplňte údaje:
   - **Name**: `news`
   - **Public bucket**: ✅ **Áno** (zaškrtnite)
   - **File size limit**: 50 MB (predvolené)
   - **Allowed MIME types**: `image/*` (alebo nechajte prázdne)
4. Kliknite na **"Create bucket"**

## Krok 3: Vytvorte Priečinok (Folder)
1. Kliknite na novo vytvorený bucket **"news"**
2. Kliknite na **"New folder"**
3. Názov priečinka: `images`
4. Kliknite na **"Create folder"**

## Krok 4: Nastavte Policies (Prístupové práva)

### Možnosť A: Cez Dashboard (jednoduchšie)
1. V buckete "news" kliknite na **"Policies"**
2. Kliknite na **"New policy"**
3. Pre každú policy:

#### Policy 1: Public Read (Verejné čítanie)
- **Policy name**: `Public read access for news images`
- **Allowed operation**: `SELECT`
- **Policy definition**: 
  ```sql
  (bucket_id = 'news')
  ```

#### Policy 2: Authenticated Upload (Prihlásení môžu nahrávať)
- **Policy name**: `Authenticated users can upload`
- **Allowed operation**: `INSERT`
- **Policy definition**: 
  ```sql
  (bucket_id = 'news' AND auth.role() = 'authenticated')
  ```

#### Policy 3: Authenticated Update (Prihlásení môžu aktualizovať)
- **Policy name**: `Authenticated users can update`
- **Allowed operation**: `UPDATE`
- **Policy definition**: 
  ```sql
  (bucket_id = 'news' AND auth.role() = 'authenticated')
  ```

#### Policy 4: Authenticated Delete (Prihlásení môžu mazať)
- **Policy name**: `Authenticated users can delete`
- **Allowed operation**: `DELETE`
- **Policy definition**: 
  ```sql
  (bucket_id = 'news' AND auth.role() = 'authenticated')
  ```

### Možnosť B: Cez SQL (rýchlejšie)
1. V ľavom menu kliknite na **"SQL Editor"**
2. Kliknite na **"New query"**
3. Vložte obsah súboru `sql/create_news_bucket.sql`
4. Kliknite na **"Run"**

## Krok 5: Overte Nastavenie
1. Bucket **"news"** by mal byť viditeľný v zozname bucketov
2. Malo by byť označené: **Public** ✅
3. V priečinku by mal byť **images/** folder

## Hotovo! 🎉

Teraz môžete používať komponentu `ImageUploadCrop` na nahrávanie obrázkov do news článkov.

## Testovanie
1. Prejdite na `/admin/news/new`
2. Kliknite na **"Nahrať obrázok"**
3. Vyberte obrázok a orezajte ho
4. Kliknite na **"Uložiť obrázok"**
5. Obrázok by sa mal zobraziť v náhľade

## Poznámky
- Obrázky sú automaticky orezané na **16:9** (1920x1080px)
- Formát: **JPEG** s 85% kvalitou
- Názov súboru je timestamp (napr. `1704654321000.jpg`)
- Obrázky sú verejne prístupné cez URL
