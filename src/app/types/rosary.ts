// src/app/types/rosary.ts
// TypeScript typy pre Rosary aplikáciu

export type RosaryCategory = 'joyful' | 'luminous' | 'sorrowful' | 'glorious';

export type Language = 'sk' | 'cz' | 'en' | 'es';

export type LectioDivinaStep = 'intro' | 'lectio' | 'meditatio' | 'oratio' | 'contemplatio' | 'actio';

// Hlavná štruktúra pre ruženec z databázy
export interface LectioDivinaRuzenec {
  id: string;
  created_at: string;
  updated_at: string;
  lang: Language;
  biblicky_text: string;
  kategoria: RosaryCategory;
  ruzenec: string;
  uvod: string;
  uvod_audio?: string;
  ilustracny_obrazok?: string;
  uvodne_modlitby?: string;
  uvodne_modlitby_audio?: string;
  lectio_text: string;
  lectio_audio?: string;
  komentar?: string;
  komentar_audio?: string;
  meditatio_text: string;
  meditatio_audio?: string;
  oratio_html: string;
  oratio_audio?: string;
  contemplatio_text: string;
  contemplatio_audio?: string;
  actio_text: string;
  actio_audio?: string;
  audio_nahravka?: string;
  autor?: string;
  publikovane: boolean;
  poradie: number;
}

// Kategória ruženec
export interface RosaryCategoryInfo {
  id: RosaryCategory;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  textColor: string;
  icon: string;
  emoji: string;
  czechName?: string;
  englishName?: string;
  spanishName?: string;
}

// Jeden desiatka v kategórii
export interface RosaryDecade {
  id: string;
  category: RosaryCategory;
  number: number; // 1-5
  title: string;
  biblicky_text: string;
  shortDescription: string;
  fullData: LectioDivinaRuzenec;
}

// Lectio Divina kroky
export interface LectioDivinaStepInfo {
  id: LectioDivinaStep;
  name: string;
  title: string;
  description: string;
  duration: number; // v minútach
  color: string;
  bgColor: string;
  icon: string;
  emoji: string;
  order: number;
}

// Audio prehrávač stav
export interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isLoading: boolean;
  error?: string;
}

// Progress tracking
export interface RosaryProgress {
  currentStep: LectioDivinaStep;
  stepIndex: number;
  totalSteps: number;
  isCompleted: boolean;
  startTime: Date;
  stepStartTime: Date;
  timeSpentInStep: number;
}

// Filter a search
export interface RosaryFilters {
  category?: RosaryCategory;
  language?: Language;
  hasAudio?: boolean;
  isPublished?: boolean;
  searchTerm?: string;
}

// Navigácia
export interface RosaryNavigation {
  currentCategory: RosaryCategory;
  currentDecade: number;
  currentStep: LectioDivinaStep;
  previousDecade?: {
    category: RosaryCategory;
    number: number;
  };
  nextDecade?: {
    category: RosaryCategory;
    number: number;
  };
}

// Breadcrumbs
export interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

// Komponenty props
export interface CategoryCardProps {
  category: RosaryCategoryInfo;
  decadeCount: number;
  onClick: () => void;
  isActive?: boolean;
}

export interface DecadeCardProps {
  decade: RosaryDecade;
  onClick: () => void;
  isActive?: boolean;
  showAudioIndicator?: boolean;
}

export interface LectioDivinaPlayerProps {
  decade: RosaryDecade;
  initialStep?: LectioDivinaStep;
  onStepChange?: (step: LectioDivinaStep) => void;
  onComplete?: () => void;
}

export interface AudioPlayerProps {
  src: string;
  autoPlay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number) => void;
  className?: string;
}

export interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: LectioDivinaStepInfo[];
  onStepClick?: (stepIndex: number) => void;
  showLabels?: boolean;
}

export interface NavigationControlsProps {
  navigation: RosaryNavigation;
  onPrevious?: () => void;
  onNext?: () => void;
  onBackToList?: () => void;
  disabled?: boolean;
}

export interface PrayerTextProps {
  text: string;
  type: 'html' | 'text';
  className?: string;
  highlightBibleVerses?: boolean;
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export interface RosarySettings {
  autoPlayAudio: boolean;
  showTimers: boolean;
  fontSize: 'small' | 'medium' | 'large';
  darkMode: boolean;
  language: Language;
  defaultStepDuration: number;
  enableVibration: boolean;
  enableNotifications: boolean;
}

// Error handling
export interface RosaryError {
  code: string;
  message: string;
  details?: Record<string, unknown> | string | null;
  timestamp: Date;
}

// Supabase database types (presne podľa schémy)
export interface DatabaseRosary {
  id: string;
  created_at: string;
  updated_at: string;
  lang: string; // VARCHAR(5)
  biblicky_text?: string;
  kategoria?: string; // VARCHAR(50)
  ruzenec?: string; // VARCHAR(100)
  uvod?: string;
  ilustracny_obrazok?: string;
  uvodne_modlitby?: string;
  lectio_text?: string;
  komentar?: string;
  meditatio_text?: string;
  oratio_html?: string;
  contemplatio_text?: string;
  actio_text?: string;
  audio_nahravka?: string;
  autor?: string; // VARCHAR(100)
  publikovane?: boolean;
  poradie?: number;
}

// Konverzia databáza -> aplikácia
export type RosaryData = DatabaseRosary;

// Typy sú už exportované vyššie individuálne