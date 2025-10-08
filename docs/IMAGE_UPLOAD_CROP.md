# ImageUploadCrop - Komponenta na nahrávanie a orezávanie obrázkov

## Popis
Komponenta umožňuje používateľom nahrávať obrázky, orezávať ich na 16:9 pomer strán a automaticky nahrávať do Supabase Storage.

## Funkcie
- ✂️ **Orezávanie obrázkov** na 16:9 pomer strán
- 📤 **Automatické nahrávanie** do Supabase Storage
- 🔍 **Zoom a posun** pre presné orezanie
- 📱 **Responzívny dizajn**
- 🖼️ **Náhľad** aktuálneho obrázka
- 🗑️ **Odstránenie** obrázka

## Použitie

```tsx
import ImageUploadCrop from "@/app/components/ImageUploadCrop";

<ImageUploadCrop
  supabase={supabase}
  currentImageUrl={news.image_url}
  onImageUploaded={(url) => setImageUrl(url)}
  bucketName="news"
  folder="images"
/>
```

## Props

| Prop | Typ | Popis | Predvolené |
|------|-----|-------|------------|
| `supabase` | `SupabaseClient` | Supabase klient | **povinné** |
| `currentImageUrl` | `string?` | Aktuálna URL obrázka | `undefined` |
| `onImageUploaded` | `(url: string) => void` | Callback po nahratí | **povinné** |
| `bucketName` | `string` | Názov bucketu | `"news"` |
| `folder` | `string` | Názov priečinka | `"images"` |

## Nastavenie Supabase Storage

### 1. Vytvorenie bucketu "news"

V Supabase dashboarde:
1. Prejdite na **Storage**
2. Kliknite na **New bucket**
3. Názov: `news`
4. Public bucket: **Áno** ✅

Alebo použite SQL príkaz zo súboru `sql/create_news_bucket.sql`

### 2. Storage Policies

Bucket má nastavené policies:
- **Public read** - každý môže čítať obrázky
- **Authenticated upload** - iba prihlásení môžu nahrávať
- **Authenticated update/delete** - iba prihlásení môžu upravovať/mazať

## Technické detaily

### Orezávanie
- Pomer strán: **16:9**
- Výstupná veľkosť: **1920x1080px** (Full HD)
- Kompresia: **85% JPEG**

### Závislosti
```bash
npm install react-easy-crop
```

### Štruktúra súborov v Storage
```
news/
  └── images/
      ├── 1704654321000.jpg
      ├── 1704654322000.jpg
      └── ...
```

Názov súboru je timestamp v milisekundách.

## Príklad integrácie

```tsx
const [imageUrl, setImageUrl] = useState("");

<div>
  <ImageUploadCrop
    supabase={supabase}
    currentImageUrl={imageUrl}
    onImageUploaded={setImageUrl}
  />
</div>
```

## Screenshots

### 1. Výber súboru
- Tlačidlo "Nahrať obrázok"
- Náhľad aktuálneho obrázka

### 2. Orezávanie
- Interaktívny crop tool
- Zoom slider (1x - 3x)
- Real-time preview

### 3. Po nahratí
- Automatické zobrazenie nového obrázka
- URL sa uloží do state
