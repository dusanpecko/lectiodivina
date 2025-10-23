// src/app/admin/liturgical-calendar/page.tsx
"use client";

import { useSupabase } from "@/app/components/SupabaseProvider";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit2,
  Globe,
  Loader2,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

// Types
interface LiturgicalYear {
  id: number;
  year: number;
  lectionary_cycle: 'A' | 'B' | 'C';
  ferial_lectionary: 1 | 2;
  start_date?: string;
  end_date?: string;
  is_generated: boolean;
  created_at: string;
  updated_at: string;
}

interface CalAPIDay {
  date: string;
  season: string;
  season_week: number;
  weekday: string;
  celebrations: Array<{
    title: string;
    rank: string;
    rank_num: number;
    colour: string;
  }>;
}

interface GeneratorProgress {
  current: number;
  total: number;
  status: 'idle' | 'fetching' | 'saving' | 'complete' | 'error';
  message: string;
}

interface Stats {
  total_years: number;
  total_days: number;
  days_by_year: { [key: number]: number };
  languages: string[];
  lectio_filled: number;
  lectio_percentage: number;
}

interface CalendarDay {
  id: number;
  datum: string;
  locale_code: string;
  season: string;
  season_week: number;
  weekday: string;
  celebration_title: string;
  celebration_rank: string;
  celebration_rank_num: number | null;
  celebration_colour: string;
  alternative_celebration_title: string | null;
  alternative_celebration_rank: string | null;
  alternative_celebration_rank_num: number | null;
  alternative_celebration_colour: string | null;
  meniny: string | null;
  lectio_hlava: string | null;
  liturgical_year_id: number;
  source_api: string;
  is_custom_edit: boolean;
  created_at: string;
  updated_at: string;
}

type NotificationType = 'success' | 'error' | 'info';

// Notification komponenta
const Notification = ({ 
  message, 
  type, 
  onClose 
}: { 
  message: string; 
  type: NotificationType; 
  onClose: () => void; 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-gray-50 border-gray-200',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-gray-50 border-gray-200'
  }[type];
  
  const textColor = {
    success: { color: '#40467b' },
    error: {},
    info: { color: '#40467b' }
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-lg p-4 shadow-lg ${bgColor} max-w-md`} style={textColor}>
      <div className="flex items-start gap-3">
        <Icon size={20} />
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Progress Bar komponenta
const ProgressBar = ({ progress }: { progress: GeneratorProgress }) => {
  if (progress.status === 'idle') return null;
  
  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;
  
  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-lg p-4 shadow-lg min-w-96">
      <div className="flex items-center gap-3 mb-2">
        <Loader2 size={20} className="animate-spin" style={{ color: '#40467b' }} />
        <span className="font-medium" style={{ color: '#40467b' }}>{progress.message}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            width: `${percentage}%`,
            background: 'linear-gradient(90deg, #40467b 0%, #686ea3 100%)'
          }}
        />
      </div>
      <div className="text-sm text-gray-600 mt-1">
        {progress.current} z {progress.total} ({percentage}%)
      </div>
    </div>
  );
};

export default function LiturgicalCalendarAdminPage() {
  const { supabase } = useSupabase();

  // State
  const [years, setYears] = useState<LiturgicalYear[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);
  const [progress, setProgress] = useState<GeneratorProgress>({
    current: 0,
    total: 0,
    status: 'idle',
    message: ''
  });
  
  // Generator modal state
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedLanguage, setSelectedLanguage] = useState<string>('sk');
  const [expandedYear, setExpandedYear] = useState<number | null>(null);
  
  // Detail calendar state
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loadingDays, setLoadingDays] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translateProgress, setTranslateProgress] = useState({ current: 0, total: 0 });
  
  // Edit state - používame modal namiesto inline editácie
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDay, setEditingDay] = useState<CalendarDay | null>(null);
  const [editForm, setEditForm] = useState<Partial<CalendarDay>>({});
  
  // Lectio sources pre dropdown
  const [availableLectioSources, setAvailableLectioSources] = useState<Array<{ hlava: string; rok: string | null }>>([]);
  const [loadingLectioSources, setLoadingLectioSources] = useState(false);

  // Notifikácie helper
  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
  }, []);

  // Načítanie dní kalendára pre daný rok
  const fetchCalendarDays = useCallback(async (yearId: number) => {
    setLoadingDays(true);
    try {
      const { data, error } = await supabase
        .from('liturgical_calendar')
        .select('*')
        .eq('liturgical_year_id', yearId)
        .order('datum', { ascending: true });

      if (error) throw error;
      
      setCalendarDays(data || []);
      console.log(`Načítaných ${data?.length || 0} dní pre rok ID ${yearId}`);
    } catch (error) {
      console.error('Error fetching calendar days:', error);
      showNotification('Chyba pri načítavaní dní kalendára', 'error');
    } finally {
      setLoadingDays(false);
    }
  }, [supabase, showNotification]);

  // Načítanie liturgických rokov
  const fetchYears = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('liturgical_years')
        .select('*')
        .order('year', { ascending: false });

      if (error) throw error;
      setYears(data || []);
    } catch (error) {
      console.error('Error fetching years:', error);
      showNotification('Chyba pri načítavaní rokov', 'error');
    } finally {
      setLoading(false);
    }
  }, [supabase, showNotification]);

  // Načítanie štatistík
  const fetchStats = useCallback(async () => {
    try {
      const { data: calendarData, error: calError } = await supabase
        .from('liturgical_calendar')
        .select('datum, locale_code, liturgical_year_id, lectio_hlava');

      if (calError) throw calError;

      const { data: yearData, error: yearError } = await supabase
        .from('liturgical_years')
        .select('id, year');

      if (yearError) throw yearError;

      // Spracuj štatistiky
      const yearMap = new Map(yearData.map(y => [y.id, y.year]));
      const daysByYear: { [key: number]: number } = {};
      const languagesSet = new Set<string>();
      let lectioFilledCount = 0;

      calendarData?.forEach(day => {
        const year = yearMap.get(day.liturgical_year_id);
        if (year) {
          daysByYear[year] = (daysByYear[year] || 0) + 1;
        }
        languagesSet.add(day.locale_code);
        if (day.lectio_hlava && day.lectio_hlava.trim() !== '') {
          lectioFilledCount++;
        }
      });

      const totalDays = calendarData?.length || 0;
      const lectioPercentage = totalDays > 0 ? Math.round((lectioFilledCount / totalDays) * 100) : 0;

      setStats({
        total_years: yearData.length,
        total_days: totalDays,
        days_by_year: daysByYear,
        languages: Array.from(languagesSet),
        lectio_filled: lectioFilledCount,
        lectio_percentage: lectioPercentage
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [supabase]);

  useEffect(() => {
    fetchYears();
    fetchStats();
  }, [fetchYears, fetchStats]);

  // Generovanie kalendára
  const handleGenerateCalendar = async () => {
    setShowGeneratorModal(false);
    setProgress({
      current: 0,
      total: 365,
      status: 'fetching',
      message: 'Načítavam liturgický kalendár z API...'
    });

    try {
      // 1. Získaj informáciu o lekcionári
      console.log('Fetching lectionary for year:', selectedYear, 'Language:', selectedLanguage);
      
      // CalAPI podporuje len český jazyk, takže vždy používame 'cs'
      const apiLang = 'cs'; 
      const lectionaryRes = await fetch(
        `/api/liturgical-calendar?action=lectionary&year=${selectedYear}&lang=${apiLang}`
      );
      
      if (!lectionaryRes.ok) {
        const errorText = await lectionaryRes.text();
        throw new Error(`Lectionary API error (${lectionaryRes.status}): ${errorText}`);
      }
      
      const lectionaryData = await lectionaryRes.json();
      console.log('Lectionary data:', lectionaryData);

      if (!lectionaryData || !lectionaryData.lectionary) {
        throw new Error('API vrátilo neplatné dáta lekcionára');
      }
      
      if (!['A', 'B', 'C'].includes(lectionaryData.lectionary)) {
        throw new Error(`Neplatný cyklus lekcionára: ${lectionaryData.lectionary}`);
      }

      // 2. Vytvor alebo aktualizuj záznam v liturgical_years pomocou UPSERT
      console.log('Upserting liturgical year:', selectedYear);
      const { data: upsertedYear, error: upsertError } = await supabase
        .from('liturgical_years')
        .upsert({
          year: selectedYear,
          lectionary_cycle: lectionaryData.lectionary,
          ferial_lectionary: lectionaryData.ferial_lectionary,
          is_generated: true
        }, {
          onConflict: 'year',
          ignoreDuplicates: false
        })
        .select();

      console.log('Upsert result:', { upsertedYear, upsertError });

      if (upsertError) {
        console.error('Upsert error details:', upsertError);
        throw upsertError;
      }
      
      if (!upsertedYear || upsertedYear.length === 0) {
        throw new Error('Upsert nevrátil žiadny záznam');
      }

      const liturgicalYearId = upsertedYear[0].id;
      console.log('Liturgical year ID:', liturgicalYearId);

      setProgress(prev => ({
        ...prev,
        status: 'fetching',
        message: 'Sťahujem liturgický kalendár pre celý rok...'
      }));

      // 3. Získaj celý rok z API (CalAPI je vždy český)
      const yearRes = await fetch(
        `/api/liturgical-calendar?action=year&year=${selectedYear}&lang=${apiLang}`
      );
      
      if (!yearRes.ok) {
        const errorText = await yearRes.text();
        throw new Error(`API error (${yearRes.status}): ${errorText}`);
      }
      
      const yearData = await yearRes.json();

      if (!yearData || !yearData.days || !Array.isArray(yearData.days)) {
        throw new Error('API vrátilo neplatné dáta - chýba pole "days"');
      }

      const days = yearData.days;
      
      if (days.length === 0) {
        throw new Error('API vrátilo prázdny kalendár');
      }

      console.log(`Total days from API: ${days.length}`);
      
      // Skontroluj duplicity v dátumoch
      const dateSet = new Set();
      const duplicates = [];
      for (const day of days) {
        if (dateSet.has(day.date)) {
          duplicates.push(day.date);
        }
        dateSet.add(day.date);
      }
      if (duplicates.length > 0) {
        console.warn('Duplicate dates found:', duplicates);
      }

      setProgress(prev => ({
        ...prev,
        total: days.length,
        status: 'saving',
        message: 'Ukladám dni do databázy...'
      }));

      // 4. Získaj meniny (pre české API používame české meniny, ak existujú)
      const { data: nameDays } = await supabase
        .from('name_days')
        .select('datum, meniny')
        .eq('locale_code', 'cs'); // CalAPI je české, tak hľadáme české meniny

      const nameDaysMap = new Map(
        nameDays?.map(nd => [nd.datum, nd.meniny]) || []
      );
      
      console.log(`Načítaných ${nameDays?.length || 0} menín pre české kalendár`);

      // Lectio sources sa budú mapovať až po preklade do slovenčiny
      console.log('⚠️ POZNÁMKA: Lectio hlava sa bude mapovať až po preklade českého kalendára do slovenčiny');

      // 4.5. Vymaž VŠETKY existujúce slovenské záznamy pre daný rok
      // Problém: unique constraint datum+locale_code neumožňuje duplicity
      console.log('Removing ALL Slovak calendar entries for dates in year:', selectedYear);
      
      const yearStart = `${selectedYear}-01-01`;
      const yearEnd = `${selectedYear}-12-31`;
      
      const { error: deleteError, count: deletedCount } = await supabase
        .from('liturgical_calendar')
        .delete({ count: 'exact' })
        .eq('locale_code', 'sk')
        .gte('datum', yearStart)
        .lte('datum', yearEnd);

      if (deleteError) {
        console.error('Error deleting old Czech entries:', deleteError);
        throw new Error(`Chyba pri mazaní starých záznamov: ${deleteError.message}`);
      } else {
        console.log(`✅ Deleted ${deletedCount || 0} old Slovak entries for year ${selectedYear}`);
      }

      // 5. Ulož dni do databázy (po dávkach)
      const BATCH_SIZE = 50;
      let savedCount = 0;
      let errorCount = 0;

      for (let i = 0; i < days.length; i += BATCH_SIZE) {
        const batch = days.slice(i, i + BATCH_SIZE);
        
        const records = batch.map((day: CalAPIDay) => {
          const celebrationTitle = day.celebrations[0]?.title || '';
          
          // Pre české texty zatiaľ nevyplňujeme lectio_hlava
          // Bude sa mapovať až po preklade do slovenčiny
          
          return {
            datum: day.date,
            locale_code: 'sk', // Používame SK locale (české texty preložíme neskôr)
            season: day.season,
            season_week: day.season_week,
            weekday: day.weekday,
            celebration_title: celebrationTitle,
            celebration_rank: day.celebrations[0]?.rank || '',
            celebration_rank_num: day.celebrations[0]?.rank_num || null,
            celebration_colour: day.celebrations[0]?.colour || '',
            alternative_celebration_title: day.celebrations[1]?.title || null,
            alternative_celebration_rank: day.celebrations[1]?.rank || null,
            alternative_celebration_rank_num: day.celebrations[1]?.rank_num || null,
            alternative_celebration_colour: day.celebrations[1]?.colour || null,
            meniny: nameDaysMap.get(day.date) || null,
            lectio_hlava: null, // Bude sa vyplňovať po preklade do SK
            liturgical_year_id: liturgicalYearId,
            source_api: 'calapi.inadiutorium.cz',
            is_custom_edit: false
          };
        });

        // Použijeme INSERT namiesto UPSERT, pretože sme už vymazali staré záznamy
        const { error: insertError } = await supabase
          .from('liturgical_calendar')
          .insert(records);

        if (insertError) {
          console.error('Batch insert error:', insertError);
          console.error('Failed batch dates:', batch.map((d: CalAPIDay) => d.date));
          console.error('Number of records in batch:', records.length);
          errorCount += batch.length;
        } else {
          savedCount += batch.length;
        }

        setProgress(prev => ({
          ...prev,
          current: i + batch.length
        }));
      }

      setProgress({
        current: days.length,
        total: days.length,
        status: 'complete',
        message: `Hotovo! Kalendár vygenerovaný (${savedCount} dní, české texty). Použite "Preložiť CZ → SK"`
      });

      console.log(`
=== ŠTATISTIKY GENEROVANIA ===
Celkom dní: ${days.length}
Uložených: ${savedCount}
Chýb: ${errorCount}
POZNÁMKA: Použite tlačidlo "Preložiť CZ → SK" na preklad do slovenčiny
==============================
      `);

      showNotification(
        `Kalendár pre rok ${selectedYear} bol vygenerovaný s českými textami! (${savedCount} dní, ${errorCount} chýb). Teraz použite "Preložiť CZ → SK"`,
        'success'
      );

      // Obnovíme dáta
      setTimeout(() => {
        fetchYears();
        fetchStats();
        setProgress({
          current: 0,
          total: 0,
          status: 'idle',
          message: ''
        });
      }, 2000);

    } catch (error) {
      console.error('Generator error:', error);
      console.error('Error type:', typeof error);
      console.error('Error keys:', error ? Object.keys(error as object) : 'null/undefined');
      
      let errorMessage = 'Neznáma chyba';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object') {
        // Try to extract error message from object
        const errorObj = error as Record<string, unknown>;
        errorMessage = (errorObj.message as string) || (errorObj.error as string) || (errorObj.msg as string) || JSON.stringify(error);
      }
      
      console.error('Final error message:', errorMessage);
      
      setProgress({
        current: 0,
        total: 0,
        status: 'error',
        message: errorMessage
      });
      showNotification(
        `Chyba pri generovaní: ${errorMessage}`,
        'error'
      );
      
      // Reset progress after 5 seconds
      setTimeout(() => {
        setProgress({
          current: 0,
          total: 0,
          status: 'idle',
          message: ''
        });
      }, 5000);
    }
  };

  // Bulk preklad českých názvov do slovenčiny
  const handleBulkTranslate = async (yearId: number) => {
    if (!confirm('Toto preloží všetky české názvy osláv do slovenčiny pomocou AI. Pokračovať?')) {
      return;
    }

    setTranslating(true);
    setTranslateProgress({ current: 0, total: calendarDays.length });

    try {
      let successCount = 0;
      let errorCount = 0;

      // Prekladaj po jednom (kvôli rate limiting)
      for (let i = 0; i < calendarDays.length; i++) {
        const day = calendarDays[i];
        
        setTranslateProgress({ current: i + 1, total: calendarDays.length });

        try {
          // Preklad cez AI
          const response = await fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: day.celebration_title,
              targetLanguage: 'sk',
              fieldType: 'liturgical', // Špeciálny typ pre liturgické texty
              sourceLanguage: 'cs'
            }),
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const data = await response.json();
          const translatedTitle = data.translatedText;

          // Aktualizuj v databáze
          const { error: updateError } = await supabase
            .from('liturgical_calendar')
            .update({
              celebration_title: translatedTitle,
              locale_code: 'sk'
            })
            .eq('id', day.id);

          if (updateError) throw updateError;

          successCount++;
        } catch (error) {
          console.error(`Error translating day ${day.datum}:`, error);
          errorCount++;
        }

        // Malá pauza kvôli rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      showNotification(
        `Preklad dokončený! Úspešne: ${successCount}, Chyby: ${errorCount}`,
        errorCount > 0 ? 'error' : 'success'
      );

      // Obnov dáta
      fetchCalendarDays(yearId);
    } catch (error) {
      console.error('Bulk translate error:', error);
      showNotification('Chyba pri preklade', 'error');
    } finally {
      setTranslating(false);
      setTranslateProgress({ current: 0, total: 0 });
    }
  };

  // Vymazanie roka
  const handleDeleteYear = async (yearId: number, year: number) => {
    if (!confirm(`Naozaj chcete vymazať liturgický rok ${year}? Toto vymaže všetky súvisiace dni v kalendári.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('liturgical_years')
        .delete()
        .eq('id', yearId);

      if (error) throw error;

      showNotification(`Liturgický rok ${year} bol vymazaný`, 'success');
      fetchYears();
      fetchStats();
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('Chyba pri mazaní', 'error');
    }
  };

  // Vymazanie VŠETKÝCH dát (pre testovanie)
  const handleDeleteAllData = async () => {
    const confirmed = confirm(
      '⚠️ VAROVANIE: Toto vymaže VŠETKY liturgické roky a kalendárové dni!\n\n' +
      'Túto akciu NEMOŽNO vrátiť späť!\n\n' +
      'Naozaj chcete pokračovať?'
    );
    
    if (!confirmed) return;

    const doubleConfirm = confirm(
      '⚠️ POSLEDNÉ VAROVANIE!\n\n' +
      'Všetky dáta budú NATRVALO VYMAZANÉ.\n\n' +
      'Ste si 100% istý?'
    );

    if (!doubleConfirm) return;

    try {
      // Najprv vymazať všetky kalendárové dni
      const { error: calendarError } = await supabase
        .from('liturgical_calendar')
        .delete()
        .neq('id', 0); // vymaže všetko

      if (calendarError) throw calendarError;

      // Potom vymazať všetky roky
      const { error: yearsError } = await supabase
        .from('liturgical_years')
        .delete()
        .neq('id', 0); // vymaže všetko

      if (yearsError) throw yearsError;

      showNotification('Všetky dáta boli vymazané', 'success');
      fetchYears();
      fetchStats();
    } catch (error) {
      console.error('Delete all error:', error);
      showNotification('Chyba pri mazaní všetkých dát', 'error');
    }
  };

  // Načítanie lectio sources pre dropdown
  const loadLectioSources = async () => {
    setLoadingLectioSources(true);
    try {
      const { data, error } = await supabase
        .from('lectio_sources')
        .select('hlava, rok')
        .eq('lang', 'sk')
        .order('hlava', { ascending: true });

      if (error) throw error;

      setAvailableLectioSources(data || []);
    } catch (error) {
      console.error('Error loading lectio sources:', error);
      showNotification('Chyba pri načítavaní lectio sources', 'error');
    } finally {
      setLoadingLectioSources(false);
    }
  };

  // Otvorenie editačného modálu
  const handleStartEdit = async (day: CalendarDay) => {
    setEditingDay(day);
    setEditForm({
      celebration_title: day.celebration_title,
      celebration_rank: day.celebration_rank,
      celebration_colour: day.celebration_colour,
      lectio_hlava: day.lectio_hlava || '',
      alternative_celebration_title: day.alternative_celebration_title || '',
      alternative_celebration_rank: day.alternative_celebration_rank || ''
    });
    setShowEditModal(true);
    
    // Načítaj lectio sources pre dropdown
    await loadLectioSources();
  };

  // Zatvorenie modálu bez uloženia
  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingDay(null);
    setEditForm({});
  };

  // Uloženie zmien z modálu
  const handleSaveEdit = async () => {
    if (!editingDay) return;
    
    try {
      const { error } = await supabase
        .from('liturgical_calendar')
        .update({
          ...editForm,
          is_custom_edit: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingDay.id);

      if (error) throw error;

      showNotification('Deň bol úspešne upravený', 'success');
      
      // Aktualizuj lokálny state
      setCalendarDays(prev => 
        prev.map(day => 
          day.id === editingDay.id 
            ? { ...day, ...editForm, is_custom_edit: true } 
            : day
        )
      );
      
      // Zatvor modal
      setShowEditModal(false);
      setEditingDay(null);
      setEditForm({});
    } catch (error) {
      console.error('Edit error:', error);
      showNotification('Chyba pri ukladaní zmien', 'error');
    }
  };

  // Vymazanie dňa
  const handleDeleteDay = async (dayId: number, datum: string) => {
    if (!confirm(`Naozaj chcete vymazať deň ${new Date(datum).toLocaleDateString('sk-SK')}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('liturgical_calendar')
        .delete()
        .eq('id', dayId);

      if (error) throw error;

      showNotification('Deň bol vymazaný', 'success');
      setCalendarDays(prev => prev.filter(day => day.id !== dayId));
    } catch (error) {
      console.error('Delete day error:', error);
      showNotification('Chyba pri mazaní dňa', 'error');
    }
  };

  // Import lectio hlavy z lectio_sources
  const handleImportLectioSources = async (yearId: number) => {
    if (!confirm('Toto automaticky namapuje celebration_title na lectio_sources.hlava. Pokračovať?')) {
      return;
    }

    try {
      // 1. Načítaj všetky lectio sources pre slovenský jazyk
      const { data: lectioSources, error: lectioError } = await supabase
        .from('lectio_sources')
        .select('hlava, rok, locale_id, locales(code)')
        .eq('locales.code', 'sk');

      if (lectioError) throw lectioError;

      console.log(`Načítaných ${lectioSources?.length || 0} lectio sources`);
      
      // Debug: Ukáž rozdelenie podľa cyklov
      const byCycle = lectioSources?.reduce((acc, s) => {
        const key = s.rok || 'null';
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log('Rozdelenie lectio sources podľa cyklov:', byCycle);
      
      // Debug: Ukáž prvých 10 lectio sources
      console.log('Príklady lectio sources (prvých 10):');
      lectioSources?.slice(0, 10).forEach(s => {
        console.log(`  - "${s.hlava}" (rok: ${s.rok || 'null'})`);
      });

      // 2. Získaj aktuálny cyklus pre daný rok
      const currentYear = years.find(y => y.id === yearId);
      if (!currentYear) {
        throw new Error('Rok nenájdený');
      }

      const cycle = currentYear.lectionary_cycle;
      console.log(`Aktuálny cyklus: ${cycle}`);

      // 3. Prejdi všetky dni v kalendári a hľadaj zhody
      let matchedCount = 0;
      let notMatchedCount = 0;
      const debugLog: string[] = [];

      for (const day of calendarDays) {
        if (day.lectio_hlava) {
          // Už má vyplnené, preskočíme
          continue;
        }

        // Detekcia typu dňa (nedeľa vs všedný deň)
        const isSunday = day.weekday.toLowerCase().includes('neděl') || 
                         day.weekday.toLowerCase().includes('nedel');

        // Normalizuj text pre lepšie porovnanie
        const normalizeText = (text: string) => {
          return text.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Odstráň diakritiku
            .replace(/\s+/g, ' ') // Normalizuj medzery
            .trim();
        };

        const dayTitleNormalized = normalizeText(day.celebration_title);

        // Hľadaj zhodu v lectio_sources
        const match = lectioSources?.find(source => {
          const sourceHlavaNormalized = normalizeText(source.hlava);

          // PRAVIDLO 1: Nedele - musia mať špecifický cyklus (A/B/C)
          if (isSunday) {
            // Pre nedele MUSÍ byť rok zhodný alebo ABC
            const cycleMatch = source.rok === cycle || source.rok === 'ABC';
            if (!cycleMatch) return false;
          } else {
            // PRAVIDLO 2: Všedné dni (Po-So) - musia mať rok 'N' alebo 'ABC'
            // Tieto dni sú rovnaké pre všetky cykly
            // V databáze je 'N' (nie null) pre všedné dni
            const isWeekday = source.rok === 'N' || source.rok === 'ABC' || !source.rok;
            if (!isWeekday) return false;
          }

          // PRAVIDLO 3: Presná zhoda (najlepšia)
          if (dayTitleNormalized === sourceHlavaNormalized) {
            return true;
          }

          // PRAVIDLO 4: Extrahuj čísla z oboch textov a porovnaj
          const extractNumbers = (text: string) => {
            const matches = text.match(/\d+/g);
            return matches ? matches.map(Number) : [];
          };

          const dayNumbers = extractNumbers(dayTitleNormalized);
          const sourceNumbers = extractNumbers(sourceHlavaNormalized);

          // Ak oba obsahujú čísla, musia sa zhodovať
          if (dayNumbers.length > 0 && sourceNumbers.length > 0) {
            const numbersMatch = dayNumbers.every((num, idx) => num === sourceNumbers[idx]);
            if (!numbersMatch) return false;
          }

          // PRAVIDLO 5: Textová podobnosť (bez čísel)
          const removeNumbers = (text: string) => text.replace(/\d+/g, '').replace(/\s+/g, ' ').trim();
          const dayTextOnly = removeNumbers(dayTitleNormalized);
          const sourceTextOnly = removeNumbers(sourceHlavaNormalized);

          // Čiastočná zhoda v texte (po odstránení čísel)
          if (dayTextOnly.length > 5 && sourceTextOnly.length > 5) {
            return dayTextOnly.includes(sourceTextOnly) || sourceTextOnly.includes(dayTextOnly);
          }

          return false;
        });

        // Ak nenájdeme priamy match a je to spomienka/sviatok, hľadaj všedný deň
        let finalMatch = match;
        
        if (!match && !isSunday) {
          // Toto je pravdepodobne spomienka/sviatok - hľadaj všedný deň
          // Napríklad "sv. Terézia z Avily" → hľadaj "Streda 25. týždňa v Cezročnom období"
          
          // Extrahuj deň v týždni z day.weekday (ANGLICKÉ názvy!)
          const weekdayMap: Record<string, string> = {
            'monday': 'pondelok',
            'tuesday': 'utorok',
            'wednesday': 'streda',
            'thursday': 'štvrtok',
            'friday': 'piatok',
            'saturday': 'sobota',
            'sunday': 'nedeľa'
          };
          
          let weekdayName = '';
          const weekdayLower = day.weekday.toLowerCase();
          for (const [enKey, skValue] of Object.entries(weekdayMap)) {
            if (weekdayLower.includes(enKey)) {
              weekdayName = skValue;
              break;
            }
          }
          
          // Extrahuj číslo týždňa z day.season_week
          const weekNumber = day.season_week;
          
          // Normalizuj názov obdobia (season) - do SLOVENSKÉHO (vracia kľúčové slovo)
          const seasonMap: Record<string, string[]> = {
            'lent': ['postnom', 'postne', 'postnej'],
            'easter': ['velkonocnom', 'velkonocne', 'velkonocnej'],
            'advent': ['adventnom', 'adventne', 'adventnej'],
            'ordinary': ['cezrocnom', 'cezrocne', 'medziobdob'],
            'christmas': ['vianocnom', 'vianocne', 'vianocnej']
          };
          
          let seasonKeywords: string[] = [];
          const seasonLower = normalizeText(day.season);
          console.log(`📅 Season mapping: "${day.season}" → normalized: "${seasonLower}"`);
          for (const [key, keywords] of Object.entries(seasonMap)) {
            if (seasonLower.includes(key)) {
              seasonKeywords = keywords;
              console.log(`   ✓ Matched "${key}" → keywords:`, keywords);
              break;
            }
          }
          if (seasonKeywords.length === 0) {
            console.log(`   ⚠️ No match found in seasonMap!`);
          }
          
          // Vytvor pattern pre všedný deň
          if (weekdayName && weekNumber && seasonKeywords.length > 0) {
            let searchPatterns: string[] = [];
            
            // Pre veľkonočné obdobie je formát: "Štvrtok po 7. veľkonočnej nedeli"
            const isEaster = seasonKeywords.some(kw => kw.includes('velkonocn'));
            if (isEaster) {
              searchPatterns = [
                `${weekdayName} po ${weekNumber}. veľkonočnej nedeli`,
                `${weekdayName} po ${weekNumber}. velkonocnej nedeli`
              ];
            } 
            // Pre ostatné obdobia: "Štvrtok 7. týždňa v Cezročnom období"
            else {
              searchPatterns = [
                `${weekdayName} ${weekNumber}. tyzdna`,
                `${weekdayName} ${weekNumber}. týždňa`,
                `${weekdayName} ${weekNumber}`
              ];
            }
            
            console.log(`🔍 Fallback pre "${day.celebration_title}":`, {
              weekday: day.weekday,
              weekdayName,
              weekNumber,
              season: day.season,
              seasonKeywords,
              searchPatterns
            });
            
            // Hľadaj v lectio_sources všedný deň s týmto patternom
            finalMatch = lectioSources?.find(source => {
              // Musí byť všedný deň (rok='N' alebo 'ABC')
              const isWeekday = source.rok === 'N' || source.rok === 'ABC' || !source.rok;
              if (!isWeekday) return false;
              
              const sourceNormalized = normalizeText(source.hlava);
              
              // Skúsme všetky patterny
              for (const pattern of searchPatterns) {
                const patternNormalized = normalizeText(pattern);
                const matches = sourceNormalized.includes(patternNormalized);
                
                if (matches) {
                  // Pre veľkonočné stačí pattern match
                  if (isEaster) {
                    console.log(`   🎯 MATCH! Pattern "${pattern}" → Source: "${source.hlava}"`);
                    return true;
                  }
                  // Pre ostatné obdobia musí obsahovať aspoň jedno kľúčové slovo
                  const hasSeasonKeyword = seasonKeywords.some(kw => sourceNormalized.includes(kw));
                  if (hasSeasonKeyword) {
                    console.log(`   🎯 MATCH! Pattern "${pattern}" + season → Source: "${source.hlava}"`);
                    return true;
                  } else {
                    console.log(`   ⚠️ Pattern match, ale chýba žiadne z season keywords`, seasonKeywords, `v "${source.hlava}"`);
                  }
                }
              }
              
              return false;
            });
            
            if (finalMatch) {
              console.log(`✅ Nájdené: "${finalMatch.hlava}"`);
              debugLog.push(`🔄 ${day.celebration_title} → ${finalMatch.hlava} (fallback na všedný deň)`);
            } else {
              console.log(`❌ Nenájdené pre patterny:`, searchPatterns);
              console.log(`   Season keywords:`, seasonKeywords);
              // Ukáž prvých 5 veľkonočných lectio sources pre debug
              if (isEaster) {
                const easterSources = lectioSources?.filter(s => 
                  (s.rok === 'N' || s.rok === 'ABC') && 
                  normalizeText(s.hlava).includes('velkonocn')
                ).slice(0, 5);
                console.log(`   Sample veľkonočných sources:`, easterSources?.map(s => s.hlava));
              }
            }
          } else {
            console.log(`⚠️ Nepodarilo sa extrahovať: weekday="${weekdayName}", week=${weekNumber}, season keywords="${seasonKeywords}" z "${day.weekday}", "${day.season}"`);
          }
        }

        if (finalMatch) {
          // Našli sme zhodu (priamu alebo fallback), aktualizuj
          const { error: updateError } = await supabase
            .from('liturgical_calendar')
            .update({ 
              lectio_hlava: finalMatch.hlava,
              updated_at: new Date().toISOString()
            })
            .eq('id', day.id);

          if (!updateError) {
            matchedCount++;
            debugLog.push(`✓ ${day.celebration_title} → ${finalMatch.hlava} (${finalMatch.rok || 'ABC'})`);
            
            // Aktualizuj lokálny state
            setCalendarDays(prev => 
              prev.map(d => 
                d.id === day.id 
                  ? { ...d, lectio_hlava: finalMatch.hlava } 
                  : d
              )
            );
          }
        } else {
          notMatchedCount++;
          const dayType = isSunday ? '(nedeľa)' : '(všedný deň)';
          debugLog.push(`✗ ${day.celebration_title} ${dayType} - nenájdené (season: ${day.season}, week: ${day.season_week})`);
        }

        // Malá pauza medzi požiadavkami
        await new Promise(resolve => setTimeout(resolve, 30));
      }

      showNotification(
        `Import dokončený! Namapovaných: ${matchedCount}, Nenájdených: ${notMatchedCount}`,
        matchedCount > 0 ? 'success' : 'info'
      );

      console.log(`
=== ŠTATISTIKY IMPORTU ===
Namapovaných: ${matchedCount}
Nenájdených: ${notMatchedCount}
Cyklus: ${cycle}

DETAIL MAPOVANIA:
${debugLog.slice(0, 50).join('\n')}
${debugLog.length > 50 ? `\n... a ďalších ${debugLog.length - 50} záznamov` : ''}
===========================
      `);

    } catch (error) {
      console.error('Import error:', error);
      showNotification('Chyba pri importe lectio sources', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Notifikácia */}
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Progress */}
        <ProgressBar progress={progress} />

        {/* Hlavička */}
        <div 
          className="rounded-2xl shadow-lg p-8 mb-6"
          style={{ background: 'linear-gradient(135deg, #40467b 0%, #686ea3 100%)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-xl">
                <Calendar size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Liturgický kalendár
                </h1>
                <p className="text-white text-opacity-90">
                  Správa liturgického kalendára a generovanie z API
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDeleteAllData}
                disabled={progress.status !== 'idle' || years.length === 0}
                className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                title="Vymazať všetky údaje pre testovanie"
              >
                <Trash2 size={20} />
                <span className="font-medium">Vymazať všetko</span>
              </button>
              <button
                onClick={() => setShowGeneratorModal(true)}
                disabled={progress.status !== 'idle'}
                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-800 rounded-xl hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Sparkles size={20} />
                <span className="font-medium">Generovať kalendár</span>
              </button>
            </div>
          </div>
        </div>

        {/* Štatistiky */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Celkom rokov</p>
                  <p className="text-3xl font-bold" style={{ color: '#40467b' }}>
                    {stats.total_years}
                  </p>
                </div>
                <Calendar size={40} className="text-gray-300" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Celkom dní</p>
                  <p className="text-3xl font-bold" style={{ color: '#40467b' }}>
                    {stats.total_days}
                  </p>
                </div>
                <CheckCircle size={40} className="text-gray-300" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Jazyky</p>
                  <p className="text-3xl font-bold" style={{ color: '#40467b' }}>
                    {stats.languages.length}
                  </p>
                </div>
                <Globe size={40} className="text-gray-300" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Lectio Divina</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold" style={{ color: stats.lectio_percentage >= 80 ? '#10b981' : stats.lectio_percentage >= 50 ? '#f59e0b' : '#ef4444' }}>
                      {stats.lectio_percentage}%
                    </p>
                    <p className="text-sm text-gray-500">
                      ({stats.lectio_filled}/{stats.total_days})
                    </p>
                  </div>
                </div>
                <BookOpen size={40} className="text-gray-300" />
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${stats.lectio_percentage}%`,
                    backgroundColor: stats.lectio_percentage >= 80 ? '#10b981' : stats.lectio_percentage >= 50 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Zoznam rokov */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold" style={{ color: '#40467b' }}>
              Liturgické roky
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 size={40} className="animate-spin mx-auto mb-4" style={{ color: '#40467b' }} />
              <p className="text-gray-600">Načítavam...</p>
            </div>
          ) : years.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar size={60} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-2">Žiadne liturgické roky</p>
              <p className="text-sm text-gray-500">Začnite generovaním kalendára</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {years.map(year => (
                <div key={year.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="text-2xl font-bold" style={{ color: '#40467b' }}>
                          {year.year}
                        </h3>
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium" style={{ color: '#40467b' }}>
                          Cyklus {year.lectionary_cycle}
                        </span>
                        {year.is_generated && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                            ✓ Vygenerované
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-6 text-sm text-gray-600">
                        <span>Všedný lekcionár: {year.ferial_lectionary}</span>
                        {stats && stats.days_by_year[year.year] && (
                          <span>{stats.days_by_year[year.year]} dní</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (expandedYear === year.id) {
                            setExpandedYear(null);
                            setCalendarDays([]);
                          } else {
                            setExpandedYear(year.id);
                            fetchCalendarDays(year.id);
                          }
                        }}
                        className="p-2 hover:bg-gray-200 rounded-lg transition"
                        title="Zobraziť kalendár"
                      >
                        {expandedYear === year.id ? (
                          <ChevronUp size={20} style={{ color: '#40467b' }} />
                        ) : (
                          <ChevronDown size={20} style={{ color: '#40467b' }} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteYear(year.id, year.year)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                        title="Vymazať"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Rozbalený kalendár */}
                  {expandedYear === year.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {loadingDays ? (
                        <div className="py-8 text-center">
                          <Loader2 size={32} className="animate-spin mx-auto mb-2" style={{ color: '#40467b' }} />
                          <p className="text-sm text-gray-600">Načítavam kalendár...</p>
                        </div>
                      ) : calendarDays.length === 0 ? (
                        <div className="py-8 text-center">
                          <Calendar size={48} className="mx-auto mb-2 text-gray-300" />
                          <p className="text-sm text-gray-600">Žiadne dni v kalendári</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold" style={{ color: '#40467b' }}>
                              Liturgický kalendár ({calendarDays.length} dní)
                            </h4>
                            <div className="flex items-center gap-4">
                              <div className="text-sm text-gray-600">
                                {calendarDays.filter(d => d.lectio_hlava).length} dní s lectio hlavou
                              </div>
                              
                              {/* Tlačidlo na preklad českých textov */}
                              {calendarDays[0]?.locale_code === 'sk' && calendarDays.some(d => 
                                d.celebration_title.includes('ě') || 
                                d.celebration_title.includes('ř') || 
                                d.celebration_title.includes('ů') ||
                                d.celebration_title.toLowerCase().includes('neděle')
                              ) && (
                                <button
                                  onClick={() => handleBulkTranslate(year.id)}
                                  disabled={translating}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                  title="Preložiť české názvy do slovenčiny"
                                >
                                  <Globe size={16} />
                                  <span>
                                    {translating 
                                      ? `Prekladám... ${translateProgress.current}/${translateProgress.total}` 
                                      : 'Preložiť CZ → SK'
                                    }
                                  </span>
                                </button>
                              )}
                              
                              {/* Tlačidlo na import z lectio_sources */}
                              <button
                                onClick={() => handleImportLectioSources(year.id)}
                                disabled={translating}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Automaticky namapovať celebration_title na lectio_sources"
                              >
                                <Sparkles size={16} />
                                <span>Importovať z Lectio Sources</span>
                              </button>
                            </div>
                          </div>
                          
                          {/* Tabuľka kalendára */}
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="px-4 py-3 text-left font-medium text-gray-700">Dátum</th>
                                  <th className="px-4 py-3 text-left font-medium text-gray-700">Oslava</th>
                                  <th className="px-4 py-3 text-left font-medium text-gray-700">Lectio hlava</th>
                                  <th className="px-4 py-3 text-center font-medium text-gray-700">Lectio Status</th>
                                  <th className="px-4 py-3 text-right font-medium text-gray-700">Akcie</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {calendarDays.map(day => {
                                  // Skontroluj či lectio_hlava existuje v lectio_sources
                                  const lectioExists = day.lectio_hlava && availableLectioSources.some(
                                    source => source.hlava === day.lectio_hlava
                                  );
                                  
                                  return (
                                  <tr 
                                    key={day.id} 
                                    className={`hover:bg-gray-50 ${lectioExists ? 'bg-green-50' : ''}`}
                                  >
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="font-medium">
                                        {new Date(day.datum).toLocaleDateString('sk-SK', { 
                                          day: 'numeric', 
                                          month: 'short' 
                                        })}
                                      </div>
                                      <div className="text-xs text-gray-500">{day.weekday}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                      <div className="font-medium flex items-center gap-2">
                                        {day.celebration_title}
                                        {day.is_custom_edit && (
                                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                                            ✏️ Upravené
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {day.celebration_rank} • {day.season}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3">
                                      {day.lectio_hlava ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                          ✓ {day.lectio_hlava.substring(0, 40)}...
                                        </span>
                                      ) : (
                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                                          ✗ Chýba
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      {lectioExists ? (
                                        <div className="flex items-center justify-center gap-1">
                                          <CheckCircle size={18} className="text-green-600" />
                                          <span className="text-xs font-medium text-green-700">Validné</span>
                                        </div>
                                      ) : day.lectio_hlava ? (
                                        <div className="flex items-center justify-center gap-1">
                                          <AlertCircle size={18} className="text-orange-500" />
                                          <span className="text-xs font-medium text-orange-700">Neplatné</span>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 text-xs">-</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <div className="flex items-center justify-end gap-1">
                                        <button
                                          onClick={() => handleStartEdit(day)}
                                          className="p-1 hover:bg-blue-100 rounded transition text-blue-600"
                                          title="Upraviť"
                                        >
                                          <Edit2 size={16} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteDay(day.id, day.datum)}
                                          className="p-1 hover:bg-red-100 rounded transition text-red-600"
                                          title="Vymazať deň"
                                        >
                                          <Trash2 size={16} />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generator Modal */}
        {showGeneratorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              <div 
                className="p-6 rounded-t-2xl"
                style={{ background: 'linear-gradient(135deg, #40467b 0%, #686ea3 100%)' }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sparkles size={24} />
                    Generovať kalendár
                  </h3>
                  <button 
                    onClick={() => setShowGeneratorModal(false)}
                    className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-lg transition"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rok
                  </label>
                  <input
                    type="number"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    min={2024}
                    max={2030}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jazyk
                  </label>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-opacity-50 focus:border-transparent transition"
                  >
                    <option value="sk">🇸🇰 Slovenčina</option>
                    <option value="cz">🇨🇿 Čeština</option>
                    <option value="en">🇺🇸 English</option>
                    <option value="es">🇪🇸 Español</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Poznámka:</strong> Kalendár bude vygenerovaný z CalAPI pre český liturgický kalendár a slovenské meniny.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowGeneratorModal(false)}
                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Zrušiť
                  </button>
                  <button
                    onClick={handleGenerateCalendar}
                    className="flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 transition font-medium"
                    style={{ background: 'linear-gradient(135deg, #40467b 0%, #686ea3 100%)' }}
                  >
                    Generovať
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingDay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div 
                className="p-6 rounded-t-2xl sticky top-0 z-10"
                style={{ background: 'linear-gradient(135deg, #40467b 0%, #686ea3 100%)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Edit2 size={24} />
                      Upraviť liturgický deň
                    </h3>
                    <p className="text-white text-opacity-80 text-sm mt-1">
                      {new Date(editingDay.datum).toLocaleDateString('sk-SK', { 
                        weekday: 'long',
                        day: 'numeric', 
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <button 
                    onClick={handleCancelEdit}
                    className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-lg transition"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                {/* Hlavná oslava */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Názov oslavy *
                  </label>
                  <input
                    type="text"
                    value={editForm.celebration_title || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, celebration_title: e.target.value }))}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Napr. Pondelok 3. týždňa v Cezročnom období"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rank
                    </label>
                    <input
                      type="text"
                      value={editForm.celebration_rank || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, celebration_rank: e.target.value }))}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Napr. Férie"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Farba
                    </label>
                    <input
                      type="text"
                      value={editForm.celebration_colour || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, celebration_colour: e.target.value }))}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Napr. zelená"
                    />
                  </div>
                </div>

                {/* Alternatívna oslava */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Alternatívna oslava (voliteľné)</h4>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Názov alternatívnej oslavy
                    </label>
                    <input
                      type="text"
                      value={editForm.alternative_celebration_title || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, alternative_celebration_title: e.target.value }))}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Napr. Sv. Jána Bosca"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rank alternatívnej oslavy
                    </label>
                    <input
                      type="text"
                      value={editForm.alternative_celebration_rank || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, alternative_celebration_rank: e.target.value }))}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      placeholder="Napr. Spomienka"
                    />
                  </div>
                </div>

                {/* Lectio Divina */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3">Lectio Divina</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lectio hlava
                    </label>
                    <input
                      type="text"
                      list="lectio-sources-list"
                      value={editForm.lectio_hlava || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, lectio_hlava: e.target.value }))}
                      disabled={loadingLectioSources}
                      className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                      placeholder="Začnite písať pre vyhľadávanie..."
                    />
                    <datalist id="lectio-sources-list">
                      {availableLectioSources.map((source, idx) => (
                        <option key={idx} value={source.hlava}>
                          {source.rok && `(Cyklus ${source.rok})`}
                        </option>
                      ))}
                    </datalist>
                    {loadingLectioSources && (
                      <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                        <span className="inline-block w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></span>
                        Načítavam možnosti...
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Začnite písať pre vyhľadávanie v lectio sources (napr. &quot;Pondelok 2.&quot;)
                    </p>
                  </div>
                </div>

                {/* Tlačidlá */}
                <div className="flex gap-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCancelEdit}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium"
                  >
                    Zrušiť
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-4 py-3 text-white rounded-lg hover:opacity-90 transition font-medium"
                    style={{ background: 'linear-gradient(135deg, #40467b 0%, #686ea3 100%)' }}
                  >
                    Uložiť zmeny
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
