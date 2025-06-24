"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import { privacyTranslations } from "./translations";
import Link from "next/link";
import { motion } from "framer-motion";

// SVG ikony
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LockClosedIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const DocumentTextIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

export default function PrivacyPolicyPage() {
  const { lang } = useLanguage();
  const t = privacyTranslations[lang] || privacyTranslations.sk;

  const sections = [
    {
      id: "controller",
      title: t.sections.controller.title,
      icon: <UserIcon />,
      content: (
        <div className="space-y-4">
          <p>{t.sections.controller.content.intro}</p>
          <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-900 mb-3">{t.sections.controller.content.companyTitle}</h4>
            <div className="text-blue-800 space-y-1">
              <p>Jána Kalinčiaka 1</p>
              <p>010 01 Žilina</p>
              <p>IČO: 52 60 18 97</p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "contact",
      title: t.sections.contact.title,
      icon: <DocumentTextIcon />,
      content: (
        <div className="space-y-4">
          <p>{t.sections.contact.content.intro}</p>
          <div className="bg-gray-50 p-6 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a href="mailto:info@lectiodivina.sk" className="text-blue-600 hover:text-blue-800 font-medium">
                  info@lectiodivina.sk
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <a href="tel:+421902575575" className="text-blue-600 hover:text-blue-800 font-medium">
                  +421 902 575 575
                </a>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "declaration",
      title: t.sections.declaration.title,
      icon: <ShieldCheckIcon />,
      content: (
        <div className="space-y-4">
          <p>{t.sections.declaration.content.intro}</p>
          <ul className="space-y-3">
            {t.sections.declaration.content.points.map((point, index) => (
              <li key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: "scope",
      title: t.sections.scope.title,
      icon: <DocumentTextIcon />,
      content: (
        <div className="space-y-6">
          <p>{t.sections.scope.content.intro}</p>
          
          <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
            <h5 className="font-semibold text-yellow-900 mb-3">{t.sections.scope.content.dataTitle}</h5>
            <div className="text-yellow-800 text-sm space-y-1">
              {t.sections.scope.content.dataPoints.map((point, index) => (
                <p key={index}>• {point}</p>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-semibold mb-3">{t.sections.scope.content.purposesTitle}</h5>
            <div className="grid gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h6 className="font-medium text-blue-900 mb-2">{t.sections.scope.content.purposes.newsletters}</h6>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h6 className="font-medium text-blue-900 mb-2">{t.sections.scope.content.purposes.services.title}</h6>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  {t.sections.scope.content.purposes.services.items.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h6 className="font-medium text-blue-900 mb-2">{t.sections.scope.content.purposes.accounting}</h6>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <p className="text-green-800">
              <strong>{t.sections.scope.content.retentionTitle}</strong> {t.sections.scope.content.retention}
            </p>
          </div>
        </div>
      )
    },
    {
      id: "third-parties",
      title: t.sections.thirdParties.title,
      icon: <UserIcon />,
      content: (
        <div className="space-y-4">
          <p>{t.sections.thirdParties.content.intro}</p>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h5 className="font-semibold text-blue-900 mb-2">{t.sections.thirdParties.content.categories.internal.title}</h5>
              <p className="text-blue-800 text-sm">{t.sections.thirdParties.content.categories.internal.desc}</p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h5 className="font-semibold text-purple-900 mb-2">{t.sections.thirdParties.content.categories.accounting.title}</h5>
              <p className="text-purple-800 text-sm">{t.sections.thirdParties.content.categories.accounting.desc}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h5 className="font-semibold text-green-900 mb-2">{t.sections.thirdParties.content.categories.accommodation.title}</h5>
              <p className="text-green-800 text-sm">{t.sections.thirdParties.content.categories.accommodation.desc}</p>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <h5 className="font-semibold text-orange-900 mb-2">{t.sections.thirdParties.content.categories.delivery.title}</h5>
              <p className="text-orange-800 text-sm">{t.sections.thirdParties.content.categories.delivery.desc}</p>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <p className="text-red-800">
              <strong>{t.sections.thirdParties.content.confidentiality.title}</strong> {t.sections.thirdParties.content.confidentiality.desc}
            </p>
          </div>
        </div>
      )
    },
    {
      id: "eu-data",
      title: t.sections.euData.title,
      icon: <ShieldCheckIcon />,
      content: (
        <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
          <p className="text-green-800">
            <strong>{t.sections.euData.content}</strong>
          </p>
        </div>
      )
    },
    {
      id: "cookies",
      title: t.sections.cookies.title,
      icon: <LockClosedIcon />,
      content: (
        <div className="space-y-4">
          <p>{t.sections.cookies.content.intro}</p>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h5 className="font-semibold text-blue-900 mb-2">{t.sections.cookies.content.usage.title}</h5>
            <p className="text-blue-800 text-sm">{t.sections.cookies.content.usage.desc}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-semibold text-gray-900 mb-2">{t.sections.cookies.content.settings.title}</h5>
            <p className="text-gray-700 text-sm">{t.sections.cookies.content.settings.desc}</p>
          </div>
        </div>
      )
    },
    {
      id: "security",
      title: t.sections.security.title,
      icon: <LockClosedIcon />,
      content: (
        <div className="space-y-4">
          <p>{t.sections.security.content.intro}</p>
          
          <div className="grid gap-3">
            {t.sections.security.content.measures.map((item, index) => (
              <div key={index} className="flex items-start space-x-3 bg-gray-50 p-3 rounded">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-600 italic">{t.sections.security.content.note}</p>
        </div>
      )
    },
    {
      id: "rights",
      title: t.sections.rights.title,
      icon: <DocumentTextIcon />,
      content: (
        <div className="space-y-6">
          <p>
            {t.sections.rights.content.intro}{" "}
            <a href={`mailto:${t.sections.rights.content.contactEmails.first}`} className="text-blue-600 hover:text-blue-800 font-medium">
              {t.sections.rights.content.contactEmails.first}
            </a>{" "}
            alebo{" "}
            <a href={`mailto:${t.sections.rights.content.contactEmails.second}`} className="text-blue-600 hover:text-blue-800 font-medium">
              {t.sections.rights.content.contactEmails.second}
            </a>
          </p>
          
          <div className="grid gap-4">
            {t.sections.rights.content.rightsList.map((right, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">
                      {right.title}
                      {right.article && <span className="text-blue-600 text-sm ml-2">({right.article})</span>}
                    </h5>
                    {right.desc && <p className="text-gray-600 text-sm">{right.desc}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  return (
    <>
      {/* Breadcrumb Header */}
      <div className="bg-white/90 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors group"
            >
              <div className="group-hover:-translate-x-1 transition-transform">
                <ArrowLeftIcon />
              </div>
              <span>{t.backToHome}</span>
            </Link>
            
            <div className="text-sm text-gray-500">
              {t.validFrom}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            {t.pageTitle}
          </h1>
          <div className="w-24 h-1.5 mx-auto bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.section
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
            >
              <div className="flex items-start space-x-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <div className="text-blue-600">
                    {section.icon}
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                  {section.title}
                </h2>
              </div>
              
              <div className="prose prose-gray max-w-none">
                {section.content}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Contact Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center"
        >
          <h3 className="text-xl font-bold mb-4">{t.contactQuestion}</h3>
          <p className="mb-6 opacity-90">{t.contactSubtitle}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a 
              href="mailto:info@lectiodivina.sk"
              className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span>info@lectiodivina.sk</span>
            </a>
            <a 
              href="tel:+421902575575"
              className="inline-flex items-center space-x-2 bg-white/20 hover:bg-white/30 px-6 py-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span>+421 902 575 575</span>
            </a>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/20 text-sm opacity-75">
            <p>
              <strong>{t.footer.signature}</strong><br />
              {t.footer.position}
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}