import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { nl } from './nl'
import { en } from './en'
import { supabase, isSupabaseConfigured, setGlobalDbUnavailable, supabaseStatus } from '@/lib/supabase'
import { isSupabaseTableMissing } from '@/lib/supabase-errors'

export type Language = 'nl' | 'en'

const translations: Record<Language, any> = {
  nl,
  en,
}

interface I18nContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
  ready: boolean
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

const STORAGE_KEY = 'levelup-language'

/**
 * Get nested translation value from key path (e.g., 'momentum.title')
 */
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.')
  let value = obj

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key]
    } else {
      return path // Return key if not found
    }
  }

  return typeof value === 'string' ? value : path
}

/**
 * Replace placeholders in translation string
 * Example: "Top {percentile}% this week" with { percentile: 25 } => "Top 25% this week"
 */
function replacePlaceholders(text: string, params?: Record<string, string | number>): string {
  if (!params) return text

  return text.replace(/\{(\w+)\}/g, (match, key) => {
    return key in params ? String(params[key]) : match
  })
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('nl')
  const [loading, setLoading] = useState(true)

  // Load language preference on mount
  useEffect(() => {
    async function loadLanguage() {
      try {
        // Try to get from Supabase user profile first
        if (!isSupabaseConfigured || supabaseStatus.dbUnavailable) {
          return
        }

        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
          const { data, error } = await supabase
            .from('users')
            .select('preferred_language')
            .eq('id', user.id)
            .single()

          if (error) {
            if (isSupabaseTableMissing(error, 'users')) {
              setGlobalDbUnavailable(true)
              return
            }
            throw error
          }

          if (data?.preferred_language) {
            setLanguageState(data.preferred_language as Language)
            setLoading(false)
            return
          }
        }

        // Fallback to localStorage
        const stored = localStorage.getItem(STORAGE_KEY) as Language | null
        if (stored && (stored === 'nl' || stored === 'en')) {
          setLanguageState(stored)
        }
      } catch (error) {
        console.error('Error loading language preference:', error)
      } finally {
        setLoading(false)
      }
    }

    loadLanguage()
  }, [])

  // Set language and persist
  const setLanguage = async (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)

    // Try to save to Supabase if authenticated
    try {
      if (!isSupabaseConfigured || supabaseStatus.dbUnavailable) return

      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { error } = await supabase
          .from('users')
          .update({ preferred_language: lang })
          .eq('id', user.id)
        if (error && isSupabaseTableMissing(error, 'users')) {
          setGlobalDbUnavailable(true)
        }
      }
    } catch (error) {
      console.error('Error saving language preference:', error)
    }
  }

  // Translation function
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

// Shorthand hook for just the t function
export function useTranslation() {
  const { t, ready } = useI18n()
  return { t, ready }
}
