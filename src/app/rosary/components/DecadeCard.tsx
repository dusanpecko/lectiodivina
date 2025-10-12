// src/app/rosary/components/DecadeCard.tsx
// Karta pre jeden desiatka ruženec

"use client";

import { useLanguage } from '@/app/components/LanguageProvider';
import { getCategoryInfo, hasAudio, hasImage } from '@/app/lib/rosary-utils';
import { RosaryDecade } from '@/app/types/rosary';
import {
  ChevronRight,
  Image as ImageIcon,
  Volume2
} from 'lucide-react';
import { useState } from 'react';
import { rosaryTranslations } from '../translations';

interface DecadeCardProps {
  decade: RosaryDecade;
  onClick: () => void;
  isActive?: boolean;
  showAudioIndicator?: boolean;
  className?: string;
}

export default function DecadeCard({
  decade,
  onClick,
  isActive = false,
  showAudioIndicator = true,
  className = ''
}: DecadeCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const categoryInfo = getCategoryInfo(decade.category);
  const hasAudioContent = hasAudio(decade);
  const hasImageContent = hasImage(decade);
  const { lang } = useLanguage();
  const t = rosaryTranslations[lang];

  return (
    <div
      className={`group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer ${
        isActive ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'
      } ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Background gradient */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          isHovered ? 'opacity-5' : 'opacity-0'
        }`}
        style={{ backgroundColor: categoryInfo.color }}
      />
      
      {/* Hlavný obsah */}
      <div className="relative p-6">
        {/* Číslo desiatka */}
        <div className="flex items-center justify-between mb-4">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-md"
            style={{ backgroundColor: categoryInfo.color }}
          >
            {decade.number}
          </div>
          
          {/* Indikátory médií */}
          <div className="flex items-center space-x-2">
            {hasAudioContent && showAudioIndicator && (
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Volume2 size={14} className="text-blue-600" />
              </div>
            )}
            {hasImageContent && (
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <ImageIcon size={14} className="text-purple-600" />
              </div>
            )}
          </div>
        </div>
        
        {/* Názov */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors leading-tight">
          {decade.title}
        </h3>
        
        {/* Biblický text */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed">
            {decade.biblicky_text}
          </p>
        </div>
        
        {/* Krátky popis */}
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {decade.shortDescription}
        </p>
        
        {/* Spodná časť */}
        <div className="flex items-center justify-between">
          <span 
            className="text-sm font-medium transition-colors duration-300"
            style={{ color: categoryInfo.color }}
          >
            {t.startLectioDivina}
          </span>
          <ChevronRight 
            size={18} 
            className={`transition-all duration-300 ${
              isHovered ? 'translate-x-1' : ''
            }`}
            style={{ color: categoryInfo.color }}
          />
        </div>
      </div>
      
      {/* Hover border efekt */}
      <div 
        className={`absolute inset-0 border-2 border-transparent rounded-xl transition-all duration-300 ${
          isHovered ? 'border-opacity-20' : 'border-opacity-0'
        }`}
        style={{ borderColor: categoryInfo.color }}
      />
    </div>
  );
}