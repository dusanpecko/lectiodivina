// types/liturgical-calendar.ts
// TypeScript typy pre liturgický kalendár

export interface LiturgicalYear {
  id?: number;
  year: number;
  lectionary_cycle: 'A' | 'B' | 'C';
  ferial_lectionary: 1 | 2;
  start_date?: string;
  end_date?: string;
  is_generated: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LiturgicalCalendarDay {
  id?: number;
  datum: string; // YYYY-MM-DD
  locale_code: string; // Kód z locales tabuľky (sk, cz, en, es)
  
  // Liturgická sezóna
  season?: string; // advent, christmas, ordinary, lent, easter
  season_week?: number;
  weekday?: string; // monday, tuesday, ...
  
  // Hlavná slávnosť
  celebration_title?: string;
  celebration_rank?: string;
  celebration_rank_num?: number;
  celebration_colour?: string; // white, red, green, violet
  
  // Alternatívna slávnosť
  alternative_celebration_title?: string;
  alternative_celebration_rank?: string;
  alternative_celebration_rank_num?: number;
  alternative_celebration_colour?: string;
  
  // Mapovanie
  lectio_hlava?: string; // Kľúč pre lectio_sources
  
  // Meniny
  meniny?: string;
  
  // Metadata
  liturgical_year_id?: number;
  source_api?: string;
  is_custom_edit: boolean;
  
  created_at?: string;
  updated_at?: string;
}

export interface NameDay {
  id?: number;
  datum: string; // YYYY-MM-DD
  locale_code: string; // Kód z locales tabuľky (sk, cz, en, es)
  meniny: string;
  created_at?: string;
}

// CalAPI response typy
export interface CalAPICelebration {
  title: string;
  colour: string; // green, violet, white, red
  rank: string;
  rank_num: number;
}

export interface CalAPIDay {
  date: string; // YYYY-MM-DD
  season: string; // ordinary, advent, christmas, lent, easter
  season_week: number;
  celebrations: CalAPICelebration[];
  weekday: string; // monday, tuesday, ...
}

export interface CalAPILectionaryInfo {
  lectionary: 'A' | 'B' | 'C';
  ferial_lectionary: 1 | 2;
}

// Admin generátor
export interface GeneratorProgress {
  current: number;
  total: number;
  status: 'idle' | 'fetching' | 'saving' | 'complete' | 'error';
  message?: string;
}

export interface GeneratorResult {
  success: boolean;
  year: number;
  total_days_saved: number;
  total_days_failed: number;
  errors?: string[];
}
