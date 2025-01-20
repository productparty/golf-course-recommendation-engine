import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, Session } from '@supabase/supabase-js'

const supabase = createClient(
  "https://nkknwkentrbbyzgqgpfd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra253a2VudHJiYnl6Z3FncGZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMzA4MzYsImV4cCI6MjA1MjgwNjgzNn0.OyizXugP02ciUdXTOWxfTrp1HwsMgBM7FyeJ8le0_mM"
)

export const AuthContext = createContext<{
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}>({
  session: null,
  loading: true,
  signOut: async () => {}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, loading, signOut }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
