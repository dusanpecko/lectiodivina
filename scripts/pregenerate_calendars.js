// scripts/pregenerate_calendars.js
// Node.js verzia predgenerovania kalendárov

import { createClient } from '@supabase/supabase-js';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import { promisify } from 'util';

dotenv.config({ path: '.env.local' });

const execAsync = promisify(exec);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const SUPPORTED_LANGUAGES = {
  'en': 'GENERAL_ROMAN_ENGLISH',
  'es': 'GENERAL_ROMAN_SPANISH', 
  'it': 'GENERAL_ROMAN_ITALIAN',
  'fr': 'GENERAL_ROMAN_FRENCH',
  'pt': 'GENERAL_ROMAN_PORTUGUESE'
};

async function generateCalendarForLanguage(langCode, constant, year) {
  console.log(`📅 Generujem kalendár pre ${langCode} na rok ${year}...`);
  
  try {
    // 1. Vytvor záznam v liturgical_years
    const lectionaryCycle = ['A', 'B', 'C'][year % 3];
    const ferialCycle = year % 2 === 0 ? 2 : 1;
    
    const { data: yearData, error: yearError } = await supabase
      .from('liturgical_years')
      .upsert({
        year: year,
        locale_code: langCode,
        lectionary_cycle: lectionaryCycle,
        ferial_lectionary: ferialCycle,
        is_generated: true
      }, {
        onConflict: 'year,locale_code'
      })
      .select()
      .single();

    if (yearError) {
      throw new Error(`Year upsert error: ${yearError.message}`);
    }

    const liturgicalYearId = yearData.id;
    console.log(`   ✅ Liturgical year ID: ${liturgicalYearId}`);

    // 2. Vymaž staré záznamy pre daný rok a jazyk
    const { error: deleteError } = await supabase
      .from('liturgical_calendar')
      .delete()
      .eq('locale_code', langCode)
      .gte('datum', `${year}-01-01`)
      .lte('datum', `${year}-12-31`);

    if (deleteError) {
      throw new Error(`Delete error: ${deleteError.message}`);
    }

    // 3. Vygeneruj celý rok cez Ruby gem
    const rubyScript = `
      require 'calendarium-romanum'
      require 'json'
      require 'date'
      
      I18n.locale = :${langCode}
      
      sanctorale = CalendariumRomanum::Data::${constant}.load
      pcal = CalendariumRomanum::PerpetualCalendar.new(sanctorale: sanctorale)
      
      year = ${year}
      days = []
      
      Date.new(year, 1, 1).upto(Date.new(year, 12, 31)) do |date|
        day_info = pcal[date]
        
        celebration = day_info.celebrations.first
        alternative_celebration = day_info.celebrations[1] if day_info.celebrations.length > 1
        
        day_data = {
          datum: date.strftime('%Y-%m-%d'),
          season: day_info.season.symbol.to_s,
          season_week: day_info.season_week,
          weekday: date.strftime('%A').downcase,
          celebration_title: celebration&.title || '',
          celebration_rank: celebration&.rank&.desc || '',
          celebration_rank_num: celebration&.rank&.priority,
          celebration_colour: celebration&.colour&.symbol&.to_s || '',
          alternative_celebration_title: alternative_celebration&.title,
          alternative_celebration_rank: alternative_celebration&.rank&.desc,
          alternative_celebration_rank_num: alternative_celebration&.rank&.priority,
          alternative_celebration_colour: alternative_celebration&.colour&.symbol&.to_s
        }
        
        days << day_data
      end
      
      result = {
        year: year,
        lang: '${langCode}',
        total_days: days.length,
        days: days,
        liturgical_year_id: ${liturgicalYearId}
      }
      
      puts result.to_json
    `;

    const { stdout, stderr } = await execAsync(`ruby -e "${rubyScript}"`);
    
    if (stderr && !stderr.includes('Ignoring')) {
      throw new Error(`Ruby script error: ${stderr}`);
    }

    const result = JSON.parse(stdout);
    const days = result.days;

    console.log(`   📊 Vygenerovaných ${days.length} dní`);

    // 4. Ulož dni do databázy po dávkach
    const BATCH_SIZE = 50;
    let savedCount = 0;

    for (let i = 0; i < days.length; i += BATCH_SIZE) {
      const batch = days.slice(i, i + BATCH_SIZE);
      
      const records = batch.map(day => ({
        datum: day.datum,
        locale_code: langCode,
        season: day.season,
        season_week: day.season_week,
        weekday: day.weekday,
        celebration_title: day.celebration_title,
        celebration_rank: day.celebration_rank,
        celebration_rank_num: day.celebration_rank_num,
        celebration_colour: day.celebration_colour,
        alternative_celebration_title: day.alternative_celebration_title || null,
        alternative_celebration_rank: day.alternative_celebration_rank || null,
        alternative_celebration_rank_num: day.alternative_celebration_rank_num || null,
        alternative_celebration_colour: day.alternative_celebration_colour || null,
        meniny: null,
        lectio_hlava: null,
        liturgical_year_id: liturgicalYearId,
        source_api: 'calendarium-romanum-pregenerated',
        is_custom_edit: false
      }));

      const { error: insertError } = await supabase
        .from('liturgical_calendar')
        .insert(records);

      if (insertError) {
        console.error(`   ❌ Batch insert error:`, insertError);
      } else {
        savedCount += records.length;
        console.log(`   💾 Uložených ${savedCount}/${days.length} dní`);
      }
    }

    console.log(`✅ Kalendár pre ${langCode}/${year} dokončený! (${savedCount} dní)`);
    return { success: true, saved: savedCount };

  } catch (error) {
    console.error(`❌ Chyba pri generovaní ${langCode}/${year}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function main() {
  const args = process.argv.slice(2);
  let years = [2025]; // Default rok
  let languages = Object.keys(SUPPORTED_LANGUAGES);

  // Parsovanie argumentov
  if (args.length > 0) {
    if (args[0].includes('-')) {
      // Range rokov: 2024-2026
      const [start, end] = args[0].split('-').map(Number);
      years = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    } else {
      // Konkrétne roky: 2024 2025 2026
      years = args.filter(arg => !isNaN(Number(arg))).map(Number);
      
      // Konkrétne jazyky: es it fr
      const langArgs = args.filter(arg => isNaN(Number(arg)));
      if (langArgs.length > 0) {
        languages = langArgs.filter(lang => SUPPORTED_LANGUAGES[lang]);
      }
    }
  }

  console.log(`🚀 Spúšťam predgenerovanie kalendárov:`);
  console.log(`   📅 Roky: ${years.join(', ')}`);
  console.log(`   🌍 Jazyky: ${languages.join(', ')}`);
  console.log('');

  const results = [];

  for (const langCode of languages) {
    const constant = SUPPORTED_LANGUAGES[langCode];
    
    for (const year of years) {
      const result = await generateCalendarForLanguage(langCode, constant, year);
      results.push({ langCode, year, ...result });
      
      // Malá pauza medzi generovaniami
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Súhrn výsledkov
  console.log('\n📊 SÚHRN GENEROVANIA:');
  console.log('========================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Úspešných: ${successful.length}`);
  console.log(`❌ Neúspešných: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ Úspešne vygenerované:');
    successful.forEach(r => {
      console.log(`   ${r.langCode}/${r.year}: ${r.saved} dní`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Neúspešné generovania:');
    failed.forEach(r => {
      console.log(`   ${r.langCode}/${r.year}: ${r.error}`);
    });
  }
  
  console.log('\n🎉 Predgenerovanie dokončené!');
}

// Spusti main ak je script volaný priamo
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateCalendarForLanguage };
