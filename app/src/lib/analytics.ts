import { supabase, setGlobalDbUnavailable, supabaseStatus } from './supabase'
import { isSupabaseTableMissing } from './supabase-errors'

export type EventType =
  | 'login'
  | 'app_open'
  | 'push_opt_in'
  | 'push_opt_out'
  | 'push_permission_denied'
  | 'push_sent'
  | 'calendar_import'
  | 'focus_block_scheduled'
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
  // Elite tier events
  | 'performance_index_viewed'
  | 'elite_upgrade_viewed'
  | 'elite_upgrade_started'
  | 'elite_upgrade_completed'
  | 'group_created'
  | 'group_joined'
  | 'group_left'
  | 'group_comparison_viewed'
  | 'weekly_snapshot_recorded'
  | 'monthly_report_generated'
  | 'breakdown_viewed'
  | 'trend_graph_viewed'

/**
 * Track user events for analytics
 * Fails silently if user not authenticated
 */
export async function trackEvent(
  eventType: EventType,
  metadata: Record<string, unknown> = {}
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

/**
 * Elite tier metrics calculation helpers
 */

/**
 * Calculate Daily Active Users (DAU)
 * Count unique users who logged in or opened the app in the last N days
 */
export async function calculateDAU(days: number = 14): Promise<number> {
  try {
    if (supabaseStatus.dbUnavailable) return 0

    const sinceDate = new Date()
    sinceDate.setDate(sinceDate.getDate() - days)

    const { data, error } = await supabase
      .from('events')
      .select('user_id')
      .in('type', ['login', 'app_open'])
      .gte('created_at', sinceDate.toISOString())

    if (error) {
      console.error('Error calculating DAU:', error)
      return 0
    }

    // Count unique user_ids
    const uniqueUsers = new Set(data?.map((event) => event.user_id) || [])
    return uniqueUsers.size
  } catch (error) {
    console.error('Error calculating DAU:', error)
    return 0
  }
}

/**
 * Calculate W1 retention (Week 1 retention)
 * Percentage of users who return 7 days after signup
 */
export async function calculateW1Retention(cohorts: number = 8): Promise<number[]> {
  try {
    if (supabaseStatus.dbUnavailable) return []

    // This is a simplified calculation
    // In production, you'd track signup dates and return rates per cohort
    // For now, return mock data structure

    const retentionRates: number[] = []

    for (let i = 0; i < cohorts; i++) {
      const cohortStartDate = new Date()
      cohortStartDate.setDate(cohortStartDate.getDate() - (i + 1) * 7)
      const cohortEndDate = new Date(cohortStartDate)
      cohortEndDate.setDate(cohortEndDate.getDate() + 1)

      // Get signups in this cohort week
      const { count: signups } = await supabase
        .from('events')
        .select('user_id', { count: 'exact', head: true })
        .eq('type', 'login')
        .gte('created_at', cohortStartDate.toISOString())
        .lt('created_at', cohortEndDate.toISOString())

      if (!signups || signups === 0) {
        retentionRates.push(0)
        continue
      }

      // Check how many returned 7 days later
      const returnDate = new Date(cohortStartDate)
      returnDate.setDate(returnDate.getDate() + 7)
      const returnEndDate = new Date(returnDate)
      returnEndDate.setDate(returnEndDate.getDate() + 1)

      const { data: returned } = await supabase
        .from('events')
        .select('user_id')
        .in('type', ['login', 'app_open'])
        .gte('created_at', returnDate.toISOString())
        .lt('created_at', returnEndDate.toISOString())

      const uniqueReturned = new Set(returned?.map((e) => e.user_id) || [])
      const retentionRate = (uniqueReturned.size / signups) * 100

      retentionRates.push(Math.round(retentionRate))
    }

    return retentionRates
  } catch (error) {
    console.error('Error calculating W1 retention:', error)
    return []
  }
}

/**
 * Calculate average Performance Index improvement rate
 * Tracks how much users' indexes improve week-over-week
 */
export async function calculateIndexImprovementRate(): Promise<number> {
  try {
    if (supabaseStatus.dbUnavailable) return 0

    // This would require weekly_snapshots data
    // For now, return placeholder
    // In production, query weekly_snapshots and calculate avg delta

    const { data, error } = await supabase.from('weekly_snapshots').select('performance_index')

    if (error || !data || data.length < 2) return 0

    // Calculate average improvement (simplified)
    // Real implementation would group by user and calculate week-over-week deltas

    return 0
  } catch (error) {
    console.error('Error calculating index improvement rate:', error)
    return 0
  }
}

/**
 * Calculate Elite conversion rate
 * Percentage of users who upgrade to Elite tier
 */
export async function calculateEliteConversionRate(): Promise<number> {
  try {
    if (supabaseStatus.dbUnavailable) return 0

    // Get total active users (logged in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: activeUsers } = await supabase
      .from('events')
      .select('user_id')
      .in('type', ['login', 'app_open'])
      .gte('created_at', thirtyDaysAgo.toISOString())

    const totalActiveUsers = new Set(activeUsers?.map((e) => e.user_id) || []).size

    if (totalActiveUsers === 0) return 0

    // Get Elite subscribers
    const { count: eliteCount } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .eq('tier', 'elite')

    const conversionRate = ((eliteCount || 0) / totalActiveUsers) * 100

    return Math.round(conversionRate * 100) / 100 // 2 decimal places
  } catch (error) {
    console.error('Error calculating Elite conversion rate:', error)
    return 0
  }
}

/**
 * Calculate group creation rate
 * Number of new groups created per week
 */
export async function calculateGroupCreationRate(weeks: number = 4): Promise<number[]> {
  try {
    if (supabaseStatus.dbUnavailable) return []

    const rates: number[] = []

    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 7)

      const { count } = await supabase
        .from('performance_groups')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekStart.toISOString())
        .lt('created_at', weekEnd.toISOString())

      rates.push(count || 0)
    }

    return rates
  } catch (error) {
    console.error('Error calculating group creation rate:', error)
    return []
  }
}

/**
 * Track Performance Index view
 */
export async function trackPerformanceIndexView(index: number, percentile?: number) {
  await trackEvent('performance_index_viewed', {
    index,
    percentile,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track Elite upgrade funnel
 */
export async function trackEliteUpgradeViewed() {
  await trackEvent('elite_upgrade_viewed', {
    timestamp: new Date().toISOString(),
  })
}

export async function trackEliteUpgradeStarted(tier: 'elite', price: number) {
  await trackEvent('elite_upgrade_started', {
    tier,
    price,
    timestamp: new Date().toISOString(),
  })
}

export async function trackEliteUpgradeCompleted(tier: 'elite', price: number) {
  await trackEvent('elite_upgrade_completed', {
    tier,
    price,
    timestamp: new Date().toISOString(),
  })
}

/**
 * Track group interactions
 */
export async function trackGroupCreated(groupId: string, groupName: string) {
  await trackEvent('group_created', {
    groupId,
    groupName,
    timestamp: new Date().toISOString(),
  })
}

export async function trackGroupJoined(groupId: string, inviteCode: string) {
  await trackEvent('group_joined', {
    groupId,
    inviteCode,
    timestamp: new Date().toISOString(),
  })
}

export async function trackGroupLeft(groupId: string) {
  await trackEvent('group_left', {
    groupId,
    timestamp: new Date().toISOString(),
  })
}
