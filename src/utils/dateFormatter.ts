/**
 * Custom date formatter that avoids hydration mismatches
 * by using consistent formatting on both server and client
 */

type Language = 'sk' | 'cz' | 'en' | 'es' | 'it' | 'pt' | 'de';

const MONTHS: Record<Language, string[]> = {
  sk: [
    'januára', 'februára', 'marca', 'apríla', 'mája', 'júna',
    'júla', 'augusta', 'septembra', 'októbra', 'novembra', 'decembra'
  ],
  cz: [
    'ledna', 'února', 'března', 'dubna', 'května', 'června',
    'července', 'srpna', 'září', 'října', 'listopadu', 'prosince'
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  es: [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ],
  it: [
    'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
    'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'
  ],
  pt: [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ],
  de: [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ]
};

const MONTHS_SHORT: Record<Language, string[]> = {
  sk: ['jan', 'feb', 'mar', 'apr', 'máj', 'jún', 'júl', 'aug', 'sep', 'okt', 'nov', 'dec'],
  cz: ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  es: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  it: ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  de: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
};

/**
 * Format date in long format: "22. októbra 2025"
 * @param dateString - ISO date string
 * @param lang - Language code
 * @returns Formatted date string
 */
export function formatDate(dateString: string, lang: Language = 'sk'): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = MONTHS[lang][date.getMonth()];
  const year = date.getFullYear();
  
  // Different formats per language
  switch (lang) {
    case 'en':
      return `${month} ${day}, ${year}`; // "October 22, 2025"
    case 'sk':
    case 'cz':
      return `${day}. ${month} ${year}`; // "22. októbra 2025"
    case 'es':
      return `${day} de ${month} de ${year}`; // "22 de octubre de 2025"
    case 'it':
      return `${day} ${month} ${year}`; // "22 ottobre 2025"
    case 'pt':
      return `${day} de ${month} de ${year}`; // "22 de outubro de 2025"
    case 'de':
      return `${day}. ${month} ${year}`; // "22. Oktober 2025"
    default:
      return `${day}. ${month} ${year}`;
  }
}

/**
 * Format date in short format: "22. 10. 2025"
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  return `${day}. ${month}. ${year}`;
}

/**
 * Format date with short month: "22. okt 2025"
 * @param dateString - ISO date string
 * @param lang - Language code
 * @returns Formatted date string
 */
export function formatDateMedium(dateString: string, lang: Language = 'sk'): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = MONTHS_SHORT[lang][date.getMonth()];
  const year = date.getFullYear();
  
  return `${day}. ${month} ${year}`;
}

/**
 * Format date for calendar: "22. 10."
 * @param date - Date object
 * @returns Formatted date string
 */
export function formatDateCalendar(date: Date): string {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  
  return `${day}. ${month}.`;
}
