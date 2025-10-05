"use client";

import { motion } from "framer-motion";
import {
  Repeat,
  MessageCircle,
  Search,
  Pause,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Quote,
  Brain,
  Lightbulb
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageProvider";
import { meditatioTranslations } from "./translations";

const iconMap = {
  Repeat,
  MessageCircle,
  Search,
  Pause,
  BookOpen
};

export default function MeditatioStep() {
  const { lang } = useLanguage();
  const t = meditatioTranslations[lang as keyof typeof meditatioTranslations] ?? meditatioTranslations.sk;

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const tipColors = [
    ['bg-gray-50 border-gray-200', 'text-slate-600'],
    ['bg-gray-50 border-gray-200', 'text-slate-600'],
    ['bg-gray-50 border-gray-200', 'text-slate-600'],
    ['bg-gray-50 border-gray-200', 'text-slate-600'],
    ['bg-gray-50 border-gray-200', 'text-slate-600']
  ];

  return (
    <div className="relative">
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: 'url(/about-background.webp)' }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(64, 70, 123, 0.8)' }} />
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3">
                <div className="w-3 h-3 bg-white/30 rounded-full" />
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#40467b' }} />
                <span className="text-white font-medium">{t.stepIndicator}</span>
                <div className="w-3 h-3 bg-white/30 rounded-full" />
                <div className="w-3 h-3 bg-white/30 rounded-full" />
                <div className="w-3 h-3 bg-white/30 rounded-full" />
              </div>
            </div>

            <div className="w-20 h-20 rounded-2xl p-5 mx-auto mb-6" style={{ backgroundColor: '#40467b' }}>
              <Brain className="w-10 h-10 text-white" />
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">{t.heroTitle}</h1>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 max-w-4xl mx-auto mb-8">
              <Quote className="w-8 h-8 text-blue-100 mx-auto mb-4" />
              <p className="text-xl sm:text-2xl text-blue-100 italic mb-2">{t.heroQuote}</p>
              <p className="text-gray-300">{t.heroReference}</p>
            </div>

            <p className="text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed">{t.heroDescription}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="mb-16" {...fadeInUp}>
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gray-100 rounded-xl p-3 mr-4">
                <Lightbulb className="w-6 h-6" style={{ color: '#40467b' }} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">{t.whatIsTitle}</h2>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">{t.whatIsContent1}</p>
              <p className="text-lg text-gray-700 leading-relaxed">{t.whatIsContent2}</p>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="italic text-gray-800">{t.whatIsQuote}</p>
              </div>
            </div>
          </motion.div>

          <motion.div className="mb-16" {...fadeInUp}>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">{t.howToTitle}</h2>
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 space-y-6">
              {t.howToSteps.map((step, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: '#40467b' }}>{i + 1}.</span>
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div className="mb-16" {...fadeInUp}>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">{t.twoQuestionsTitle}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.aboutGodTitle}</h3>
                <ul className="space-y-2 text-gray-600">
                  {t.aboutGodList.map((item, i) => (
                    <li key={i}><span style={{ color: '#40467b' }}>•</span> {item}</li>
                  ))}
                </ul>
              </div>
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{t.aboutMeTitle}</h3>
                <ul className="space-y-2 text-gray-600">
                  {t.aboutMeList.map((item, i) => (
                    <li key={i}><span style={{ color: '#40467b' }}>•</span> {item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          <motion.div className="mb-16" {...fadeInUp}>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">{t.practicalTitle}</h2>
            <motion.div
              className="space-y-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {t.practicalTips.map((tip, i) => {
                const Icon = iconMap[tip.icon as keyof typeof iconMap];
                const [bgColor, textColor] = tipColors[i];
                return (
                  <motion.div
                    key={i}
                    className={`border-2 rounded-xl p-6 ${bgColor} hover:shadow-lg transition-all duration-300`}
                    variants={fadeInUp}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <Icon className={`w-8 h-8 ${textColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{tip.title}</h3>
                        <p className="text-gray-600 mb-3">{tip.description}</p>
                        <p className="text-gray-700 leading-relaxed">{tip.content}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          <motion.div className="mb-16" {...fadeInUp}>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">{t.exampleTitle}</h2>
            <div className="bg-gray-50 p-8 rounded-2xl space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">{t.exampleVerse}</h3>
              {t.exampleSteps.map((step, i) => (
                <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700">
                    <strong>{step.title}</strong> {step.content}
                  </p>
                </div>
              ))}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-gray-700">{t.examplePersonal}</p>
              </div>
              <div className="p-4 rounded-lg border-l-4 text-white" style={{ backgroundColor: '#40467b', borderColor: '#40467b' }}>
                <p className="font-medium text-lg">{t.exampleWord}</p>
              </div>
            </div>
          </motion.div>

          <motion.div className="mb-16 p-8 rounded-2xl text-white shadow-xl" style={{ backgroundColor: '#40467b' }} {...fadeInUp}>
            <h2 className="text-2xl font-bold mb-4">{t.closingTitle}</h2>
            <p className="text-lg leading-relaxed mb-4">{t.closingText1}</p>
            <div className="bg-white/10 p-4 rounded-lg mb-4">
              <p className="italic text-blue-100">{t.closingQuote}</p>
            </div>
            <p className="text-lg italic">{t.closingText2}</p>
          </motion.div>

          <motion.div className="flex justify-between items-center" {...fadeInUp}>
            <Link href="/intro/lectio">
              <motion.button
                className="flex items-center px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t.back}
              </motion.button>
            </Link>
            <Link href="/intro/oratio">
              <motion.button
                className="flex items-center px-8 py-4 text-white font-bold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#40467b' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#353a66'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#40467b'}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.next}
                <ArrowRight className="w-6 h-6 ml-2" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
