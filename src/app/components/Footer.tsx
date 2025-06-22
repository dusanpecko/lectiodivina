// src/components/Footer.tsx
"use client";
import { useLanguage } from "./LanguageProvider";
import { translations } from "@/app/i18n";
import { useCallback, useState } from "react";
import { useCookieConsent } from "./CookieConsentContext";
import Link from "next/link";

export default function Footer() {
  const { open, consentStatus } = useCookieConsent();
  const { lang } = useLanguage();
  const t = translations[lang];
  const [isHovered, setIsHovered] = useState(false);

  // Tooltip text podľa stavu cookies
  const getCookieStatusText = () => {
    if (consentStatus === 'accepted') return 'Cookies prijaté - Zmeniť nastavenia';
    if (consentStatus === 'declined') return 'Cookies odmietnuté - Zmeniť nastavenia';
    return 'Nastaviť cookies';
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-gray-100 relative z-20">
      {/* Hlavný obsah footera */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          
          {/* Kontaktné informácie */}
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-bold text-white mb-4 relative">
                {t.footer?.contact || "Kontakt"}
                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-yellow-400 rounded-full"></div>
              </h4>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 mt-0.5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium text-white">KROK – Pastoračný fond Žilinskej diecézy</div>
                    <div>Jána Kalinčiaka 1</div>
                    <div>010 01 Žilina</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <a href="tel:+421903982982" className="hover:text-yellow-400 transition-colors duration-200">
                    +421 903 982 982
                  </a>
                </div>
                
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <a href="mailto:mojkrok@dcza.sk" className="hover:text-yellow-400 transition-colors duration-200">
                    mojkrok@dcza.sk
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Právne informácie */}
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-bold text-white mb-4 relative">
                {t.footer?.legal_info || "Právne informácie"}
                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-yellow-400 rounded-full"></div>
              </h4>
              <div className="space-y-2 text-gray-300">
                <div><span className="font-medium text-white">IČO:</span> 52 60 18 97</div>
                <div><span className="font-medium text-white">DIČ:</span> 21 21 13 90 42</div>
                <div>
                  <span className="font-medium text-white">IBAN:</span><br />
                  <span className="select-all font-mono text-sm bg-gray-800 px-2 py-1 rounded mt-1 inline-block">
                    SK04 8330 0000 0029 0168 8673
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Odkazy a súkromie */}
          <div className="space-y-6">
            <div>
              <h4 className="text-xl font-bold text-white mb-4 relative">
                {t.footer?.links || "Odkazy"}
                <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-yellow-400 rounded-full"></div>
              </h4>
              <div className="space-y-3">
                <div className="flex flex-col space-y-2">
                  <Link href="/terms" className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 inline-flex items-center group">
                    <svg className="w-4 h-4 mr-2 text-yellow-400 opacity-60 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                    {t.footer?.terms || "Všeobecné obchodné podmienky"}
                  </Link>
                  
                  <Link href="/privacy" className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 inline-flex items-center group">
                    <svg className="w-4 h-4 mr-2 text-yellow-400 opacity-60 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t.footer?.privacy || "Ochrana osobných údajov"}
                  </Link>
                  
                  {/* ✨ ENHANCED Cookie Settings Button */}
                  <button
                    onClick={open}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="text-gray-300 hover:text-yellow-400 transition-all duration-300 inline-flex items-center group text-left relative"
                    title={getCookieStatusText()}
                  >
                    {/* Cookie Icon with Status Indicator */}
                    <div className="relative mr-2">
                      {/* Main Cookie Icon */}
                      <svg 
                        className="w-4 h-4 text-yellow-400 opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                        {/* Cookie Crumbs */}
                        <circle cx="8" cy="10" r="0.8" opacity="0.7"/>
                        <circle cx="12" cy="8" r="0.6" opacity="0.7"/>
                        <circle cx="10" cy="13" r="0.7" opacity="0.7"/>
                        <circle cx="15" cy="11" r="0.5" opacity="0.7"/>
                      </svg>
                      
                      {/* Status Indicator */}
                      <div 
                        className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          consentStatus === 'accepted' 
                            ? 'bg-green-400 shadow-green-400/50' 
                            : consentStatus === 'declined'
                            ? 'bg-red-400 shadow-red-400/50'
                            : 'bg-gray-400 shadow-gray-400/50'
                        } ${isHovered ? 'shadow-lg scale-110' : 'shadow-sm'}`}
                      />
                    </div>
                    
                    {/* Text with Status */}
                    <span className="flex flex-col">
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {t.footer?.manage_cookies || t.manage_cookies || "Nastavenia cookies"}
                      </span>
                      <span className={`text-xs transition-all duration-300 ${
                        consentStatus === 'accepted' 
                          ? 'text-green-400' 
                          : consentStatus === 'declined'
                          ? 'text-red-400'
                          : 'text-gray-500'
                      }`}>
                        {consentStatus === 'accepted' && '✓ Prijaté'}
                        {consentStatus === 'declined' && '✗ Odmietnuté'}
                        {!consentStatus && '⚪ Nenastavené'}
                      </span>
                    </span>
                    
                    {/* Settings Gear Icon */}
                    <svg 
                      className="w-3 h-3 ml-auto text-gray-500 group-hover:text-yellow-400 group-hover:rotate-90 transition-all duration-300" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spodná časť s copyright a admin */}
      <div className="border-t border-gray-800 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-400 text-center sm:text-left">
              © 2022 - 2025 Dušan Pecko | Pastoračný fond Žilinskej diecézy (
              <a href="https://mojkrok.sk" target="_blank" rel="noopener" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                mojkrok.sk
              </a>
              ) | {t.footer?.all_rights_reserved || "Všetky práva vyhradené"}
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                {t.footer?.created_by || "vytvoril"}{" "}
                <a href="https://myprofile.sk" target="_blank" rel="noopener" className="text-yellow-400 hover:text-yellow-300 transition-colors font-medium">
                  MYPROFILE
                </a>
              </span>
              
              {/* Cookie Status Floating Button */}
              <button
                onClick={open}
                className={`p-2 rounded-full transition-all duration-300 group relative ${
                  consentStatus === 'accepted' 
                    ? 'bg-green-800/30 hover:bg-green-700/50 text-green-400' 
                    : consentStatus === 'declined'
                    ? 'bg-red-800/30 hover:bg-red-700/50 text-red-400'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                } hover:text-yellow-400 hover:scale-110`}
                title={getCookieStatusText()}
              >
                <span className="text-lg" role="img" aria-label="Cookie">🍪</span>
                
                {/* Pulse animation pro nenastavené cookies */}
                {!consentStatus && (
                  <div className="absolute inset-0 rounded-full bg-yellow-400/20 animate-ping"></div>
                )}
              </button>
              
              {/* Admin Button */}
              <Link 
                href="/admin" 
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-yellow-400 transition-all duration-200 group hover:scale-110" 
                title={t.footer?.admin_tooltip || t.admin || "Administrácia"}
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 group-hover:rotate-90 transition-transform duration-200" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}