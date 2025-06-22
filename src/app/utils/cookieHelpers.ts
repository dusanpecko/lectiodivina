// utils/cookieHelpers.ts

/**
 * Vymaže len cookies, ktoré vytvára vaša aplikácia
 * NEKASUJE Supabase session cookies (sb-access-token, sb-refresh-token, sb-csrf-token)!
 */
export function removeAppCookies() {
  if (typeof document === 'undefined') return; // Server-side safety
  
  try {
    // Jazykové nastavenia
    document.cookie = "lang=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict;";
    
    // Analytické cookies
    document.cookie = "analyticsConsent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict;";
    document.cookie = "_ga=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname + ";";
    document.cookie = "_ga_=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname + ";";
    document.cookie = "_gid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname + ";";
    
    // Marketing cookies
    document.cookie = "fbp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname + ";";
    document.cookie = "_fbp=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname + ";";
    
    // Vlastné cookies aplikácie
    document.cookie = "userPreferences=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict;";
    document.cookie = "themeMode=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict;";
    
    console.log('App cookies removed successfully');
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
    localStorage.removeItem('lang');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('themeMode');
    localStorage.removeItem('analyticsData');
    localStorage.removeItem('visitCount');
    localStorage.removeItem('lastVisit');
    
    // Session storage tiež
    sessionStorage.removeItem('tempData');
    sessionStorage.removeItem('formDraft');
    
    console.log('App localStorage cleaned successfully');
  } catch (error) {
    console.error('Error cleaning localStorage:', error);
  }
}

/**
 * Skontroluje či má používateľ udelený súhlas s cookies
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
 * Získa stav cookie súhlasu
 */
export function getCookieConsentStatus(): 'accepted' | 'declined' | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const consent = localStorage.getItem('cookieConsent');
    if (consent === 'accepted' || consent === 'declined') {
      return consent;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Nastaví cookie súhlas
 */
export function setCookieConsent(status: 'accepted' | 'declined') {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('cookieConsent', status);
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    if (status === 'declined') {
      // Ak odmietol, vymaž tracking data
      removeAppCookies();
      removeAppLocalStorage();
    }
  } catch (error) {
    console.error('Error setting cookie consent:', error);
  }
}