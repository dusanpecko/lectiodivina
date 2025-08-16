// src/app/rosary/components/CategoryGrid.tsx
// Grid zobrazenie kategórií ruženec

"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { RosaryCategory } from '@/app/types/rosary';
import { 
  ROSARY_CATEGORIES, 
  getCategoryInfo 
} from '@/app/lib/rosary-utils';
import CategoryCard from './CategoryCard';

interface CategoryStats {
  category: RosaryCategory;
  count: number;
  hasAudio: number;
}

interface CategoryGridProps {
  categoryStats: CategoryStats[];
  loading?: boolean;
  className?: string;
}

export default function CategoryGrid({
  categoryStats,
  loading = false,
  className = ''
}: CategoryGridProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<RosaryCategory | null>(null);

  const handleCategoryClick = (category: RosaryCategory) => {
    setSelectedCategory(category);
    // Malé oneskorenie pre animáciu
    setTimeout(() => {
      router.push(`/rosary/${category}`);
    }, 150);
  };

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {ROSARY_CATEGORIES.map((category) => {
        const categoryInfo = getCategoryInfo(category);
        const stats = categoryStats.find(s => s.category === category);
        const isSelected = selectedCategory === category;
        
        return (
          <CategoryCard
            key={category}
            category={categoryInfo}
            decadeCount={stats?.count || 0}
            audioCount={stats?.hasAudio || 0}
            onClick={() => handleCategoryClick(category)}
            isActive={isSelected}
            isLoading={loading}
          />
        );
      })}
    </div>
  );
}