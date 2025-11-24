// API endpoint pre dnešné Lectio Divina (public prístup pre homepage preview)
import { CACHE_PREFIX, CACHE_TTL, cacheQuery } from '@/lib/cache';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'sk';
    
    // Dnešný dátum
    const today = new Date().toISOString().split('T')[0];
    
    // Cache key includes today's date and language
    const cacheKey = `${CACHE_PREFIX.LECTIO}:today:${today}:lang:${lang}`;
    
    const result = await cacheQuery(
      cacheKey,
      async () => {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
        // 1. Nájdi dnešný liturgický deň
        const { data: calendarDay, error: calendarError } = await supabase
          .from('liturgical_calendar')
          .select('*')
          .eq('datum', today)
          .eq('locale_code', lang)
          .single();
    
        if (calendarError || !calendarDay) {
          throw new Error('Liturgický deň nebol najdený');
        }
    
        // 2. Ak existuje lectio_hlava, nájdi správny lectio source
        let lectioSource = null;
        if (calendarDay.lectio_hlava) {
          // 2.1 Získame liturgický rok z calendar day (už obsahuje správny liturgical_year_id pre daný jazyk)
          const { data: liturgicalYear } = await supabase
            .from('liturgical_years')
            .select('*')
            .eq('id', calendarDay.liturgical_year_id)
            .single();
      
          if (!liturgicalYear) {
            console.error('Liturgický rok nebol nájdený pre ID:', calendarDay.liturgical_year_id);
            throw new Error('Liturgický rok nebol nájdený');
          }
      
          // 2.2 Určíme či je to všedný deň alebo sviatok (A/B/C vs N)
          const isWeekday = calendarDay.celebration_title?.match(/(Pondelok|Utorok|Streda|Štvrtok|Piatok|Sobota|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday).+(týždňa|Week)/i);
          const isSpecialDay = !isWeekday && (
            calendarDay.celebration_title?.match(/(nedeľa|Nedeľa|Sunday)/i) ||
            (calendarDay.celebration_rank_num !== null && calendarDay.celebration_rank_num > 1)
          );
      
          const rokToSearch = isSpecialDay ? liturgicalYear.lectionary_cycle : 'N';
      
          console.log(`🔍 Hľadám lectio pre rok: ${rokToSearch}, hlava: ${calendarDay.lectio_hlava}, lang: ${lang}, liturgický rok: ${liturgicalYear.year} (${liturgicalYear.locale_code})`);
      
          // 2.3 Nájdi lectio source s správnym rokom
          const { data: source } = await supabase
            .from('lectio_sources')
            .select('*')
            .eq('hlava', calendarDay.lectio_hlava)
            .eq('lang', lang)
            .eq('rok', rokToSearch)
            .eq('checked', 1)
            .single();
      
          // 2.4 Ak nenájdeme s A/B/C, skúsime N (fallback pre sviatky)
          if (!source && isSpecialDay && rokToSearch !== 'N') {
            console.log('🔄 Nenájdené s rokom A/B/C, skúšam N...');
            const { data: fallbackSource } = await supabase
              .from('lectio_sources')
              .select('*')
              .eq('hlava', calendarDay.lectio_hlava)
              .eq('lang', lang)
              .eq('rok', 'N')
              .eq('checked', 1)
              .single();
        
            lectioSource = fallbackSource;
          } else {
            lectioSource = source;
          }
        }
      
        return {
          liturgicalDay: {
            date: calendarDay.datum,
            season: calendarDay.season,
            celebration_title: calendarDay.celebration_title,
            celebration_rank: calendarDay.celebration_rank,
            celebration_colour: calendarDay.celebration_colour,
          },
          lectio: lectioSource ? {
            id: lectioSource.id,
            hlava: lectioSource.hlava,
            suradnice_pismo: lectioSource.suradnice_pismo,
            kniha: lectioSource.kniha,
            kapitola: lectioSource.kapitola,
            
            // Biblický text (celý - pre SEO)
            nazov_biblia_1: lectioSource.nazov_biblia_1,
            biblia_1: lectioSource.biblia_1,
            biblia_1_audio: lectioSource.biblia_1_audio,
            
            // Lectio preview (prvých 300 znakov)
            lectio_preview: lectioSource.lectio_text 
              ? lectioSource.lectio_text.substring(0, 300) + '...'
              : null,
            
            // Actio text (celý - pre DailyQuote komponent)
            actio_text: lectioSource.actio_text,
            reference: lectioSource.reference,
            
            // Info že sú dostupné ďalšie sekcie (ale bez obsahu)
            has_meditatio: !!lectioSource.meditatio_text,
            has_oratio: !!lectioSource.oratio_text,
            has_contemplatio: !!lectioSource.contemplatio_text,
            has_actio: !!lectioSource.actio_text,
            has_audio: !!lectioSource.biblia_1_audio,
          } : null
        };
      },
      CACHE_TTL.SEMI_STATIC // 15 minutes - updates once per day
    );
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Error fetching today lectio:', error);
    return NextResponse.json(
      { error: 'Chyba pri načítaní lectio' },
      { status: 500 }
    );
  }
}
