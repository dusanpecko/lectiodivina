// src/app/api/liturgical-calendar/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * API Wrapper pre calapi.inadiutorium.cz
 * Poskytuje prístup k liturgickému kalendáru Rímskokatolíckej cirkvi
 */

const CALAPI_BASE_URL = 'http://calapi.inadiutorium.cz/api/v0';

// Helper funkcia pre fetch s error handlingom
async function fetchFromCalAPI(endpoint: string) {
  try {
    const url = `${CALAPI_BASE_URL}${endpoint}`;
    console.log('Fetching from CalAPI:', url);
    
    const response = await fetch(url, {
      cache: 'no-store', // Vždy fresh data
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`CalAPI error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('CalAPI fetch error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * GET /api/liturgical-calendar?action=year&year=2025&lang=cs
 * GET /api/liturgical-calendar?action=month&year=2025&month=12&lang=cs
 * GET /api/liturgical-calendar?action=day&year=2025&month=12&day=8&lang=cs
 * GET /api/liturgical-calendar?action=lectionary&year=2025&lang=cs
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const action = searchParams.get('action') || 'day';
  const year = searchParams.get('year');
  const month = searchParams.get('month');
  const day = searchParams.get('day');
  const lang = searchParams.get('lang') || 'cs'; // default czech
  
  // Validácia jazyka
  const validLangs = ['cs', 'en', 'fr', 'it', 'la'];
  if (!validLangs.includes(lang)) {
    return NextResponse.json(
      { error: `Invalid language. Supported: ${validLangs.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    switch (action) {
      case 'lectionary': {
        // Získanie informácie o lekcionári pre daný rok
        // GET /api/v0/{lang}/calendars/czech/{year}
        if (!year) {
          return NextResponse.json({ error: 'Year is required' }, { status: 400 });
        }

        const result = await fetchFromCalAPI(`/${lang}/calendars/czech/${year}`);
        
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({
          year: parseInt(year),
          lectionary: result.data.lectionary, // A, B, alebo C
          ferial_lectionary: result.data.ferial_lectionary, // 1 alebo 2
        });
      }

      case 'year': {
        // Získanie kompletného roku (všetky mesiace)
        if (!year) {
          return NextResponse.json({ error: 'Year is required' }, { status: 400 });
        }

        const yearNum = parseInt(year);
        const months = [];

        // Načítaj všetky mesiace v roku
        for (let m = 1; m <= 12; m++) {
          const result = await fetchFromCalAPI(`/${lang}/calendars/czech/${yearNum}/${m}`);
          
          if (result.success) {
            months.push(...result.data);
          } else {
            console.error(`Failed to fetch month ${m}:`, result.error);
          }
        }

        return NextResponse.json({
          year: yearNum,
          lang,
          total_days: months.length,
          days: months,
        });
      }

      case 'month': {
        // Získanie jedného mesiaca
        // GET /api/v0/{lang}/calendars/czech/{year}/{month}
        if (!year || !month) {
          return NextResponse.json({ error: 'Year and month are required' }, { status: 400 });
        }

        const result = await fetchFromCalAPI(`/${lang}/calendars/czech/${year}/${month}`);
        
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json({
          year: parseInt(year),
          month: parseInt(month),
          lang,
          days: result.data,
        });
      }

      case 'day': {
        // Získanie jedného dňa
        // GET /api/v0/{lang}/calendars/czech/{year}/{month}/{day}
        if (!year || !month || !day) {
          return NextResponse.json({ error: 'Year, month and day are required' }, { status: 400 });
        }

        const result = await fetchFromCalAPI(`/${lang}/calendars/czech/${year}/${month}/${day}`);
        
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json(result.data);
      }

      case 'today': {
        // Získanie dnešného dňa
        // GET /api/v0/{lang}/calendars/czech/today
        const result = await fetchFromCalAPI(`/${lang}/calendars/czech/today`);
        
        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 500 });
        }

        return NextResponse.json(result.data);
      }

      default:
        return NextResponse.json(
          { error: `Invalid action. Supported: lectionary, year, month, day, today` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
