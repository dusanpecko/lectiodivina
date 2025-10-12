// components/LectioGuideSection.tsx
"use client";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Brain, CheckCircle, Clock, Heart, Target, Users } from "lucide-react";

interface GuideStep {
  title: string;
  subtitle: string;
  description: string;
  duration: string;
}

interface ProcessedStep extends GuideStep {
  number: number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  href: string;
}

interface LectioGuideSectionProps {
  lectio_guide_section: {
    title: string;
    description: string;
    steps: GuideStep[];
    badge: string;
    subtitle: string;
    total_duration: string;
    steps_count: string;
    start_step: string;
    cta: {
      title: string;
      description: string;
      start_with_intro: string;
      go_to_lectio: string;
    };
  };
}

export default function LectioGuideSection({ t }: { t: LectioGuideSectionProps }) {
  const guideSection = t.lectio_guide_section;
  
  const steps = (guideSection.steps as GuideStep[]).map((step: GuideStep, index: number) => ({
    number: index + 1,
    title: step.title,
    subtitle: step.subtitle,
    description: step.description,
    icon: [BookOpen, Brain, Users, Heart, Target][index],
    color: ['from-blue-500 to-indigo-600', 'from-green-500 to-emerald-600', 'from-amber-500 to-orange-600', 'from-red-500 to-pink-600', 'from-purple-500 to-violet-600'][index],
    bgColor: ['bg-blue-50', 'bg-green-50', 'bg-amber-50', 'bg-red-50', 'bg-purple-50'][index],
    borderColor: ['border-blue-200', 'border-green-200', 'border-amber-200', 'border-red-200', 'border-purple-200'][index],
    textColor: ['text-blue-600', 'text-green-600', 'text-amber-600', 'text-red-600', 'text-purple-600'][index],
    duration: step.duration,
    href: ['/intro/lectio', '/intro/meditatio', '/intro/oratio', '/intro/contemplatio', '/intro/actio'][index]
  }));

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <section className="min-h-screen py-12 lg:py-16 relative overflow-hidden flex items-center justify-center snap-start" style={{ backgroundColor: '#686ea3' }}>
      <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          className="text-center mb-8"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div className="inline-flex items-center space-x-2 bg-white/90 font-bold text-sm px-4 py-2 rounded-full mb-4" style={{ color: '#40467b' }}>
            <BookOpen className="w-4 h-4" />
            <span>{guideSection.badge}</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            {guideSection.title}
          </h2>
          
          <p className="text-lg text-white/90 max-w-3xl mx-auto mb-4">
            {guideSection.subtitle}
          </p>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-white/80">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{guideSection.total_duration}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4" />
              <span>{guideSection.steps_count}</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {steps.map((step: ProcessedStep) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.number}
                variants={fadeInUp}
                className="group relative"
                whileHover={{
                  scale: 1.02,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
              >
                <a href={step.href} className="block">
                  <div 
                    className="relative rounded-2xl p-4 hover:shadow-xl transition-all duration-300 h-full"
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <div className="absolute -top-2 -left-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center text-xs font-bold" style={{ color: '#40467b' }}>
                      {step.number}
                    </div>
                    
                    <div 
                      className="w-10 h-10 rounded-xl p-2 mb-3 mx-auto group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
                    >
                      <Icon className="w-full h-full text-white" />
                    </div>
                    
                    <div className="text-center mb-2">
                      <h3 className="text-base font-bold text-white mb-1">
                        {step.title}
                      </h3>
                      <p className="text-xs font-medium text-white/80 mb-2">
                        {step.subtitle}
                      </p>
                      <div className="inline-flex items-center space-x-1 text-white/70 text-xs font-medium mb-2">
                        <Clock className="w-3 h-3" />
                        <span>{step.duration}</span>
                      </div>
                    </div>
                    
                    <p className="text-white/75 text-xs leading-relaxed mb-2">
                      {step.description}
                    </p>
                    
                    <div className="text-center">
                      <span className="inline-flex items-center text-white font-medium text-xs group-hover:text-white/90 transition-colors duration-300">
                        {guideSection.start_step}
                        <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                      </span>
                    </div>
                  </div>
                </a>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.div
          className="text-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <div 
            className="rounded-2xl p-6 shadow-lg"
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1.5px solid rgba(255, 255, 255, 0.35)'
            }}
          >
            <h3 className="text-xl font-bold mb-3 text-white">
              {guideSection.cta.title}
            </h3>
            <p className="text-white/80 mb-5 text-sm">
              {guideSection.cta.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="/intro"
                className="inline-flex items-center justify-center px-5 py-2.5 text-white font-bold rounded-xl hover:opacity-90 transition-all duration-200"
                style={{ backgroundColor: '#40467b' }}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                {guideSection.cta.start_with_intro}
              </a>
              <a
                href="/intro/lectio"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-white/90 font-bold rounded-xl border-2 border-white/50 hover:bg-white transition-colors duration-200"
                style={{ color: '#40467b' }}
              >
                {guideSection.cta.go_to_lectio}
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
