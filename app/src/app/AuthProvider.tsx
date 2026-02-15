/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase, isSupabaseConfigured, setGlobalDbUnavailable, supabaseStatus } from '@/lib/supabase'
import { isSupabaseTableMissing } from '@/lib/supabase-errors'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<number | undefined>(undefined)
  const isE2E = import.meta.env.VITE_E2E === 'true' || Boolean((window as Window & { Cypress?: unknown }).Cypress)

  useEffect(() => {
    if (isE2E) {
      const mockUser = {
        id: 'e2e-user',
        email: 'e2e@levelup.test',
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User
      setUser(mockUser)
      setSession({ user: mockUser } as Session)
      setLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    let resolved = false

    if (import.meta.env.DEV) console.debug('Auth init start')

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      setLoading(false)
      if (import.meta.env.DEV) console.debug('Auth loading false')
      return
    }

    timeoutRef.current = window.setTimeout(() => {
      if (cancelled || resolved) return
      setError('Auth initialization timed out')
      setLoading(false)
      if (import.meta.env.DEV) console.debug('Auth loading false')
    }, 2500)

    // Get initial session
    const loadSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (cancelled) return
        if (import.meta.env.DEV) console.debug('Auth session received')
        setSession(session)
        setUser(session?.user ?? null)
        setError(null)
      } catch {
        if (cancelled) return
        setError('Failed to load auth session')
      } finally {
        if (!cancelled) {
          resolved = true
          setLoading(false)
          if (import.meta.env.DEV) console.debug('Auth loading false')
        }
      }
    }

    loadSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (import.meta.env.DEV) console.debug('Auth session received')
      setSession(session)
      setUser(session?.user ?? null)
      setError(null)
      setLoading(false)
    })

    return () => {
      cancelled = true
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current)
      subscription.unsubscribe()
    }
  }, [isE2E])

  const signIn = async (email: string, password: string) => {
    try {
      if (isE2E) {
        return { error: null }
      }
      if (!isSupabaseConfigured) {
        return { error: new Error('Supabase is not configured') }
      }
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (!error && data.user && !supabaseStatus.dbUnavailable) {
        // Track login event
        const { error: eventError } = await supabase.from('events').insert({
          user_id: data.user.id,
          type: 'login',
          created_at: new Date().toISOString(),
        })
        if (eventError && isSupabaseTableMissing(eventError, 'events')) {
          setGlobalDbUnavailable(true)
        }
      }
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      if (isE2E) {
        return { error: null }
      }
      if (!isSupabaseConfigured) {
        return { error: new Error('Supabase is not configured') }
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    if (isE2E) return
    if (!isSupabaseConfigured) return
    await supabase.auth.signOut()
  }

  const value: AuthContextValue = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
