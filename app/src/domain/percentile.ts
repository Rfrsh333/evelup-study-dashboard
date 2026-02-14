import { supabase } from '@/lib/supabase'
import { startOfWeek } from 'date-fns'

/**
 * Calculate user's percentile for this week
 * Returns 0-100 where 100 is the best
 *
 * Strategy: Compare user's score against all active users this week
 * Active user = user who has logged activity this week
 */
export async function calculatePercentile(userScore: number): Promise<number | undefined> {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return undefined // Not authenticated
    }

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

    // Fetch all user scores for this week from user_state
    // This is a simplified approach - in production, you'd want a materialized view or RPC
    const { data: userStates, error } = await supabase
      .from('user_state')
      .select('state')
      .not('state', 'is', null)

    if (error || !userStates || userStates.length === 0) {
      // If we can't fetch data, return undefined (beta estimate mode)
      return undefined
    }

    // Extract momentum scores from all users
    const scores: number[] = []

    for (const userState of userStates) {
      try {
        const state = typeof userState.state === 'string'
          ? JSON.parse(userState.state)
          : userState.state

        // Calculate or extract momentum score
        // For now, we'll use a simplified approach
        // In production, you'd recalculate momentum for each user
        if (state && typeof state === 'object') {
          // Simple heuristic: use study logs and focus sessions as proxy
          const studyLogs = state.studyLogs || []
          const focusSessions = state.focusSessions || []

          // Calculate simple week score (not perfect, but works for MVP)
          const weekMinutes = studyLogs
            .filter((log: any) => new Date(log.date) >= weekStart)
            .reduce((sum: number, log: any) => sum + (log.minutes || 0), 0)

          const weekSessions = focusSessions
            .filter((session: any) => new Date(session.startTime) >= weekStart && session.completed)
            .length

          // Simple score: normalize minutes to 0-60 and sessions to 0-40
          const minutesScore = Math.min(weekMinutes / 2, 60) // Cap at 120 minutes = 60 points
          const sessionsScore = Math.min(weekSessions * 8, 40) // Cap at 5 sessions = 40 points

          scores.push(minutesScore + sessionsScore)
        }
      } catch (e) {
        // Skip malformed states
        continue
      }
    }

    if (scores.length < 2) {
      // Not enough data for percentile
      return undefined
    }

    // Calculate percentile: how many scores are below the user's score
    const scoresBelow = scores.filter(s => s < userScore).length
    const percentile = Math.round((scoresBelow / scores.length) * 100)

    return percentile

  } catch (error) {
    console.error('Error calculating percentile:', error)
    return undefined
  }
}

/**
 * Get percentile badge tier
 */
export function getPercentileBadge(percentile: number): 'top10' | 'top25' | 'top50' | null {
  if (percentile >= 90) return 'top10'
  if (percentile >= 75) return 'top25'
  if (percentile >= 50) return 'top50'
  return null
}
