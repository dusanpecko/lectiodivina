// src/app/rosary/components/CategoryCard.tsx
// Karta pre kategóriu ruženec

"use client";

import { useLanguage } from '@/app/components/LanguageProvider';
import { RosaryCategoryInfo } from '@/app/types/rosary';
import {
  BookOpen,
  ChevronRight,
  Play
} from 'lucide-react';
import { useState } from 'react';
import { rosaryTranslations } from '../translations';

interface CategoryCardProps {
  category: RosaryCategoryInfo;
  decadeCount: number;
  audioCount: number;
  onClick: () => void;
  isActive?: boolean;
  isLoading?: boolean;
}

export default function CategoryCard({
  category,
  decadeCount,
  audioCount,
  onClick,
  isActive = false,
  isLoading = false
}: CategoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { lang } = useLanguage();
  const t = rosaryTranslations[lang];

  return (
    <div
      className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer ${
        isActive ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'
      } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Background gradient */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          isHovered ? 'opacity-10' : 'opacity-5'
        }`}
        style={{ backgroundColor: category.color }}
      />
      
      {/* Hlavný obsah */}
      <div className="relative p-6">
        {/* Ikona */}
        <div 
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl mb-4 shadow-lg transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: category.color }}
        >
          {category.icon}
        </div>
        
        {/* Názov a popis */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
          {category.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {category.description}
        </p>
        
        {/* Štatistiky */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <BookOpen size={14} className="mr-1" />
            <span>{decadeCount} {t.mysteriesCount}</span>
          </div>
          {audioCount > 0 && (
            <div className="flex items-center">
              <Play size={14} className="mr-1" />
              <span>{audioCount} {t.withAudioCount}</span>
            </div>
          )}
        </div>
        
        {/* Spodná časť */}
        <div className="flex items-center justify-between">
          <span 
            className="text-sm font-medium transition-colors duration-300"
            style={{ color: category.color }}
          >
            {t.startPrayer}
          </span>
          <ChevronRight 
            size={20} 
            className={`transition-all duration-300 ${
              isHovered ? 'translate-x-1' : ''
            }`}
            style={{ color: category.color }}
          />
        </div>
      </div>
      
      {/* Loading overlay */}
      {isActive && isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}
      
      {/* Hover efekt */}
      <div 
        className={`absolute inset-0 border-2 border-transparent rounded-2xl transition-all duration-300 ${
          isHovered ? 'border-opacity-20' : 'border-opacity-0'
        }`}
        style={{ borderColor: category.color }}
      />
    </div>
  );
}