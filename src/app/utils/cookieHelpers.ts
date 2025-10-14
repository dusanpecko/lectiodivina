// utils/cookieHelpers.ts

export type CookieConsentStatus = 'accepted' | 'declined' | null;

// Google Analytics gtag interface
declare global {
  interface Window {
    gtag?: (
      command: 'consent' | 'config' | 'event',
      action: string,
      parameters?: Record<string, string | boolean>
    ) => void;
  }
}

/**
 * Vymaže len cookies, ktoré vytvára vaša aplikácia
 * NEKASUJE Supabase session cookies (sb-access-token, sb-refresh-token, sb-csrf-token)!
 */
export function removeAppCookies() {
  if (typeof document === 'undefined') return; // Server-side safety
  
  try {
    const hostname = window.location.hostname;
    const rootDomain = hostname.startsWith('www.') ? hostname.substring(4) : hostname;
    
    // Jazykové nastavenia
    document.cookie = "lang=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict;";
    
    // Analytické cookies - vymaž pre všetky možné domény
    const analyticsCookies = ['_ga', '_ga_', '_gid', '_gat', 'analyticsConsent'];
    analyticsCookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain};`;
    });
    
    // Marketing cookies
    const marketingCookies = ['fbp', '_fbp', 'fr'];
    marketingCookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${hostname};`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain};`;
    });
    
    // Vlastné cookies aplikácie
    const appCookies = ['userPreferences', 'themeMode', 'sessionId'];
    appCookies.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict;`;
    });
  } catch (error) {
    console.error('Error removing cookies:', error);
  }
}

/**
 * Vymaže len vaše localStorage keys
 * NEKASUJE critické údaje ako session data!
 */
export function removeAppLocalStorage() {
  if (typeof window === 'undefined') return; // Server-side safety
  
  try {
    // ❌ NEODSTRAŇUJ 'cookieConsent' - potrebujeme zapamätať rozhodnutie používateľa!
    // localStorage.removeItem('cookieConsent'); // ❌ ZLE
    
    // ✅ Odstráň len tieto keys:
    const keysToRemove = [
      'lang',
      'userPreferences', 
      'themeMode',
      'analyticsData',
      'visitCount',
      'lastVisit',
      'ga_session',
      'tracking_data'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Session storage tiež
    const sessionKeysToRemove = [
      'tempData',
      'formDraft',
      'analytics_session'
    ];
    
    sessionKeysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error cleaning localStorage:', error);
  }
}

/**
 * Získa stav cookie súhlasu - HYDRATION SAFE s debugging
 */
export function getCookieConsentStatus(): CookieConsentStatus {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    const consent = localStorage.getItem('cookieConsent');
    
    // Validácia hodnoty
    if (consent === 'accepted' || consent === 'declined') {
      return consent;
    }
    
    return null;
  } catch (error) {
    console.error('Error reading cookie consent status:', error);
    return null;
  }
}

/**
 * Nastaví cookie súhlas - HYDRATION SAFE
 */
export function setCookieConsent(status: 'accepted' | 'declined') {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem('cookieConsent', status);
    
    // HYDRATION SAFE: Use static date instead of new Date()
    const currentTimestamp = Date.now();
    localStorage.setItem('cookieConsentDate', new Date(currentTimestamp).toISOString());
    
    // Backup do cookie pre prípad problémov s localStorage
    // HYDRATION SAFE: Create expiry date safely
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    document.cookie = `cookieConsent=${status}; expires=${oneYearFromNow.toUTCString()}; path=/; SameSite=Strict; Secure`;
    
    // Dispatch custom event pre cross-component sync
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { 
      detail: { status } 
    }));
    
    if (status === 'declined') {
      // Ak odmietol, vymaž tracking data
      removeAppCookies();
      removeAppLocalStorage();
    }
  } catch (error) {
    console.error('Error setting cookie consent:', error);
    
    // Fallback: len cookie
    try {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      document.cookie = `cookieConsent=${status}; expires=${oneYearFromNow.toUTCString()}; path=/; SameSite=Strict; Secure`;
    } catch (cookieError) {
      console.error('Fallback cookie save failed:', cookieError);
    }
  }
}

/**
 * Skontroluje či má používateľ udelený súhlas s cookies
 * @deprecated Použite getCookieConsentStatus() === 'accepted'
 */
export function hasCookieConsent(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const consent = localStorage.getItem('cookieConsent');
    return consent === 'accepted';
  } catch {
    return false;
  }
}

/**
 * Kontroluje či má užívateľ súhlas na tracking cookies
 */
export function hasTrackingConsent(): boolean {
  return getCookieConsentStatus() === 'accepted';
}

/**
 * Kontroluje či sú funkčné cookies povolené (vždy true)
 */
export function hasFunctionalConsent(): boolean {
  // Funkčné cookies sú vždy povolené
  return true;
}

/**
 * Inicializuje tracking služby ak má súhlas
 */
export function initializeTrackingIfConsented() {
  if (hasTrackingConsent()) {
    // Tu môžete spustiť tracking služby
    // initializeGoogleAnalytics();
    // initializeFacebookPixel();
  }
}

/**
 * Vypne všetky tracking služby
 */
export function disableAllTracking() {
  try {
    // Vypni Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied'
      });
    }
    
    // Tu môžete pridať ďalšie služby
    // disableFacebookPixel();
  } catch (error) {
    console.error('Error disabling tracking:', error);
  }
}

/**
 * DEBUGGING - Vymaže cookie consent pre testovanie
 */
export function clearCookieConsentForTesting() {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem('cookieConsent');
    localStorage.removeItem('cookieConsentDate');
    document.cookie = 'cookieConsent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  } catch (error) {
    console.error('Error clearing cookie consent for testing:', error);
  }
}