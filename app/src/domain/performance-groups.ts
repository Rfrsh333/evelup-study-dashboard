/**
 * Performance Groups domain logic (Elite tier feature)
 *
 * Pure functions for:
 * - Calculating group rankings from weekly snapshots
 * - Determining member trends
 * - Building comparison views
 */

import { startOfWeek, subWeeks, format } from 'date-fns'
import type {
  WeeklySnapshot,
  GroupMemberWithStats,
  GroupComparison,
  PerformanceGroup,
} from './types'

/**
 * Calculate current week start (Monday)
 */
export function getCurrentWeekStart(): Date {
  return startOfWeek(new Date(), { weekStartsOn: 1 })
}

/**
 * Calculate previous week start
 */
export function getPreviousWeekStart(): Date {
  return subWeeks(getCurrentWeekStart(), 1)
}

/**
 * Format week start for display
 */
export function formatWeekStart(weekStart: Date): string {
  return format(weekStart, 'MMM d, yyyy')
}

/**
 * Determine trend direction based on index change
 */
export function calculateTrend(
  currentIndex: number,
  previousIndex?: number
): 'up' | 'down' | 'stable' {
  if (!previousIndex) return 'stable'

  const delta = currentIndex - previousIndex
  if (delta > 2) return 'up'
  if (delta < -2) return 'down'
  return 'stable'
}

/**
 * Calculate rankings from weekly snapshots
 * Returns members sorted by performance index (highest first)
 */
export function calculateGroupRankings(
  currentWeekSnapshots: WeeklySnapshot[],
  previousWeekSnapshots: WeeklySnapshot[]
): GroupMemberWithStats[] {
  // Create a map of previous week indices for trend calculation
  const previousIndexMap = new Map<string, number>()
  previousWeekSnapshots.forEach((snapshot) => {
    previousIndexMap.set(snapshot.userId, snapshot.performanceIndex)
  })

  // Sort current snapshots by performance index (descending)
  const sorted = [...currentWeekSnapshots].sort(
    (a, b) => b.performanceIndex - a.performanceIndex
  )

  // Build member stats with rankings
  return sorted.map((snapshot, index) => {
    const previousIndex = previousIndexMap.get(snapshot.userId)
    const trend = calculateTrend(snapshot.performanceIndex, previousIndex)

    return {
      userId: snapshot.userId,
      rank: index + 1, // 1-based ranking
      currentIndex: snapshot.performanceIndex,
      previousIndex,
      trend,
      joinedAt: new Date(), // Will be populated from group_members in real data
    }
  })
}

/**
 * Build group comparison view for UI
 */
export function buildGroupComparison(
  group: PerformanceGroup,
  currentUserId: string,
  currentWeekSnapshots: WeeklySnapshot[],
  previousWeekSnapshots: WeeklySnapshot[]
): GroupComparison {
  const weekStart = getCurrentWeekStart()
  const members = calculateGroupRankings(currentWeekSnapshots, previousWeekSnapshots)

  // Find user's rank
  const userMember = members.find((m) => m.userId === currentUserId)
  const yourRank = userMember?.rank ?? members.length + 1

  return {
    groupId: group.id,
    groupName: group.name,
    weekStart,
    members,
    yourRank,
    totalMembers: members.length,
  }
}

/**
 * Validate invite code format
 * Invite codes are 8 characters: uppercase letters and numbers (no ambiguous chars)
 */
export function isValidInviteCode(code: string): boolean {
  const pattern = /^[A-Z2-9]{8}$/
  return pattern.test(code)
}

/**
 * Get user's percentile within group
 * Returns percentile (0-100) based on how many members user outperforms
 */
export function calculateGroupPercentile(
  userId: string,
  snapshots: WeeklySnapshot[]
): number | null {
  if (snapshots.length <= 1) return null

  const userSnapshot = snapshots.find((s) => s.userId === userId)
  if (!userSnapshot) return null

  const userIndex = userSnapshot.performanceIndex
  const lowerScores = snapshots.filter((s) => s.performanceIndex < userIndex).length

  return Math.round((lowerScores / snapshots.length) * 100)
}

/**
 * Get top N performers from snapshots
 */
export function getTopPerformers(
  snapshots: WeeklySnapshot[],
  limit: number = 3
): WeeklySnapshot[] {
  return [...snapshots]
    .sort((a, b) => b.performanceIndex - a.performanceIndex)
    .slice(0, limit)
}

/**
 * Check if user can join more groups (Elite tier limit)
 * Free tier: 0 groups
 * Elite tier: 5 groups max
 */
export function canJoinMoreGroups(currentGroupCount: number, tier: 'free' | 'elite'): boolean {
  if (tier === 'free') return false
  return currentGroupCount < 5
}

/**
 * Generate performance message for group comparison
 */
export function getGroupPerformanceMessage(
  rank: number,
  totalMembers: number,
  trend: 'up' | 'down' | 'stable'
): string {
  const percentile = Math.round(((totalMembers - rank) / totalMembers) * 100)

  if (rank === 1) {
    return `Leading the group. Maintain this position.`
  }

  if (percentile >= 80 && trend === 'up') {
    return `Top ${100 - percentile}% in group. Strong upward trajectory.`
  }

  if (percentile >= 50 && trend === 'down') {
    return `You dropped ${rank - 1} places. Recover your position.`
  }

  if (percentile >= 50) {
    return `Above group average. Keep pushing.`
  }

  if (trend === 'down') {
    return `Below group average. Immediate action required.`
  }

  return `Ranked ${rank} of ${totalMembers}. Room for improvement.`
}
