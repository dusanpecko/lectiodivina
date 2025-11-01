// scripts/check_db.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
  // Lokalizácie
  const { data: locales } = await supabase
    .from('locales')
    .select('*')
    .order('code');

  console.log('📍 Aktuálne lokalizácie:');
  locales?.forEach(locale => {
    console.log(`  ${locale.code}: ${locale.name} (${locale.native_name})`);
  });

  // Španielske dni
  const { data: esData, error: esError, count: esCount } = await supabase
    .from('liturgical_calendar')
    .select('datum, celebration_title, celebration_rank, season', { count: 'exact' })
    .eq('locale_code', 'es')
    .gte('datum', '2025-01-01')
    .lte('datum', '2025-12-31')
    .order('datum')
    .limit(5);

  if (esError) {
    console.error('ES Error:', esError);
  } else {
    console.log(`\n🇪🇸 Španielsky kalendár 2025: ${esCount} dní`);
    console.log('Prvých 5 dní:');
    esData.forEach(day => {
      console.log(`  ${day.datum}: ${day.celebration_title} (${day.season})`);
    });
  }

  // Slovenské dni
  const { data: skData, error: skError, count: skCount } = await supabase
    .from('liturgical_calendar')
    .select('datum, celebration_title, celebration_rank, season', { count: 'exact' })
    .eq('locale_code', 'sk')
    .gte('datum', '2025-01-01')
    .lte('datum', '2025-12-31')
    .order('datum')
    .limit(5);

  if (skError) {
    console.error('SK Error:', skError);
  } else {
    console.log(`\n🇸🇰 Slovenský kalendár 2025: ${skCount || 0} dní`);
    if (skData && skData.length > 0) {
      console.log('Prvých 5 dní:');
      skData.forEach(day => {
        console.log(`  ${day.datum}: ${day.celebration_title} (${day.season})`);
      });
    }
  }

  // Liturgical years
  const { data: yearsData } = await supabase
    .from('liturgical_years')
    .select('*')
    .eq('year', 2025)
    .order('locale_code');

  console.log(`\n📅 Liturgical years pre 2025:`);
  yearsData?.forEach(year => {
    console.log(`  ${year.locale_code}: ID ${year.id}, generated: ${year.is_generated}`);
  });
}

checkDatabase().catch(console.error);