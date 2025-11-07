"use client";

import { CheckCircle, ShoppingCart, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  duration?: number;
  type?: 'success' | 'info' | 'error';
}

export default function Toast({ message, show, onClose, duration = 3000, type = 'success' }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to finish
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show && !isVisible) return null;

  const icons = {
    success: <CheckCircle className="w-6 h-6 text-green-600" />,
    info: <ShoppingCart className="w-6 h-6 text-blue-600" />,
    error: <X className="w-6 h-6 text-red-600" />,
  };

  const colors = {
    success: 'from-green-50 to-green-100 border-green-200',
    info: 'from-blue-50 to-blue-100 border-blue-200',
    error: 'from-red-50 to-red-100 border-red-200',
  };

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div
        className={`
          pointer-events-auto
          max-w-sm w-full
          bg-gradient-to-r ${colors[type]}
          border-2
          rounded-xl
          shadow-2xl
          p-4
          flex items-center gap-3
          transition-all duration-300 ease-out
          ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        `}
      >
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-800">
            {message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
