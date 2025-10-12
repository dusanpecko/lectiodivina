// src/app/components/programs/CategoryFilter.tsx
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Check, Star, Moon, Heart, BookOpen, Users } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  count?: number; // Počet programov v kategórii
}

interface AllCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  count?: number;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categorySlug: string) => void;
  showCounts?: boolean;
  variant?: 'pills' | 'dropdown' | 'grid' | 'sidebar';
  size?: 'sm' | 'md' | 'lg';
  showAllOption?: boolean;
  allOptionLabel?: string;
  className?: string;
  loading?: boolean;
}

const CATEGORY_ICONS = {
  'featured': Star,
  'sleep_stories': Moon,
  'meditation': Heart,
  'prayer': Users,
  'bible_study': BookOpen
} as const;

const CATEGORY_COLORS = {
  'featured': {
    bg: 'bg-yellow-100 hover:bg-yellow-200',
    text: 'text-yellow-700',
    active: 'bg-yellow-500 text-white',
    border: 'border-yellow-300'
  },
  'sleep_stories': {
    bg: 'bg-indigo-100 hover:bg-indigo-200',
    text: 'text-indigo-700',
    active: 'bg-indigo-500 text-white',
    border: 'border-indigo-300'
  },
  'meditation': {
    bg: 'bg-green-100 hover:bg-green-200',
    text: 'text-green-700',
    active: 'bg-green-500 text-white',
    border: 'border-green-300'
  },
  'prayer': {
    bg: 'bg-blue-100 hover:bg-blue-200',
    text: 'text-blue-700',
    active: 'bg-blue-500 text-white',
    border: 'border-blue-300'
  },
  'bible_study': {
    bg: 'bg-purple-100 hover:bg-purple-200',
    text: 'text-purple-700',
    active: 'bg-purple-500 text-white',
    border: 'border-purple-300'
  }
} as const;

// Loading skeleton
const CategoryFilterSkeleton = ({ variant }: { variant: string }) => {
  if (variant === 'dropdown') {
    return <div className="h-10 w-48 bg-gray-200 rounded-lg animate-pulse"></div>;
  }
  
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-10 w-32 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
      ))}
    </div>
  );
};

export default function CategoryFilter({
  categories,
  selectedCategory,
  onCategoryChange,
  showCounts = false,
  variant = 'pills',
  size = 'md',
  showAllOption = true,
  allOptionLabel = "Všetky programy",
  className = "",
  loading = false
}: CategoryFilterProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-dropdown]')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isDropdownOpen]);

  // Size variants
  const sizeClasses = {
    sm: 'px-3 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  } as const;

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20
  } as const;

  // Get category config
  const getCategoryConfig = (categorySlug: string) => {
    return CATEGORY_COLORS[categorySlug as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.featured;
  };

  const getCategoryIcon = (categorySlug: string) => {
    const IconComponent = CATEGORY_ICONS[categorySlug as keyof typeof CATEGORY_ICONS] || BookOpen;
    return IconComponent;
  };

  // Get selected category info
  const selectedCategoryInfo = categories.find(cat => cat.slug === selectedCategory);
  
  const allCategories: AllCategory[] = showAllOption 
    ? [{ 
        id: 'all', 
        name: allOptionLabel, 
        slug: 'all', 
        description: '', 
        color: '', 
        icon: '', 
        display_order: 0, 
        is_active: true,
        count: undefined
      }]
    : [];
  
  const allOptions = [...allCategories, ...categories.filter(cat => cat.is_active)];

  if (loading) {
    return <CategoryFilterSkeleton variant={variant} />;
  }

  // Pills variant (horizontal scrollable)
  if (variant === 'pills') {
    return (
      <div className={`flex gap-3 overflow-x-auto pb-2 ${className}`}>
        {allOptions.map((category) => {
          const isSelected = selectedCategory === category.slug;
          const config = getCategoryConfig(category.slug);
          const IconComponent = getCategoryIcon(category.slug);
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.slug)}
              className={`${sizeClasses[size]} rounded-full font-medium transition-all whitespace-nowrap flex items-center gap-2 flex-shrink-0 ${
                isSelected
                  ? config.active
                  : `${config.bg} ${config.text} hover:shadow-md`
              }`}
            >
              {category.slug !== 'all' && (
                <IconComponent size={iconSizes[size]} />
              )}
              {category.name}
              {showCounts && category.count !== undefined && (
                <span className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${
                  isSelected ? 'bg-white/20' : 'bg-white/70 text-gray-600'
                }`}>
                  {category.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`} data-dropdown>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`${sizeClasses[size]} border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors flex items-center justify-between gap-3 min-w-48`}
        >
          <div className="flex items-center gap-2">
            {selectedCategoryInfo && selectedCategory !== 'all' && (
              <span className={getCategoryConfig(selectedCategory).text}>
                {React.createElement(getCategoryIcon(selectedCategory), { size: iconSizes[size] })}
              </span>
            )}
            <span className="font-medium">
              {selectedCategoryInfo?.name || allOptionLabel}
            </span>
            {showCounts && selectedCategoryInfo?.count !== undefined && (
              <span className="text-gray-500">({selectedCategoryInfo.count})</span>
            )}
          </div>
          {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {isDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
            {allOptions.map((category) => {
              const isSelected = selectedCategory === category.slug;
              const config = getCategoryConfig(category.slug);
              const IconComponent = getCategoryIcon(category.slug);
              
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    onCategoryChange(category.slug);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {category.slug !== 'all' && (
                      <span className={config.text}>
                        <IconComponent size={iconSizes[size]} />
                      </span>
                    )}
                    <div>
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-gray-500">{category.description}</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {showCounts && category.count !== undefined && (
                      <span className="text-sm text-gray-500">({category.count})</span>
                    )}
                    {isSelected && <Check size={16} className="text-blue-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Grid variant
  if (variant === 'grid') {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {allOptions.map((category) => {
          const isSelected = selectedCategory === category.slug;
          const config = getCategoryConfig(category.slug);
          const IconComponent = getCategoryIcon(category.slug);
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.slug)}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                isSelected
                  ? `${config.active} border-current shadow-lg`
                  : `${config.bg} ${config.text} ${config.border} hover:shadow-md`
              }`}
            >
              {category.slug !== 'all' && (
                <div className="mb-2">
                  <IconComponent size={24} className="mx-auto" />
                </div>
              )}
              <div className="font-semibold">{category.name}</div>
              {category.description && (
                <div className={`text-sm mt-1 ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
                  {category.description}
                </div>
              )}
              {showCounts && category.count !== undefined && (
                <div className={`text-sm mt-2 ${isSelected ? 'text-white/90' : 'text-gray-500'}`}>
                  {category.count} programov
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Sidebar variant
  if (variant === 'sidebar') {
    return (
      <div className={`space-y-2 ${className}`}>
        <h3 className="font-semibold text-gray-900 mb-3">Kategórie</h3>
        {allOptions.map((category) => {
          const isSelected = selectedCategory === category.slug;
          const config = getCategoryConfig(category.slug);
          const IconComponent = getCategoryIcon(category.slug);
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.slug)}
              className={`w-full px-3 py-2 rounded-lg transition-all flex items-center justify-between ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                {category.slug !== 'all' && (
                  <span className={isSelected ? 'text-white' : config.text}>
                    <IconComponent size={iconSizes[size]} />
                  </span>
                )}
                <span className="font-medium">{category.name}</span>
              </div>
              
              {showCounts && category.count !== undefined && (
                <span className={`text-sm px-2 py-1 rounded-full ${
                  isSelected 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {category.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return null;
}