"use client";

import { LucideIcon } from "lucide-react";
import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

interface BaseInputProps {
  /** Label textu */
  label: string;
  /** Ikona pre label */
  icon?: LucideIcon;
  /** Veľkosť ikony */
  iconSize?: number;
  /** Je povinné pole? */
  required?: boolean;
  /** Pomocný text pod inputom */
  helperText?: string;
  /** Error správa */
  error?: string;
  /** Počet znakov / max length */
  showCharCount?: boolean;
  /** Aktuálna dĺžka textu */
  currentLength?: number;
  /** Max dĺžka */
  maxLength?: number;
}

interface FormInputProps extends BaseInputProps, InputHTMLAttributes<HTMLInputElement> {
  /** Typ inputu */
  type?: "text" | "email" | "password" | "number" | "url" | "tel";
}

interface FormTextareaProps extends BaseInputProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Počet riadkov */
  rows?: number;
}

export function FormInput({
  label,
  icon: Icon,
  iconSize = 16,
  required = false,
  helperText,
  error,
  showCharCount = false,
  currentLength = 0,
  maxLength,
  className = "",
  ...props
}: FormInputProps) {
  const isOverLimit = maxLength && currentLength > maxLength * 0.9;

  return (
    <div className="space-y-2">
      <label className="admin-edit-label">
        {Icon && <Icon size={iconSize} style={{ color: 'var(--admin-edit-icon-color)' }} />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        {...props}
        maxLength={maxLength}
        className={`admin-edit-input ${className}`}
        style={
          {
            borderColor: error ? 'var(--admin-edit-error)' : undefined,
          } as React.CSSProperties
        }
      />
      
      {/* Helper text alebo error */}
      {(helperText || error) && (
        <p className={`text-xs ${error ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
      
      {/* Character count */}
      {showCharCount && maxLength && (
        <p className={`text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
          {currentLength}/{maxLength} znakov
        </p>
      )}
    </div>
  );
}

export function FormTextarea({
  label,
  icon: Icon,
  iconSize = 16,
  required = false,
  helperText,
  error,
  showCharCount = false,
  currentLength = 0,
  maxLength,
  rows = 4,
  className = "",
  ...props
}: FormTextareaProps) {
  const isOverLimit = maxLength && currentLength > maxLength * 0.9;

  return (
    <div className="space-y-2">
      <label className="admin-edit-label">
        {Icon && <Icon size={iconSize} style={{ color: 'var(--admin-edit-icon-color)' }} />}
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <textarea
        {...props}
        rows={rows}
        maxLength={maxLength}
        className={`admin-edit-input resize-y ${className}`}
        style={
          {
            borderColor: error ? 'var(--admin-edit-error)' : undefined,
            minHeight: '100px',
          } as React.CSSProperties
        }
      />
      
      {/* Helper text alebo error */}
      {(helperText || error) && (
        <p className={`text-xs ${error ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
      
      {/* Character count */}
      {showCharCount && maxLength && (
        <p className={`text-xs ${isOverLimit ? 'text-red-500 font-medium' : 'text-gray-500'}`}>
          {currentLength}/{maxLength} znakov
        </p>
      )}
    </div>
  );
}
