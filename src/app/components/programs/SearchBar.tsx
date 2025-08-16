// src/app/components/programs/SearchBar.tsx
import { useState, useEffect, useRef } from "react";
import { Search, X, Clock, Filter, Sparkles } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suggestions?: string[];
  recentSearches?: string[];
  onRecentSearch?: (search: string) => void;
  onClearRecent?: () => void;
  showFilters?: boolean;
  onFilterClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface SearchSuggestion {
  type: 'recent' | 'suggestion' | 'category';
  text: string;
  category?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Hľadať programy, autorov alebo témy...",
  suggestions = [],
  recentSearches = [],
  onRecentSearch,
  onClearRecent,
  showFilters = false,
  onFilterClick,
  className = "",
  size = 'md'
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Combine suggestions with recent searches
  const allSuggestions: SearchSuggestion[] = [
    ...recentSearches.slice(0, 3).map(search => ({
      type: 'recent' as const,
      text: search
    })),
    ...suggestions.map(suggestion => ({
      type: 'suggestion' as const,
      text: suggestion
    }))
  ];

  // Filter suggestions based on current input
  const filteredSuggestions = allSuggestions.filter(suggestion =>
    suggestion.text.toLowerCase().includes(value.toLowerCase()) ||
    suggestion.type === 'recent'
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(newValue.length > 0 || recentSearches.length > 0);
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    setShowSuggestions(value.length > 0 || recentSearches.length > 0);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onChange(suggestion.text);
    if (suggestion.type === 'recent' && onRecentSearch) {
      onRecentSearch(suggestion.text);
    }
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
    setShowSuggestions(recentSearches.length > 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
    if (e.key === 'Enter') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Size variants
  const sizeClasses = {
    sm: 'h-10 text-sm',
    md: 'h-12 text-base',
    lg: 'h-14 text-lg'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input */}
      <div className={`relative flex items-center bg-white border-2 rounded-xl transition-all duration-200 ${
        isFocused 
          ? 'border-blue-500 shadow-lg ring-4 ring-blue-100' 
          : 'border-gray-200 hover:border-gray-300 shadow-sm'
      }`}>
        {/* Search Icon */}
        <div className="absolute left-4 text-gray-400">
          <Search size={iconSizes[size]} />
        </div>
        
        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full pl-12 pr-20 py-3 bg-transparent border-none outline-none placeholder-gray-400 ${sizeClasses[size]}`}
        />
        
        {/* Actions */}
        <div className="absolute right-3 flex items-center gap-2">
          {/* Clear Button */}
          {value && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title="Vymazať"
            >
              <X size={iconSizes[size] - 4} />
            </button>
          )}
          
          {/* Filter Button */}
          {showFilters && (
            <button
              onClick={onFilterClick}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Filtre"
            >
              <Filter size={iconSizes[size] - 4} />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (isFocused || value) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          {filteredSuggestions.length > 0 ? (
            <div className="max-h-64 overflow-y-auto">
              {/* Recent Searches */}
              {recentSearches.length > 0 && !value && (
                <div className="p-3 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock size={14} />
                      Nedávne vyhľadávania
                    </h4>
                    {onClearRecent && (
                      <button
                        onClick={onClearRecent}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Vymazať
                      </button>
                    )}
                  </div>
                  {recentSearches.slice(0, 3).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick({ type: 'recent', text: search })}
                      className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {search}
                    </button>
                  ))}
                </div>
              )}

              {/* Search Suggestions */}
              {filteredSuggestions.filter(s => s.type === 'suggestion').length > 0 && (
                <div className="p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Sparkles size={14} />
                    Návrhy
                  </h4>
                  {filteredSuggestions
                    .filter(s => s.type === 'suggestion')
                    .map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <Search size={14} className="text-gray-400" />
                        <span>
                          {suggestion.text.split(new RegExp(`(${value})`, 'gi')).map((part, i) => 
                            part.toLowerCase() === value.toLowerCase() ? (
                              <mark key={i} className="bg-yellow-200 text-gray-900">{part}</mark>
                            ) : (
                              part
                            )
                          )}
                        </span>
                      </button>
                    ))
                  }
                </div>
              )}

              {/* Popular Categories */}
              {!value && (
                <div className="p-3 border-t border-gray-100">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Populárne kategórie</h4>
                  <div className="flex flex-wrap gap-2">
                    {['Modlitby', 'Meditácie', 'Biblické štúdium', 'Usínanie'].map((category) => (
                      <button
                        key={category}
                        onClick={() => handleSuggestionClick({ type: 'category', text: category })}
                        className="px-3 py-1 text-xs bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600 rounded-full transition-colors"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : value && (
            <div className="p-4 text-center text-gray-500">
              <Search size={24} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Žiadne výsledky pre "{value}"</p>
              <p className="text-xs text-gray-400 mt-1">Skúste iné kľúčové slová</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}