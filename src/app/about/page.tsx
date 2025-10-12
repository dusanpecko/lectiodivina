"use client";
import { motion } from "framer-motion";
import {
  BookOpen,
  Building2,
  ExternalLink,
  HandHeart,
  Heart,
  MessageCircle,
  Smartphone,
  Users
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "../components/LanguageProvider";
import { aboutTranslations } from "./i18n";

export default function AboutPage() {
  const { lang } = useLanguage();
  const t = aboutTranslations[lang];
  const [selectedMember, setSelectedMember] = useState<number | null>(null);

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

  const teamMembers = t.team.members.map((member, index) => ({
    id: index + 1,
    name: member.name,
    role: member.role,
    image: `/profile_${index + 1}.webp`,
    bio: member.bio
  }));

  return (
    <div className="relative">
      {/* Hero sekcia - O projekte Lectio Divina */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Pozadie obrázok */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/about-background.webp)',
          }}
        >
          {/* Tmavý overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Obsah */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="backdrop-blur-md rounded-3xl p-12 border"
            style={{
              backgroundColor: 'rgba(64, 70, 123, 0.75)',
              borderColor: 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t.title}
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-4xl mx-auto">
              {t.subtitle}
            </p>
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sekcia: Ako sa to všetko začalo - Text vľavo, obrázok vpravo */}
      <section 
        className="py-16 lg:py-24 relative"
        style={{ 
          background: 'linear-gradient(135deg, #40467b 0%, #5a6191 50%, #40467b 100%)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid lg:grid-cols-2 gap-12 items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            {/* Text vľavo */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <Heart className="w-8 h-8 text-red-200" />
                </div>
                <h2 className="text-3xl lg:text-5xl font-bold text-white">
                  {t.origin.title}
                </h2>
              </div>
              <p className="text-lg lg:text-xl text-white/90 leading-relaxed">
                {t.origin.text}
              </p>
            </div>

            {/* Obrázok vpravo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
                <Image 
                  src="/about-start.webp" 
                  alt="Ako sa to začalo"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sekcia: Naša vízia - Obrázok vľavo, text vpravo, biele pozadie */}
      <section 
        className="py-16 lg:py-24 relative bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid lg:grid-cols-2 gap-12 items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            {/* Obrázok vľavo */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative order-2 lg:order-1"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
                <Image 
                  src="/about-vision.webp" 
                  alt="Naša vízia"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
              </div>
            </motion.div>

            {/* Text vpravo */}
            <div className="space-y-6 order-1 lg:order-2">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}>
                  <Users className="w-8 h-8" style={{ color: '#40467b' }} />
                </div>
                <h2 className="text-3xl lg:text-5xl font-bold" style={{ color: '#40467b' }}>
                  {t.vision.title}
                </h2>
              </div>
              <p className="text-lg lg:text-xl text-gray-700 leading-relaxed">
                {t.vision.text}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Sekcia: Čo je to Lectio Divina - Hero štýl s pozadím */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Pozadie obrázok */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/hero-background.webp)',
          }}
        >
          {/* Tmavý overlay */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Obsah */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="backdrop-blur-md rounded-3xl p-12 border"
            style={{
              backgroundColor: 'rgba(64, 70, 123, 0.75)',
              borderColor: 'rgba(255, 255, 255, 0.2)'
            }}
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(168, 85, 247, 0.3)' }}>
                <BookOpen className="w-12 h-12 text-white" />
              </div>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
              {t.what_is.title}
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-white/95 leading-relaxed max-w-4xl mx-auto">
              {t.what_is.text}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sekcia: Osvedčený projekt s víziou do budúcnosti - Text vľavo, štatistiky vpravo */}
      <section 
        className="py-16 lg:py-24 relative"
        style={{ 
          backgroundColor: '#40467b'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid lg:grid-cols-2 gap-12 items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            {/* Text vľavo */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                  <Smartphone className="w-8 h-8 text-green-200" />
                </div>
                <h2 className="text-3xl lg:text-5xl font-bold text-white">
                  {t.proven_project.title}
                </h2>
              </div>
              <p className="text-lg lg:text-xl text-white/90 leading-relaxed">
                {t.proven_project.text}
              </p>
            </div>

            {/* Štatistiky vpravo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 gap-6"
            >
              <div className="text-center p-8 backdrop-blur-sm rounded-2xl border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                <div className="text-5xl font-bold text-white mb-3">{t.stats.downloads}</div>
                <div className="text-lg text-white/90">{t.stats.downloads_desc}</div>
              </div>
              <div className="text-center p-8 backdrop-blur-sm rounded-2xl border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                <div className="text-5xl font-bold text-white mb-3">{t.stats.feedback}</div>
                <div className="text-lg text-white/90">{t.stats.feedback_desc}</div>
              </div>
              <div className="text-center p-8 backdrop-blur-sm rounded-2xl border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', borderColor: 'rgba(255, 255, 255, 0.3)' }}>
                <div className="text-5xl font-bold text-white mb-3">{t.stats.fruits}</div>
                <div className="text-lg text-white/90">{t.stats.fruits_desc}</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Sekcia: Náš tím - Biele pozadie */}
      <section className="py-16 lg:py-24 relative bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Nadpis */}
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#40467b' }}>
              {t.team.title}
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t.team.description}
            </p>
          </div>

          {/* Tímové fotky - Grid */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12 items-stretch"
            style={{ gridAutoRows: 'minmax(auto, 1fr)' }}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                variants={fadeInUp}
                className="flex flex-col items-center h-full"
              >
                <div className="flex flex-col items-center flex-grow">
                  <div 
                    className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-2xl cursor-pointer"
                    style={{ 
                      background: `linear-gradient(135deg, ${index % 3 === 0 ? '#40467b' : index % 3 === 1 ? '#686ea3' : '#9ca3af'} 0%, rgba(255,255,255,0.2) 100%)`
                    }}
                    onClick={() => setSelectedMember(member.id)}
                  >
                    <Image 
                      src={member.image}
                      alt={member.name}
                      width={160}
                      height={160}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-center mb-6 flex-grow flex items-center" style={{ color: '#40467b', minHeight: '3rem' }}>
                    {member.role}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedMember(member.id)}
                  className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-all duration-200 hover:opacity-80 mt-auto"
                  style={{ backgroundColor: '#40467b' }}
                >
                  {t.team.show_bio}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Modal pre bio */}
      {selectedMember && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMember(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl max-w-2xl w-full p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const member = teamMembers.find(m => m.id === selectedMember);
              if (!member) return null;
              
              return (
                <>
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <span className="text-2xl text-gray-500">&times;</span>
                  </button>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 mb-6">
                      <Image 
                        src={member.image}
                        alt={member.name}
                        width={128}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <h3 className="text-3xl font-bold mb-2" style={{ color: '#40467b' }}>
                      {member.name}
                    </h3>
                    
                    <p className="text-lg mb-6" style={{ color: '#686ea3' }}>
                      {member.role}
                    </p>

                    <p className="text-gray-700 leading-relaxed mb-8 text-left">
                      {member.bio}
                    </p>

                    <a
                      href="https://myprofile.sk/lectio-divina"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-medium hover:underline"
                      style={{ color: '#40467b' }}
                    >
                      {t.team.contact_link}
                    </a>
                  </div>
                </>
              );
            })()}
          </motion.div>
        </div>
      )}

      {/* Záverečná CTA sekcia: Staňte sa súčasťou našej misie - Výrazný dizajn */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Pozadie gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #40467b 0%, #2d3154 50%, #40467b 100%)'
          }}
        >
          {/* Dekoratívne kruhy */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hlavný obsah */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {/* Ikona */}
            <div className="flex justify-center mb-8">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center shadow-2xl"
                style={{ 
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.1) 100%)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <Heart className="w-14 h-14 text-white" />
              </div>
            </div>

            {/* Nadpis */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {t.support.title}
            </h2>
            
            {/* Podnadpis */}
            <p className="text-2xl sm:text-3xl text-white/90 mb-8 font-semibold">
              {t.support.subtitle}
            </p>

            {/* Popis */}
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed mb-12">
              {t.support.intro}
            </p>

            {/* Poďakovanie */}
            <div 
              className="inline-block px-8 py-4 rounded-2xl mb-16"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.25)'
              }}
            >
              <p className="text-2xl font-bold text-white flex items-center gap-3">
                <BookOpen className="w-8 h-8" />
                {t.conclusion.thanks}
              </p>
            </div>
          </motion.div>

          {/* Spôsoby podpory - 3 hlavné karty */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {t.support.ways.slice(0, 3).map((way, index) => {
              const icons = [HandHeart, MessageCircle, Building2];
              const Icon = icons[index] || HandHeart;
              
              return (
                <motion.div 
                  key={index}
                  className="backdrop-blur-md rounded-2xl p-8 border transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    borderColor: 'rgba(255, 255, 255, 0.3)'
                  }}
                  variants={fadeInUp}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-bold text-white mb-4">
                      {way.title}
                    </h4>
                    <p className="text-white/90 mb-6 leading-relaxed">
                      {way.text}
                    </p>
                    {way.link && way.button && (
                      <a 
                        href={way.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-8 py-4 text-white font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-2xl hover:scale-105 border-2"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.15) 100%)',
                          borderColor: 'rgba(255, 255, 255, 0.4)'
                        }}
                      >
                        {way.button}
                        <ExternalLink className="w-5 h-5 ml-2" />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Záverečný citát */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center"
          >
            <div 
              className="inline-block px-12 py-8 rounded-3xl max-w-4xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              }}
            >
              <p className="text-2xl lg:text-3xl text-white leading-relaxed font-medium italic">
                &ldquo;{t.conclusion.text}&rdquo;
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}