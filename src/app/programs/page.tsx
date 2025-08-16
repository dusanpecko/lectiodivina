"use client";

import { useEffect, useState, useMemo } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import { 
  Star, BookOpen
} from "lucide-react";
import Link from "next/link";

// Import new components
import CategoryFilter from "@/app/components/programs/CategoryFilter";
import ProgramGrid from "@/app/components/programs/ProgramGrid";
import SearchBar from "@/app/components/programs/SearchBar";

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

interface ProgramCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  display_order: number;
  is_active: boolean;
}

// Hero Section
const HeroSection = ({ 
  searchQuery, 
  onSearchChange,
  recentSearches,
  onRecentSearch,
  onClearRecent
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  recentSearches: string[];
  onRecentSearch: (search: string) => void;
  onClearRecent: () => void;
}) => (
  <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white">
    <div className="container mx-auto px-6 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Duchovná <span className="text-yellow-300">Cesta</span>
        </h1>
        <p className="text-xl md:text-2xl text-blue-100 mb-8">
          Objavte modlitby, meditácie a duchovné cvičenia pre prehĺbenie vašej viery
        </p>
        
        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Vyhľadajte programy, autorov alebo témy..."
            recentSearches={recentSearches}
            onRecentSearch={onRecentSearch}
            onClearRecent={onClearRecent}
            suggestions={[
              "Ranné modlitby",
              "Večerná meditácia", 
              "Biblické štúdium",
              "Modlitby za pokoj",
              "Duchovný rast"
            ]}
            size="lg"
            className="shadow-2xl"
          />
        </div>
      </div>
    </div>
  </div>
);

// Stats Section
const StatsSection = ({ programs }: { programs: Program[] }) => {
  const stats = useMemo(() => {
    const totalSessions = programs.reduce((sum, p) => sum + p.total_sessions, 0);
    const totalHours = Math.floor(programs.reduce((sum, p) => sum + p.total_duration_minutes, 0) / 60);
    const featuredCount = programs.filter(p => p.is_featured).length;
    
    return { totalSessions, totalHours, featuredCount, totalPrograms: programs.length };
  }, [programs]);

  return (
    <div className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalPrograms}</div>
            <div className="text-gray-600">Programy</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalSessions}</div>
            <div className="text-gray-600">Lekcie</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-purple-600 mb-2">{stats.totalHours}h</div>
            <div className="text-gray-600">Obsah</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.featuredCount}</div>
            <div className="text-gray-600">Odporúčané</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProgramsMainPage() {
  const { supabase } = useSupabase();
  const { lang: appLang } = useLanguage();
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, setCategories] = useState<ProgramCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedPrograms, setSavedPrograms] = useState<string[]>([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programsRes, categoriesRes] = await Promise.all([
          supabase
            .from("programs")
            .select("*")
            .eq("is_published", true)
            .eq("lang", appLang)
            .order("is_featured", { ascending: false })
            .order("category")
            .order("display_order"),
          
          supabase
            .from("program_categories")
            .select("*")
            .eq("is_active", true)
            .order("display_order")
        ]);

        if (programsRes.data) setPrograms(programsRes.data);
        if (categoriesRes.data) setCategories(categoriesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, appLang]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Load saved programs from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('savedPrograms');
    if (saved) {
      setSavedPrograms(JSON.parse(saved));
    }
  }, []);

  // Handle recent search
  const handleRecentSearch = (search: string) => {
    setSearchQuery(search);
    
    // Add to recent searches
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Clear recent searches
  const handleClearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // Handle program save
  const handleProgramSave = (programId: string) => {
    const updated = savedPrograms.includes(programId)
      ? savedPrograms.filter(id => id !== programId)
      : [...savedPrograms, programId];
    
    setSavedPrograms(updated);
    localStorage.setItem('savedPrograms', JSON.stringify(updated));
  };

  // Debug logs - remove in production
  useEffect(() => {
    console.log('Debug - Loading state:', loading);
    console.log('Debug - Programs count:', programs.length);
    console.log('Debug - Categories count:', categories.length);
    console.log('Debug - Selected category:', selectedCategory);
    console.log('Debug - Search query:', searchQuery);
    // Remove filteredPrograms from here to avoid circular dependency
  }, [loading, programs, categories, selectedCategory, searchQuery]);

  // Filter programs
  const filteredPrograms = useMemo(() => {
    let filtered = programs;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    
    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query) ||
        p.author?.toLowerCase().includes(query)
      );
      
      // Add to recent searches if not already there
      if (searchQuery.length > 2 && !recentSearches.includes(searchQuery)) {
        const updated = [searchQuery, ...recentSearches].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
      }
    }
    
    return filtered;
  }, [programs, selectedCategory, searchQuery, recentSearches]);

  // Group programs
  const { featuredPrograms, regularPrograms } = useMemo(() => {
    const featured = filteredPrograms.filter(p => p.is_featured);
    const regular = filteredPrograms.filter(p => !p.is_featured);
    return { featuredPrograms: featured, regularPrograms: regular };
  }, [filteredPrograms]);

  // Convert categories to the format expected by CategoryFilter
  const categoryFilterData = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    color: cat.color,
    icon: cat.icon,
    display_order: cat.display_order,
    is_active: cat.is_active,
    count: programs.filter(p => p.category === cat.slug).length
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
        recentSearches={recentSearches}
        onRecentSearch={handleRecentSearch}
        onClearRecent={handleClearRecent}
      />
      
      {/* Stats */}
      <StatsSection programs={programs} />
      
      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Filters */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Prehľadávať programy</h2>
          <CategoryFilter
            categories={categoryFilterData}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            showCounts={true}
            variant="pills"
            size="md"
            className="mb-8"
          />
        </div>

        {/* Featured Programs Section */}
        {loading ? (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Star className="text-yellow-500" size={24} />
              <h3 className="text-2xl font-bold text-gray-800">Odporúčané programy</h3>
            </div>
            <ProgramGrid
              programs={[]}
              loading={true}
              variant="featured"
              columns={3}
              showSearch={false}
              showFilters={false}
              showViewToggle={false}
              onSave={handleProgramSave}
              savedPrograms={savedPrograms}
            />
          </section>
        ) : featuredPrograms.length > 0 ? (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Star className="text-yellow-500" size={24} />
              <h3 className="text-2xl font-bold text-gray-800">Odporúčané programy ({featuredPrograms.length})</h3>
            </div>
            <ProgramGrid
              programs={featuredPrograms}
              loading={false}
              variant="featured"
              columns={3}
              showSearch={false}
              showFilters={false}
              showViewToggle={false}
              onSave={handleProgramSave}
              savedPrograms={savedPrograms}
              emptyState={
                <div className="text-center py-16">
                  <Star size={64} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">Žiadne odporúčané programy</h3>
                  <p className="text-gray-500">Momentálne nie sú k dispozícii žiadne odporúčané programy.</p>
                </div>
              }
            />
          </section>
        ) : (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Star className="text-yellow-500" size={24} />
              <h3 className="text-2xl font-bold text-gray-800">Odporúčané programy (0)</h3>
            </div>
            <div className="text-center py-16">
              <Star size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Žiadne odporúčané programy</h3>
              <p className="text-gray-500">Momentálne nie sú k dispozícii žiadne odporúčané programy.</p>
            </div>
          </section>
        )}

        {/* All Programs Section */}
        <section>
          <h3 className="text-2xl font-bold text-gray-800 mb-6">
            {selectedCategory === 'all' ? 'Všetky programy' : 
             categories.find(c => c.slug === selectedCategory)?.name || 'Programy'}
            {!loading && ` (${regularPrograms.length})`}
          </h3>
          
          <ProgramGrid
            programs={regularPrograms}
            loading={loading}
            showSearch={false} // Search is in hero
            showFilters={true}
            showViewToggle={true}
            variant="default"
            columns={4}
            onSave={handleProgramSave}
            savedPrograms={savedPrograms}
            emptyState={
              <div className="text-center py-16">
                <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenašli sa žiadne programy</h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? `Žiadne programy nevyhovujú vyhľadávaniu "${searchQuery}". Skúste iné kľúčové slová.`
                    : 'V tejto kategórii nie sú k dispozícii žiadne programy.'
                  }
                </p>
                {(searchQuery || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Zobraziť všetky programy
                  </button>
                )}
              </div>
            }
          />
        </section>
      </div>
    </div>
  );
}