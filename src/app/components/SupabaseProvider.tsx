// src/app/components/SupabaseProvider.tsx
'use client'

import { createClient } from '@/app/lib/supabase/client'
import type { Session, SupabaseClient } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

type SupabaseContext = {
  supabase: SupabaseClient
  session: Session | null
  isLoading: boolean
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  const [supabase] = useState(() => createClient())
  const [currentSession, setCurrentSession] = useState<Session | null>(session)
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setCurrentSession(session)
      setIsLoading(false)
    })

    // Handle initial session check with error handling
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (error) {
        if (error.message.includes('refresh_token_not_found') || error.message.includes('Invalid Refresh Token')) {
          setCurrentSession(null)
        } else {
          console.error('Session error:', error.message)
          setCurrentSession(null)
        }
      } else {
        setCurrentSession(initialSession)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase, isMounted])

  // Počas server-side rendering a počiatočného client mount, 
  // renderuj konzistentný obsah
  if (!isMounted || isLoading) {
    return (
      <Context.Provider value={{ supabase, session: null, isLoading: true }}>
        {children}
      </Context.Provider>
    )
  }

  return (
    <Context.Provider value={{ supabase, session: currentSession, isLoading: false }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}