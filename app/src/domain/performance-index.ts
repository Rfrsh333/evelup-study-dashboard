/**
 * Performance Index (0-100) - Elite Academic Performance Optimizer
 *
 * Calculation breakdown:
 * - Grade progression: 40%
 * - Block completion rate: 20%
 * - Focus consistency: 15%
 * - Deadline adherence: 15%
 * - Weekly streak: 10%
 *
 * This is the primary metric for the Elite tier positioning.
 */

import { startOfWeek, subWeeks } from 'date-fns'
import type {
  Assessment,
  SchoolDeadline,
  FocusSession,
  StudyLog,
  StreakState,
} from './types'

// Performance Index weights (must sum to 100%)
const WEIGHTS = {
  GRADE_PROGRESSION: 0.40, // 40%
  BLOCK_COMPLETION: 0.20, // 20%
  FOCUS_CONSISTENCY: 0.15, // 15%
  DEADLINE_ADHERENCE: 0.15, // 15%
  WEEKLY_STREAK: 0.10, // 10%
} as const

// Target values for normalization
const TARGETS = {
  TARGET_AVERAGE: 7.0, // Target grade average
  FOCUS_SESSIONS_PER_WEEK: 5,
  STUDY_DAYS_PER_WEEK: 5,
  MAX_STREAK_DAYS: 7,
} as const

export interface PerformanceIndexBreakdown {
  gradeProgression: number // 0-100
  blockCompletion: number // 0-100
  focusConsistency: number // 0-100
  deadlineAdherence: number // 0-100
  weeklyStreak: number // 0-100
}

export interface PerformanceIndex {
  index: number // 0-100 (weighted total)
  breakdown: PerformanceIndexBreakdown
  trend: PerformanceTrend
  targetAverage: number
  scoreGap: number // How far from target average
}

export interface PerformanceTrend {
  deltaIndex: number // Change in index
  deltaPercentage: number // Percentage change
  direction: 'up' | 'down' | 'stable'
  weekComparison: string // "vs last week"
}

/**
 * Calculate grade progression score (0-100)
 * Based on current weighted average and trajectory toward target
 */
export function calculateGradeProgression(assessments: Assessment[]): number {
  const completedAssessments = assessments.filter((a) => a.score !== null && a.score > 0)

  if (completedAssessments.length === 0) {
    return 50 // Neutral score if no data
  }

  // Calculate weighted average
  const totalWeight = completedAssessments.reduce((sum, a) => sum + (a.weight || 1), 0)
  const weightedSum = completedAssessments.reduce(
    (sum, a) => sum + (a.score || 0) * (a.weight || 1),
    0
  )
  const currentAverage = weightedSum / totalWeight

  // Normalize to 0-100 scale
  // 10.0 grade = 100 points, 5.5 (passing) = 55 points
  const normalized = (currentAverage / 10) * 100

  // Bonus for being above target
  const targetBonus = currentAverage >= TARGETS.TARGET_AVERAGE ? 10 : 0

  return Math.min(normalized + targetBonus, 100)
}

/**
 * Calculate block completion rate (0-100)
 * Based on percentage of blocks with passed assessments
 */
export function calculateBlockCompletion(assessments: Assessment[]): number {
  // Group by block
  const blockMap = new Map<string, Assessment[]>()
  assessments.forEach((a) => {
    const blockId = a.blockId || 'default'
    if (!blockMap.has(blockId)) {
      blockMap.set(blockId, [])
    }
    blockMap.get(blockId)?.push(a)
  })

  if (blockMap.size === 0) {
    return 50 // Neutral if no blocks
  }

  // Count blocks with at least one passed assessment
  let completedBlocks = 0
  blockMap.forEach((blockAssessments) => {
    const hasPassed = blockAssessments.some((a) => a.status === 'passed' && a.score !== null)
    if (hasPassed) completedBlocks++
  })

  return (completedBlocks / blockMap.size) * 100
}

/**
 * Calculate focus consistency score (0-100)
 * Based on completed focus sessions this week
 */
export function calculateFocusConsistency(
  focusSessions: FocusSession[],
  weekStart?: Date
): number {
  const start = weekStart || startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekEnd = new Date(start)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const weekSessions = focusSessions.filter((session) => {
    const sessionDate = new Date(session.startTime)
    return session.completed && sessionDate >= start && sessionDate < weekEnd
  })

  const cappedSessions = Math.min(weekSessions.length, TARGETS.FOCUS_SESSIONS_PER_WEEK)
  return (cappedSessions / TARGETS.FOCUS_SESSIONS_PER_WEEK) * 100
}

/**
 * Calculate deadline adherence score (0-100)
 * Based on percentage of deadlines that are on-track or completed
 */
export function calculateDeadlineAdherence(deadlines: SchoolDeadline[]): number {
  const activeDeadlines = deadlines.filter(
    (d) => d.status !== 'failed' && new Date(d.deadline) > new Date()
  )

  if (activeDeadlines.length === 0) {
    return 100 // Perfect score if no active deadlines
  }

  const onTrackOrCompleted = activeDeadlines.filter(
    (d) => d.status === 'on-track' || d.status === 'completed'
  ).length

  return (onTrackOrCompleted / activeDeadlines.length) * 100
}

/**
 * Calculate weekly streak score (0-100)
 * Based on current study streak, capped at 7 days
 */
export function calculateWeeklyStreakScore(streakState: StreakState): number {
  const cappedStreak = Math.min(streakState.currentStreak, TARGETS.MAX_STREAK_DAYS)
  return (cappedStreak / TARGETS.MAX_STREAK_DAYS) * 100
}

/**
 * Calculate complete Performance Index
 */
export function calculatePerformanceIndex(
  assessments: Assessment[],
  deadlines: SchoolDeadline[],
  focusSessions: FocusSession[],
  studyLogs: StudyLog[],
  streakState: StreakState,
  weekStart?: Date
): PerformanceIndex {
  const start = weekStart || startOfWeek(new Date(), { weekStartsOn: 1 })

  // Calculate individual components
  const gradeProgression = calculateGradeProgression(assessments)
  const blockCompletion = calculateBlockCompletion(assessments)
  const focusConsistency = calculateFocusConsistency(focusSessions, start)
  const deadlineAdherence = calculateDeadlineAdherence(deadlines)
  const weeklyStreak = calculateWeeklyStreakScore(streakState)

  const breakdown: PerformanceIndexBreakdown = {
    gradeProgression,
    blockCompletion,
    focusConsistency,
    deadlineAdherence,
    weeklyStreak,
  }

  // Calculate weighted index
  const index =
    gradeProgression * WEIGHTS.GRADE_PROGRESSION +
    blockCompletion * WEIGHTS.BLOCK_COMPLETION +
    focusConsistency * WEIGHTS.FOCUS_CONSISTENCY +
    deadlineAdherence * WEIGHTS.DEADLINE_ADHERENCE +
    weeklyStreak * WEIGHTS.WEEKLY_STREAK

  // Calculate current average and gap
  const completedAssessments = assessments.filter((a) => a.score !== null && a.score > 0)
  let currentAverage = 0
  if (completedAssessments.length > 0) {
    const totalWeight = completedAssessments.reduce((sum, a) => sum + (a.weight || 1), 0)
    const weightedSum = completedAssessments.reduce(
      (sum, a) => sum + (a.score || 0) * (a.weight || 1),
      0
    )
    currentAverage = weightedSum / totalWeight
  }

  const scoreGap = TARGETS.TARGET_AVERAGE - currentAverage

  // Calculate trend (compare to last week)
  const lastWeekStart = subWeeks(start, 1)
  const lastWeekIndex = calculatePerformanceIndexRaw(
    assessments,
    deadlines,
    focusSessions,
    studyLogs,
    streakState,
    lastWeekStart
  )

  const deltaIndex = index - lastWeekIndex
  const deltaPercentage = lastWeekIndex > 0 ? (deltaIndex / lastWeekIndex) * 100 : 0

  let direction: 'up' | 'down' | 'stable' = 'stable'
  if (deltaIndex > 2) direction = 'up'
  else if (deltaIndex < -2) direction = 'down'

  const trend: PerformanceTrend = {
    deltaIndex,
    deltaPercentage,
    direction,
    weekComparison: 'vs last week',
  }

  return {
    index: Math.round(index),
    breakdown,
    trend,
    targetAverage: TARGETS.TARGET_AVERAGE,
    scoreGap: Number(scoreGap.toFixed(2)),
  }
}

/**
 * Calculate raw index (for trend comparison)
 * Internal helper that doesn't calculate trend recursively
 */
function calculatePerformanceIndexRaw(
  assessments: Assessment[],
  deadlines: SchoolDeadline[],
  focusSessions: FocusSession[],
  _studyLogs: StudyLog[],
  streakState: StreakState,
  weekStart: Date
): number {
  const gradeProgression = calculateGradeProgression(assessments)
  const blockCompletion = calculateBlockCompletion(assessments)
  const focusConsistency = calculateFocusConsistency(focusSessions, weekStart)
  const deadlineAdherence = calculateDeadlineAdherence(deadlines)
  const weeklyStreak = calculateWeeklyStreakScore(streakState)

  return (
    gradeProgression * WEIGHTS.GRADE_PROGRESSION +
    blockCompletion * WEIGHTS.BLOCK_COMPLETION +
    focusConsistency * WEIGHTS.FOCUS_CONSISTENCY +
    deadlineAdherence * WEIGHTS.DEADLINE_ADHERENCE +
    weeklyStreak * WEIGHTS.WEEKLY_STREAK
  )
}

/**
 * Get performance tier based on index
 */
export function getPerformanceTier(
  index: number
): 'elite' | 'high-performer' | 'on-track' | 'needs-improvement' {
  if (index >= 85) return 'elite'
  if (index >= 70) return 'high-performer'
  if (index >= 55) return 'on-track'
  return 'needs-improvement'
}

/**
 * Get performance message based on index and trend
 */
export function getPerformanceMessage(
  index: number,
  trend: PerformanceTrend,
  percentile?: number
): string {
  const tier = getPerformanceTier(index)

  if (tier === 'elite' && percentile && percentile >= 90) {
    return `You are outperforming ${percentile}% of active students this week.`
  }

  if (tier === 'elite') {
    return 'Elite performance secured. Maintain this standard.'
  }

  if (tier === 'high-performer' && trend.direction === 'up') {
    return 'Strong upward trajectory. Continue this momentum.'
  }

  if (trend.direction === 'down' && index < 70) {
    return 'You lost momentum this week. Recover before Sunday.'
  }

  if (tier === 'on-track') {
    return 'Baseline maintained. Push harder to break into top tier.'
  }

  return 'Critical performance gap detected. Immediate action required.'
}
