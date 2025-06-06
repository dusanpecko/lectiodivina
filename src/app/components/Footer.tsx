// src/components/Footer.tsx
"use client";
import { useLanguage } from "./LanguageProvider";
import { translations } from "@/app/i18n";
import { useCallback } from "react";
import { useCookieConsent } from "./CookieConsentContext";

export default function Footer() {
  const { open } = useCookieConsent();
   const { lang } = useLanguage();
   const t = translations[lang];

  return (
    <footer className="bg-black/90 text-gray-100 pt-12 pb-4 mt-0 relative z-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-10 md:gap-0 justify-between">
        <div className="mb-8 md:mb-0">
          <h4 className="font-bold text-lg mb-2">Kontakt</h4>
          <div className="text-sm space-y-1">
            <div>
              <span className="font-semibold">Adresa:</span><br />
              KROK – Pastoračný fond Žilinskej diecézy<br />
              Jána Kalinčiaka 1,<br />
              010 01 Žilina
            </div>
            <div>
              <span className="font-semibold">Telefón:</span><br />
              <a href="tel:+421903982982" className="hover:underline text-yellow-400">+421 903 982 982</a>
            </div>
            <div>
              <span className="font-semibold">Email:</span><br />
              <a href="mailto:mojkrok@dcza.sk" className="hover:underline text-yellow-400">mojkrok@dcza.sk</a>
            </div>
          </div>
        </div>
        <div className="text-sm space-y-1">
          <div><span className="font-semibold">IČO:</span> 52 60 18 97</div>
          <div><span className="font-semibold">DIČ:</span> 21 21 13 90 42</div>
          <div>
            <span className="font-semibold">IBAN:</span><br />
            <span className="select-all">SK04 8330 0000 0029 0168 8673</span>
          </div>
        </div>
      </div>
      <div className="mt-10 text-xs text-gray-400 text-center border-t border-gray-800 pt-4 flex flex-col items-center gap-2">
        <span>
          © 2022 - 2025 Dušan Pecko | Pastoračný fond Žilinskej diecézy (<a href="https://mojkrok.sk" target="_blank" rel="noopener" className="underline hover:text-yellow-400">mojkrok.sk</a>) | Všetky práva vyhradené |
          created by <a href="https://myprofile.sk" target="_blank" rel="noopener" className="underline hover:text-yellow-400">MYPROFILE</a>
        </span>
        <button
            onClick={open}
            className="underline text-sm text-indigo-400 hover:text-indigo-200 transition"
            type="button"
        >
            {t.manage_cookies || "Spravovať cookies"}
        </button>
      </div>
    </footer>
  );
}

