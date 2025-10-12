'use client';

import {
  AlertCircle,
  ArrowLeft, ArrowRight,
  BarChart3,
  Bell,
  CheckCircle,
  ChevronDown, ChevronUp,
  Edit3,
  Filter,
  List,
  Plus, RefreshCw,
  Search,
  Settings,
  Trash2,
  Users,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface NotificationTopic {
  id: string;
  name_sk: string;
  name_en: string | null;
  name_cs: string | null;
  slug: string;
  description_sk: string | null;
  icon: string | null;
  color: string;
  is_active: boolean;
  is_default: boolean;
  display_order: number;
  category: string | null;
  created_at: string;
  subscriber_count?: number;
}

type FilterState = {
  name: string;
  category: string;
  is_active: string; // "" = všetky, "true" = aktívne, "false" = neaktívne
  is_default: string; // "" = všetky, "true" = predvolené, "false" = nie predvolené
};

type NotificationType = 'success' | 'error' | 'info';

const PAGE_SIZE = 20;

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
    success: 'bg-gray-50 border-gray-200',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-gray-50 border-gray-200'
  }[type];
  
  const textColor = {
    success: { color: '#40467b' },
    error: {},
    info: { color: '#40467b' }
  }[type];

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: AlertCircle
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-lg p-4 shadow-lg ${bgColor} max-w-md`} style={textColor}>
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
  <div className={`w-${size} h-${size} border-2 border-t-transparent rounded-full animate-spin`} style={{ borderColor: '#40467b', borderTopColor: 'transparent' }} />
);

export default function NotificationTopicsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [topics, setTopics] = useState<NotificationTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  } | null>(null);

  // Filtre a stránkovanie
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page');
    const pageNum = pageParam ? parseInt(pageParam, 10) : 1;
    return pageNum > 0 ? pageNum : 1;
  });
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState<FilterState>({
    name: "",
    category: "",
    is_active: "",
    is_default: ""
  });

  // Helper pre zmenu stránky s aktualizáciou URL
  const updatePage = useCallback((newPage: number) => {
    setPage(newPage);
    if (newPage > 1) {
      router.push(`/admin/notification-topics?page=${newPage}`, { scroll: false });
    } else {
      router.push('/admin/notification-topics', { scroll: false });
    }
  }, [router]);

  // Notifikácie helper
  const showNotification = useCallback((message: string, type: NotificationType) => {
    setNotification({ message, type });
  }, []);

  // Fetch data with filtering and pagination
  const fetchTopics = useCallback(async () => {
    setLoading(true);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', PAGE_SIZE.toString());
      
      if (filter.name) params.append('name', filter.name);
      if (filter.category) params.append('category', filter.category);
      if (filter.is_active) params.append('is_active', filter.is_active);
      if (filter.is_default) params.append('is_default', filter.is_default);

      const response = await fetch(`/api/admin/notification-topics?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        setTopics(data.topics || []);
        setTotal(data.total || 0);
      } else {
        showNotification(data.error || 'Chyba pri načítaní tém', 'error');
        setTopics([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showNotification('Nepodarilo sa načítať témy', 'error');
      setTopics([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, filter, showNotification]);

  // Effects
  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // Handlers
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Naozaj chcete vymazať túto tému? Táto akcia sa nedá vrátiť späť.")) {
      return;
    }

    setDeletingId(id);
    
    try {
      const response = await fetch(`/api/admin/notification-topics/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showNotification("Téma bola úspešne vymazaná", "success");
        
        // Ak je posledný item na stránke, choď na predchádzajúcu
        if (topics.length === 1 && page > 1) {
          updatePage(page - 1);
        } else {
          fetchTopics();
        }
      } else {
        const data = await response.json();
        showNotification(data.error || 'Chyba pri mazaní témy', 'error');
      }
    } catch (err) {
      console.error('Delete error:', err);
      showNotification('Nepodarilo sa zmazať tému', 'error');
    } finally {
      setDeletingId(null);
    }
  }, [topics.length, page, fetchTopics, showNotification, updatePage]);

  const clearFilters = useCallback(() => {
    setFilter({ name: "", category: "", is_active: "", is_default: "" });
    updatePage(1);
  }, [updatePage]);

  // Computed values
  const hasActiveFilters = useMemo(() => 
    Object.values(filter).some(f => f !== ""), 
    [filter]
  );

  const stats = useMemo(() => ({
    total: topics.length,
    active: topics.filter(t => t.is_active).length,
    default: topics.filter(t => t.is_default).length,
    subscribers: topics.reduce((sum, topic) => sum + (topic.subscriber_count || 0), 0)
  }), [topics]);

  const getIconEmoji = (icon: string | null) => {
    const iconMap: Record<string, string> = {
      'book-open': '📖',
      'bell': '🔔',
      'hands-praying': '🙏',
      'rosary': '📿',
      'calendar': '📅',
      'star': '⭐',
      'heart': '❤️',
      'church': '⛪',
      'cross': '✝️',
      'bible': '📜',
      'candle': '🕯️',
      'dove': '🕊️',
    };
    return iconMap[icon || 'bell'] || '🔔';
  };

  const getCategoryLabel = (category: string | null) => {
    const categoryMap: Record<string, string> = {
      'spiritual': 'Duchovné',
      'educational': 'Vzdelávacie',
      'news': 'Novinky',
      'other': 'Ostatné',
    };
    return categoryMap[category || 'other'] || 'Ostatné';
  };

  return (
    <div className="min-h-screen">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hlavička */}
        <header className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-[#40467b] via-[#686ea3] to-[#40467b] px-8 py-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                  <Bell size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white drop-shadow-sm">
                    Správa Tém Notifikácií
                  </h1>
                  <p className="text-indigo-100 mt-1">Konfigurácia tém pre push notifikácie</p>
                </div>
              </div>
              
              {/* Štatistiky */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.total}</div>
                  <div className="text-sm text-indigo-100 mt-1">Celkom tém</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.active}</div>
                  <div className="text-sm text-indigo-100 mt-1">Aktívne</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.default}</div>
                  <div className="text-sm text-indigo-100 mt-1">Predvolené</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-white drop-shadow">{stats.subscribers}</div>
                  <div className="text-sm text-indigo-100 mt-1">Odberatelia</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Ovládacie panely */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Akcie */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Plus size={20} style={{ color: '#40467b' }} />
              </div>
              <h3 className="font-semibold text-gray-800">Akcie</h3>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push("/admin/notification-topics/new")}
                className="w-full bg-gradient-to-r from-[#40467b] to-[#686ea3] text-white px-4 py-2.5 rounded-lg hover:from-[#686ea3] hover:to-[#40467b] transition flex items-center justify-center gap-2 shadow-sm font-medium"
              >
                <Plus size={16} />
                Pridať novú tému
              </button>
              <div className="flex gap-2">
                <button
                  onClick={fetchTopics}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2.5 rounded-lg hover:from-gray-700 hover:to-gray-800 transition text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                  <RefreshCw size={16} />
                  Obnoviť
                </button>
                <button
                  onClick={() => router.push('/admin/notifications')}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg hover:from-blue-700 hover:to-blue-800 transition text-sm flex items-center justify-center gap-2 shadow-sm"
                >
                  <Bell size={16} />
                  Notifikácie
                </button>
              </div>
            </div>
          </div>

          {/* Detailné štatistiky */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 size={20} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">Detailné štatistiky</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-cyan-800 text-xs">🔔</span>
                </div>
                <div className="font-bold text-cyan-800">{stats.total}</div>
                <div className="text-xs text-gray-500">Celkom</div>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-green-800 text-xs">✅</span>
                </div>
                <div className="font-bold text-green-800">{stats.active}</div>
                <div className="text-xs text-gray-500">Aktívne</div>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-purple-800 text-xs">⭐</span>
                </div>
                <div className="font-bold text-purple-800">{stats.default}</div>
                <div className="text-xs text-gray-500">Predvolené</div>
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-orange-800 text-xs">👥</span>
                </div>
                <div className="font-bold text-orange-800">{stats.subscribers}</div>
                <div className="text-xs text-gray-500">Odberatelia</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Search size={20} className="text-gray-600" />
              <h3 className="font-semibold text-gray-800">Filtre</h3>
              {hasActiveFilters && (
                <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                  Aktívne filtre
                </span>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition"
            >
              <Filter size={16} />
              {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Bell size={16} className="inline mr-1" />
                  Názov
                </label>
                <input
                  type="text"
                  value={filter.name}
                  onChange={e => { 
                    setFilter(f => ({ ...f, name: e.target.value })); 
                    updatePage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent transition"
                  style={{'--tw-ring-color': '#40467b'} as React.CSSProperties}
                  placeholder="Filtrovať názvy..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <List size={16} className="inline mr-1" />
                  Kategória
                </label>
                <select
                  value={filter.category}
                  onChange={e => { 
                    setFilter(f => ({ ...f, category: e.target.value })); 
                    updatePage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent transition"
                  style={{'--tw-ring-color': '#40467b'} as React.CSSProperties}
                >
                  <option value="">Všetky kategórie</option>
                  <option value="spiritual">Duchovné</option>
                  <option value="educational">Vzdelávacie</option>
                  <option value="news">Novinky</option>
                  <option value="other">Ostatné</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CheckCircle size={16} className="inline mr-1" />
                  Aktívne
                </label>
                <select
                  value={filter.is_active}
                  onChange={e => { 
                    setFilter(f => ({ ...f, is_active: e.target.value })); 
                    updatePage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent transition"
                  style={{'--tw-ring-color': '#40467b'} as React.CSSProperties}
                >
                  <option value="">Všetky</option>
                  <option value="true">Aktívne</option>
                  <option value="false">Neaktívne</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Settings size={16} className="inline mr-1" />
                  Predvolené
                </label>
                <select
                  value={filter.is_default}
                  onChange={e => { 
                    setFilter(f => ({ ...f, is_default: e.target.value })); 
                    updatePage(1); 
                  }}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:border-transparent transition"
                  style={{'--tw-ring-color': '#40467b'} as React.CSSProperties}
                >
                  <option value="">Všetky</option>
                  <option value="true">Predvolené</option>
                  <option value="false">Nie predvolené</option>
                </select>
              </div>
            </div>
          )}

          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                <X size={16} />
                Vyčistiť filtre
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Settings size={16} />
                      Poradie
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Bell size={16} />
                      Téma
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <List size={16} />
                      Kategória
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      Odberatelia
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Akcie</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <LoadingSpinner />
                        <span className="text-gray-500">Načítavam...</span>
                      </div>
                    </td>
                  </tr>
                ) : topics.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Žiadne témy notifikácií</p>
                        <p>Skúste zmeniť filtre alebo pridajte novú tému</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  topics.map(topic => (
                    <tr key={topic.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-indigo-100 transition-all duration-200">
                      <td className="px-6 py-4">
                        <div className="text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-semibold text-gray-900">
                            {topic.display_order}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl" title={topic.icon || 'bell'}>
                              {getIconEmoji(topic.icon)}
                            </span>
                            <span
                              className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: topic.color }}
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{topic.name_sk}</div>
                            {topic.description_sk && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {topic.description_sk}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded mt-1 inline-block">
                              {topic.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
                          {getCategoryLabel(topic.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {topic.is_active ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              ✓ Aktívna
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              ✗ Neaktívna
                            </span>
                          )}
                          {topic.is_default && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              ⭐ Predvolená
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <Users size={14} className="text-orange-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{topic.subscriber_count || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/notification-topics/${topic.id}`}
                            className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg transition"
                            title="Upraviť"
                          >
                            <Edit3 size={18} />
                          </Link>
                          {!topic.is_default && (
                            <button
                              onClick={() => handleDelete(topic.id)}
                              disabled={deletingId === topic.id}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                              title="Vymazať"
                            >
                              {deletingId === topic.id ? (
                                <LoadingSpinner size={4} />
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {Math.ceil(total / PAGE_SIZE) > 1 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
            <div className="text-center text-sm text-gray-600 mb-4">
              Zobrazujem <span className="font-bold">{(page - 1) * PAGE_SIZE + 1}</span> až{" "}
              <span className="font-bold">{Math.min(page * PAGE_SIZE, total)}</span> z{" "}
              <span className="font-bold">{total}</span> tém notifikácií
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <button
                onClick={() => updatePage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">Predchádzajúca</span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Stránka:</span>
                <select
                  value={page}
                  onChange={(e) => updatePage(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:border-transparent transition min-w-[80px]"
                  style={{'--tw-ring-color': '#40467b'} as React.CSSProperties}
                >
                  {Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <option key={pageNum} value={pageNum}>
                        {pageNum} / {Math.ceil(total / PAGE_SIZE)}
                      </option>
                    );
                  })}
                </select>
              </div>
              
              <button
                onClick={() => {
                  const nextPage = page * PAGE_SIZE < total ? page + 1 : page;
                  updatePage(nextPage);
                }}
                disabled={page * PAGE_SIZE >= total}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Ďalšia</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
