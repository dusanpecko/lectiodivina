"use client";

import { useState } from "react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { mobilePrivacyTranslations } from "./translations";
import Link from "next/link";
import { motion } from "framer-motion";

// SVG Icons
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const SmartphoneIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const DatabaseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const CookieIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

export default function MobilePrivacyPage() {
  const { lang } = useLanguage();
  const t = mobilePrivacyTranslations[lang] || mobilePrivacyTranslations.sk;
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['intro']));

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const sections = [
    {
      id: "intro",
      title: t.sections.intro.title,
      icon: <SmartphoneIcon />,
      content: (
        <div className="space-y-4">
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30">
            <h4 className="font-bold mb-3 text-lg" style={{ color: '#40467b' }}>📱 Lectio Divina Mobile App</h4>
            <p className="text-gray-700 mb-3 leading-relaxed">{t.sections.intro.content.description}</p>
            <p className="text-gray-700 mb-3 leading-relaxed">{t.sections.intro.content.purpose}</p>
            <p className="text-gray-700 leading-relaxed">{t.sections.intro.content.commitment}</p>
          </div>
          
          {/* App Download Links */}
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30">
            <h5 className="font-semibold mb-4" style={{ color: '#40467b' }}>📲 {t.downloadApp}</h5>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="https://apps.apple.com/sk/app/lectio-divina/id6443882687"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all hover:scale-105 shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <div className="text-xs">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </a>
              
              <a 
                href="https://play.google.com/store/apps/details?id=sk.dpapp.app.android604688a88a394"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-3 bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all hover:scale-105 shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div>
                  <div className="text-xs">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "token-data",
      title: t.sections.tokenData.title,
      icon: <DatabaseIcon />,
      content: (
        <div className="space-y-4">
          <p>{t.sections.tokenData.content.description}</p>
          
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30">
            <h5 className="font-semibold mb-3" style={{ color: '#40467b' }}>🔑 {t.exampleToken}</h5>
            <code className="text-sm bg-gray-800 text-green-400 p-4 rounded-xl block overflow-x-auto break-all shadow-inner">
              {t.sections.tokenData.content.example.split(': ')[1]}
            </code>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div 
                className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: '#40467b' }}
              ></div>
              <span className="text-gray-700">{t.sections.tokenData.content.nature}</span>
            </div>
            <div className="flex items-start space-x-3">
              <div 
                className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: '#40467b' }}
              ></div>
              <span className="text-gray-700">{t.sections.tokenData.content.generator}</span>
            </div>
            <div className="flex items-start space-x-3">
              <div 
                className="w-3 h-3 rounded-full mt-2 flex-shrink-0"
                style={{ backgroundColor: '#40467b' }}
              ></div>
              <span className="text-gray-700">{t.sections.tokenData.content.approach}</span>
            </div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <p className="text-yellow-800 mb-2">
              <strong>🔒 Bezpečnosť:</strong> {t.sections.tokenData.content.security}
            </p>
            <p className="text-yellow-800">
              <strong>📧 Vaše práva:</strong> {t.sections.tokenData.content.request}
            </p>
          </div>
        </div>
      )
    },
    {
      id: "personal-data",
      title: t.sections.personalData.title,
      icon: <ShieldCheckIcon />,
      content: (
        <div className="space-y-6">
          <p>{t.sections.personalData.content.intro}</p>
          
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30">
            <h5 className="font-semibold mb-4" style={{ color: '#40467b' }}>{t.sections.personalData.content.dataTypes.title}</h5>
            <ul className="space-y-2">
              {t.sections.personalData.content.dataTypes.items.map((item: string, index: number) => (
                <li key={index} className="flex items-center space-x-3">
                  <span 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: '#40467b' }}
                  ></span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <p className="text-sm text-gray-600 italic">{t.sections.personalData.content.purpose}</p>
          
          <div>
            <h5 className="font-semibold mb-4">{t.sections.personalData.content.additionalData.title}</h5>
            <div className="grid gap-4">
              <div className="bg-white/70 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-white/30 hover:shadow-xl transition-all hover:scale-105">
                <h6 className="font-semibold mb-2" style={{ color: '#40467b' }}>📍 {t.sections.personalData.content.additionalData.location.title}</h6>
                <p className="text-gray-700 text-sm leading-relaxed">{t.sections.personalData.content.additionalData.location.purpose}</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-white/30 hover:shadow-xl transition-all hover:scale-105">
                <h6 className="font-semibold mb-2" style={{ color: '#40467b' }}>📷 {t.sections.personalData.content.additionalData.photos.title}</h6>
                <p className="text-gray-700 text-sm leading-relaxed">{t.sections.personalData.content.additionalData.photos.purpose}</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-white/30 hover:shadow-xl transition-all hover:scale-105">
                <h6 className="font-semibold mb-2" style={{ color: '#40467b' }}>📊 {t.sections.personalData.content.additionalData.appInfo.title}</h6>
                <p className="text-gray-700 text-sm leading-relaxed">{t.sections.personalData.content.additionalData.appInfo.purpose}</p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-white/30 hover:shadow-xl transition-all hover:scale-105">
                <h6 className="font-semibold mb-2" style={{ color: '#40467b' }}>🔗 {t.sections.personalData.content.additionalData.identifiers.title}</h6>
                <p className="text-gray-700 text-sm leading-relaxed">{t.sections.personalData.content.additionalData.identifiers.purpose}</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "cookies",
      title: t.sections.cookies.title,
      icon: <CookieIcon />,
      content: (
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30">
            <h5 className="font-semibold mb-4" style={{ color: '#40467b' }}>🍪 {t.cookiesQuestion}</h5>
            <p className="text-gray-700 mb-3 leading-relaxed">{t.sections.cookies.content.definition}</p>
            <p className="text-gray-700 leading-relaxed">{t.sections.cookies.content.purpose}</p>
          </div>
          
          <div className="space-y-4">
            <p>{t.sections.cookies.content.types}</p>
            <p>{t.sections.cookies.content.information}</p>
            <p>{t.sections.cookies.content.advertising}</p>
            <p>{t.sections.cookies.content.settings}</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30">
            <h5 className="font-semibold mb-4" style={{ color: '#40467b' }}>📈 Google Analytics</h5>
            <div className="space-y-3 text-sm text-gray-700">
              <p className="leading-relaxed">{t.sections.cookies.content.analytics.intro}</p>
              <p className="leading-relaxed">{t.sections.cookies.content.analytics.description}</p>
              <p className="leading-relaxed">{t.sections.cookies.content.analytics.anonymity}</p>
              <p className="leading-relaxed">{t.sections.cookies.content.analytics.settings}</p>
              <p className="font-semibold leading-relaxed" style={{ color: '#40467b' }}>{t.sections.cookies.content.analytics.consent}</p>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-white/30">
            <p className="text-gray-700 text-sm leading-relaxed">{t.sections.cookies.content.directive}</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm p-5 rounded-xl shadow-lg border border-white/30">
            <p className="font-semibold" style={{ color: '#40467b' }}>
              ✅ {t.sections.cookies.content.appNote}
            </p>
          </div>
        </div>
      )
    },
    {
      id: "terms",
      title: t.sections.terms.title,
      icon: <DocumentTextIcon />,
      content: (
        <div className="space-y-6">
          <p>{t.sections.terms.content.intro}</p>
          
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30">
              <h5 className="font-semibold mb-4 flex items-center" style={{ color: '#40467b' }}>
                <span 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 text-white shadow-lg"
                  style={{ backgroundColor: '#40467b' }}
                >💻</span>
                {t.sections.terms.content.software.title}
              </h5>
              <div className="space-y-4 text-sm text-gray-700">
                <p className="leading-relaxed"><strong style={{ color: '#40467b' }}>Vlastníctvo:</strong> {t.sections.terms.content.software.ownership}</p>
                <p className="leading-relaxed"><strong style={{ color: '#40467b' }}>Licencia:</strong> {t.sections.terms.content.software.license}</p>
                <p className="leading-relaxed"><strong style={{ color: '#40467b' }}>Obmedzenia:</strong> {t.sections.terms.content.software.restrictions}</p>
                <div className="bg-red-50/80 backdrop-blur-sm p-4 rounded-xl border border-red-200">
                  <p className="text-red-700 font-semibold leading-relaxed">{t.sections.terms.content.software.violations}</p>
                </div>
                <p className="italic text-gray-600 leading-relaxed">{t.sections.terms.content.software.liability}</p>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30">
              <h5 className="font-semibold mb-4 flex items-center" style={{ color: '#40467b' }}>
                <span 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 text-white shadow-lg"
                  style={{ backgroundColor: '#40467b' }}
                >📄</span>
                {t.sections.terms.content.documents.title}
              </h5>
              <p className="text-sm text-gray-700 mb-6 leading-relaxed">{t.sections.terms.content.documents.intro}</p>
              <div className="bg-white/70 backdrop-blur-sm p-5 rounded-xl border border-white/30 mb-6">
                <h6 className="font-semibold mb-3" style={{ color: '#40467b' }}>{t.termsConditions}</h6>
                <ul className="space-y-3">
                  {t.sections.terms.content.documents.conditions.map((condition: string, index: number) => (
                    <li key={index} className="flex items-start space-x-3 text-sm text-gray-700">
                      <span 
                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: '#40467b' }}
                      ></span>
                      <span className="leading-relaxed">{condition}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4 text-sm">
                <div className="bg-red-50/80 backdrop-blur-sm p-4 rounded-xl border border-red-200">
                  <p className="font-semibold mb-2" style={{ color: '#40467b' }}>Zakázané použitie:</p>
                  <p className="text-red-600 mb-2 leading-relaxed">{t.sections.terms.content.documents.restrictions}</p>
                  <p className="text-red-600 leading-relaxed">{t.sections.terms.content.documents.violations}</p>
                </div>
                <p className="italic text-gray-600 leading-relaxed">{t.sections.terms.content.documents.designProtection}</p>
              </div>
            </div>
            
            <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-white/30">
              <h5 className="font-semibold mb-4 flex items-center" style={{ color: '#40467b' }}>
                <span 
                  className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 text-white shadow-lg"
                  style={{ backgroundColor: '#40467b' }}
                >⚠️</span>
                {t.sections.terms.content.disclaimer.title}
              </h5>
              <div className="bg-orange-50/80 backdrop-blur-sm p-5 rounded-xl border border-orange-200">
                <div className="space-y-4 text-sm text-gray-700">
                  <p className="leading-relaxed"><strong style={{ color: '#40467b' }}>Záruka:</strong> {t.sections.terms.content.disclaimer.warranty}</p>
                  <p className="leading-relaxed"><strong style={{ color: '#40467b' }}>Zodpovednosť:</strong> {t.sections.terms.content.disclaimer.liability}</p>
                  <p className="leading-relaxed"><strong style={{ color: '#40467b' }}>Presnosť:</strong> {t.sections.terms.content.disclaimer.accuracy}</p>
                  <p className="leading-relaxed"><strong style={{ color: '#40467b' }}>Zmeny:</strong> {t.sections.terms.content.disclaimer.changes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <Link 
                href="/" 
                className="inline-flex items-center text-white hover:text-gray-100 transition-colors px-4 py-2 rounded-lg"
                style={{ backgroundColor: '#40467b' }}
              >
                <ArrowLeftIcon />
                <span className="ml-2 font-medium">{t.backToHome}</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: '#40467b' }}
              >
                <SmartphoneIcon />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#40467b' }}>
                  Mobile Privacy Policy
                </h1>
                <p className="text-lg text-gray-600">Lectio Divina Mobile App</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <div key={section.id} className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-white/50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: '#40467b' }}
                  >
                    {section.icon}
                  </div>
                  <h2 className="text-xl font-semibold" style={{ color: '#40467b' }}>
                    {section.title}
                  </h2>
                </div>
                <motion.div
                  animate={{ rotate: expandedSections.has(section.id) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: '#40467b' }}
                >
                  <ChevronDownIcon />
                </motion.div>
              </button>
              
              <motion.div
                initial={false}
                animate={{
                  height: expandedSections.has(section.id) ? "auto" : 0,
                  opacity: expandedSections.has(section.id) ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="px-8 pb-8 text-gray-700 leading-relaxed">
                  {section.content}
                </div>
              </motion.div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <p className="text-gray-700 mb-6 text-lg">
              {t.footerQuestion}
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center text-white px-8 py-4 rounded-xl font-medium transition-all hover:scale-105 shadow-lg"
              style={{ backgroundColor: '#40467b' }}
            >
              {t.contactUs}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}