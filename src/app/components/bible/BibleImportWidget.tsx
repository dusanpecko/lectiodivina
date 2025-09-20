"use client";

import { useState } from "react";
import { BibleImportModal } from "./BibleImportModal";

interface BibleImportWidgetProps {
  onImport: (verses: string, reference: string, translationName: string) => void;
  currentLocaleId: number | null;
  buttonText?: string;
  buttonSize?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export function BibleImportWidget({
  onImport,
  currentLocaleId,
  buttonText = "Import z Biblie",
  buttonSize = "md",
  disabled = false,
  className = ""
}: BibleImportWidgetProps) {
  const [showModal, setShowModal] = useState(false);

  const handleImport = (verses: string, reference: string, translationName: string) => {
    onImport(verses, reference, translationName);
    setShowModal(false);
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        disabled={disabled || !currentLocaleId}
        className={`
          inline-flex items-center font-medium rounded-lg
          bg-green-600 text-white shadow-md
          hover:bg-green-700 
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeClasses[buttonSize]}
          ${className}
        `}
      >
        <span className="mr-2">📥</span>
        {buttonText}
      </button>

      <BibleImportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onImport={handleImport}
        currentLocaleId={currentLocaleId}
      />
    </>
  );
}