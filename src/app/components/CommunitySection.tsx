"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@supabase/supabase-js";

// Supabase konfigurácia
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface CommunitySectionProps {
  translations: {
    community_section: {
      headline: string;
      subtitle: string;
      description: string;
      tester_title: string;
      tester_desc: string;
      newsletter_title: string;
      newsletter_desc: string;
      idea_title: string;
      idea_desc: string;
      form_name: string;
      form_email: string;
      form_message: string;
      form_interests: string;
      interest_tester: string;
      interest_newsletter: string;
      interest_idea: string;
      submit_btn: string;
      success_message: string;
      error_message: string;
      required_field: string;
    };
  };
}

type InterestType = 'tester' | 'newsletter' | 'idea';

interface FormData {
  name: string;
  email: string;
  message: string;
  interests: InterestType[];
}

export default function CommunitySection({ translations }: CommunitySectionProps) {
  const t = translations.community_section;
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
    interests: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInterestChange = (interest: InterestType) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || formData.interests.length === 0) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('community_members')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            message: formData.message || null,
            want_testing: formData.interests.includes('tester'),
            want_newsletter: formData.interests.includes('newsletter'),
            has_idea: formData.interests.includes('idea'),
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '', interests: [] });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-br from-amber-50 to-orange-100 relative overflow-hidden">
      {/* Medové pozadie s hexagónmi */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-600">
            <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" />
          </svg>
        </div>
        <div className="absolute top-32 right-20 w-16 h-16">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-600">
            <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" />
          </svg>
        </div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-600">
            <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" />
          </svg>
        </div>
        <div className="absolute bottom-40 right-1/3 w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-amber-600">
            <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" />
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-10">
        {/* Hlavička sekcie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#4a5085] mb-4">
            {t.headline}
          </h2>
          <div className="w-20 h-1 bg-amber-500 mx-auto mb-6 rounded-full" />
          <p className="text-lg sm:text-xl text-amber-800 mb-4 max-w-3xl mx-auto font-medium">
            {t.subtitle}
          </p>
          <p className="text-base sm:text-lg text-amber-700 max-w-4xl mx-auto">
            {t.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Karty možností */}
          <div className="space-y-8">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-amber-200"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#4a5085]">{t.tester_title}</h3>
              </div>
              <p className="text-gray-700">{t.tester_desc}</p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-amber-200"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#4a5085]">{t.newsletter_title}</h3>
              </div>
              <p className="text-gray-700">{t.newsletter_desc}</p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl border border-amber-200"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#4a5085]">{t.idea_title}</h3>
              </div>
              <p className="text-gray-700">{t.idea_desc}</p>
            </motion.div>
          </div>

          {/* Formulár */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-2xl border border-amber-200"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form_name} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form_email} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t.form_interests} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes('tester')}
                      onChange={() => handleInterestChange('tester')}
                      className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <span className="ml-3 text-gray-700">{t.interest_tester}</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes('newsletter')}
                      onChange={() => handleInterestChange('newsletter')}
                      className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <span className="ml-3 text-gray-700">{t.interest_newsletter}</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes('idea')}
                      onChange={() => handleInterestChange('idea')}
                      className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <span className="ml-3 text-gray-700">{t.interest_idea}</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form_message}
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition resize-none"
                  placeholder="Vaša správa alebo nápad..."
                />
              </div>

              {submitStatus === 'success' && (
                <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  {t.success_message}
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {t.error_message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-4 px-6 rounded-lg hover:from-amber-600 hover:to-orange-600 transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '...' : t.submit_btn}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}