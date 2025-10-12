"use client";

import { ArrowLeft, LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface EditPageHeaderProps {
  /** Titulok stránky */
  title: string;
  /** Popis/podnadpis */
  description?: string;
  /** Ikona pre hlavičku */
  icon: LucideIcon;
  /** URL pre návrat späť */
  backUrl: string;
  /** Emoji ikona (nepovinné) */
  emoji?: string;
  /** Má neuložené zmeny? */
  hasUnsavedChanges?: boolean;
  /** Je dostupný draft? */
  isDraftAvailable?: boolean;
  /** Texty pre indikátory */
  unsavedText?: string;
  draftText?: string;
  /** Dodatočný obsah v headeri */
  children?: ReactNode;
}

export default function EditPageHeader({
  title,
  description,
  icon: Icon,
  backUrl,
  emoji,
  hasUnsavedChanges = false,
  isDraftAvailable = false,
  unsavedText = "Neuložené zmeny",
  draftText = "Draft načítaný",
  children
}: EditPageHeaderProps) {
  const router = useRouter();

  const handleBackClick = () => {
    router.push(backUrl);
  };

  return (
    <div className="admin-edit-gradient-header">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Back button */}
          <button
            onClick={handleBackClick}
            className="p-3 bg-white/10 backdrop-blur-sm text-white rounded-xl transition-all duration-200 hover:scale-105 hover:bg-white/20"
            type="button"
          >
            <ArrowLeft size={20} />
          </button>
          
          {/* Icon wrapper */}
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-white/10 backdrop-blur-sm">
            <Icon size={24} className="text-white" />
          </div>
          
          {/* Title and description */}
          <div>
            <h1 className="text-3xl font-bold text-white">
              {title}
            </h1>
            {description && (
              <p className="text-white/90 mt-1">
                {description}
              </p>
            )}
            
            {/* Status indicators */}
            {(hasUnsavedChanges || isDraftAvailable) && (
              <div className="flex items-center space-x-4 text-sm mt-2">
                {hasUnsavedChanges && (
                  <div className="flex items-center space-x-1 text-orange-300">
                    <span>●</span>
                    <span>{unsavedText}</span>
                  </div>
                )}
                {isDraftAvailable && (
                  <div className="flex items-center space-x-1 text-blue-300">
                    <span>📝</span>
                    <span>{draftText}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Emoji na pravej strane */}
        {emoji && (
          <div className="text-4xl opacity-80">
            {emoji}
          </div>
        )}
      </div>
      
      {/* Dodatočný obsah */}
      {children}
    </div>
  );
}
