"use client";
import { AlertCircle, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'warning' | 'danger' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Potvrdiť",
  cancelText = "Zrušiť",
  onConfirm,
  onCancel,
  type = 'warning'
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmBg: '#dc2626',
          confirmBgHover: '#b91c1c'
        };
      case 'warning':
        return {
          iconBg: 'bg-purple-100',
          iconColor: 'text-purple-600',
          confirmBg: '#40467b',
          confirmBgHover: '#686ea3'
        };
      case 'info':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmBg: '#2563eb',
          confirmBgHover: '#1d4ed8'
        };
    }
  };

  const colors = getColors();

  const dialogContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onCancel}
      />
      
      {/* Dialog */}
      <div 
        className="relative rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200 backdrop-blur-md border"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: 'rgba(64, 70, 123, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 hover:opacity-70 transition-opacity"
          style={{ color: '#40467b' }}
        >
          <X size={20} />
        </button>

        <div className="p-6">
          {/* Icon */}
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: 'rgba(64, 70, 123, 0.1)' }}
          >
            <AlertCircle size={24} style={{ color: '#40467b' }} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold mb-2" style={{ color: '#40467b' }}>
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-700 mb-6">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 border"
              style={{
                backgroundColor: 'rgba(64, 70, 123, 0.1)',
                borderColor: 'rgba(64, 70, 123, 0.2)',
                color: '#40467b'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(64, 70, 123, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(64, 70, 123, 0.1)';
              }}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 text-white rounded-lg font-medium transition-all duration-200 shadow-lg"
              style={{ backgroundColor: colors.confirmBg }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.confirmBgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.confirmBg;
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}
