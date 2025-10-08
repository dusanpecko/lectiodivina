//app/components/CommunitySection.tsx
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSupabase } from "./SupabaseProvider";

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
      loading_form: string;
      message_placeholder: string;
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
  const { supabase } = useSupabase();
  const t = translations.community_section;
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
    interests: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [mounted, setMounted] = useState(false);

  // HYDRATION SAFE: Mark as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

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
      // HYDRATION SAFE: new Date() only on client
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

  // HYDRATION SAFE: Show static version until mounted
  if (!mounted) {
    return (
      <section className="py-12 lg:py-16 relative overflow-hidden min-h-screen snap-start flex items-center w-full" style={{ backgroundColor: '#f8f9fa' }}>
        {/* Simplified background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-10 w-full">
          {/* Static header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#40467b' }}>
              {t.headline}
            </h2>
            <p className="text-lg text-gray-600 mb-3 max-w-3xl mx-auto">
              {t.subtitle}
            </p>
            <p className="text-base text-gray-600 max-w-3xl mx-auto">
              {t.description}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Static cards */}
            <div className="space-y-6">
              <div className="rounded-xl p-5 shadow-md"
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#40467b' }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#40467b' }}>{t.tester_title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{t.tester_desc}</p>
              </div>

              <div className="rounded-xl p-5 shadow-md"
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#40467b' }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#40467b' }}>{t.newsletter_title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{t.newsletter_desc}</p>
              </div>

              <div className="rounded-xl p-5 shadow-md"
                style={{
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#40467b' }}>
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#40467b' }}>{t.idea_title}</h3>
                </div>
                <p className="text-gray-600 text-sm">{t.idea_desc}</p>
              </div>
            </div>

            {/* Static form */}
            <div className="rounded-xl p-6 shadow-md"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="space-y-6">
                <div className="text-center text-gray-500">
                  {t.loading_form}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Full interactive version after mount
  return (
    <section className="py-12 lg:py-16 relative overflow-hidden min-h-screen snap-start flex items-center w-full" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Simplified background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-purple-200/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-10 w-full">
        {/* Compact header section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#40467b' }}>
            {t.headline}
          </h2>
          <p className="text-lg text-gray-600 mb-3 max-w-3xl mx-auto">
            {t.subtitle}
          </p>
          <p className="text-base text-gray-600 max-w-3xl mx-auto">
            {t.description}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Karty možností */}
          <div className="space-y-6">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="rounded-xl p-5 shadow-md"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#40467b' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#40467b' }}>{t.tester_title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{t.tester_desc}</p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="rounded-xl p-5 shadow-md"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#40467b' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#40467b' }}>{t.newsletter_title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{t.newsletter_desc}</p>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="rounded-xl p-5 shadow-md"
              style={{
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: '#40467b' }}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold" style={{ color: '#40467b' }}>{t.idea_title}</h3>
              </div>
              <p className="text-gray-600 text-sm">{t.idea_desc}</p>
            </motion.div>
          </div>

          {/* Formulár */}
          <motion.div
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-xl p-6 shadow-md"
            style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg transition text-sm"
                  style={{ outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = '#40467b'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg transition text-sm"
                  style={{ outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = '#40467b'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t.form_interests} <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes('tester')}
                      onChange={() => handleInterestChange('tester')}
                      className="w-4 h-4 border-gray-300 rounded"
                      style={{ accentColor: '#40467b' }}
                    />
                    <span className="ml-3 text-gray-700 text-sm">{t.interest_tester}</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes('newsletter')}
                      onChange={() => handleInterestChange('newsletter')}
                      className="w-4 h-4 border-gray-300 rounded"
                      style={{ accentColor: '#40467b' }}
                    />
                    <span className="ml-3 text-gray-700 text-sm">{t.interest_newsletter}</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.interests.includes('idea')}
                      onChange={() => handleInterestChange('idea')}
                      className="w-4 h-4 border-gray-300 rounded"
                      style={{ accentColor: '#40467b' }}
                    />
                    <span className="ml-3 text-gray-700 text-sm">{t.interest_idea}</span>
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
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg transition resize-none text-sm"
                  style={{ outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = '#40467b'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  placeholder={t.message_placeholder}
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
                className="w-full text-white font-bold py-3 px-6 rounded-lg transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#40467b' }}
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