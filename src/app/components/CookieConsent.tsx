// src/components/CookieConsent.tsx
"use client";
import { useLanguage } from "./LanguageProvider";
import { translations } from "@/app/i18n";
import { useEffect, useRef } from "react";
import { removeAppCookies, removeAppLocalStorage } from "../utils/cookieHelpers";


type Props = {
  visible: boolean;
  onClose: () => void;
  showIfNeeded: () => void;
};

export default function CookieConsent({ visible, onClose, showIfNeeded }: Props) {
  const { lang } = useLanguage();
  const t = translations[lang];
  const acceptRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    showIfNeeded();
  }, [showIfNeeded]);

  useEffect(() => {
    if (visible && acceptRef.current) acceptRef.current.focus();
  }, [visible]);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    onClose();
    // Spusti Analytics, ak potrebuješ
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined");
    // Mazanie localStorage a cookies (iba tvoje kľúče)
    removeAppLocalStorage();
    removeAppCookies();
    onClose();
    // Tu vypni Analytics atď.
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 transition-all"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 text-center relative animate-fade-in">
        <button
          onClick={onClose}
          aria-label={t.close || "Zavrieť"}
          className="absolute top-2 right-3 text-gray-400 hover:text-black text-2xl"
        >
          &times;
        </button>
        <h3 id="cookie-consent-title" className="text-xl font-bold mb-2">
          🍪 {t.cookie_title || "Cookies"}
        </h3>
        <p className="text-gray-700 mb-6">
          {t.cookie_text ||
            "Táto stránka používa cookies na analýzu návštevnosti a lepšie fungovanie."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            ref={acceptRef}
            onClick={acceptCookies}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full font-semibold shadow transition"
          >
            {t.accept_cookies || "Súhlasím"}
          </button>
          <button
            onClick={declineCookies}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-full font-semibold shadow transition"
          >
            {t.decline_cookies || "Nesúhlasím"}
          </button>
        </div>
      </div>
    </div>
  );
}
