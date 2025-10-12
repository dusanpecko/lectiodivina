"use client";

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface FormSectionProps {
  /** Titulok sekcie */
  title: string;
  /** Ikona pre sekciu */
  icon: LucideIcon;
  /** Obsah sekcie */
  children: ReactNode;
  /** Veľkosť ikony (default: 24) */
  iconSize?: number;
  /** Dodatočné CSS triedy */
  className?: string;
}

export default function FormSection({
  title,
  icon: Icon,
  children,
  iconSize = 24,
  className = ""
}: FormSectionProps) {
  return (
    <div className={`admin-edit-section ${className}`}>
      <div className="admin-edit-section-title">
        <div className="admin-edit-icon-wrapper">
          <Icon size={iconSize} className="text-white" />
        </div>
        <h2>{title}</h2>
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
