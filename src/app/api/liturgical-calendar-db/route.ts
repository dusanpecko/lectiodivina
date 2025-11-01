// src/app/api/liturgical-calendar-db/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * API pre liturgický kalendár z predgenerovaných dát v databáze
 * Rýchlejšie a spoľahlivejšie ako Ruby gem volania
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const action = searchParams.get('action') || 'day';
  const year = searchParams.get('year');
  const month = searchParams.get('month');  
  const day = searchParams.get('day');
  const lang = searchParams.get('lang') || 'en';
  
  // Validácia jazyka
  const supportedLanguages = ['en', 'es', 'it', 'fr', 'pt', 'la', 'cs'];
  
  if (!supportedLanguages.includes(lang)) {
    return NextResponse.json(
      { error: `Unsupported language. Supported: ${supportedLanguages.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    switch (action) {
      case 'lectionary': {
        if (!year) {
          return NextResponse.json({ error: 'Year is required' }, { status: 400 });
        }

        const { data: yearData, error } = await supabase
          .from('liturgical_years')
          .select('year, lectionary_cycle, ferial_lectionary')
          .eq('year', year)
          .eq('locale_code', lang)
          .single();

        if (error) {
          return NextResponse.json({ error: 'Year not found in database' }, { status: 404 });
        }

        return NextResponse.json({
          year: parseInt(year),
          lectionary: yearData.lectionary_cycle,
          ferial_lectionary: yearData.ferial_lectionary
        });
      }

      case 'year': {
        if (!year) {
          return NextResponse.json({ error: 'Year is required' }, { status: 400 });
        }

        const yearStart = `${year}-01-01`;
        const yearEnd = `${year}-12-31`;

        const { data: calendarData, error } = await supabase
          .from('liturgical_calendar')
          .select(`
            datum, season, season_week, weekday,
            celebration_title, celebration_rank, celebration_rank_num, celebration_colour,
            alternative_celebration_title, alternative_celebration_rank, 
            alternative_celebration_rank_num, alternative_celebration_colour
          `)
          .eq('locale_code', lang)
          .gte('datum', yearStart)
          .lte('datum', yearEnd)
          .order('datum', { ascending: true });

        if (error) {
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        const days = calendarData?.map(day => ({
          date: day.datum,
          season: day.season,
          season_week: day.season_week,
          weekday: day.weekday,
          celebrations: [
            {
              title: day.celebration_title,
              rank: day.celebration_rank,
              rank_num: day.celebration_rank_num,
              colour: day.celebration_colour
            },
            ...(day.alternative_celebration_title ? [{
              title: day.alternative_celebration_title,
              rank: day.alternative_celebration_rank,
              rank_num: day.alternative_celebration_rank_num,
              colour: day.alternative_celebration_colour
            }] : [])
          ].filter(c => c.title)
        })) || [];

        return NextResponse.json({
          year: parseInt(year),
          lang,
          total_days: days.length,
          days,
          source: 'database-pregenerated'
        });
      }

      case 'month': {
        if (!year || !month) {
          return NextResponse.json({ error: 'Year and month are required' }, { status: 400 });
        }

        const monthStart = `${year}-${month.padStart(2, '0')}-01`;
        const nextMonth = parseInt(month) === 12 ? 1 : parseInt(month) + 1;
        const nextYear = parseInt(month) === 12 ? parseInt(year) + 1 : parseInt(year);
        const monthEnd = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-01`;

        const { data: calendarData, error } = await supabase
          .from('liturgical_calendar')
          .select(`
            datum, season, season_week, weekday,
            celebration_title, celebration_rank, celebration_rank_num, celebration_colour,
            alternative_celebration_title, alternative_celebration_rank, 
            alternative_celebration_rank_num, alternative_celebration_colour
          `)
          .eq('locale_code', lang)
          .gte('datum', monthStart)
          .lt('datum', monthEnd)
          .order('datum', { ascending: true });

        if (error) {
          return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        const days = calendarData?.map(day => ({
          date: day.datum,
          season: day.season,
          season_week: day.season_week,
          weekday: day.weekday,
          celebrations: [
            {
              title: day.celebration_title,
              rank: day.celebration_rank,
              rank_num: day.celebration_rank_num,
              colour: day.celebration_colour
            },
            ...(day.alternative_celebration_title ? [{
              title: day.alternative_celebration_title,
              rank: day.alternative_celebration_rank,
              rank_num: day.alternative_celebration_rank_num,
              colour: day.alternative_celebration_colour
            }] : [])
          ].filter(c => c.title)
        })) || [];

        return NextResponse.json({
          year: parseInt(year),
          month: parseInt(month),
          lang,
          days,
          source: 'database-pregenerated'
        });
      }

      case 'day': {
        if (!year || !month || !day) {
          return NextResponse.json({ error: 'Year, month and day are required' }, { status: 400 });
        }

        const dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        const { data: dayData, error } = await supabase
          .from('liturgical_calendar')
          .select(`
            datum, season, season_week, weekday,
            celebration_title, celebration_rank, celebration_rank_num, celebration_colour,
            alternative_celebration_title, alternative_celebration_rank, 
            alternative_celebration_rank_num, alternative_celebration_colour
          `)
          .eq('locale_code', lang)
          .eq('datum', dateStr)
          .single();

        if (error) {
          return NextResponse.json({ error: 'Day not found in database' }, { status: 404 });
        }

        const celebrations = [
          {
            title: dayData.celebration_title,
            rank: dayData.celebration_rank,
            rank_num: dayData.celebration_rank_num,
            colour: dayData.celebration_colour
          },
          ...(dayData.alternative_celebration_title ? [{
            title: dayData.alternative_celebration_title,
            rank: dayData.alternative_celebration_rank,
            rank_num: dayData.alternative_celebration_rank_num,
            colour: dayData.alternative_celebration_colour
          }] : [])
        ].filter(c => c.title);

        return NextResponse.json({
          date: dayData.datum,
          season: dayData.season,
          season_week: dayData.season_week,
          weekday: dayData.weekday,
          celebrations,
          lang,
          source: 'database-pregenerated'
        });
      }

      default:
        return NextResponse.json(
          { error: `Invalid action. Supported: lectionary, year, month, day` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Database liturgical calendar API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}