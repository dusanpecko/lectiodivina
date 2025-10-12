import { useState, useEffect } from 'react';
import { useSupabase } from '../app/components/SupabaseProvider';

export interface UserRole {
  role: string | null;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isUser: boolean;
  isEditor: boolean;
  isModerator: boolean;
}

export function useUserRole(): UserRole {
  const { supabase, session } = useSupabase();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!session?.user?.email) {
        setRole(null);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("email", session.user.email)
          .maybeSingle();

        if (userError) {
          throw new Error(`Chyba pri načítavaní roly: ${userError.message}`);
        }

        if (userData) {
          setRole(userData.role || 'user');
        } else {
          setRole('user'); // Predvolená rola ak používateľ nie je v databáze
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setError(err instanceof Error ? err.message : 'Neznáma chyba');
        setRole('user'); // Fallback na user rolu
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [session, supabase]);

  return {
    role,
    loading,
    error,
    isAdmin: role === 'admin',
    isUser: role === 'user',
    isEditor: role === 'editor',
    isModerator: role === 'moderator',
  };
}