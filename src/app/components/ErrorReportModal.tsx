'use client';

import { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ErrorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  lectioId: number;
  lectioDate: string;
  stepKey: string;
  stepName: string;
  currentText: string;
  userId: string;
  userEmail: string;
  onSubmit: (data: ErrorReportData) => Promise<void>;
}

export interface ErrorReportData {
  lectio_id: number;
  lectio_date: string;
  step_key: string;
  step_name: string;
  original_text: string;
  corrected_text: string;
  error_severity: 'low' | 'medium' | 'high' | 'critical';
  additional_notes?: string;
  user_id: string;
  user_email: string;
}

export default function ErrorReportModal({
  isOpen,
  onClose,
  lectioId,
  lectioDate,
  stepKey,
  stepName,
  currentText,
  userId,
  userEmail,
  onSubmit
}: ErrorReportModalProps) {
  const [originalText, setOriginalText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!originalText.trim() || !correctedText.trim()) {
      setError('Prosím vyplňte pôvodný aj opravený text.');
      return;
    }

    if (originalText.trim() === correctedText.trim()) {
      setError('Pôvodný a opravený text nemôžu byť rovnaké.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        lectio_id: lectioId,
        lectio_date: lectioDate,
        step_key: stepKey,
        step_name: stepName,
        original_text: originalText,
        corrected_text: correctedText,
        error_severity: severity,
        additional_notes: notes || undefined,
        user_id: userId,
        user_email: userEmail
      });

      // Reset form
      setOriginalText('');
      setCorrectedText('');
      setSeverity('medium');
      setNotes('');
      onClose();
    } catch (err) {
      setError('Nepodarilo sa odoslať hlásenie. Skúste to prosím znova.');
      console.error('Error submitting report:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ paddingTop: '6rem' }}>
      <div 
        className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col"
        style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)', maxHeight: '70vh' }}
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: 'rgba(64, 70, 123, 0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#40467b' }}>
              <AlertCircle size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#40467b' }}>
                Nahlásiť chybu
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                {stepName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all hover:bg-gray-100"
            style={{ color: '#40467b' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {/* Original Text */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#40467b' }}>
                Pôvodný text (s chybou) *
              </label>
              <textarea
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                placeholder="Skopírujte časť textu, kde ste našli chybu..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 resize-none"
                style={{ 
                  borderColor: 'rgba(64, 70, 123, 0.2)',
                  backgroundColor: 'rgba(64, 70, 123, 0.03)'
                }}
                required
              />
            </div>

            {/* Corrected Text */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#40467b' }}>
                Opravený text *
              </label>
              <textarea
                value={correctedText}
                onChange={(e) => setCorrectedText(e.target.value)}
                placeholder="Napište správnu verziu textu..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 resize-none"
                style={{ 
                  borderColor: 'rgba(64, 70, 123, 0.2)',
                  backgroundColor: 'white'
                }}
                required
              />
            </div>

            {/* Severity */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#40467b' }}>
                Stupeň závažnosti *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { value: 'low', label: 'Malá chyba', desc: 'Preklep', color: '#10b981' },
                  { value: 'medium', label: 'Gramatika', desc: 'Gramatická chyba', color: '#f59e0b' },
                  { value: 'high', label: 'Význam', desc: 'Chyba vo význame', color: '#ef4444' },
                  { value: 'critical', label: 'Kritická', desc: 'Nesprávna informácia', color: '#dc2626' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setSeverity(option.value as any)}
                    className="p-3 rounded-lg border-2 transition-all text-left"
                    style={{
                      borderColor: severity === option.value ? option.color : 'rgba(64, 70, 123, 0.2)',
                      backgroundColor: severity === option.value ? `${option.color}15` : 'white'
                    }}
                  >
                    <div className="font-semibold text-sm" style={{ color: severity === option.value ? option.color : '#374151' }}>
                      {option.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {option.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#40467b' }}>
                Poznámky (nepovinné)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Doplňujúce informácie, kontext chyby..."
                rows={2}
                className="w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 resize-none"
                style={{ 
                  borderColor: 'rgba(64, 70, 123, 0.2)',
                  backgroundColor: 'white'
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#fee2e2' }}>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t" style={{ borderColor: 'rgba(64, 70, 123, 0.1)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-lg transition-all hover:opacity-80 font-medium"
              style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)', color: '#40467b' }}
              disabled={isSubmitting}
            >
              Zrušiť
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg transition-all hover:opacity-80 text-white font-medium shadow-md"
              style={{ backgroundColor: '#40467b' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Odeielam...' : 'Odoslať hlásenie'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
