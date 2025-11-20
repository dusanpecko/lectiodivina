"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import { motion } from "framer-motion";
import Link from "next/link";
import { privacyTranslations } from "./translations";

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
              <p>{t.sections.controller.content.address.street}</p>
              <p>{t.sections.controller.content.address.city}</p>
              <p>{t.sections.controller.content.address.ico}</p>
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
                <a href="mailto:info@lectio.one" className="text-blue-600 hover:text-blue-800 font-medium">
                  info@lectio.one
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <a href="tel:+421902982982" className="text-blue-600 hover:text-blue-800 font-medium">
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
                <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#40467b' }}></div>
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
          
          <div className="bg-blue-50 p-6 rounded-lg border-l-4" style={{ borderColor: '#40467b' }}>
            <h5 className="font-semibold mb-3" style={{ color: '#40467b' }}>{t.sections.scope.content.dataTitle}</h5>
            <div className="text-gray-700 text-sm space-y-1">
              {t.sections.scope.content.dataPoints.map((point, index) => (
                <p key={index}>• {point}</p>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-semibold mb-3">{t.sections.scope.content.purposesTitle}</h5>
            <div className="grid gap-4">
              <div className="bg-white/50 p-4 rounded-lg border border-gray-200">
                <h6 className="font-medium mb-2" style={{ color: '#40467b' }}>{t.sections.scope.content.purposes.newsletters}</h6>
              </div>
              
              <div className="bg-white/50 p-4 rounded-lg border border-gray-200">
                <h6 className="font-medium mb-2" style={{ color: '#40467b' }}>{t.sections.scope.content.purposes.services.title}</h6>
                <ul className="text-sm text-gray-700 space-y-1 ml-4">
                  {t.sections.scope.content.purposes.services.items.map((item, index) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-white/50 p-4 rounded-lg border border-gray-200">
                <h6 className="font-medium mb-2" style={{ color: '#40467b' }}>{t.sections.scope.content.purposes.accounting}</h6>
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
            </a>
          </p>
          
          <div className="grid gap-4">
            {t.sections.rights.content.rightsList.map((right, index) => (
              <div key={index} className="bg-white/50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 text-white" style={{ backgroundColor: '#40467b' }}>
                    <span className="font-bold text-sm">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">
                      {right.title}
                      {right.article && <span className="text-sm ml-2" style={{ color: '#40467b' }}>({right.article})</span>}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-8">
      {/* Breadcrumb Header */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="inline-flex items-center space-x-2 text-white hover:text-gray-100 transition-colors group px-4 py-2 rounded-lg"
              style={{ backgroundColor: '#40467b' }}
            >
              <div className="group-hover:-translate-x-1 transition-transform">
                <ArrowLeftIcon />
              </div>
              <span className="font-medium">{t.backToHome}</span>
            </Link>
            
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
              {t.validFrom}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg"
                style={{ backgroundColor: '#40467b' }}
              >
                <ShieldCheckIcon />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold" style={{ color: '#40467b' }}>
                {t.pageTitle}
              </h1>
            </div>
            <div className="w-24 h-1.5 mx-auto rounded-full" style={{ backgroundColor: '#40467b' }}></div>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.section
              key={section.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20"
            >
              <div className="flex items-start space-x-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-lg"
                  style={{ backgroundColor: '#40467b' }}
                >
                  {section.icon}
                </div>
                <h2 className="text-2xl font-bold leading-tight" style={{ color: '#40467b' }}>
                  {section.title}
                </h2>
              </div>
              
              <div className="prose prose-gray max-w-none text-gray-700">
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
          className="mt-12 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center border border-white/20"
        >
          <div 
            className="inline-block px-6 py-3 rounded-xl text-white mb-4"
            style={{ backgroundColor: '#40467b' }}
          >
            <h3 className="text-xl font-bold">{t.contactQuestion}</h3>
          </div>
          <p className="mb-6 text-gray-600">{t.contactSubtitle}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <a 
              href="mailto:info@lectio.one"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors text-white hover:opacity-90 shadow-md"
              style={{ backgroundColor: '#40467b' }}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="font-medium">info@lectio.one</span>
            </a>
            <a 
              href="tel:+421902982982"
              className="inline-flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-6 py-3 rounded-lg transition-colors text-gray-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span className="font-medium">+421 902 575 575</span>
            </a>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm">
            <p style={{ color: '#40467b' }}>
              <strong>{t.footer.signature}</strong><br />
              <span className="text-gray-600">{t.footer.position}</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}