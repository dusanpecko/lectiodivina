"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/components/SupabaseProvider"; // ← ZMENA: náš provider
import Link from "next/link";
import {
  Users,
  Newspaper,
  Calendar,
  BookOpen,
  Quote,
  TrendingUp,
  Activity,
  Clock,
  Plus,
  Eye,
  Heart,
  MessageSquare,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Star
} from "lucide-react";

interface DashboardStats {
  users: { total: number; newThisWeek: number; growth: number };
  articles: { total: number; published: number; drafts: number; thisMonth: number };
  lectio: { total: number; thisWeek: number };
  quotes: { total: number; active: number };
  engagement: { totalViews: number; totalLikes: number; avgEngagement: number };
}

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  trend, 
  trendValue,
  href 
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: any;
  color: string;
  trend?: 'up' | 'down';
  trendValue?: string;
  href?: string;
}) => {
  const colorClasses = {
    blue: "bg-blue-500 from-blue-400 to-blue-600",
    green: "bg-green-500 from-green-400 to-green-600", 
    purple: "bg-purple-500 from-purple-400 to-purple-600",
    red: "bg-red-500 from-red-400 to-red-600",
    orange: "bg-orange-500 from-orange-400 to-orange-600",
    pink: "bg-pink-500 from-pink-400 to-pink-600"
  };

  const CardContent = () => (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} shadow-lg`}>
            <Icon size={24} className="text-white" />
          </div>
          {trend && trendValue && (
            <div className={`flex items-center space-x-1 ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span className="text-sm font-medium">{trendValue}</span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          <p className="text-lg font-semibold text-gray-700">{title}</p>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>
      
      <div className={`h-1 bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
    </div>
  );

  if (href) {
    return (
      <Link href={href}>
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
};

const QuickAction = ({ title, description, icon: Icon, color, href }: {
  title: string;
  description: string;
  icon: any;
  color: string;
  href: string;
}) => (
  <Link href={href}>
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 group border-l-4 border-transparent hover:border-blue-500">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl bg-${color}-100 text-${color}-600 group-hover:scale-110 transition-transform duration-200`}>
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
        <ArrowUpRight size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>
    </div>
  </Link>
);

const RecentActivityItem = ({ action, time, user, type }: {
  action: string;
  time: string;
  user: string;
  type: 'create' | 'edit' | 'delete';
}) => {
  const typeStyles = {
    create: "bg-green-100 text-green-600",
    edit: "bg-blue-100 text-blue-600", 
    delete: "bg-red-100 text-red-600"
  };

  const typeIcons = {
    create: Plus,
    edit: Activity,
    delete: Clock
  };

  const TypeIcon = typeIcons[type];

  return (
    <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`p-2 rounded-lg ${typeStyles[type]}`}>
        <TypeIcon size={16} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{action}</p>
        <p className="text-xs text-gray-500">{user} • {time}</p>
      </div>
    </div>
  );
};

export default function AdminPage() {
  const { supabase } = useSupabase(); // ← ZMENA: náš provider namiesto useSupabaseClient
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Simulujeme načítanie štatistík - nahraďte skutočnými dotazmi
        const mockStats: DashboardStats = {
          users: { total: 1247, newThisWeek: 23, growth: 12.5 },
          articles: { total: 156, published: 134, drafts: 22, thisMonth: 18 },
          lectio: { total: 89, thisWeek: 7 },
          quotes: { total: 365, active: 312 },
          engagement: { totalViews: 45678, totalLikes: 3456, avgEngagement: 7.8 }
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Načítavam dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hlavička */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vitajte v administrácii! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              Prehľad vašej aplikácie a rýchle akcie
            </p>
          </div>
          <div className="text-6xl">📊</div>
        </div>
        
        {/* Aktuálny čas a dátum */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock size={20} className="text-blue-600" />
              <span className="text-sm font-medium text-gray-700">
                {new Date().toLocaleDateString('sk-SK', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleTimeString('sk-SK')}
            </div>
          </div>
        </div>
      </div>

      {/* Štatistiky */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          title="Používatelia"
          value={stats?.users.total.toLocaleString() || '0'}
          subtitle={`+${stats?.users.newThisWeek || 0} tento týždeň`}
          icon={Users}
          color="blue"
          trend="up"
          trendValue={`+${stats?.users.growth || 0}%`}
          href="/admin/users"
        />
        
        <StatCard
          title="Články"
          value={stats?.articles.total || 0}
          subtitle={`${stats?.articles.published || 0} publikovaných`}
          icon={Newspaper}
          color="green"
          trend="up"
          trendValue={`+${stats?.articles.thisMonth || 0} tento mesiac`}
          href="/admin/news"
        />
        
        <StatCard
          title="Lectio"
          value={stats?.lectio.total || 0}
          subtitle={`${stats?.lectio.thisWeek || 0} tento týždeň`}
          icon={BookOpen}
          color="purple"
          href="/admin/lectio"
        />
        
        <StatCard
          title="Citáty"
          value={stats?.quotes.total || 0}
          subtitle={`${stats?.quotes.active || 0} aktívnych`}
          icon={Quote}
          color="orange"
          href="/admin/daily_quotes"
        />
      </div>

      {/* Engagement štatistiky */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatCard
          title="Celkové zobrazenia"
          value={stats?.engagement.totalViews.toLocaleString() || '0'}
          subtitle="Za posledný mesiac"
          icon={Eye}
          color="red"
          trend="up"
          trendValue="+15.3%"
        />
        
        <StatCard
          title="Páči sa mi"
          value={stats?.engagement.totalLikes.toLocaleString() || '0'}
          subtitle="Celkový počet"
          icon={Heart}
          color="pink"
          trend="up"
          trendValue="+8.7%"
        />
        
        <StatCard
          title="Priemerná angažovanosť"
          value={`${stats?.engagement.avgEngagement || 0}%`}
          subtitle="Engagement rate"
          icon={TrendingUp}
          color="green"
          trend="up"
          trendValue="+2.1%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Rýchle akcie */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Zap size={24} className="mr-2 text-yellow-500" />
              Rýchle akcie
            </h2>
          </div>
          
          <div className="space-y-4">
            <QuickAction
              title="Nový článok"
              description="Napíšte a publikujte nový článok"
              icon={Plus}
              color="green"
              href="/admin/news/new"
            />
            
            <QuickAction
              title="Pridať používateľa"
              description="Vytvorte nový používateľský účet"
              icon={Users}
              color="blue"
              href="/admin/users/new"
            />
            
            <QuickAction
              title="Nové lectio"
              description="Pridajte novú lectio divina"
              icon={BookOpen}
              color="purple"
              href="/admin/lectio/new"
            />
            
            <QuickAction
              title="Spravovať kalendár"
              description="Upravte udalosti a termíny"
              icon={Calendar}
              color="orange"
              href="/admin/calendar"
            />
          </div>
        </div>

        {/* Nedávna aktivita */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <Activity size={24} className="mr-2 text-blue-500" />
              Nedávna aktivita
            </h2>
            <Link href="/admin/activity" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Zobraziť všetko
            </Link>
          </div>
          
          <div className="space-y-2">
            <RecentActivityItem
              action="Vytvorený nový článok 'Advent 2024'"
              time="pred 2 hodinami"
              user="Admin"
              type="create"
            />
            
            <RecentActivityItem
              action="Upravené lectio 'Úvod do modlitby'"
              time="pred 4 hodinami"
              user="Editor"
              type="edit"
            />
            
            <RecentActivityItem
              action="Pridaný nový používateľ"
              time="pred 6 hodinami"
              user="Admin"
              type="create"
            />
            
            <RecentActivityItem
              action="Publikovaný článok 'Vianočná príprava'"
              time="včera"
              user="Moderátor"
              type="edit"
            />
            
            <RecentActivityItem
              action="Vymazaný nepotrebný citát"
              time="pred 2 dňami"
              user="Admin"
              type="delete"
            />
          </div>
        </div>
      </div>

      {/* Výkonnostné grafy placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <BarChart3 size={24} className="mr-2 text-green-500" />
              Mesačné štatistiky
            </h2>
          </div>
          
          <div className="h-64 bg-gradient-to-t from-green-50 to-transparent rounded-lg flex items-center justify-center border-2 border-dashed border-green-200">
            <div className="text-center text-gray-500">
              <BarChart3 size={48} className="mx-auto mb-2 text-green-300" />
              <p>Graf mesačných štatistík</p>
              <p className="text-sm">Bude implementovaný neskôr</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <PieChart size={24} className="mr-2 text-purple-500" />
              Rozdelenie obsahu
            </h2>
          </div>
          
          <div className="h-64 bg-gradient-to-t from-purple-50 to-transparent rounded-lg flex items-center justify-center border-2 border-dashed border-purple-200">
            <div className="text-center text-gray-500">
              <PieChart size={48} className="mx-auto mb-2 text-purple-300" />
              <p>Graf rozdelenia obsahu</p>
              <p className="text-sm">Bude implementovaný neskôr</p>
            </div>
          </div>
        </div>
      </div>

      {/* Systémové info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Star size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Systém je v poriadku
              </h3>
              <p className="text-gray-600">
                Všetky služby fungujú správne. Posledná aktualizácia: dnes o 14:30
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-600">Online</span>
          </div>
        </div>
      </div>
    </div>
  );
}