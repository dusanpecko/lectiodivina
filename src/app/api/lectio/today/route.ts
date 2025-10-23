// API endpoint pre dnešné Lectio Divina (public prístup pre homepage preview)
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'sk';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Dnešný dátum
    const today = new Date().toISOString().split('T')[0];
    
    // 1. Nájdi dnešný liturgický deň
    const { data: calendarDay, error: calendarError } = await supabase
      .from('liturgical_calendar')
      .select('*')
      .eq('datum', today)
      .eq('locale_code', lang)
      .single();
    
    if (calendarError || !calendarDay) {
      return NextResponse.json(
        { error: 'Liturgický deň nebol najdený' },
        { status: 404 }
      );
    }
    
    // 2. Ak existuje lectio_hlava, nájdi lectio source
    let lectioSource = null;
    if (calendarDay.lectio_hlava) {
      const { data: source } = await supabase
        .from('lectio_sources')
        .select('*')
        .eq('hlava', calendarDay.lectio_hlava)
        .eq('lang', lang)
        .eq('checked', 1) // Len skontrolované
        .single();
      
      lectioSource = source;
    }
    
    return NextResponse.json({
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
    });
    
  } catch (error) {
    console.error('Error fetching today lectio:', error);
    return NextResponse.json(
      { error: 'Chyba pri načítaní lectio' },
      { status: 500 }
    );
  }
}
