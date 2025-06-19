// Vymaže tvoje app cookies (nemaž Supabase/Supabase session cookies!)
export function removeAppCookies() {
  // Maz len cookies, ktoré vytvára tvoja aplikácia (napr. jazyk, analytika, marketing...)
  // NEmaž cookies ako sb-access-token, sb-refresh-token, sb-csrf-token (Supabase session cookies)!

  document.cookie = "lang=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "yourCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  // Ak máš ďalšie vlastné cookies (napr. 'analytics_xyz'), pridaj ich sem:
  // document.cookie = "analytics_xyz=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Vymaže tvoje localStorage keys
export function removeAppLocalStorage() {
  localStorage.removeItem('cookieConsent');
  localStorage.removeItem('lang');
  // Pridaj ďalšie podľa potreby
  localStorage.removeItem('yourKey');
}