'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import BetaFeedbackModal from './BetaFeedbackModal';

interface BetaFloatingIconTranslations {
  title: string;
  message: string;
  feedback: string;
  close: string;
}

const translations: Record<string, BetaFloatingIconTranslations> = {
  sk: {
    title: 'Beta verzia',
    message: 'Táto webová aplikácia je v beta verzii. Môžete očakávať občasné chyby a zmeny. Ak narazíte na problém, neváhajte nás kontaktovať.',
    feedback: 'Nahlásiť chybu',
    close: 'Zatvoriť'
  },
  cz: {
    title: 'Beta verze',
    message: 'Tato webová aplikace je v beta verzi. Můžete očekávat občasné chyby a změny. Pokud narazíte na problém, neváhejte nás kontaktovat.',
    feedback: 'Nahlásit chybu',
    close: 'Zavřít'
  },
  en: {
    title: 'Beta Version',
    message: 'This web application is in beta version. You may experience occasional bugs and changes. If you encounter any issues, please don\'t hesitate to contact us.',
    feedback: 'Report bug',
    close: 'Close'
  },
  es: {
    title: 'Versión Beta',
    message: 'Esta aplicación web está en versión beta. Puede experimentar errores ocasionales y cambios. Si encuentra algún problema, no dude en contactarnos.',
    feedback: 'Reportar error',
    close: 'Cerrar'
  }
};

interface BetaFloatingIconProps {
  language: string;
}

export default function BetaFloatingIcon({ language }: BetaFloatingIconProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const t = translations[language] || translations.sk;

  const handleIconClick = () => {
    console.log('Beta icon clicked, opening popup');
    setIsPopupOpen(true);
  };

  const handleErrorReport = () => {
    setIsPopupOpen(false);
    setIsFeedbackOpen(true);
  };

  const handleFeedbackSubmit = async (data: { email?: string; message: string }) => {
    try {
      const response = await fetch('/api/test-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          message: data.message,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          language: language
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error submitting feedback:', result);
        throw new Error(result.error || 'Failed to submit feedback');
      }

      console.log('Feedback submitted successfully:', result);

    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  };

  return (
    <>
      {/* Floating Beta Icon - positioned at right center */}
      <button
        onClick={handleIconClick}
        className="fixed right-6 top-1/2 transform -translate-y-1/2 z-[999] w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center ring-2 ring-white ring-opacity-50 cursor-pointer"
        title={t.title}
      >
        <AlertTriangle className="w-8 h-8 text-white animate-pulse drop-shadow-sm" />
      </button>

      {/* Beta Information Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-semibold">{t.title}</h3>
              </div>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-gray-700 leading-relaxed">
                {t.message}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleErrorReport}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  {t.feedback}
                </button>
                <button
                  onClick={() => setIsPopupOpen(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Beta Feedback Modal */}
      <BetaFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  );
}