// src/app/api/liturgical-calendar-multi/route.ts
import { exec } from 'child_process';
import { NextRequest, NextResponse } from 'next/server';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * API Wrapper pre calendarium-romanum Ruby gem
 * Poskytuje liturgický kalendár RKC vo viacerých jazykoch z natívnych zdrojov
 */

/**
 * GET /api/liturgical-calendar-multi?action=year&year=2025&lang=es
 * GET /api/liturgical-calendar-multi?action=month&year=2025&month=12&lang=it  
 * GET /api/liturgical-calendar-multi?action=day&year=2025&month=12&day=8&lang=pt
 * GET /api/liturgical-calendar-multi?action=lectionary&year=2025&lang=fr
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const action = searchParams.get('action') || 'day';
  const year = searchParams.get('year');
  const month = searchParams.get('month');  
  const day = searchParams.get('day');
  const lang = searchParams.get('lang') || 'en';
  
  // Validácia jazyka - podporované jazyky z calendarium-romanum
  const supportedLanguages: { [key: string]: string } = {
    'en': 'GENERAL_ROMAN_ENGLISH',      // Angličtina
    'es': 'GENERAL_ROMAN_SPANISH',      // Španielčina  
    'it': 'GENERAL_ROMAN_ITALIAN',      // Taliančina
    'fr': 'GENERAL_ROMAN_FRENCH',       // Francúzština
    'pt': 'GENERAL_ROMAN_PORTUGUESE',   // Portugalčina
    'la': 'GENERAL_ROMAN_LATIN',        // Latinka
    'cs': 'GENERAL_ROMAN_CZECH',        // Čeština (ako backup pre CalAPI)
  };

  if (!supportedLanguages[lang]) {
    return NextResponse.json(
      { error: `Unsupported language. Supported: ${Object.keys(supportedLanguages).join(', ')}` },
      { status: 400 }
    );
  }

  try {
    switch (action) {
      case 'lectionary': {
        // Získanie informácie o lekcionári pre daný rok
        if (!year) {
          return NextResponse.json({ error: 'Year is required' }, { status: 400 });
        }

        const rubyScript = `
          require 'calendarium-romanum'
          require 'json'
          
          year = ${year}
          
          # Výpočet lekcionárneho cyklu
          lectionary_cycle = ['A', 'B', 'C'][year % 3]
          ferial_cycle = year % 2 == 0 ? 2 : 1
          
          result = {
            year: year,
            lectionary: lectionary_cycle,
            ferial_lectionary: ferial_cycle
          }
          
          puts result.to_json
        `;

        const { stdout, stderr } = await execAsync(`ruby -e "${rubyScript}"`);
        
        if (stderr && !stderr.includes('Ignoring')) {
          throw new Error(`Ruby script error: ${stderr}`);
        }

        const result = JSON.parse(stdout);
        return NextResponse.json(result);
      }

      case 'year': {
        if (!year) {
          return NextResponse.json({ error: 'Year is required' }, { status: 400 });
        }

        const calendarConstant = supportedLanguages[lang];
        const rubyScript = `
          require 'calendarium-romanum'
          require 'json'
          require 'date'
          
          # Nastavenie lokalizácie
          I18n.locale = :${lang}
          
          # Načítanie kalendárových dát  
          sanctorale = CalendariumRomanum::Data::${calendarConstant}.load
          pcal = CalendariumRomanum::PerpetualCalendar.new(sanctorale: sanctorale)
          
          year = ${year}
          days = []
          
          Date.new(year, 1, 1).upto(Date.new(year, 12, 31)) do |date|
            day_info = pcal[date]
            
            celebrations = day_info.celebrations.map do |c|
              {
                title: c.title,
                rank: c.rank.desc,
                rank_num: c.rank.priority,
                colour: c.colour.symbol.to_s
              }
            end
            
            days << {
              date: date.strftime('%Y-%m-%d'),
              season: day_info.season.symbol.to_s,
              season_week: day_info.season_week,
              weekday: date.strftime('%A').downcase,
              celebrations: celebrations
            }
          end
          
          result = {
            year: year,
            lang: '${lang}',
            total_days: days.length,
            days: days,
            source: 'calendarium-romanum'
          }
          
          puts result.to_json
        `;
        
        const { stdout, stderr } = await execAsync(`ruby -e "${rubyScript}"`);
        
        if (stderr && !stderr.includes('Ignoring')) {
          throw new Error(`Ruby script error: ${stderr}`);
        }

        const result = JSON.parse(stdout);
        return NextResponse.json(result);
      }

      case 'month': {
        if (!year || !month) {
          return NextResponse.json({ error: 'Year and month are required' }, { status: 400 });
        }

        const calendarConstant = supportedLanguages[lang];
        const rubyScript = `
          require 'calendarium-romanum'
          require 'json'
          require 'date'
          
          # Nastavenie lokalizácie
          I18n.locale = :${lang}
          
          # Načítanie kalendárových dát  
          sanctorale = CalendariumRomanum::Data::${calendarConstant}.load
          pcal = CalendariumRomanum::PerpetualCalendar.new(sanctorale: sanctorale)
          
          year = ${year}
          month = ${month}
          days = []
          
          Date.new(year, month, 1).upto(Date.new(year, month, -1)) do |date|
            day_info = pcal[date]
            
            celebrations = day_info.celebrations.map do |c|
              {
                title: c.title,  
                rank: c.rank.desc,
                rank_num: c.rank.priority,
                colour: c.colour.symbol.to_s
              }
            end
            
            days << {
              date: date.strftime('%Y-%m-%d'),
              season: day_info.season.symbol.to_s,
              season_week: day_info.season_week,
              weekday: date.strftime('%A').downcase,
              celebrations: celebrations
            }
          end
          
          result = {
            year: year,
            month: month,
            lang: '${lang}',
            days: days,
            source: 'calendarium-romanum'
          }
          
          puts result.to_json
        `;
        
        const { stdout, stderr } = await execAsync(`ruby -e "${rubyScript}"`);
        
        if (stderr && !stderr.includes('Ignoring')) {
          throw new Error(`Ruby script error: ${stderr}`);
        }

        const result = JSON.parse(stdout);
        return NextResponse.json(result);
      }

      case 'day': {
        if (!year || !month || !day) {
          return NextResponse.json({ error: 'Year, month and day are required' }, { status: 400 });
        }

        const calendarConstant = supportedLanguages[lang];
        const rubyScript = `
          require 'calendarium-romanum'
          require 'json'
          require 'date'
          
          # Nastavenie lokalizácie
          I18n.locale = :${lang}
          
          # Načítanie kalendárových dát  
          sanctorale = CalendariumRomanum::Data::${calendarConstant}.load
          pcal = CalendariumRomanum::PerpetualCalendar.new(sanctorale: sanctorale)
          
          date = Date.new(${year}, ${month}, ${day})
          day_info = pcal[date]
          
          celebrations = day_info.celebrations.map do |c|
            {
              title: c.title,
              rank: c.rank.desc,
              rank_num: c.rank.priority,
              colour: c.colour.symbol.to_s
            }
          end
          
          result = {
            date: date.strftime('%Y-%m-%d'),
            season: day_info.season.symbol.to_s,
            season_week: day_info.season_week,
            weekday: date.strftime('%A').downcase,
            celebrations: celebrations,
            lang: '${lang}',
            source: 'calendarium-romanum'
          }
          
          puts result.to_json
        `;
        
        const { stdout, stderr } = await execAsync(`ruby -e "${rubyScript}"`);
        
        if (stderr && !stderr.includes('Ignoring')) {
          throw new Error(`Ruby script error: ${stderr}`);
        }

        const result = JSON.parse(stdout);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: `Invalid action. Supported: lectionary, year, month, day` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Multi-language liturgical calendar API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}