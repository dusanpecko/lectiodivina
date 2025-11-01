#!/usr/bin/env ruby

# scripts/pregenerate_calendars.rb
# Skript na predgenerovanie liturgických kalendárov pre všetky jazyky

require 'calendarium-romanum'
require 'json'
require 'date'
require 'pg'
require 'dotenv'

# Načítanie environment variables
Dotenv.load('.env.local')

# Konfigurácia databázy
DB_URL = ENV['DATABASE_URL']
conn = PG.connect(DB_URL)

# Podporované jazyky
SUPPORTED_LANGUAGES = {
  'en' => { constant: 'GENERAL_ROMAN_ENGLISH', locale: :en },
  'es' => { constant: 'GENERAL_ROMAN_SPANISH', locale: :es },
  'it' => { constant: 'GENERAL_ROMAN_ITALIAN', locale: :it },
  'fr' => { constant: 'GENERAL_ROMAN_FRENCH', locale: :fr },
  'pt' => { constant: 'GENERAL_ROMAN_PORTUGUESE', locale: :pt },
  'la' => { constant: 'GENERAL_ROMAN_LATIN', locale: :la },
  'cs' => { constant: 'GENERAL_ROMAN_CZECH', locale: :cs }
}

def generate_calendar_for_language(lang_code, config, year)
  puts "Generujem kalendár pre #{lang_code} na rok #{year}..."
  
  # Nastavenie lokalizácie
  I18n.locale = config[:locale]
  
  # Načítanie kalendárových dát  
  constant_name = config[:constant]
  sanctorale = CalendariumRomanum::Data.const_get(constant_name).load
  pcal = CalendariumRomanum::PerpetualCalendar.new(sanctorale: sanctorale)
  
  # Vytvorenie záznamu v liturgical_years
  lectionary_cycle = ['A', 'B', 'C'][year % 3]
  ferial_cycle = year % 2 == 0 ? 2 : 1
  
  liturgical_year_result = conn.exec_params(
    "INSERT INTO liturgical_years (year, locale_code, lectionary_cycle, ferial_lectionary, is_generated) 
     VALUES ($1, $2, $3, $4, true) 
     ON CONFLICT (year, locale_code) 
     DO UPDATE SET 
       lectionary_cycle = EXCLUDED.lectionary_cycle,
       ferial_lectionary = EXCLUDED.ferial_lectionary,
       is_generated = EXCLUDED.is_generated,
       updated_at = NOW()
     RETURNING id",
    [year, lang_code, lectionary_cycle, ferial_cycle]
  )
  
  liturgical_year_id = liturgical_year_result[0]['id']
  puts "Liturgical year ID: #{liturgical_year_id}"
  
  # Vymazanie starých záznamov
  conn.exec_params(
    "DELETE FROM liturgical_calendar 
     WHERE locale_code = $1 AND DATE_PART('year', datum) = $2",
    [lang_code, year]
  )
  
  # Generovanie všetkých dní v roku
  batch_size = 50
  days_data = []
  
  Date.new(year, 1, 1).upto(Date.new(year, 12, 31)) do |date|
    day_info = pcal[date]
    
    celebration = day_info.celebrations.first
    alternative_celebration = day_info.celebrations[1] if day_info.celebrations.length > 1
    
    day_data = {
      datum: date.strftime('%Y-%m-%d'),
      locale_code: lang_code,
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
      alternative_celebration_colour: alternative_celebration&.colour&.symbol&.to_s,
      meniny: nil, # Načíta sa zo separátnej tabuľky
      lectio_hlava: nil, # Bude sa mapovať neskôr
      liturgical_year_id: liturgical_year_id,
      source_api: 'calendarium-romanum-pregenerated',
      is_custom_edit: false
    }
    
    days_data << day_data
    
    # Uloženie po dávkach
    if days_data.length >= batch_size
      insert_batch(conn, days_data)
      days_data = []
    end
  end
  
  # Uloženie poslednej dávky
  insert_batch(conn, days_data) if days_data.any?
  
  puts "✅ Kalendár pre #{lang_code} na rok #{year} vygenerovaný!"
end

def insert_batch(conn, days_data)
  return if days_data.empty?
  
  values = days_data.map.with_index do |day, index|
    base = index * 16
    "(#{(1..16).map { |i| "$#{base + i}" }.join(', ')})"
  end.join(', ')
  
  params = days_data.flat_map do |day|
    [
      day[:datum], day[:locale_code], day[:season], day[:season_week],
      day[:weekday], day[:celebration_title], day[:celebration_rank], 
      day[:celebration_rank_num], day[:celebration_colour],
      day[:alternative_celebration_title], day[:alternative_celebration_rank],
      day[:alternative_celebration_rank_num], day[:alternative_celebration_colour],
      day[:meniny], day[:lectio_hlava], day[:liturgical_year_id], 
      day[:source_api], day[:is_custom_edit]
    ]
  end
  
  sql = "
    INSERT INTO liturgical_calendar (
      datum, locale_code, season, season_week, weekday,
      celebration_title, celebration_rank, celebration_rank_num, celebration_colour,
      alternative_celebration_title, alternative_celebration_rank, 
      alternative_celebration_rank_num, alternative_celebration_colour,
      meniny, lectio_hlava, liturgical_year_id, source_api, is_custom_edit
    ) VALUES #{values}
  "
  
  conn.exec_params(sql, params)
  puts "  📝 Uložených #{days_data.length} dní"
end

# Hlavný skript
if __FILE__ == $0
  years = (2024..2030).to_a
  
  if ARGV.length > 0
    # Špecifické roky z argumentov
    years = ARGV.map(&:to_i)
  end
  
  SUPPORTED_LANGUAGES.each do |lang_code, config|
    years.each do |year|
      begin
        generate_calendar_for_language(lang_code, config, year)
      rescue => e
        puts "❌ Chyba pri generovaní #{lang_code}/#{year}: #{e.message}"
        puts e.backtrace.first(5)
        next
      end
    end
  end
  
  conn.close
  puts "\n🎉 Všetky kalendáre vygenerované!"
end