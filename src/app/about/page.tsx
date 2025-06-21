"use client";
import { useLanguage } from "../components/LanguageProvider";
import { aboutTranslations } from "./i18n";
import { motion } from "framer-motion";
import { 
  Heart, 
  BookOpen, 
  Users, 
  Smartphone, 
  Bell, 
  Monitor, 
  Globe, 
  Palette,
  ExternalLink,
  HandHeart,
  MessageCircle,
  Building2,
  Lightbulb
} from "lucide-react";

export default function AboutPage() {
  const { lang } = useLanguage();
  const t = aboutTranslations[lang];

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

  return (
    <div className="relative">
      {/* Hero sekcia */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Pozadie s gradientom */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900"></div>
        <div className="absolute inset-0 bg-black/40"></div>
        
        {/* Dekoratívne prvky */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-blue-400/20 rounded-full blur-xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t.title}
            </h1>
            <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto">
              {t.subtitle}
            </p>
            <div className="flex justify-center">
              <BookOpen className="w-16 h-16 text-yellow-400" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Obsah stránky */}
      <section className="py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Ako sa to začalo */}
          <motion.div 
            className="mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="flex items-center mb-6">
              <Heart className="w-8 h-8 text-red-500 mr-4" />
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {t.origin.title}
              </h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t.origin.text}
            </p>
          </motion.div>

          {/* Naša vízia */}
          <motion.div 
            className="mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="flex items-center mb-6">
              <Users className="w-8 h-8 text-blue-600 mr-4" />
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {t.vision.title}
              </h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t.vision.text}
            </p>
          </motion.div>

          {/* Čo je Lectio Divina */}
          <motion.div 
            className="mb-16 bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-2xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="flex items-center mb-6">
              <BookOpen className="w-8 h-8 text-purple-600 mr-4" />
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {t.what_is.title}
              </h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t.what_is.text}
            </p>
          </motion.div>

          {/* Osvedčený projekt */}
          <motion.div 
            className="mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="flex items-center mb-6">
              <Smartphone className="w-8 h-8 text-green-600 mr-4" />
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {t.proven_project.title}
              </h2>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              {t.proven_project.text}
            </p>
            
            {/* Štatistiky */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <div className="text-3xl font-bold text-indigo-600 mb-2">5000+</div>
                <div className="text-gray-600">Stiahnutí za prvý mesiac</div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
                <div className="text-gray-600">Pozitívna spätná väzba</div>
              </div>
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">∞</div>
                <div className="text-gray-600">Duchovné ovocie</div>
              </div>
            </div>
          </motion.div>

          {/* Nová verzia */}
          <motion.div 
            className="mb-16 bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-2xl"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8 text-center">
              {t.new_version.title}
            </h2>
            
            {/* Už hotové */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-green-700 mb-4 flex items-center">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-3"></span>
                {t.new_version.completed}
              </h3>
              <p className="text-gray-700 ml-6">
                {t.new_version.completed_text}
              </p>
            </div>

            {/* Na čom pracujeme */}
            <div>
              <h3 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                {t.new_version.working_on}
              </h3>
              <motion.div 
                className="space-y-4 ml-6"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {t.new_version.features.map((feature, index) => {
                  const icons = [Bell, Monitor, Globe, Palette];
                  const Icon = icons[index] || Bell;
                  return (
                    <motion.div 
                      key={index}
                      className="flex items-start space-x-3"
                      variants={fadeInUp}
                    >
                      <Icon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{feature}</p>
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </motion.div>

          {/* Podpora projektu */}
          <motion.div 
            className="mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {t.support.title}
              </h2>
              <h3 className="text-2xl text-gray-700 mb-6">
                {t.support.subtitle}
              </h3>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t.support.intro}
              </p>
            </div>

            {/* Spôsoby podpory */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {t.support.ways.map((way, index) => {
                const icons = [HandHeart, MessageCircle, Building2, Lightbulb, Heart];
                const Icon = icons[index] || HandHeart;
                const colors = ['border-green-200 bg-green-50', 'border-blue-200 bg-blue-50', 'border-purple-200 bg-purple-50', 'border-yellow-200 bg-yellow-50', 'border-red-200 bg-red-50'];
                
                return (
                  <motion.div 
                    key={index}
                    className={`p-6 rounded-xl border-2 ${colors[index]} hover:shadow-lg transition-shadow duration-300`}
                    variants={fadeInUp}
                  >
                    <div className="flex items-center mb-4">
                      <Icon className="w-8 h-8 text-gray-700 mr-3" />
                      <h4 className="text-xl font-semibold text-gray-900">
                        {way.title}
                      </h4>
                    </div>
                    <p className="text-gray-700 mb-4">
                      {way.text}
                    </p>
                    {way.link && way.button && (
                      <a 
                        href={way.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                      >
                        {way.button}
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Záver */}
          <motion.div 
            className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl text-white"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <BookOpen className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
            <p className="text-xl mb-6 leading-relaxed">
              {t.conclusion.text}
            </p>
            <p className="text-lg font-semibold">
              {t.conclusion.thanks}
            </p>
          </motion.div>

        </div>
      </section>
    </div>
  );
}