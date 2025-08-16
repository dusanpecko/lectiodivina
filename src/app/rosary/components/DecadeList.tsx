// src/app/rosary/components/DecadeList.tsx
// Zoznam desiatkov pre kategóriu

"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RosaryDecade, RosaryCategory } from '@/app/types/rosary';
import DecadeCard from './DecadeCard';
import { BookOpen, AlertCircle } from 'lucide-react';

interface DecadeListProps {
  decades: RosaryDecade[];
  category: RosaryCategory;
  loading?: boolean;
  className?: string;
}

export default function DecadeList({
  decades,
  category,
  loading = false,
  className = ''
}: DecadeListProps) {
  const router = useRouter();
  const [selectedDecade, setSelectedDecade] = useState<string | null>(null);

  const handleDecadeClick = (decade: RosaryDecade) => {
    setSelectedDecade(decade.id);
    // Malé oneskorenie pre animáciu
    setTimeout(() => {
      router.push(`/rosary/${category}/${decade.number}`);
    }, 150);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
              </div>
            </div>
            <div className="h-6 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-4"></div>
            <div className="flex items-center justify-between">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Prázdny stav
  if (decades.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Žiadne tajomstvá
          </h3>
          <p className="text-gray-600 mb-6">
            Pre túto kategóriu zatiaľ nie sú dostupné žiadne tajomstvá ruženec.
          </p>
          <button
            onClick={() => router.push('/rosary')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <BookOpen size={16} className="mr-2" />
            Späť na kategórie
          </button>
        </div>
      </div>
    );
  }

  // Zoradenie desiatkov podľa čísla
  const sortedDecades = [...decades].sort((a, b) => a.number - b.number);

  return (
    <div className={`space-y-6 ${className}`}>
      {sortedDecades.map((decade) => (
        <DecadeCard
          key={decade.id}
          decade={decade}
          onClick={() => handleDecadeClick(decade)}
          isActive={selectedDecade === decade.id}
          showAudioIndicator={true}
        />
      ))}
    </div>
  );
}