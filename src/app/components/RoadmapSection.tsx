"use client";
import { motion, useInView } from "framer-motion";
import { Globe2, Languages, Rocket, Sparkles } from "lucide-react";
import { useRef } from "react";
import { useLanguage } from "./LanguageProvider";
import { roadmapTranslations } from "./roadmapTranslations";

interface Milestone {
  date: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export default function RoadmapSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { lang } = useLanguage();
  const t = roadmapTranslations[lang];

  // Roadmap milestones
  const milestones: Milestone[] = [
    {
      date: t.milestones.start.date,
      title: t.milestones.start.title,
      description: t.milestones.start.description,
      icon: <Rocket className="w-6 h-6" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      date: t.milestones.branding.date,
      title: t.milestones.branding.title,
      description: t.milestones.branding.description,
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-purple-500 to-pink-500",
    },
    {
      date: t.milestones.website.date,
      title: t.milestones.website.title,
      description: t.milestones.website.description,
      icon: <Globe2 className="w-6 h-6" />,
      color: "from-amber-500 to-orange-500",
    },
    {
      date: t.milestones.flutter.date,
      title: t.milestones.flutter.title,
      description: t.milestones.flutter.description,
      icon: <Sparkles className="w-6 h-6" />,
      color: "from-green-500 to-emerald-500",
    },
    {
      date: t.milestones.expansion.date,
      title: t.milestones.expansion.title,
      description: t.milestones.expansion.description,
      icon: <Languages className="w-6 h-6" />,
      color: "from-teal-500 to-cyan-500",
    },
    {
      date: t.milestones.portuguese.date,
      title: t.milestones.portuguese.title,
      description: t.milestones.portuguese.description,
      icon: <Globe2 className="w-6 h-6" />,
      color: "from-rose-500 to-red-500",
    },
  ];

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center overflow-hidden py-12 lg:py-0" style={{ backgroundColor: '#686ea3' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-32 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 -right-32 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div ref={ref} className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 pt-12 sm:pt-16"
        >
          <span className="inline-block px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 text-white rounded-full text-xs sm:text-sm font-semibold mb-3 sm:mb-4">
            {t.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3">
            {t.title}
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-white/95 max-w-2xl mx-auto mb-2 sm:mb-3 font-semibold">
            {t.subtitle}
          </p>
          <p className="text-sm sm:text-base text-white/85 max-w-3xl mx-auto px-4">
            {t.description}
          </p>
        </motion.div>

        {/* Timeline container */}
        <div className="relative">
          {/* SVG Wave Line - hidden on mobile */}
          <svg
            className="hidden lg:block absolute top-1/2 left-0 w-full h-32 -translate-y-1/2 pointer-events-none z-0"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="25%" stopColor="#a855f7" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="75%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <motion.path
              d="M0,60 Q100,20 200,60 T400,60 T600,60 T800,60 T1000,60 T1200,60"
              stroke="url(#waveGradient)"
              strokeWidth="3"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isInView ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 2, ease: "easeInOut" }}
            />
          </svg>

          {/* Milestones */}
          <div className="flex flex-col lg:flex-row lg:items-stretch lg:justify-between space-y-8 lg:space-y-0 lg:space-x-4 px-4 lg:px-0 relative z-10">
            {milestones.map((milestone, index) => {
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 0 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="flex flex-col w-full lg:w-auto lg:flex-1 items-center group"
                  whileHover={{ 
                    scale: 1.05, 
                    y: -10,
                    transition: { 
                      duration: 0.3,
                      ease: "easeOut"
                    } 
                  }}
                >
                  {/* Content Card - glassmorphism style */}
                  <div
                    className="relative rounded-2xl p-4 sm:p-6 transition-all duration-300 w-full flex flex-col h-full group-hover:shadow-2xl"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      transition: 'all 0.3s ease-out'
                    }}
                  >
                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Date badge - outside content wrapper */}
                    <div className="absolute -top-2 -right-2 px-3 py-1 bg-white/90 rounded-full text-xs font-bold shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300 z-20" style={{ color: '#686ea3' }}>
                      {milestone.date}
                    </div>
                    
                    {/* Content wrapper with relative positioning */}
                    <div className="relative z-10">
                    {/* Icon with glow effect */}
                    <div 
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${milestone.color} flex items-center justify-center text-white mx-auto mb-3 group-hover:scale-125 group-hover:rotate-6 transition-all duration-300 group-hover:shadow-2xl relative`}
                    >
                      {/* Glow effect on hover */}
                      <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${milestone.color} opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300`}></div>
                      <div className="relative z-10">
                        {milestone.icon}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm sm:text-base font-bold text-white text-center mb-2 group-hover:scale-105 transition-transform duration-300">
                      {milestone.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs text-white/80 group-hover:text-white transition-colors duration-300 text-center leading-relaxed flex-grow">
                      {milestone.description}
                    </p>
                    </div>
                  </div>

                  {/* Dot on timeline - hidden on mobile */}
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.2 + 0.8 }}
                    viewport={{ once: true }}
                    className={`hidden lg:block w-5 h-5 rounded-full bg-gradient-to-br ${milestone.color} border-4 border-white shadow-lg mt-6`}
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
