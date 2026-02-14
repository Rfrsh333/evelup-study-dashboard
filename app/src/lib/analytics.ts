import { supabase } from './supabase'

export type EventType =
  | 'login'
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

    await supabase.from('events').insert({
      user_id: user.id,
      event_type: eventType,
      metadata,
      timestamp: new Date().toISOString(),
    })
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

    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('event_type', eventType)

    return count || 0
  } catch (error) {
    console.error('Error fetching event count:', error)
    return 0
  }
}
