import { supabase, setGlobalDbUnavailable, supabaseStatus } from './supabase'
import { isSupabaseTableMissing } from './supabase-errors'

export type EventType =
  | 'login'
  | 'app_open'
  | 'push_opt_in'
  | 'push_opt_out'
  | 'push_permission_denied'
  | 'push_sent'
  | 'focus_started'
  | 'focus_completed'
  | 'deadline_added'
  | 'deadline_completed'
  | 'daily_objective_completed'
  | 'all_daily_objectives_completed'
  | 'weekly_challenge_completed'
  | 'weekly_challenge_viewed'
  | 'percentile_viewed'
  | 'level_up'
  | 'demo_data_loaded'
  | 'data_reset'

/**
 * Track user events for analytics
 * Fails silently if user not authenticated
 */
export async function trackEvent(
  eventType: EventType,
  metadata: Record<string, any> = {}
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      // Don't track events for unauthenticated users
      return
    }

    if (supabaseStatus.dbUnavailable) return

    const { error } = await supabase.from('events').insert({
      user_id: user.id,
      type: eventType,
      metadata,
      created_at: new Date().toISOString(),
    })
    if (error && isSupabaseTableMissing(error, 'events')) {
      setGlobalDbUnavailable(true)
      return
    }
  } catch (error) {
    // Fail silently - don't block user actions due to analytics errors
    console.error('Analytics error:', error)
  }
}

/**
 * Get event count for a specific type
 */
export async function getEventCount(eventType: EventType): Promise<number> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return 0

    if (supabaseStatus.dbUnavailable) return 0

    const { count, error } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('type', eventType)

    if (error && isSupabaseTableMissing(error, 'events')) {
      setGlobalDbUnavailable(true)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Error fetching event count:', error)
    return 0
  }
}
