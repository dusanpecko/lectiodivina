'use client';

import { useLanguage } from '@/app/components/LanguageProvider';
import { useSupabase } from '@/app/components/SupabaseProvider';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Flag
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminTranslations } from '../translations';

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'navrhy' | 'vyvoj' | 'testovanie' | 'hotove';
  priority: 'low' | 'medium' | 'high';
  assignee: string | null;
  due_date: string | null;
  created_at: string;
}

const priorityColors = {
  high: 'bg-red-100 text-red-800 border-red-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  low: 'bg-green-100 text-green-800 border-green-200'
};

export default function TasksDashboardWidget() {
  const { session } = useSupabase();
  const { lang } = useLanguage();
  const t = adminTranslations[lang];
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const priorityLabels = {
    high: t.priorityHigh,
    medium: t.priorityMedium,
    low: t.priorityLow
  };

  const statusLabels = {
    navrhy: t.statusProposal,
    vyvoj: t.statusDevelopment,
    testovanie: t.statusTesting,
    hotove: t.statusDone
  };

  useEffect(() => {
    if (session) {
      fetchTasks();
    }
  }, [session]);



  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const data = await response.json();
        console.log('📋 All tasks from API:', data);
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get current user email from session
  const currentUserEmail = session?.user?.email || null;

  // Filtruje úlohy pre aktuálne prihláseného používateľa
  const myTasks = tasks.filter(task => 
    task.assignee === currentUserEmail && task.status !== 'hotove'
  );

  // Debug logging
  console.log('🎯 Filter debug:');
  console.log('- Current user email:', currentUserEmail);
  console.log('- All tasks:', tasks.length);
  console.log('- Tasks with assignees:', tasks.filter(t => t.assignee).map(t => ({ title: t.title, assignee: t.assignee, status: t.status })));
  console.log('- My filtered tasks:', myTasks.length);

  // Získa počet úloh podľa priority a dátumu
  const getTaskStats = () => {
    const now = new Date();
    const overdue = myTasks.filter(task => {
      if (!task.due_date) return false;
      return new Date(task.due_date) < now;
    });

    const urgent = myTasks.filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue >= 0 && daysUntilDue <= 3; // Urgent ak je do 3 dní
    });

    const high = myTasks.filter(task => task.priority === 'high');

    return { overdue, urgent, high, total: myTasks.length };
  };

  const stats = getTaskStats();

  // Funkcia na formátovanie dátumu
  const formatDate = (dateString: string | null) => {
    if (!dateString) return t.noDueDate;
    const date = new Date(dateString);
    const locale = lang === 'sk' ? 'sk-SK' : lang === 'cz' ? 'cs-CZ' : lang === 'en' ? 'en-US' : 'es-ES';
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
  };

  // Funkcia na zistenie, či je úloha neskoro alebo blízko termínu
  const getUrgencyStatus = (dueDate: string | null) => {
    if (!dueDate) return null;
    
    const now = new Date();
    const due = new Date(dueDate);
    const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return 'overdue'; // Neskoro
    if (daysUntil <= 3) return 'urgent'; // Urgentné (do 3 dní)
    return 'normal';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Ak používateľ nemá pridelené žiadne úlohy
  if (myTasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{t.myTasks}</h2>
          <button
            onClick={() => router.push('/admin/tasks')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
          >
            <span>{t.showAll}</span>
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="text-center py-12">
          <CheckCircle2 size={48} className="mx-auto text-green-500 mb-3" />
          <p className="text-gray-600 text-lg font-medium">{t.noAssignedTasks}</p>
          <p className="text-gray-400 text-sm mt-2">{t.greatWork}</p>
          
          {/* Debug info */}
          <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-left">
            <p><strong>Debug:</strong></p>
            <p>Email: {currentUserEmail || 'Nie je prihlásený'}</p>
            <p>Celkovo taskov: {tasks.length}</p>
            <p>Moje tasky: {myTasks.length}</p>
            {tasks.length > 0 && (
              <div>
                <p>Zoznam všetkých taskov:</p>
                <ul>
                  {tasks.map(t => (
                    <li key={t.id} className="ml-2">
                      • {t.title} (priradené: {t.assignee || 'nikto'}, status: {t.status})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const topTasks = myTasks.slice(0, 5); // Zobraz prvých 5 úloh

  return (
    <div className="bg-white rounded-xl shadow-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{t.myTasks}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {t.have} {stats.total} {stats.total === 1 ? t.assignedTask : stats.total < 5 ? t.assignedTasks2to4 : t.assignedTasks5plus}
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/tasks')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1 transition-colors"
        >
          <span>{t.showAll}</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Štatistiky - Upozornenia */}
      {(stats.overdue.length > 0 || stats.urgent.length > 0 || stats.high.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {/* Neskoro */}
          {stats.overdue.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="text-red-600" size={24} />
                <div>
                  <p className="text-sm font-medium text-red-900">{t.overdue}</p>
                  <p className="text-2xl font-bold text-red-600">{stats.overdue.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Urgentné */}
          {stats.urgent.length > 0 && (
            <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Clock className="text-orange-600" size={24} />
                <div>
                  <p className="text-sm font-medium text-orange-900">{t.urgentDays}</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.urgent.length}</p>
                </div>
              </div>
            </div>
          )}

          {/* Vysoká priorita */}
          {stats.high.length > 0 && (
            <div className="bg-purple-50 border-l-4 border-purple-500 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Flag className="text-purple-600" size={24} />
                <div>
                  <p className="text-sm font-medium text-purple-900">{t.highPriority}</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.high.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Zoznam úloh */}
      <div className="space-y-3">
        {topTasks.map(task => {
          const urgency = getUrgencyStatus(task.due_date);
          
          return (
            <div
              key={task.id}
              className={`
                p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md
                ${urgency === 'overdue' ? 'bg-red-50 border-red-300' : ''}
                ${urgency === 'urgent' ? 'bg-orange-50 border-orange-300' : ''}
                ${urgency === 'normal' || urgency === null ? 'bg-gray-50 border-gray-200' : ''}
              `}
              onClick={() => router.push('/admin/tasks')}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{task.title}</h3>
                    {urgency === 'overdue' && (
                      <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-medium">
                        {t.overdueLabel}
                      </span>
                    )}
                    {urgency === 'urgent' && (
                      <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-medium">
                        {t.urgentLabel}
                      </span>
                    )}
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center space-x-4 text-sm">
                    {/* Priorita */}
                    <span className={`px-2 py-1 rounded-md border text-xs font-medium ${priorityColors[task.priority]}`}>
                      {priorityLabels[task.priority]}
                    </span>

                    {/* Status */}
                    <span className="text-gray-600">
                      {statusLabels[task.status]}
                    </span>

                    {/* Termín */}
                    {task.due_date && (
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Calendar size={14} />
                        <span className={urgency === 'overdue' ? 'text-red-600 font-semibold' : ''}>
                          {formatDate(task.due_date)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer - ak je viac ako 5 úloh */}
      {myTasks.length > 5 && (
        <div className="mt-4 pt-4 border-t border-gray-200 text-center">
          <button
            onClick={() => router.push('/admin/tasks')}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            + {t.showMore} {myTasks.length - 5} {myTasks.length - 5 === 1 ? t.taskWord : t.tasksWord}
          </button>
        </div>
      )}
    </div>
  );
}
