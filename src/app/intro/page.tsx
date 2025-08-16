"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Heart,
  Users,
  RefreshCw,
  ArrowRight,
  Ear,
  Clock,
  Bookmark,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "./translations";

type Translation = typeof translations.sk;

type Step = Translation["steps"][number];
type Benefit = Translation["benefits"][number];
type Guide = Translation["guide"][number];

export default function IntroPage() {
  const { lang } = useLanguage();
  const t: Translation = translations[lang as keyof typeof translations] ?? translations.sk;

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

  const iconMap: Record<string, React.ElementType> = {
    lectio: BookOpen,
    meditatio: Heart,
    oratio: Users,
    contemplatio: RefreshCw,
    actio: ArrowRight
  };

  const stepColors: Record<string, string> = {
    lectio: "from-blue-500 to-indigo-600",
    meditatio: "from-green-500 to-emerald-600",
    oratio: "from-amber-500 to-orange-600",
    contemplatio: "from-red-500 to-pink-600",
    actio: "from-purple-500 to-violet-600"
  };

  const steps = t.steps.map((step) => ({
    ...step,
    icon: iconMap[step.slug],
    color: stepColors[step.slug]
  }));

  const benefits = t.benefits.map((b, i) => ({
    ...b,
    icon: [Ear, Heart, RefreshCw, Users][i]
  }));

  const guides = t.guide.map((g, i) => ({
    ...g,
    icon: [Clock, Bookmark, Heart, UserCheck][i]
  }));

  return (
    <div className="relative">
      {/* Hero sekcia */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/20 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-blue-400/20 rounded-full blur-xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t.heroTitle}
            </h1>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-yellow-300 mb-8">
              {t.heroSubtitle}
            </h2>
            <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-4xl mx-auto">
              {t.heroDescription}
            </p>
            <Link href="/intro/lectio">
              <motion.button
                className="inline-flex items-center px-8 py-4 bg-yellow-500 text-gray-900 font-bold rounded-xl hover:bg-yellow-400 transition-colors duration-200 text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.startLectio}
                <ArrowRight className="w-6 h-6 ml-2" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Čo je Lectio Divina */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="flex items-center justify-center mb-8">
              <BookOpen className="w-12 h-12 text-purple-600 mr-4" />
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
                {t.whatIs}
              </h2>
            </div>
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                {t.whatIsText1}
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                {t.whatIsText2}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Päť krokov */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              {t.fiveStepsTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t.fiveStepsText}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.slug}
                  variants={fadeInUp}
                  className="group"
                >
                  <Link href={`/intro/${step.slug}`}>
                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer h-full">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${step.color} p-4 mb-4 mx-auto`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-center mb-4">
                        <div className="text-sm font-semibold text-gray-500 mb-1">
                          Krok {step.number} • {step.duration}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {step.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                          {step.subtitle}
                        </p>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {step.description}
                      </p>
                      <div className="mt-6 text-center">
                        <span className="inline-flex items-center text-sm font-medium text-indigo-600 group-hover:text-indigo-800">
                          {t.startStep}
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Výhody */}
      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              {t.benefitsTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t.benefitsText}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              const colors = ['bg-blue-50 border-blue-200', 'bg-green-50 border-green-200', 'bg-purple-50 border-purple-200', 'bg-orange-50 border-orange-200'];
              const iconColors = ['text-blue-600', 'text-green-600', 'text-purple-600', 'text-orange-600'];

              return (
                <motion.div
                  key={index}
                  className={`p-6 rounded-xl border-2 ${colors[index]} hover:shadow-lg transition-shadow duration-300`}
                  variants={fadeInUp}
                >
                  <div className="flex items-center mb-4">
                    <Icon className={`w-8 h-8 ${iconColors[index]} mr-4`} />
                    <h3 className="text-xl font-semibold text-gray-900">
                      {benefit.title}
                    </h3>
                  </div>
                  <p className="text-gray-700">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Ako začať */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              {t.howToTitle}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t.howToText}
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {guides.map((guide, index) => {
              const Icon = guide.icon;

              return (
                <motion.div
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
                  variants={fadeInUp}
                >
                  <div className="flex items-start space-x-4">
                    <Icon className="w-8 h-8 text-indigo-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {guide.title}
                      </h3>
                      <p className="text-gray-700">
                        {guide.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            className="text-center mt-12"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <Link href="/intro/lectio">
              <motion.button
                className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors duration-200 text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {t.startFirstStep}
                <ArrowRight className="w-6 h-6 ml-2" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Záver */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center bg-gradient-to-r from-indigo-600 to-purple-600 p-8 rounded-2xl text-white"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <BookOpen className="w-16 h-16 mx-auto mb-6 text-yellow-300" />
            <p className="text-xl mb-6 leading-relaxed italic">
              {t.closingQuote}
            </p>
            <p className="text-lg">
              {t.closingText}
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
