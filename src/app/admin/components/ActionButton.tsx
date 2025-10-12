"use client";

import { LucideIcon } from "lucide-react";
import { ButtonHTMLAttributes } from "react";

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Text tlačidla */
  children: React.ReactNode;
  /** Ikona (nepovinné) */
  icon?: LucideIcon;
  /** Veľkosť ikony */
  iconSize?: number;
  /** Variant tlačidla */
  variant?: "primary" | "success" | "danger" | "warning" | "info";
  /** Je tlačidlo loading? */
  loading?: boolean;
}

const variantStyles = {
  primary: "bg-gradient-to-r from-[#40467b] to-[#686ea3] hover:from-[#686ea3] hover:to-[#40467b]",
  success: "bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-600",
  danger: "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600",
  warning: "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600",
  info: "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600",
};

export default function ActionButton({
  children,
  icon: Icon,
  iconSize = 16,
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  ...props
}: ActionButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={`
        ${variantStyles[variant]}
        text-white px-4 py-2.5 rounded-lg
        transition-all duration-200
        shadow-sm hover:shadow-md
        flex items-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${!isDisabled && 'hover:-translate-y-0.5'}
        ${className}
      `}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon size={iconSize} />
      ) : null}
      {children}
    </button>
  );
}
