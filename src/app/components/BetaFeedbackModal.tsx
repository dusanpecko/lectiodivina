'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from './LanguageProvider';

interface BetaFeedbackModalTranslations {
  title: string;
  email_label: string;
  email_placeholder: string;
  message_label: string;
  message_placeholder: string;
  submit: string;
  cancel: string;
  submitting: string;
  success: string;
  error: string;
  required_message: string;
}

const translations: Record<string, BetaFeedbackModalTranslations> = {
  sk: {
    title: 'Nahlásiť chybu alebo feedback',
    email_label: 'Email (voliteľné)',
    email_placeholder: 'vasmail@example.com',
    message_label: 'Opíšte problém alebo váš feedback',
    message_placeholder: 'Popíšte prosím, čo sa stalo alebo čo by ste chceli zlepšiť...',
    submit: 'Odoslať',
    cancel: 'Zrušiť',
    submitting: 'Odosiela sa...',
    success: 'Ďakujeme za váš feedback!',
    error: 'Nastala chyba pri odosielaní. Skúste to znova.',
    required_message: 'Správa je povinná'
  },
  cz: {
    title: 'Nahlásit chybu nebo feedback',
    email_label: 'Email (volitelné)',
    email_placeholder: 'vasmail@example.com',
    message_label: 'Popište problém nebo váš feedback',
    message_placeholder: 'Popište prosím, co se stalo nebo co byste chtěli zlepšit...',
    submit: 'Odeslat',
    cancel: 'Zrušit',
    submitting: 'Odesílá se...',
    success: 'Děkujeme za váš feedback!',
    error: 'Nastala chyba při odesílání. Zkuste to znovu.',
    required_message: 'Zpráva je povinná'
  },
  en: {
    title: 'Report bug or feedback',
    email_label: 'Email (optional)',
    email_placeholder: 'yourmail@example.com',
    message_label: 'Describe the problem or your feedback',
    message_placeholder: 'Please describe what happened or what you would like to improve...',
    submit: 'Submit',
    cancel: 'Cancel',
    submitting: 'Submitting...',
    success: 'Thank you for your feedback!',
    error: 'An error occurred while submitting. Please try again.',
    required_message: 'Message is required'
  },
  es: {
    title: 'Reportar error o feedback',
    email_label: 'Email (opcional)',
    email_placeholder: 'sumail@example.com',
    message_label: 'Describe el problema o tu feedback',
    message_placeholder: 'Por favor describe qué pasó o qué te gustaría mejorar...',
    submit: 'Enviar',
    cancel: 'Cancelar',
    submitting: 'Enviando...',
    success: '¡Gracias por tu feedback!',
    error: 'Ocurrió un error al enviar. Inténtalo de nuevo.',
    required_message: 'El mensaje es requerido'
  }
};

interface BetaFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email?: string; message: string }) => Promise<void>;
}

export default function BetaFeedbackModal({ isOpen, onClose, onSubmit }: BetaFeedbackModalProps) {
  const { lang } = useLanguage();
  const t = translations[lang] || translations.sk;
  
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await onSubmit({
        email: email.trim() || undefined,
        message: message.trim()
      });
      
      setSubmitStatus('success');
      setEmail('');
      setMessage('');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSubmitStatus('idle');
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{t.title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t.email_label}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.email_placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              disabled={isSubmitting}
            />
          </div>

          {/* Message Field */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              {t.message_label} *
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t.message_placeholder}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              disabled={isSubmitting}
              required
            />
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="text-green-600 text-sm font-medium">
              {t.success}
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="text-red-600 text-sm font-medium">
              {!message.trim() ? t.required_message : t.error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              {isSubmitting ? t.submitting : t.submit}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}