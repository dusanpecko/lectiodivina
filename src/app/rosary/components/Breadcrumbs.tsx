// src/app/rosary/components/Breadcrumbs.tsx
// Navigačné breadcrumbs pre rosary

"use client";

import Link from 'next/link';
import { BreadcrumbItem } from '@/app/types/rosary';
import { Home, ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {/* Domov link */}
      <Link 
        href="/" 
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Home size={16} className="mr-1" />
        Domov
      </Link>
      
      {/* Breadcrumb items */}
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight size={16} className="text-gray-400 mx-2" />
          {item.isActive ? (
            <span className="text-blue-600 font-medium">
              {item.label}
            </span>
          ) : (
            <Link 
              href={item.href}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}