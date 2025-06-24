"use client";

import { useState } from "react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { contactTranslations } from "./translations";
import Link from "next/link";

// Icons
const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const HeadphonesIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0v2a1 1 0 01-1 1h-8a1 1 0 01-1-1V4m0 0H5a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0v4a2 2 0 002 2h6a2 2 0 002-2v-4m0 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const ChevronDownIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg 
    className={`w-5 h-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  privacyConsent: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  message?: string;
  privacyConsent?: string;
}

export default function ContactPage() {
  const { lang } = useLanguage();
  const t = contactTranslations[lang] || contactTranslations.sk;
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
    privacyConsent: false
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = t.form.required;
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = t.form.required;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t.form.required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.form.invalidEmail;
    }
    
    if (!formData.message.trim()) {
      newErrors.message = t.form.required;
    }
    
    if (!formData.privacyConsent) {
      newErrors.privacyConsent = t.form.required;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // TODO: Implement reCAPTCHA verification
      // const recaptchaToken = await executeRecaptcha('contact_form');
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // recaptchaToken,
          language: lang,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }),
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          message: '',
          privacyConsent: false
        });
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Sample supporters data - replace with your actual supporters
  const supporters = [
    { name: "Žilinská diecéza", logo: "/logos/partner1.webp", url: "https://dcza.sk/" },
    { name: "Slovenská biblická spoločnosť", logo: "/logos/partner2.webp", url: "https://biblia.sk/" },
    { name: "SysTech Group s.r.o.", logo: "/logos/partner3.webp", url: "https://systechgroup.eu/sk/" },
    { name: "FORK", logo: "/logos/partner4.webp", url: "https://www.fork.sk/" },
    { name: "KROK – Pastoračný fond Žilinskej diecézy", logo: "/logos/partner5.webp", url: "https://mojkrok.sk" },
    { name: "Vydavateľstvo Dobrá kniha", logo: "/logos/partner6.webp", url: "https://www.dobrakniha.sk/" },
    { name: "SSV", logo: "/logos/partner7.webp", url: "https://www.ssv.sk/" },
    { name: "4IGV", logo: "/logos/partner8.webp", url: "https://www.4igv.cz/ttps://partner8.com" },
    { name: "Inštitút Communio", logo: "/logos/partner9.webp", url: "https://icommunio.sk/" },
    { name: "MYPROFILE", logo: "/logos/partner10.webp", url: "https://mypro.one/" },
    { name: "Časopis Naša Žilinská diecéza", logo: "/logos/partner11.webp", url: "https://www.nasadieceza.sk/" },
    { name: "Zachej", logo: "/logos/partner12.webp", url: "https://www.zachej.sk/" },
    { name: "Kongregácia Sestier Panny Márie Útechy", logo: "/logos/partner13.webp", url: "https://consolation.sk/" },
    { name: "Miesto pre vás", logo: "/logos/placeholder.svg", url: "mailto:mojkrok@dcza.sk" },
    { name: "Miesto pre vás", logo: "/logos/placeholder.svg", url: "mailto:mojkrok@dcza.sk" },
    { name: "Miesto pre vás", logo: "/logos/placeholder.svg", url: "mailto:mojkrok@dcza.sk" },
    { name: "Miesto pre vás", logo: "/logos/placeholder.svg", url: "mailto:mojkrok@dcza.sk" },
    { name: "Miesto pre vás", logo: "/logos/placeholder.svg", url: "mailto:mojkrok@dcza.sk" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.header.title}</h1>
          <p className="text-xl text-blue-600 mb-4">{t.header.subtitle}</p>
          <p className="text-gray-600 max-w-3xl mx-auto">{t.header.description}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Contact Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Organization Info */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t.organization.title}</h2>
            <p className="text-gray-600 text-sm mb-4">{t.organization.mission}</p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold text-blue-900">{t.organization.project}</p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t.contact.title}</h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <LocationIcon />
                <div>
                  <p className="font-medium text-gray-900">{t.contact.address}</p>
                  <p className="text-sm text-gray-600">
                    KROK – Pastoračný fond Žilinskej diecézy<br/>
                    Lectio divina<br/>
                    Jána Kalinčiaka 1,<br/>
                    010 01 Žilina
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <PhoneIcon />
                <div>
                  <p className="font-medium text-gray-900">{t.contact.phone}</p>
                  <a href="tel:+421903982982" className="text-blue-600 hover:text-blue-800">
                    +421 903 982 982
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MailIcon />
                <div>
                  <p className="font-medium text-gray-900">{t.contact.email}</p>
                  <a href="mailto:mojkrok@dcza.sk" className="text-blue-600 hover:text-blue-800">
                    mojkrok@dcza.sk
                  </a>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{t.contact.ico}</p>
                  <p className="text-gray-600">52 60 18 97</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{t.contact.dic}</p>
                  <p className="text-gray-600">21 21 13 90 42</p>
                </div>
              </div>
              <div className="mt-2">
                <p className="font-medium text-gray-900">{t.contact.iban}</p>
                <p className="text-gray-600 break-all">SK04 8330 0000 0029 0168 8673</p>
              </div>
            </div>
          </div>

          {/* Quick Contact Options */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t.quickContact.title}</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
                <HeadphonesIcon />
                <div>
                  <p className="font-medium text-blue-900">{t.quickContact.technical.title}</p>
                  <p className="text-sm text-blue-700">{t.quickContact.technical.description}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors">
                <HeartIcon />
                <div>
                  <p className="font-medium text-purple-900">{t.quickContact.spiritual.title}</p>
                  <p className="text-sm text-purple-700">{t.quickContact.spiritual.description}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
                <UsersIcon />
                <div>
                  <p className="font-medium text-green-900">{t.quickContact.partnership.title}</p>
                  <p className="text-sm text-green-700">{t.quickContact.partnership.description}</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                <ChatIcon />
                <div>
                  <p className="font-medium text-orange-900">{t.quickContact.feedback.title}</p>
                  <p className="text-sm text-orange-700">{t.quickContact.feedback.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social & Apps */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{t.social.title}</h3>
            <div className="flex space-x-4 mb-6">
              <a 
                href="https://www.facebook.com/SKLectioDivina"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Facebook</span>
              </a>
              
              <a 
                href="https://www.instagram.com/sklectiodivina/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.621 5.367 11.988 11.988 11.988s11.987-5.367 11.987-11.988C24.014 5.367 18.648.001 12.017.001zM8.449 16.988c-2.458 0-4.467-2.01-4.467-4.468s2.009-4.467 4.467-4.467c2.459 0 4.468 2.009 4.468 4.467s-2.009 4.468-4.468 4.468zm7.519 0c-2.458 0-4.467-2.01-4.467-4.468s2.009-4.467 4.467-4.467c2.459 0 4.468 2.009 4.468 4.467s-2.009 4.468-4.468 4.468z"/>
                </svg>
                <span>Instagram</span>
              </a>
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-3">{t.apps.title}</h4>
            <div className="space-y-3">
              <a 
                href="https://apps.apple.com/sk/app/lectio-divina/id6443882687"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 bg-black text-white px-4 py-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div>
                  <div className="text-xs">Download on the</div>
                  <div className="text-sm font-semibold">App Store</div>
                </div>
              </a>
              
              <a 
                href="https://play.google.com/store/apps/details?id=sk.dpapp.app.android604688a88a394"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                <div>
                  <div className="text-xs">Get it on</div>
                  <div className="text-sm font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column - Contact Form & FAQ */}
        <div className="lg:col-span-2 space-y-8">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.form.title}</h2>
              <p className="text-gray-600">{t.form.subtitle}</p>
            </div>

            {submitStatus !== 'idle' && (
              <div className={`mb-6 p-4 rounded-lg ${
                submitStatus === 'success' 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <p className={submitStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {submitStatus === 'success' ? t.form.success : t.form.error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.form.firstName} *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.firstName 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-300 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                    placeholder={t.form.firstName}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.form.lastName} *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border ${
                      errors.lastName 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-300 focus:border-blue-500'
                    } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                    placeholder={t.form.lastName}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.email} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.email 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-200`}
                  placeholder={t.form.email}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.form.message} *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={6}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    errors.message 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-300 focus:border-blue-500'
                  } focus:outline-none focus:ring-2 focus:ring-blue-200 resize-vertical`}
                  placeholder={t.form.message}
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                )}
              </div>
              
              <div>
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={formData.privacyConsent}
                    onChange={(e) => handleInputChange('privacyConsent', e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {t.form.privacyConsent}{' '}
                    <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-800 underline">
                      {t.form.privacyLink}
                    </Link>
                    *
                  </span>
                </label>
                {errors.privacyConsent && (
                  <p className="mt-1 text-sm text-red-600">{errors.privacyConsent}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? t.form.submitting : t.form.submit}
              </button>
            </form>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.faq.title}</h2>
            
            <div className="space-y-4">
              {t.faq.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900">{item.question}</h3>
                    <ChevronDownIcon isOpen={expandedFaq === index} />
                  </button>
                  
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedFaq === index 
                        ? 'max-h-96 opacity-100' 
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-6 pb-4 text-gray-700">
                      <p>{item.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Supporters Section */}
      <div className="mt-12">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.supporters.title}</h2>
            <p className="text-gray-600">{t.supporters.subtitle}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {supporters.map((supporter, index) => (
              <a
                key={index}
                href={supporter.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors group border border-gray-200 hover:shadow-md"
              >
                <div className="w-full h-16 flex items-center justify-center relative">
                  <img 
                    src={supporter.logo} 
                    alt={supporter.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      // Fallback ak sa obrázok nenačíta
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div 
                    className="hidden w-full h-full bg-gray-200 rounded items-center justify-center absolute inset-0"
                    style={{display: 'none'}}
                  >
                    <span className="text-xs text-gray-500">{supporter.name}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}