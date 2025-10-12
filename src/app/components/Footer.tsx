// src/components/Footer.tsx
"use client";
import { translations } from "@/app/i18n";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCookieConsent } from "./CookieConsentContext";
import { useLanguage } from "./LanguageProvider";

export default function Footer() {
  const { open, consentStatus } = useCookieConsent();
  const { lang } = useLanguage();
  const t = translations[lang];
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Tooltip text podľa stavu cookies
  const getCookieStatusText = () => {
    if (!mounted) return 'Nastaviť cookies';
    if (consentStatus === 'accepted') return 'Cookies prijaté - Zmeniť nastavenia';
    if (consentStatus === 'declined') return 'Cookies odmietnuté - Zmeniť nastavenia';
    return 'Nastaviť cookies';
  };

  // Safe consent status for rendering
  const safeConsentStatus = mounted ? consentStatus : null;

  return (
    <footer className="relative z-20" style={{ background: 'linear-gradient(to bottom right, #1f2937, #111827, #1f2937)' }}>
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full blur-3xl" style={{ backgroundColor: '#40467b' }}></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full blur-3xl" style={{ backgroundColor: '#686ea3' }}></div>
      </div>
      
      {/* Hlavný obsah footera */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Kontaktné informácie */}
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-bold text-white mb-3 relative inline-block">
                {t.footer?.contact || "Kontakt"}
                <div className="absolute bottom-0 left-0 w-full h-0.5 rounded-full" style={{ backgroundColor: '#40467b' }}></div>
              </h4>
              <div className="space-y-2 text-gray-300 text-sm">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#40467b' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="font-medium text-white">KROK – Pastoračný fond Žilinskej diecézy</div>
                    <div>Jána Kalinčiaka 1</div>
                    <div>010 01 Žilina</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#40467b' }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <a href="tel:+421903982982" className="transition-colors duration-200" style={{ color: '#9ca3af' }} onMouseEnter={(e) => e.currentTarget.style.color = '#40467b'} onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                    +421 903 982 982
                  </a>
                </div>
                
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#40467b' }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <a href="mailto:mojkrok@dcza.sk" className="transition-colors duration-200" style={{ color: '#9ca3af' }} onMouseEnter={(e) => e.currentTarget.style.color = '#40467b'} onMouseLeave={(e) => e.currentTarget.style.color = '#9ca3af'}>
                    mojkrok@dcza.sk
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Právne informácie */}
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-bold text-white mb-3 relative inline-block">
                {t.footer?.legal_info || "Právne informácie"}
                <div className="absolute bottom-0 left-0 w-full h-0.5 rounded-full" style={{ backgroundColor: '#40467b' }}></div>
              </h4>
              <div className="space-y-2 text-gray-300 text-sm">
                <div><span className="font-medium text-white">IČO:</span> 52 60 18 97</div>
                <div><span className="font-medium text-white">DIČ:</span> 21 21 13 90 42</div>
                <div>
                  <span className="font-medium text-white">IBAN:</span><br />
                  <span className="select-all font-mono text-xs px-2 py-1 rounded mt-1 inline-block" style={{ background: 'rgba(64, 70, 123, 0.2)' }}>
                    SK04 8330 0000 0029 0168 8673
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Odkazy a súkromie */}
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-bold text-white mb-3 relative inline-block">
                {t.footer?.links || "Odkazy"}
                <div className="absolute bottom-0 left-0 w-full h-0.5 rounded-full" style={{ backgroundColor: '#40467b' }}></div>
              </h4>
              <div className="space-y-2">
                <div className="flex flex-col space-y-2 text-sm">
                  <Link href="/terms" className="text-gray-300 transition-colors duration-200 inline-flex items-center group" onMouseEnter={(e) => e.currentTarget.style.color = '#40467b'} onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                    <svg className="w-3 h-3 mr-2 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: '#40467b' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
                    </svg>
                    {t.footer?.terms || "Všeobecné obchodné podmienky"}
                  </Link>
                  
                  <Link href="/privacy" className="text-gray-300 transition-colors duration-200 inline-flex items-center group" onMouseEnter={(e) => e.currentTarget.style.color = '#40467b'} onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                    <svg className="w-3 h-3 mr-2 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: '#40467b' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t.footer?.privacy || "Ochrana osobných údajov"}
                  </Link>
                  <Link href="/privacy-policy" className="text-gray-300 transition-colors duration-200 inline-flex items-center group" onMouseEnter={(e) => e.currentTarget.style.color = '#40467b'} onMouseLeave={(e) => e.currentTarget.style.color = '#d1d5db'}>
                    <svg className="w-3 h-3 mr-2 opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: '#40467b' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {t.footer?.privacy_policy || "Ochrana osobných údajov"}
                  </Link>
                  
                  {/* Cookie Settings Button */}
                  <button
                    onClick={open}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="text-gray-300 transition-all duration-300 inline-flex items-center group text-left relative text-sm"
                    style={{ color: isHovered ? '#40467b' : '#d1d5db' }}
                    title={getCookieStatusText()}
                  >
                    <div className="relative mr-2">
                      <svg 
                        className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110" 
                        style={{ color: isHovered ? '#40467b' : '#6b7280' }}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      
                      {mounted && (
                        <div 
                          className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            safeConsentStatus === 'accepted' 
                              ? 'bg-green-400 shadow-green-400/50' 
                              : safeConsentStatus === 'declined'
                              ? 'bg-red-400 shadow-red-400/50'
                              : 'bg-gray-400 shadow-gray-400/50'
                          } ${isHovered ? 'shadow-lg scale-110' : 'shadow-sm'}`}
                        />
                      )}
                    </div>
                    
                    <span className="flex flex-col">
                      <span className="group-hover:translate-x-1 transition-transform duration-300">
                        {t.footer?.manage_cookies || t.manage_cookies || "Nastavenia cookies"}
                      </span>
                      {mounted && (
                        <span className={`text-xs transition-all duration-300 ${
                          safeConsentStatus === 'accepted' 
                            ? 'text-green-400' 
                            : safeConsentStatus === 'declined'
                            ? 'text-red-400'
                            : 'text-gray-500'
                        }`}>
                          {safeConsentStatus === 'accepted' && '✓ Prijaté'}
                          {safeConsentStatus === 'declined' && '✗ Odmietnuté'}
                          {!safeConsentStatus && '⚪ Nenastavené'}
                        </span>
                      )}
                    </span>
                    
                    <svg 
                      className="w-3 h-3 ml-auto text-gray-500 group-hover:rotate-90 transition-all duration-300" 
                      style={{ color: isHovered ? '#40467b' : '#6b7280' }}
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                
                {/* NOVÁ SEKCIA - Sociálne siete */}
                <div className="pt-3 mt-3 border-t" style={{ borderColor: 'rgba(64, 70, 123, 0.3)' }}>
                  <h5 className="text-xs font-semibold text-white mb-2">
                    {t.footer?.follow_us || "Sledujte nás"}
                  </h5>
                  <div className="flex space-x-2">
                    {/* Facebook */}
                    <a
                      href="https://www.facebook.com/lectiodivinaorg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative p-2 rounded-lg transition-all duration-300 hover:scale-110"
                      style={{ background: 'rgba(64, 70, 123, 0.2)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#1877f2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(64, 70, 123, 0.2)'}
                      title="Facebook"
                    >
                      <svg 
                        className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors duration-300" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <div className="absolute inset-0 bg-blue-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </a>
                    
                    {/* Instagram */}
                    <a
                      href="https://www.instagram.com/lectiodivinaorg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative p-2 rounded-lg transition-all duration-300 hover:scale-110"
                      style={{ background: 'rgba(64, 70, 123, 0.2)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(to bottom right, #833ab4, #fd1d1d, #fcb045)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(64, 70, 123, 0.2)'}
                      title="Instagram"
                    >
                      <svg 
                        className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors duration-300" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.596-3.197-1.536L3.685 17.02c-.315.315-.315.827 0 1.142.157.157.363.236.57.236.207 0 .413-.079.57-.236l1.567-1.567c.94.754 2.091 1.194 3.362 1.194 3.022 0 5.474-2.452 5.474-5.474S11.471 6.841 8.449 6.841s-5.474 2.452-5.474 5.474c0 1.271.44 2.422 1.194 3.362l-1.567 1.567c-.315.315-.315.827 0 1.142.157.157.363.236.57.236.207 0 .413-.079.57-.236l1.567-1.567c.749.94 1.9 1.536 3.197 1.536 2.209 0 4.001-1.792 4.001-4.001s-1.792-4.001-4.001-4.001z"/>
                        <path d="M12 7.378c-2.552 0-4.622 2.07-4.622 4.622S9.448 16.622 12 16.622s4.622-2.07 4.622-4.622S14.552 7.378 12 7.378zM12 14.756c-1.504 0-2.756-1.252-2.756-2.756s1.252-2.756 2.756-2.756 2.756 1.252 2.756 2.756S13.504 14.756 12 14.756z"/>
                        <circle cx="16.806" cy="7.207" r="1.078"/>
                      </svg>
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </a>
                    
                    {/* YouTube (pre budúcnosť) */}
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="group relative p-2 rounded-lg transition-all duration-300 opacity-50 cursor-not-allowed"
                      style={{ background: 'rgba(64, 70, 123, 0.2)' }}
                      title="YouTube (coming soon)"
                    >
                      <svg 
                        className="w-4 h-4 text-gray-300 transition-colors duration-300" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <div className="absolute inset-0 bg-red-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </a>
                    
                    {/* WhatsApp/Contact */}
                    <a
                      href="https://wa.me/421903982982"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative p-2 rounded-lg transition-all duration-300 hover:scale-110"
                      style={{ background: 'rgba(64, 70, 123, 0.2)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#25D366'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(64, 70, 123, 0.2)'}
                      title="WhatsApp"
                    >
                      <svg 
                        className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors duration-300" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.051 3.488"/>
                      </svg>
                      <div className="absolute inset-0 bg-green-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spodná časť s copyright a admin */}
      <div className="border-t relative z-10" style={{ borderColor: 'rgba(64, 70, 123, 0.3)', background: 'rgba(0, 0, 0, 0.5)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            <div className="text-xs text-gray-400 text-center sm:text-left">
              © 2022 - {new Date().getFullYear()} Dušan Pecko | Pastoračný fond Žilinskej diecézy (
              <a href="https://mojkrok.sk" target="_blank" rel="noopener" className="transition-colors" style={{ color: '#40467b' }} onMouseEnter={(e) => e.currentTarget.style.color = '#686ea3'} onMouseLeave={(e) => e.currentTarget.style.color = '#40467b'}>
                mojkrok.sk
              </a>
              ) | {t.footer?.all_rights_reserved || "Všetky práva vyhradené"}
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-400">
                {t.footer?.created_by || "vytvoril"}{" "}
                <a href="https://myprofile.sk" target="_blank" rel="noopener" className="transition-colors font-medium" style={{ color: '#40467b' }} onMouseEnter={(e) => e.currentTarget.style.color = '#686ea3'} onMouseLeave={(e) => e.currentTarget.style.color = '#40467b'}>
                  MYPROFILE
                </a>
              </span>
              
              {/* Cookie Status Floating Button */}
              <button
                onClick={open}
                className={`p-1.5 rounded-lg transition-all duration-300 group relative hover:scale-110`}
                style={{
                  background: mounted && safeConsentStatus === 'accepted'
                    ? 'rgba(34, 197, 94, 0.2)'
                    : mounted && safeConsentStatus === 'declined'
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'rgba(64, 70, 123, 0.2)'
                }}
                title={getCookieStatusText()}
              >
                <span className="text-base" role="img" aria-label="Cookie">🍪</span>
                
                {/* Pulse animation pro nenastavené cookies - only show after mount */}
                {mounted && !safeConsentStatus && (
                  <div className="absolute inset-0 rounded-lg animate-ping" style={{ background: 'rgba(64, 70, 123, 0.3)' }}></div>
                )}
              </button>
              
              {/* Admin Button */}
              <Link 
                href="/admin" 
                className="p-1.5 rounded-lg text-gray-400 transition-all duration-200 group hover:scale-110" 
                style={{ background: 'rgba(64, 70, 123, 0.2)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(64, 70, 123, 0.4)';
                  e.currentTarget.style.color = '#40467b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(64, 70, 123, 0.2)';
                  e.currentTarget.style.color = '#9ca3af';
                }}
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