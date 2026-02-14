import { supabase, setGlobalDbUnavailable, supabaseStatus } from '@/lib/supabase'
import { isSupabaseTableMissing } from '@/lib/supabase-errors'

const REQUIRED_TABLES = ['users', 'user_state', 'events', 'integrations', 'deadlines', 'grades']
let healthcheckPromise: Promise<boolean> | null = null

export function checkSupabaseHealth(): Promise<boolean> {
  if (supabaseStatus.dbUnavailable) return Promise.resolve(false)
  if (healthcheckPromise) return healthcheckPromise

  healthcheckPromise = (async () => {
    for (const table of REQUIRED_TABLES) {
      const { error } = await supabase.from(table).select('id').limit(1)
      if (error && isSupabaseTableMissing(error, table)) {
        setGlobalDbUnavailable(true)
        return false
      }
    }
    return true
  })()

  return healthcheckPromise
}
