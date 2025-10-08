// app/components/AuditLogViewer.tsx
import React, { useEffect, useState } from 'react';
import { useSupabase } from '@/app/components/SupabaseProvider';
import { useLanguage } from '@/app/components/LanguageProvider';
import { auditLogViewerTranslations } from './auditLogViewerTranslations';
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  FileText, 
  BookOpen, 
  Quote 
} from 'lucide-react';

interface AuditLogEntry {
  id: string;
  table_name: string;
  action: string;
  action_type: 'create' | 'edit' | 'delete';
  user_email: string;
  created_at: string;
}

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'create': 
      return <Plus size={16} className="text-green-600" />;
    case 'edit': 
      return <Edit size={16} className="text-blue-600" />;
    case 'delete': 
      return <Trash2 size={16} className="text-red-600" />;
    default: 
      return <Activity size={16} className="text-gray-600" />;
  }
};

const getTableIcon = (tableName: string) => {
  switch (tableName) {
    case 'users': 
      return <User size={16} className="text-blue-500" />;
    case 'news': 
      return <FileText size={16} className="text-green-500" />;
    case 'lectio': 
      return <BookOpen size={16} className="text-purple-500" />;
    case 'daily_quotes': 
      return <Quote size={16} className="text-orange-500" />;
    default: 
      return <Activity size={16} className="text-gray-500" />;
  }
};

const getActionColor = (actionType: string) => {
  switch (actionType) {
    case 'create': 
      return 'bg-green-100 text-green-800 border-green-200';
    case 'edit': 
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'delete': 
      return 'bg-red-100 text-red-800 border-red-200';
    default: 
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatTimeAgo = (dateString: string, lang: string): string => {
  const t = auditLogViewerTranslations[lang];
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return t.time.just_now;
  if (diffInMinutes < 60) return t.time.minutes_ago.replace('${minutes}', diffInMinutes.toString());
  if (diffInHours < 24) return t.time.hours_ago.replace('${hours}', diffInHours.toString());
  if (diffInDays === 1) return t.time.yesterday;
  if (diffInDays < 7) return t.time.days_ago.replace('${days}', diffInDays.toString());
  return date.toLocaleDateString(t.locale);
};

interface AuditLogViewerProps {
  limit?: number;
  tableName?: string;
  className?: string;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ 
  limit = 10, 
  tableName, 
  className = '' 
}) => {
  const { supabase } = useSupabase();
  const { lang } = useLanguage();
  const t = auditLogViewerTranslations[lang];
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!supabase) return;

      try {
        let query = supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (tableName) {
          query = query.eq('table_name', tableName);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Error fetching audit logs:', error);
        } else {
          setLogs(data || []);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [supabase, limit, tableName]);

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <Activity size={48} className="mx-auto mb-2 text-gray-300" />
        <p>{t.empty_state.no_activities}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {logs.map((log) => (
        <div
          key={log.id}
          className="flex items-start space-x-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          <div className="flex-shrink-0 mt-1">
            {getTableIcon(log.table_name)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900 truncate">
                {log.action}
              </p>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action_type)}`}>
                  {getActionIcon(log.action_type)}
                  <span className="ml-1 capitalize">{log.action_type}</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">
                {log.user_email}
              </p>
              <p className="text-xs text-gray-400">
                {formatTimeAgo(log.created_at, lang)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Príklad použitia v komponente
export const ExampleUsage: React.FC = () => {
  const { lang } = useLanguage();
  const t = auditLogViewerTranslations[lang];
  
  return (
    <div>
      {/* Zobrazenie nedávnych aktivít */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">{t.examples.recent_activities}</h3>
        <AuditLogViewer limit={5} />
      </div>
      
      {/* Zobrazenie len aktivít pre články */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">{t.examples.article_activities}</h3>
        <AuditLogViewer limit={10} tableName="news" />
      </div>
    </div>
  );
};