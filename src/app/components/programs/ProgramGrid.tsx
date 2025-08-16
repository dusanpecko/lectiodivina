// src/app/components/programs/ProgramGrid.tsx
import { useState, useMemo } from "react";
import ProgramCard from "./ProgramCard";
import { Grid, List, Filter, SortAsc, SortDesc, Search } from "lucide-react";

interface Program {
  id: string;
  title: string;
  slug: string;
  category: string;
  description?: string;
  image_url?: string;
  author?: string;
  lang: string;
  total_sessions: number;
  total_duration_minutes: number;
  is_featured: boolean;
  is_published: boolean;
  created_at?: string;
}

interface ProgramGridProps {
  programs: Program[];
  loading?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showViewToggle?: boolean;
  defaultView?: 'grid' | 'list';
  variant?: 'default' | 'compact' | 'featured';
  columns?: 2 | 3 | 4;
  onSave?: (programId: string) => void;
  savedPrograms?: string[];
  emptyState?: React.ReactNode;
}

type SortOption = 'newest' | 'oldest' | 'title' | 'sessions' | 'duration';
type FilterOption = 'all' | 'featured' | 'has_sessions';

const SORT_OPTIONS = [
  { value: 'newest' as SortOption, label: 'Najnovšie' },
  { value: 'oldest' as SortOption, label: 'Najstaršie' },
  { value: 'title' as SortOption, label: 'Názov A-Z' },
  { value: 'sessions' as SortOption, label: 'Počet lekcií' },
  { value: 'duration' as SortOption, label: 'Dĺžka' }
];

const FILTER_OPTIONS = [
  { value: 'all' as FilterOption, label: 'Všetky programy' },
  { value: 'featured' as FilterOption, label: 'Odporúčané' },
  { value: 'has_sessions' as FilterOption, label: 'S lekciami' }
];

// Loading skeleton
const ProgramGridSkeleton = ({ columns = 4 }: { columns: number }) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns > 2 ? 3 : 2} xl:grid-cols-${columns} gap-6`}>
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
        <div className="h-48 bg-gray-200"></div>
        <div className="p-6">
          <div className="h-6 bg-gray-200 rounded mb-3 w-24"></div>
          <div className="h-6 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
          <div className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty state
const DefaultEmptyState = () => (
  <div className="text-center py-16">
    <div className="text-6xl mb-4">🔍</div>
    <h3 className="text-xl font-semibold text-gray-600 mb-2">Žiadne programy</h3>
    <p className="text-gray-500">Skúste zmeniť filtre alebo vyhľadávacie kritériá.</p>
  </div>
);

export default function ProgramGrid({
  programs,
  loading = false,
  showSearch = true,
  showFilters = true,
  showViewToggle = true,
  defaultView = 'grid',
  variant = 'default',
  columns = 4,
  onSave,
  savedPrograms = [],
  emptyState
}: ProgramGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter and sort programs
  const filteredAndSortedPrograms = useMemo(() => {
    let filtered = programs;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(program => 
        program.title.toLowerCase().includes(query) ||
        program.description?.toLowerCase().includes(query) ||
        program.author?.toLowerCase().includes(query)
      );
    }

    // Apply filters
    switch (filterBy) {
      case 'featured':
        filtered = filtered.filter(p => p.is_featured);
        break;
      case 'has_sessions':
        filtered = filtered.filter(p => p.total_sessions > 0);
        break;
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'newest':
          comparison = new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
          break;
        case 'oldest':
          comparison = new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title, 'sk');
          break;
        case 'sessions':
          comparison = b.total_sessions - a.total_sessions;
          break;
        case 'duration':
          comparison = b.total_duration_minutes - a.total_duration_minutes;
          break;
      }
      
      return sortDirection === 'desc' ? comparison : -comparison;
    });

    return sorted;
  }, [programs, searchQuery, sortBy, filterBy, sortDirection]);

  const handleSortToggle = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {(showSearch || showFilters) && (
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="h-10 bg-gray-200 rounded-lg w-64 animate-pulse"></div>
            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
            </div>
          </div>
        )}
        <ProgramGridSkeleton columns={columns} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      {(showSearch || showFilters || showViewToggle) && (
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          {/* Search */}
          {showSearch && (
            <div className="relative flex-1 max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Hľadať programy..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
          )}

          {/* Filters and View Toggle */}
          <div className="flex items-center gap-3">
            {/* Filter */}
            {showFilters && (
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                {FILTER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}

            {/* Sort */}
            {showFilters && (
              <div className="flex items-center gap-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  {SORT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                <button
                  onClick={handleSortToggle}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  title={sortDirection === 'asc' ? 'Vzostupne' : 'Zostupne'}
                >
                  {sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />}
                </button>
              </div>
            )}

            {/* View Toggle */}
            {showViewToggle && (
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition ${
                    viewMode === 'grid' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition ${
                    viewMode === 'list' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <List size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {searchQuery || filterBy !== 'all' ? (
            <>Našlo sa <span className="font-medium">{filteredAndSortedPrograms.length}</span> programov</>
          ) : (
            <>Zobrazuje sa <span className="font-medium">{filteredAndSortedPrograms.length}</span> programov</>
          )}
        </p>
        
        {(searchQuery || filterBy !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterBy('all');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Vyčistiť filtre
          </button>
        )}
      </div>

      {/* Grid/List Content */}
      {filteredAndSortedPrograms.length === 0 ? (
        emptyState || <DefaultEmptyState />
      ) : viewMode === 'grid' ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 ${
          columns === 2 ? 'lg:grid-cols-2' :
          columns === 3 ? 'lg:grid-cols-2 xl:grid-cols-3' :
          'lg:grid-cols-3 xl:grid-cols-4'
        } gap-6`}>
          {filteredAndSortedPrograms.map(program => (
            <ProgramCard
              key={program.id}
              program={program}
              variant={variant}
              onSave={onSave}
              isSaved={savedPrograms.includes(program.id)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAndSortedPrograms.map(program => (
            <ProgramCard
              key={program.id}
              program={program}
              variant="compact"
              onSave={onSave}
              isSaved={savedPrograms.includes(program.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}