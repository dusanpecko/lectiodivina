//src/app/admin/articles/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider";
import { 
  Grid, Trash2, PlusCircle, Edit3, ArrowLeft, Save,
  Search, X, CheckCircle, AlertCircle, Tag, Palette,
  FileText, Eye, Calendar
} from "lucide-react";
import { useLanguage } from "@/app/components/LanguageProvider";
import { translations } from "@/app/i18n";
import { useRouter } from "next/navigation";

interface Category {
  id?: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  created_at?: string;
  article_count?: number;
}

type NotificationType = 'success' | 'error' | 'info';

const COLOR_PRESETS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
];

// Notification komponenta
const Notification = ({ 
  message, 
  type, 
  onClose 
}: { 
  message: string; 
  type: NotificationType; 
  onClose: () => void; 
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-lg p-4 shadow-lg ${bgColor} max-w-md`}>
      <div className="flex items-start gap-3">
        <Icon size={20} />
        <div className="flex-1">
          <p className="font-medium">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Loading komponenta
const LoadingSpinner = ({ size = 6 }: { size?: number }) => (
  <div className={`w-${size} h-${size} border-2 border-blue-600 border-t-transparent rounded-full animate-spin`} />
);

// Category Form Modal
const CategoryModal = ({ 
  category, 
  isOpen, 
  onClose, 
  onSave 
}: {
  category: Category | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
}) => {
  const [formData, setFormData] = useState<Category>({
    name: '',
    slug: '',
    description: '',
    color: COLOR_PRESETS[0]
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData(category);
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        color: COLOR_PRESETS[0]
      });
    }
  }, [category, isOpen]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[áäâà]/g, 'a')
      .replace(/[éěêè]/g, 'e')
      .replace(/[íîì]/g, 'i')
      .replace(/[óôò]/g, 'o')
      .replace(/[úůûù]/g, 'u')
      .replace(/[ýÿ]/g, 'y')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[ß]/g, 'ss')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {category ? 'Upraviť kategóriu' : 'Nová kategória'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Názov kategórie *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="napr. Duchovnosť"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              URL slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="duchovnost"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Popis
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 border rounded-lg h-20 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Krátky popis kategórie..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Farba kategórie
            </label>
            <div className="grid grid-cols-5 gap-2 mb-3">
              {COLOR_PRESETS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-10 h-10 rounded-lg border-2 transition ${
                    formData.color === color ? 'border-gray-400 scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              className="w-full h-10 border rounded-lg"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              disabled={saving || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <LoadingSpinner size={4} />
                  Ukladám...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {category ? 'Uložiť' : 'Vytvoriť'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function CategoriesPage() {
  const { lang: appLang } = useLanguage();
  const t = translations[appLang];
  const router = useRouter();
  const { supabase } = useSupabase();

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);
  const [modalCategory, setModalCategory] = useState<Category | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
  }, []);

  // Fetch categories with article counts
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("article_categories")
        .select("*")
        .order("name");

      if (categoriesError) throw categoriesError;

      // Fetch article counts for each category
      const categoriesWithCounts = await Promise.all(
        (categoriesData || []).map(async (category) => {
          const { count } = await supabase
            .from("articles")
            .select("*", { count: "exact", head: true })
            .eq("category_id", category.id);

          return {
            ...category,
            article_count: count || 0
          };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Fetch error:', error);
      showNotification("Chyba pri načítavaní kategórií", "error");
    } finally {
      setLoading(false);
    }
  }, [supabase, showNotification]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handlers
  const handleSave = async (categoryData: Category) => {
    try {
      if (categoryData.id) {
        // Update existing category
        const { error } = await supabase
          .from("article_categories")
          .update({
            name: categoryData.name,
            slug: categoryData.slug,
            description: categoryData.description,
            color: categoryData.color
          })
          .eq("id", categoryData.id);

        if (error) throw error;
        showNotification("Kategória bola úspešne aktualizovaná", "success");
      } else {
        // Create new category
        const { error } = await supabase
          .from("article_categories")
          .insert([{
            name: categoryData.name,
            slug: categoryData.slug,
            description: categoryData.description,
            color: categoryData.color
          }]);

        if (error) throw error;
        showNotification("Kategória bola úspešne vytvorená", "success");
      }

      fetchCategories();
    } catch (error: any) {
      console.error('Save error:', error);
      if (error.code === '23505') {
        showNotification("Kategória s týmto názvom už existuje", "error");
      } else {
        showNotification("Chyba pri ukladaní kategórie", "error");
      }
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    const category = categories.find(c => c.id === id);
    if (!category) return;

    if (category.article_count && category.article_count > 0) {
      showNotification(
        `Nemožno vymazať kategóriu "${category.name}" - obsahuje ${category.article_count} článkov`,
        "error"
      );
      return;
    }

    if (!confirm(`Naozaj chcete vymazať kategóriu "${category.name}"?`)) {
      return;
    }

    setDeletingId(id);
    try {
      const { error } = await supabase
        .from("article_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;

      showNotification("Kategória bola úspešne vymazaná", "success");
      fetchCategories();
    } catch (error) {
      console.error('Delete error:', error);
      showNotification("Chyba pri mazaní kategórie", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const openModal = (category?: Category) => {
    setModalCategory(category || null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalCategory(null);
  };

  // Filter categories
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Notifications */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Category Modal */}
      <CategoryModal
        category={modalCategory}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSave}
      />

      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <header className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/admin/articles")}
                className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Grid size={24} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Správa kategórií
                  </h1>
                  <p className="text-gray-600">Organizácia článkov do kategórií</p>
                </div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
                <div className="text-sm text-gray-500">Kategórie</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {categories.reduce((sum, cat) => sum + (cat.article_count || 0), 0)}
                </div>
                <div className="text-sm text-gray-500">Články</div>
              </div>
            </div>
          </div>
        </header>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                placeholder="Vyhľadať kategórie..."
              />
            </div>

            {/* Add Button */}
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              <PlusCircle size={20} />
              Nová kategória
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <LoadingSpinner />
                <span className="text-gray-500">Načítavam kategórie...</span>
              </div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Grid size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Žiadne výsledky' : 'Žiadne kategórie'}
              </p>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Skúste zmeniť vyhľadávací výraz'
                  : 'Vytvorte prvú kategóriu pre organizáciu článkov'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={() => openModal()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <PlusCircle size={16} />
                  Vytvoriť kategóriu
                </button>
              )}
            </div>
          ) : (
            filteredCategories.map(category => (
              <div
                key={category.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                {/* Category Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="font-semibold text-lg text-gray-800">
                      {category.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openModal(category)}
                      className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                      title="Upraviť"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id!)}
                      disabled={deletingId === category.id}
                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                      title="Vymazať"
                    >
                      {deletingId === category.id ? (
                        <LoadingSpinner size={4} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Category Info */}
                <div className="space-y-3">
                  {category.description && (
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {category.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FileText size={14} />
                      <span>{category.article_count || 0} článkov</span>
                    </div>
                    {category.created_at && (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {new Date(category.created_at).toLocaleDateString('sk-SK')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="flex items-center gap-2">
                    <div 
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: category.color }}
                    >
                      <Tag size={12} />
                      {category.slug}
                    </div>
                    
                    {category.article_count && category.article_count > 0 && (
                      <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                        <Eye size={12} />
                        Aktívna
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quick Stats */}
        {!loading && categories.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <h3 className="font-semibold text-gray-800 mb-4">Prehľad kategórií</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">
                  {categories.length}
                </div>
                <div className="text-sm text-gray-500">Celkom kategórií</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {categories.filter(c => (c.article_count || 0) > 0).length}
                </div>
                <div className="text-sm text-gray-500">S článkami</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {categories.reduce((sum, cat) => sum + (cat.article_count || 0), 0)}
                </div>
                <div className="text-sm text-gray-500">Celkom článkov</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-orange-600">
                  {categories.length > 0 
                    ? Math.round(categories.reduce((sum, cat) => sum + (cat.article_count || 0), 0) / categories.length)
                    : 0
                  }
                </div>
                <div className="text-sm text-gray-500">Priemer na kategóriu</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}