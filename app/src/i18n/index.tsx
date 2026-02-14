import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { nl } from './nl'
import { en } from './en'
import { supabase, isSupabaseConfigured, setGlobalDbUnavailable, supabaseStatus } from '@/lib/supabase'
import { isSupabaseTableMissing } from '@/lib/supabase-errors'

export type Language = 'nl' | 'en'

const translations: Record<Language, any> = { nl, en }

interface I18nContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
  ready: boolean
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)
const STORAGE_KEY = 'levelup-language'

function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.')
  let value = obj

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return path
    }
  }

  return typeof value === 'string' ? value : path
}

function replacePlaceholders(text: string, params?: Record<string, string | number>): string {
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (match, key) => (key in params ? String(params[key]) : match))
}

function isValidLanguage(v: any): v is Language {
  return v === 'nl' || v === 'en'
}

function loadLocalLanguage(): Language | null {
  const stored = localStorage.getItem(STORAGE_KEY)
  return isValidLanguage(stored) ? stored : null
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => loadLocalLanguage() ?? 'nl')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadLanguage() {
      try {
        // Always have a usable local fallback immediately
        const local = loadLocalLanguage()
        if (local && !cancelled) setLanguageState(local)

        // If Supabase not configured or DB unavailable, we stay in local mode
        if (!isSupabaseConfigured || supabaseStatus.dbUnavailable) return

        const { data: authData, error: authErr } = await supabase.auth.getUser()
        if (authErr) throw authErr

        const user = authData?.user
        if (!user) return

        const defaultLanguage = isValidLanguage(local ?? 'nl') ? (local as Language) : 'nl'

        const { error: upsertError } = await supabase
          .from('users')
          .upsert(
            {
              id: user.id,
              email: user.email ?? null,
              preferred_language: defaultLanguage,
            },
            { onConflict: 'id' }
          )

        if (upsertError) {
          if (isSupabaseTableMissing(upsertError, 'users')) {
            setGlobalDbUnavailable(true)
            return
          }
          console.warn('User upsert (non-fatal):', upsertError)
        }

        // ✅ maybeSingle prevents 406 when the row doesn't exist yet
        const { data, error } = await supabase
          .from('users')
          .select('preferred_language')
          .eq('id', user.id)
          .maybeSingle()

        if (error) {
          if (isSupabaseTableMissing(error, 'users')) {
            setGlobalDbUnavailable(true)
            return
          }
          // Non-fatal: row might not exist yet
          console.warn('Language preference fetch (non-fatal):', error)
          return
        }

        if (data?.preferred_language && isValidLanguage(data.preferred_language)) {
          if (!cancelled) {
            setLanguageState(data.preferred_language)
            localStorage.setItem(STORAGE_KEY, data.preferred_language)
          }
        }
      } catch (error) {
        console.error('Error loading language preference:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadLanguage()
    return () => {
      cancelled = true
    }
  }, [])

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)

    try {
      if (!isSupabaseConfigured || supabaseStatus.dbUnavailable) return

      const { data: authData, error: authErr } = await supabase.auth.getUser()
      if (authErr) throw authErr

      const user = authData?.user
      if (!user) return

      // ✅ upsert ensures the users row exists (fixes "no rows" forever)
      const { error } = await supabase
        .from('users')
        .upsert({ id: user.id, preferred_language: lang }, { onConflict: 'id' })

      if (error) {
        if (isSupabaseTableMissing(error, 'users')) {
          setGlobalDbUnavailable(true)
          return
        }
        console.warn('Error saving language preference (non-fatal):', error)
      }
    } catch (error) {
      console.error('Error saving language preference:', error)
    }
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    const translation = getNestedValue(translations[language], key)
    return replacePlaceholders(translation, params)
  }

  const value: I18nContextValue = {
    language,
    setLanguage,
    t,
    ready: !loading,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    if (import.meta.env.DEV) {
      throw new Error('useI18n must be used within I18nProvider')
    }
    return {
      language: 'nl' as Language,
      setLanguage: () => {},
      t: (key: string) => key,
      ready: true,
    }
  }
  return context
}

export function useTranslation() {
  const { t, ready } = useI18n()
  return { t, ready }
}
