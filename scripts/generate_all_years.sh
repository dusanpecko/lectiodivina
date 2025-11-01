#!/bin/bash
# scripts/generate_all_years.sh
# Generuje všetky kalendáre na roky 2025-2035

cd /Users/dusanpecko/lectiodivina/backend

echo "🚀 Začínam generovanie kalendárov na roky 2025-2035"
echo "⏰ Začiatok: $(date)"

# Rozdelené do menších skupín aby nedošlo k prekročeniu timeoutu
echo "📅 Generujem 2025-2027..."
node scripts/pregenerate_calendars.js 2025-2027

echo "📅 Generujem 2028-2030..."
node scripts/pregenerate_calendars.js 2028-2030

echo "📅 Generujem 2031-2033..."
node scripts/pregenerate_calendars.js 2031-2033

echo "📅 Generujem 2034-2035..."
node scripts/pregenerate_calendars.js 2034-2035

echo "✅ Generovanie dokončené!"
echo "⏰ Koniec: $(date)"

# Overenie výsledkov
echo "📊 Súhrn kalendárov v databáze:"
node -e "
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const { data } = await supabase
  .from('liturgical_calendar')
  .select('locale_code, datum')
  .gte('datum', '2025-01-01')
  .lte('datum', '2035-12-31');

const summary = {};
data?.forEach(row => {
  const year = row.datum.split('-')[0];
  const key = \`\${row.locale_code}/\${year}\`;
  summary[key] = (summary[key] || 0) + 1;
});

console.log('Kalendáre po jazyk/rok:');
Object.entries(summary).sort().forEach(([key, count]) => {
  console.log(\`  \${key}: \${count} dní\`);
});

console.log(\`\nCelkovo: \${data?.length || 0} záznamov\`);
"