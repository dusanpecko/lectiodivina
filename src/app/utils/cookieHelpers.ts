// src/utils/cookieHelpers.ts

// Vymaže tvoje app cookies (zmeň názvy na tvoje reálne)
export function removeAppCookies() {
  // Príklad – prispôsob podľa svojich cookies
  document.cookie = "lang=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  document.cookie = "yourCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

// Vymaže tvoje localStorage keys
export function removeAppLocalStorage() {
  localStorage.removeItem('cookieConsent');
  localStorage.removeItem('lang');
  // Pridaj ďalšie podľa potreby
  localStorage.removeItem('yourKey');
    
}
