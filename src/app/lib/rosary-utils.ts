// src/app/lib/rosary-utils.ts
// Helper funkcie a konštanty pre Rosary aplikáciu

import { 
  RosaryCategory, 
  RosaryCategoryInfo, 
  LectioDivinaStep, 
  LectioDivinaStepInfo,
  Language,
  RosaryDecade,
  LectioDivinaRuzenec,
  RosaryNavigation
} from '../types/rosary';

// ===============================
// KONŠTANTY
// ===============================

export const ROSARY_CATEGORIES: RosaryCategory[] = [
  'joyful',
  'luminous', 
  'sorrowful',
  'glorious'
];

export const LECTIO_DIVINA_STEPS: LectioDivinaStep[] = [
  'intro',
  'lectio',
  'meditatio', 
  'oratio',
  'contemplatio',
  'actio'
];

export const SUPPORTED_LANGUAGES: Language[] = ['sk', 'cz', 'en', 'es'];

export const DECADES_PER_CATEGORY = 5;

// ===============================
// KATEGÓRIE RUŽENEC
// ===============================

export const ROSARY_CATEGORIES_INFO: Record<RosaryCategory, RosaryCategoryInfo> = {
  joyful: {
    id: 'joyful',
    name: 'Radostné tajomstvá',
    description: 'Radostné udalosti zo života Panny Márie a Ježiša',
    color: '#FFD700', // zlatá
    bgColor: '#FFFBEB', // amber-50
    textColor: '#92400E', // amber-700
    icon: '✨',
    emoji: '😊',
    czechName: 'Radostná tajemství',
    englishName: 'Joyful Mysteries',
    spanishName: 'Misterios Gozosos'
  },
  luminous: {
    id: 'luminous',
    name: 'Svetelné tajomstvá',
    description: 'Svetelné momenty Ježišovho verejného pôsobenia',
    color: '#87CEEB', // svetlomodrá
    bgColor: '#EFF6FF', // blue-50
    textColor: '#1E40AF', // blue-700
    icon: '💡',
    emoji: '✨',
    czechName: 'Světelná tajemství',
    englishName: 'Luminous Mysteries',
    spanishName: 'Misterios Luminosos'
  },
  sorrowful: {
    id: 'sorrowful',
    name: 'Bolestné tajomstvá',
    description: 'Utrpenie a smrť Ježiša Krista',
    color: '#8B0000', // tmavočervená
    bgColor: '#FEF2F2', // red-50
    textColor: '#991B1B', // red-700
    icon: '✝️',
    emoji: '😢',
    czechName: 'Bolestná tajemství',
    englishName: 'Sorrowful Mysteries',
    spanishName: 'Misterios Dolorosos'
  },
  glorious: {
    id: 'glorious',
    name: 'Slávnostné tajomstvá',
    description: 'Zmŕtvychvstanie a sláva Ježiša a Márie',
    color: '#FFFFFF', // biela
    bgColor: '#F5F3FF', // violet-50
    textColor: '#5B21B6', // violet-700
    icon: '👑',
    emoji: '🎉',
    czechName: 'Slavnostní tajemství',
    englishName: 'Glorious Mysteries',
    spanishName: 'Misterios Gloriosos'
  }
};

// ===============================
// LECTIO DIVINA KROKY
// ===============================

export const LECTIO_DIVINA_STEPS_INFO: Record<LectioDivinaStep, LectioDivinaStepInfo> = {
  intro: {
    id: 'intro',
    name: 'Úvod',
    title: 'Príprava na modlitbu',
    description: 'Príprava srdca a mysle na duchovnú cestu',
    duration: 2,
    color: '#6B7280', // gray-500
    bgColor: '#F9FAFB', // gray-50
    icon: '🏠',
    emoji: '🙏',
    order: 0
  },
  lectio: {
    id: 'lectio',
    name: 'Lectio',
    title: 'Čítanie',
    description: 'Pozorné a pomalé čítanie Božieho slova',
    duration: 5,
    color: '#3B82F6', // blue-500
    bgColor: '#EFF6FF', // blue-50
    icon: '📖',
    emoji: '📚',
    order: 1
  },
  meditatio: {
    id: 'meditatio',
    name: 'Meditatio',
    title: 'Rozjímanie',
    description: 'Hlboké premýšľanie nad textom',
    duration: 10,
    color: '#10B981', // emerald-500
    bgColor: '#ECFDF5', // emerald-50
    icon: '🧘',
    emoji: '💭',
    order: 2
  },
  oratio: {
    id: 'oratio',
    name: 'Oratio',
    title: 'Modlitba - Desiatky',
    description: 'Otvorený rozhovor s Bohom cez ruženec',
    duration: 15,
    color: '#F59E0B', // amber-500
    bgColor: '#FFFBEB', // amber-50
    icon: '📿',
    emoji: '🙏',
    order: 3
  },
  contemplatio: {
    id: 'contemplatio',
    name: 'Contemplatio',
    title: 'Kontemplacie',
    description: 'Tiché spočinutie v Božej prítomnosti',
    duration: 10,
    color: '#EF4444', // red-500
    bgColor: '#FEF2F2', // red-50
    icon: '❤️',
    emoji: '💖',
    order: 4
  },
  actio: {
    id: 'actio',
    name: 'Actio',
    title: 'Konanie',
    description: 'Pretvorenie poznania do praktického života',
    duration: 5,
    color: '#8B5CF6', // violet-500
    bgColor: '#F5F3FF', // violet-50
    icon: '🌟',
    emoji: '⚡',
    order: 5
  }
};

// ===============================
// HELPER FUNKCIE
// ===============================

/**
 * Získa informácie o kategórii ruženec
 */
export function getCategoryInfo(category: RosaryCategory): RosaryCategoryInfo {
  return ROSARY_CATEGORIES_INFO[category];
}

/**
 * Získa informácie o kroku Lectio Divina
 */
export function getStepInfo(step: LectioDivinaStep): LectioDivinaStepInfo {
  return LECTIO_DIVINA_STEPS_INFO[step];
}

/**
 * Získa farbu pre kategóriu
 */
export function getCategoryColor(category: RosaryCategory): string {
  return ROSARY_CATEGORIES_INFO[category].color;
}

/**
 * Získa background farbu pre kategóriu
 */
export function getCategoryBgColor(category: RosaryCategory): string {
  return ROSARY_CATEGORIES_INFO[category].bgColor;
}

/**
 * Získa ikonu pre kategóriu
 */
export function getCategoryIcon(category: RosaryCategory): string {
  return ROSARY_CATEGORIES_INFO[category].icon;
}

/**
 * Získa emoji pre kategóriu
 */
export function getCategoryEmoji(category: RosaryCategory): string {
  return ROSARY_CATEGORIES_INFO[category].emoji;
}

/**
 * Získa názov kategórie v danom jazyku
 */
export function getCategoryName(category: RosaryCategory, language: Language = 'sk'): string {
  const categoryInfo = ROSARY_CATEGORIES_INFO[category];
  
  switch (language) {
    case 'cz':
      return categoryInfo.czechName || categoryInfo.name;
    case 'en':
      return categoryInfo.englishName || categoryInfo.name;
    case 'es':
      return categoryInfo.spanishName || categoryInfo.name;
    default:
      return categoryInfo.name;
  }
}

/**
 * Formátuje čas v minútach na čitateľný formát
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} h`;
  }
  
  return `${hours} h ${remainingMinutes} min`;
}

/**
 * Formátuje biblický text - odstráni HTML a skráti
 */
export function formatBibleText(text: string, maxLength: number = 100): string {
  // Odstránenie HTML tagov
  const cleanText = text.replace(/<[^>]*>/g, '');
  
  // Skrátenie textu
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  
  return cleanText.substring(0, maxLength - 3) + '...';
}

/**
 * Formátuje HTML text pre modlitby
 */
export function formatPrayerText(htmlText: string): string {
  // Základné HTML formátovanie
  return htmlText
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

/**
 * Generuje názov desiatka
 */
export function getDecadeTitle(category: RosaryCategory, number: number): string {
  const categoryInfo = getCategoryInfo(category);
  return `${number}. ${categoryInfo.name.toLowerCase()} tajomstvo`;
}

/**
 * Generuje slug pre URL
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[áäâà]/g, 'a')
    .replace(/[éëêè]/g, 'e')
    .replace(/[íîì]/g, 'i')
    .replace(/[óöôò]/g, 'o')
    .replace(/[úüûù]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[ľĺ]/g, 'l')
    .replace(/[ť]/g, 't')
    .replace(/[ž]/g, 'z')
    .replace(/[š]/g, 's')
    .replace(/[č]/g, 'c')
    .replace(/[ň]/g, 'n')
    .replace(/[ď]/g, 'd')
    .replace(/[ŕ]/g, 'r')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Konvertuje databázový záznam na RosaryDecade
 */
export function convertToRosaryDecade(
  dbRecord: LectioDivinaRuzenec, 
  category: RosaryCategory, 
  number: number
): RosaryDecade {
  return {
    id: dbRecord.id,
    category,
    number,
    title: dbRecord.ruzenec,
    biblicky_text: dbRecord.biblicky_text,
    shortDescription: formatBibleText(dbRecord.uvod, 150),
    fullData: dbRecord
  };
}

/**
 * Získa nasledujúci krok Lectio Divina
 */
export function getNextStep(currentStep: LectioDivinaStep): LectioDivinaStep | null {
  const currentIndex = LECTIO_DIVINA_STEPS.indexOf(currentStep);
  
  if (currentIndex === -1 || currentIndex === LECTIO_DIVINA_STEPS.length - 1) {
    return null;
  }
  
  return LECTIO_DIVINA_STEPS[currentIndex + 1];
}

/**
 * Získa predchádzajúci krok Lectio Divina
 */
export function getPreviousStep(currentStep: LectioDivinaStep): LectioDivinaStep | null {
  const currentIndex = LECTIO_DIVINA_STEPS.indexOf(currentStep);
  
  if (currentIndex <= 0) {
    return null;
  }
  
  return LECTIO_DIVINA_STEPS[currentIndex - 1];
}

/**
 * Generuje navigáciu pre ruženec
 */
export function generateRosaryNavigation(
  currentCategory: RosaryCategory,
  currentDecade: number,
  currentStep: LectioDivinaStep
): RosaryNavigation {
  const categoryIndex = ROSARY_CATEGORIES.indexOf(currentCategory);
  
  // Predchádzajúci desiatka
  let previousDecade = undefined;
  if (currentDecade > 1) {
    previousDecade = {
      category: currentCategory,
      number: currentDecade - 1
    };
  } else if (categoryIndex > 0) {
    previousDecade = {
      category: ROSARY_CATEGORIES[categoryIndex - 1],
      number: 5
    };
  }
  
  // Nasledujúci desiatka
  let nextDecade = undefined;
  if (currentDecade < 5) {
    nextDecade = {
      category: currentCategory,
      number: currentDecade + 1
    };
  } else if (categoryIndex < ROSARY_CATEGORIES.length - 1) {
    nextDecade = {
      category: ROSARY_CATEGORIES[categoryIndex + 1],
      number: 1
    };
  }
  
  return {
    currentCategory,
    currentDecade,
    currentStep,
    previousDecade,
    nextDecade
  };
}

/**
 * Získa celkový čas pre Lectio Divina
 */
export function getTotalDuration(): number {
  return LECTIO_DIVINA_STEPS.reduce((total, step) => {
    return total + LECTIO_DIVINA_STEPS_INFO[step].duration;
  }, 0);
}

/**
 * Validuje kategóriu ruženec
 */
export function isValidCategory(category: string): category is RosaryCategory {
  return ROSARY_CATEGORIES.includes(category as RosaryCategory);
}

/**
 * Validuje krok Lectio Divina
 */
export function isValidStep(step: string): step is LectioDivinaStep {
  return LECTIO_DIVINA_STEPS.includes(step as LectioDivinaStep);
}

/**
 * Validuje jazyk
 */
export function isValidLanguage(language: string): language is Language {
  return SUPPORTED_LANGUAGES.includes(language as Language);
}

/**
 * Validuje číslo desiatka
 */
export function isValidDecadeNumber(number: number): boolean {
  return Number.isInteger(number) && number >= 1 && number <= 5;
}

/**
 * Generuje breadcrumb items
 */
export function generateBreadcrumbs(
  currentCategory?: RosaryCategory,
  currentDecade?: number,
  currentStep?: LectioDivinaStep
) {
  const breadcrumbs = [
    { label: 'Ruženec', href: '/rosary', isActive: false }
  ];
  
  if (currentCategory) {
    const categoryInfo = getCategoryInfo(currentCategory);
    breadcrumbs.push({
      label: categoryInfo.name,
      href: `/rosary/${currentCategory}`,
      isActive: !currentDecade
    });
  }
  
  if (currentCategory && currentDecade) {
    breadcrumbs.push({
      label: `${currentDecade}. tajomstvo`,
      href: `/rosary/${currentCategory}/${currentDecade}`,
      isActive: !currentStep
    });
  }
  
  if (currentStep && currentStep !== 'intro') {
    const stepInfo = getStepInfo(currentStep);
    breadcrumbs.push({
      label: stepInfo.name,
      href: '#',
      isActive: true
    });
  }
  
  return breadcrumbs;
}

/**
 * Kontroluje, či je audio dostupné
 */
export function hasAudio(decade: RosaryDecade): boolean {
  return !!decade.fullData.audio_nahravka;
}

/**
 * Kontroluje, či je obrázok dostupný
 */
export function hasImage(decade: RosaryDecade): boolean {
  return !!decade.fullData.ilustracny_obrazok;
}

/**
 * Extrahuje text z HTML
 */
export function extractTextFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Skontroluje, či je ruženec publikovaný
 */
export function isPublished(decade: RosaryDecade): boolean {
  return decade.fullData.publikovane;
}

/**
 * Generuje URL pre audio
 */
export function getAudioUrl(decade: RosaryDecade): string | null {
  return decade.fullData.audio_nahravka || null;
}

/**
 * Generuje URL pre obrázok
 */
export function getImageUrl(decade: RosaryDecade): string | null {
  return decade.fullData.ilustracny_obrazok || null;
}

// Všetky funkcie a konštanty sú už exportované vyššie