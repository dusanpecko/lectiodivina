# Admin Edit Pages - CSS Systém

Tento dokument popisuje nový CSS systém pre admin editačné stránky v Lectio Divina projektu.

## 📁 Súbory

### 1. `src/app/admin/admin-edit.css`
Obsahuje CSS premenné a utility triedy pre editačné stránky.

**CSS Premenné:**
```css
--admin-edit-primary: #40467b       /* Primárna farba firmy */
--admin-edit-secondary: #686ea3     /* Sekundárna farba firmy */
--admin-edit-gradient-main         /* Hlavný gradient */
--admin-edit-section-bg            /* Pozadie sekcií */
--admin-edit-input-border-focus    /* Border farba pri focus */
```

**Utility Triedy:**
- `.admin-edit-gradient-header` - Gradient header s rounded corners
- `.admin-edit-section` - Biela sekcia formulára
- `.admin-edit-input` - Input/select/textarea s focus states
- `.admin-edit-label` - Label s ikonou
- `.admin-edit-button-primary` - Tlačidlo s gradientom

### 2. `src/app/globals.css`
Obsahuje globálne CSS premenné dostupné všade.

```css
--firm-primary: #40467b
--firm-secondary: #686ea3
```

### 3. `src/app/admin/components/`
Reusable React komponenty pre editačné stránky.

## 🎨 Komponenty

### EditPageHeader
Gradient header pre editačné stránky s back tlačidlom a statusom.

```tsx
import { EditPageHeader } from '@/app/admin/components';
import { Sparkles } from 'lucide-react';

<EditPageHeader
  title="Upraviť rožanec"
  description="Upravte informácie o rožanci"
  icon={Sparkles}
  backUrl="/admin/rosary"
  emoji="📿"
  hasUnsavedChanges={true}
  isDraftAvailable={false}
  unsavedText="Neuložené zmeny"
  draftText="Draft načítaný"
/>
```

**Props:**
- `title` (string) - Hlavný titulok
- `description` (string, optional) - Popis/podnadpis
- `icon` (LucideIcon) - Ikona z lucide-react
- `backUrl` (string) - URL pre návrat
- `emoji` (string, optional) - Emoji na pravej strane
- `hasUnsavedChanges` (boolean) - Zobrazí indikátor neuložených zmien
- `isDraftAvailable` (boolean) - Zobrazí indikátor draftu
- `unsavedText` (string) - Text pre neuložené zmeny
- `draftText` (string) - Text pre draft

---

### FormSection
Sekcia formulára s nadpisom a ikonou.

```tsx
import { FormSection } from '@/app/admin/components';
import { FileText } from 'lucide-react';

<FormSection title="Základné informácie" icon={FileText}>
  {/* Obsah sekcie */}
</FormSection>
```

**Props:**
- `title` (string) - Titulok sekcie
- `icon` (LucideIcon) - Ikona sekcie
- `children` (ReactNode) - Obsah sekcie
- `iconSize` (number, default: 24) - Veľkosť ikony
- `className` (string) - Dodatočné CSS triedy

---

### ActionButton
Tlačidlo s gradientom a ikonou.

```tsx
import { ActionButton } from '@/app/admin/components';
import { Save } from 'lucide-react';

<ActionButton 
  icon={Save}
  variant="primary"
  loading={saving}
  disabled={false}
>
  Uložiť
</ActionButton>
```

**Props:**
- `children` (ReactNode) - Text tlačidla
- `icon` (LucideIcon, optional) - Ikona
- `iconSize` (number, default: 16) - Veľkosť ikony
- `variant` ("primary" | "success" | "danger" | "warning" | "info") - Farba
- `loading` (boolean) - Zobrazí spinner
- `disabled` (boolean) - Deaktivuje tlačidlo
- `...props` - Ostatné HTML button props (onClick, type, atď.)

**Varianty:**
- `primary` - Firma gradient (#40467b → #686ea3)
- `success` - Zelený gradient
- `danger` - Červený gradient
- `warning` - Oranžový gradient
- `info` - Modrý gradient

---

### FormInput & FormTextarea
Input a textarea s labelom, ikonou a počítadlom znakov.

```tsx
import { FormInput, FormTextarea } from '@/app/admin/components';
import { Sparkles, FileText } from 'lucide-react';

<FormInput
  label="Názov rožanca"
  icon={Sparkles}
  required
  showCharCount
  currentLength={text.length}
  maxLength={150}
  placeholder="Zadajte názov..."
  value={text}
  onChange={(e) => setText(e.target.value)}
/>

<FormTextarea
  label="Popis"
  icon={FileText}
  rows={6}
  showCharCount
  currentLength={desc.length}
  maxLength={500}
  value={desc}
  onChange={(e) => setDesc(e.target.value)}
/>
```

**Props:**
- `label` (string) - Label text
- `icon` (LucideIcon, optional) - Ikona pri labeli
- `iconSize` (number, default: 16) - Veľkosť ikony
- `required` (boolean) - Zobrazí * pri labeli
- `helperText` (string) - Pomocný text pod inputom
- `error` (string) - Error správa (červená)
- `showCharCount` (boolean) - Zobrazí počet znakov
- `currentLength` (number) - Aktuálna dĺžka textu
- `maxLength` (number) - Maximálna dĺžka
- `...props` - Ostatné HTML input/textarea props

---

## 🚀 Použitie

### Refaktorovanie existujúcej stránky

**Pred:**
```tsx
<div className="bg-white rounded-xl shadow-xl p-6 border border-gray-100">
  <div className="flex items-center mb-6">
    <div className="p-2 rounded-lg mr-3" style={{ backgroundColor: '#40467b' }}>
      <FileText size={24} className="text-white" />
    </div>
    <h2 className="text-2xl font-bold" style={{ color: '#40467b' }}>
      Základné informácie
    </h2>
  </div>
  <div className="space-y-6">
    {/* Obsah */}
  </div>
</div>
```

**Po:**
```tsx
<FormSection title="Základné informácie" icon={FileText}>
  <div className="space-y-6">
    {/* Obsah */}
  </div>
</FormSection>
```

---

### Refaktorovanie tlačidiel

**Pred:**
```tsx
<button
  onClick={handleSave}
  disabled={saving}
  className="inline-flex items-center px-3 py-2 text-white rounded-lg"
  style={{ backgroundColor: '#40467b' }}
  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#686ea3'}
  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#40467b'}
>
  <Save size={16} />
  Uložiť
</button>
```

**Po:**
```tsx
<ActionButton icon={Save} variant="primary" loading={saving}>
  Uložiť
</ActionButton>
```

---

### Refaktorovanie inputov

**Pred:**
```tsx
<label className="block text-sm font-semibold" style={{ color: '#40467b' }}>
  <div className="flex items-center gap-2">
    <Sparkles size={16} style={{ color: '#686ea3' }} />
    Názov <span className="text-red-500">*</span>
  </div>
</label>
<input
  className="w-full px-4 py-3 border rounded-lg"
  style={{ borderColor: '#686ea3' }}
  onFocus={(e) => e.target.style.boxShadow = '...'}
/>
```

**Po - Verzia 1 (komponenty):**
```tsx
<FormInput
  label="Názov"
  icon={Sparkles}
  required
  showCharCount
  currentLength={text.length}
  maxLength={150}
/>
```

**Po - Verzia 2 (CSS triedy):**
```tsx
<label className="admin-edit-label">
  <Sparkles size={16} style={{ color: 'var(--admin-edit-icon-color)' }} />
  Názov <span className="text-red-500">*</span>
</label>
<input className="admin-edit-input" />
```

---

## 📝 Príklady použitia

### Jednoduchá editačná stránka

```tsx
import { EditPageHeader, FormSection, ActionButton, FormInput } from '@/app/admin/components';
import { FileText, Save, Trash } from 'lucide-react';

export default function EditArticle() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <EditPageHeader
          title="Upraviť článok"
          icon={FileText}
          backUrl="/admin/articles"
        />

        <form className="space-y-8">
          <FormSection title="Základné informácie" icon={FileText}>
            <FormInput
              label="Titulok"
              required
              showCharCount
              currentLength={title.length}
              maxLength={200}
            />
          </FormSection>

          <div className="flex gap-4">
            <ActionButton icon={Save} variant="primary">
              Uložiť
            </ActionButton>
            <ActionButton icon={Trash} variant="danger">
              Zmazať
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

## 🎨 Prispôsobenie

### Zmena farieb firmy

Upravte farby v `src/app/admin/admin-edit.css`:

```css
:root {
  --admin-edit-primary: #YOUR_COLOR;
  --admin-edit-secondary: #YOUR_COLOR;
}
```

### Pridanie nového variantu ActionButton

V `src/app/admin/components/ActionButton.tsx`:

```tsx
const variantStyles = {
  // ... existujúce varianty
  custom: "bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-600",
};
```

---

## ✅ Výhody

1. **Konzistentný dizajn** - Všetky stránky vyzerajú jednotne
2. **Jednoduchá údržba** - Zmena farby na jednom mieste
3. **Rýchlejší vývoj** - Menej kódu, viac funkcií
4. **Lepšia čitateľnosť** - Čistejší JSX kód
5. **Type-safe** - TypeScript props validácia
6. **Responsive** - Mobile-friendly komponenty

---

## 📚 Ďalšie zdroje

- [Lucide Icons](https://lucide.dev/) - Ikony použité v komponentoch
- [Tailwind CSS](https://tailwindcss.com/) - Utility classes
- [React Hooks](https://react.dev/reference/react) - useState, useCallback, atď.

---

**Vytvorené:** 11. október 2025  
**Autor:** Admin Edit CSS System  
**Verzia:** 1.0.0
