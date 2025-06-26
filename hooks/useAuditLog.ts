// hooks/useAuditLog.ts
import { useSupabase } from '@/app/components/SupabaseProvider';
import { useCallback } from 'react';

interface AuditLogEntry {
  id?: string;
  table_name: string;
  action: string;
  action_type: 'create' | 'edit' | 'delete';
  user_email?: string;
  created_at?: string;
}

export const useAuditLog = () => {
  const { supabase } = useSupabase();
  
  // Ak váš SupabaseProvider nemá user, môžete ho získať takto:
  // const [user, setUser] = useState<any>(null);
  // useEffect(() => {
  //   if (supabase) {
  //     supabase.auth.getUser().then(({ data }) => setUser(data.user));
  //   }
  // }, [supabase]);

  const logAction = useCallback(async (entry: AuditLogEntry) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          table_name: entry.table_name,
          action: entry.action,
          action_type: entry.action_type,
          user_email: entry.user_email || 'system@app.com',
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error logging action:', error);
      }
    } catch (error) {
      console.error('Error in audit log:', error);
    }
  }, [supabase]);

  const logCreate = useCallback((tableName: string, description: string, userEmail?: string) => {
    return logAction({
      table_name: tableName,
      action: `Vytvorený: ${description}`,
      action_type: 'create',
      user_email: userEmail
    });
  }, [logAction]);

  const logEdit = useCallback((tableName: string, description: string, userEmail?: string) => {
    return logAction({
      table_name: tableName,
      action: `Upravený: ${description}`,
      action_type: 'edit',
      user_email: userEmail
    });
  }, [logAction]);

  const logDelete = useCallback((tableName: string, description: string, userEmail?: string) => {
    return logAction({
      table_name: tableName,
      action: `Vymazaný: ${description}`,
      action_type: 'delete',
      user_email: userEmail
    });
  }, [logAction]);

  return {
    logAction,
    logCreate,
    logEdit,
    logDelete
  };
};