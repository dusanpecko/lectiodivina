"use client";

import { useLanguage } from "@/app/components/LanguageProvider";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle,
  Feather,
  Heart,
  HeartHandshake,
  Lightbulb,
  Quote,
  RefreshCw,
  Share2,
  Target,
  Users
} from "lucide-react";
import Link from "next/link";
import { translations } from "./translations";

export default function ActioStep() {
  const { lang } = useLanguage();
  const t = translations[lang as keyof typeof translations] ?? translations.sk;

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

  const iconMap = {
    Target,
    HeartHandshake,
    Feather,
    Users,
    RefreshCw,
    Share2,
    Heart
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
      {/* Hero sekcia */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: 'url(/about-background.webp)' }}
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(64, 70, 123, 0.8)' }} />
        
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Navigácia krokov */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-3">
                <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                <div className="w-3 h-3 bg-white/30 rounded-full"></div>
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#40467b' }}></div>
                <span className="text-white font-medium">{t.stepIndicator}</span>
              </div>
            </div>

            <div className="w-20 h-20 rounded-2xl p-5 mx-auto mb-6" style={{ backgroundColor: '#40467b' }}>
              <Target className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
              {t.stepTitle}
            </h1>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 max-w-4xl mx-auto mb-8">
              <Quote className="w-8 h-8 text-blue-100 mx-auto mb-4" />
              <p className="text-xl sm:text-2xl text-blue-100 italic mb-2">
                {t.quoteText}
              </p>
              <p className="text-gray-300">{t.quoteReference}</p>
            </div>

            <p className="text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed">
              {t.introParagraph}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Hlavný obsah */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Čo je Actio */}
          <motion.div 
            className="mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gray-100 rounded-xl p-3 mr-4">
                <Lightbulb className="w-6 h-6" style={{ color: '#40467b' }} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {t.whatIsTitle}
              </h2>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <p className="text-lg text-gray-700 leading-relaxed mb-4">
                {t.whatIsContent}
              </p>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-gray-800 font-medium mb-2">
                  {t.whatIsQuote1}
                </p>
                <p className="text-gray-700 italic">
                  {t.whatIsQuote2}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Ako žiť Actio v každodennosti */}
          <motion.div 
            className="mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
              {t.dailyLifeTitle}
            </h2>
            <div className="space-y-4">
              {t.everydayLife.map((item, index) => (
                <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start space-x-4">
                    <span className="text-2xl">{item.emoji}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.area}</h3>
                      <p className="text-gray-700">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 p-6 rounded-xl mt-8 border border-gray-200">
              <p className="text-gray-800 italic text-center">
                <em>{t.dailyLifeQuote}</em>
              </p>
            </div>
          </motion.div>

          {/* Možnosti konkrétneho Actio */}
          <motion.div 
            className="mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
              {t.concreteActionsTitle}
            </h2>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {t.actionCategories.map((category, index) => {
                const Icon = iconMap[category.icon as keyof typeof iconMap];
                return (
                  <motion.div 
                    key={index}
                    className={`border-2 rounded-xl p-6 ${category.color} hover:shadow-lg transition-all duration-300`}
                    variants={fadeInUp}
                  >
                    <div className="text-center mb-6">
                      <Icon className={`w-12 h-12 ${category.iconColor} mx-auto mb-3`} />
                      <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                    </div>
                    <ul className="space-y-3">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-3">
                          <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: '#40467b' }}></div>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </motion.div>
            <div className="mt-8 bg-gray-50 p-6 rounded-xl text-center border border-gray-200">
              <p className="text-gray-800 font-medium">
                {t.concreteActionsQuote}
              </p>
            </div>
          </motion.div>

          {/* Tiché formy Actio */}
          <motion.div 
            className="mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
              {t.silentActionsTitle}
            </h2>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                {t.silentActionsIntro}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {t.silentActions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-white p-4 rounded-lg border border-gray-200">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#40467b' }} />
                    <span className="text-gray-700">{action}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="italic text-gray-800">
                  <em>{t.silentActionsQuote}</em>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Praktické návody */}
          <motion.div 
            className="mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
              {t.practicalTipsTitle}
            </h2>
            <motion.div 
              className="space-y-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {t.practicalTips.map((tip, index) => {
                const Icon = iconMap[tip.icon as keyof typeof iconMap];
                const [bgColor, textColor] = tipColors[index];
                
                return (
                  <motion.div 
                    key={index}
                    className={`border-2 rounded-xl p-6 ${bgColor} hover:shadow-lg transition-all duration-300`}
                    variants={fadeInUp}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <Icon className={`w-8 h-8 ${textColor}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {tip.title}
                        </h3>
                        <p className="text-gray-600 mb-3">
                          {tip.description}
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                          {tip.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Príklad Actio */}
          <motion.div 
            className="mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
              {t.exampleTitle}
            </h2>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">
                {t.exampleIntro}
              </h3>
              
              <div className="space-y-6">
                {t.exampleActions.map((action, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">{action.title}</h4>
                    <p className="text-gray-700">{action.content}</p>
                  </div>
                ))}
                
                <div className="p-6 rounded-lg border-l-4 text-white" style={{ backgroundColor: '#40467b', borderColor: '#40467b' }}>
                  <p className="font-medium text-lg">
                    {t.exampleConclusion}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Záver kroku */}
          <motion.div 
            className="mb-16 p-8 rounded-2xl text-white shadow-xl"
            style={{ backgroundColor: '#40467b' }}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-2xl font-bold mb-4">{t.closingTitle}</h2>
            <p className="text-lg leading-relaxed mb-4">
              {t.closingText}
            </p>
            <div className="bg-white/10 p-4 rounded-lg">
              <p className="italic text-blue-100">
                {t.closingQuote}
              </p>
            </div>
          </motion.div>

          {/* Navigácia medzi krokmi */}
          <motion.div 
            className="flex justify-between items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <Link href="/intro/contemplatio">
              <motion.button
                className="flex items-center px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t.back}
              </motion.button>
            </Link>

            <div className="text-center">
              <Link href="/intro">
                <motion.button
                  className="flex items-center px-8 py-4 text-white font-bold rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
                  style={{ backgroundColor: '#40467b' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#353a66'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#40467b'}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <CheckCircle className="w-6 h-6 mr-2" />
                  {t.backToOverview}
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}