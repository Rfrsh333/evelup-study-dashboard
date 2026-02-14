import { startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import type {
  SchoolDeadline,
  FocusSession,
  StudyLog,
  MomentumScore,
  MomentumBreakdown,
  MomentumTrend,
  WeeklyData,
} from './types'
import { getStudyDaysInWeek } from './streak'

// Momentum weights (must sum to 100%)
const WEIGHTS = {
  CONSISTENCY: 0.4, // 40%
  DEADLINE_CONTROL: 0.3, // 30%
  FOCUS_SCORE: 0.2, // 20%
  STREAK_BONUS: 0.1, // 10%
} as const

// Target values for normalization
const TARGETS = {
  STUDY_DAYS_PER_WEEK: 5,
  FOCUS_SESSIONS_PER_WEEK: 5,
  MAX_STREAK_DAYS: 7,
} as const

/**
 * Calculate consistency score (0-100) based on study days this week
 * Target: 5 days per week (capped at 5)
 */
export function calculateConsistency(studyLogs: StudyLog[], weekStart?: Date): number {
  const start = weekStart || startOfWeek(new Date(), { weekStartsOn: 1 })
  const studyDays = getStudyDaysInWeek(studyLogs, start)
  const cappedDays = Math.min(studyDays, TARGETS.STUDY_DAYS_PER_WEEK)
  return (cappedDays / TARGETS.STUDY_DAYS_PER_WEEK) * 100
}

/**
 * Calculate deadline control score (0-100) based on on-track deadlines
 * Percentage of active deadlines that are on-track
 */
export function calculateDeadlineControl(deadlines: SchoolDeadline[]): number {
  const activeDeadlines = deadlines.filter(
    (d) => d.status === 'on-track' || d.status === 'at-risk'
  )

  if (activeDeadlines.length === 0) return 100 // Perfect score if no deadlines

  const onTrack = activeDeadlines.filter((d) => d.status === 'on-track').length
  return (onTrack / activeDeadlines.length) * 100
}

/**
 * Calculate focus score (0-100) based on completed focus sessions this week
 * Target: 5 sessions per week
 */
export function calculateFocusScore(focusSessions: FocusSession[], weekStart?: Date): number {
  const start = weekStart || startOfWeek(new Date(), { weekStartsOn: 1 })
  const end = endOfWeek(start, { weekStartsOn: 1 })

  const weekSessions = focusSessions.filter((session) => {
    const sessionDate = new Date(session.startTime)
    return session.completed && sessionDate >= start && sessionDate <= end
  })

  const cappedSessions = Math.min(weekSessions.length, TARGETS.FOCUS_SESSIONS_PER_WEEK)
  return (cappedSessions / TARGETS.FOCUS_SESSIONS_PER_WEEK) * 100
}

/**
 * Calculate streak bonus score (0-100)
 * Based on current streak, capped at 7 days
 */
export function calculateStreakBonus(currentStreak: number): number {
  const cappedStreak = Math.min(currentStreak, TARGETS.MAX_STREAK_DAYS)
  return (cappedStreak / TARGETS.MAX_STREAK_DAYS) * 100
}

/**
 * Get data for a specific week
 */
export function getWeeklyData(
  studyLogs: StudyLog[],
  focusSessions: FocusSession[],
  deadlines: SchoolDeadline[],
  weekStart: Date
): WeeklyData {
  const end = endOfWeek(weekStart, { weekStartsOn: 1 })

  // Calculate study minutes for the week
  const studyMinutes = studyLogs
    .filter((log) => {
      const logDate = new Date(log.date)
      return logDate >= weekStart && logDate <= end
    })
    .reduce((sum, log) => sum + log.minutes, 0)

  // Count focus sessions for the week
  const focusSessionCount = focusSessions.filter((session) => {
    const sessionDate = new Date(session.startTime)
    return session.completed && sessionDate >= weekStart && sessionDate <= end
  }).length

  return {
    studyMinutes,
    focusSessions: focusSessionCount,
    deadlineControlPercentage: calculateDeadlineControl(deadlines),
    consistencyScore: calculateConsistency(studyLogs, weekStart),
  }
}

/**
 * Calculate weekly trend by comparing current week to previous week
 */
export function calculateWeeklyTrend(
  studyLogs: StudyLog[],
  focusSessions: FocusSession[],
  deadlines: SchoolDeadline[],
  currentStreak: number
): MomentumTrend {
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const lastWeekStart = subWeeks(thisWeekStart, 1)

  // Calculate scores for this week
  const thisWeekScore = calculateMomentumScoreRaw(
    studyLogs,
    focusSessions,
    deadlines,
    currentStreak,
    thisWeekStart
  )

  // Calculate scores for last week
  const lastWeekScore = calculateMomentumScoreRaw(
    studyLogs,
    focusSessions,
    deadlines,
    currentStreak,
    lastWeekStart
  )

  const deltaScore = thisWeekScore - lastWeekScore
  const deltaPercentage = lastWeekScore > 0 ? (deltaScore / lastWeekScore) * 100 : 0

  let direction: 'up' | 'down' | 'neutral' = 'neutral'
  if (deltaScore > 2) direction = 'up'
  else if (deltaScore < -2) direction = 'down'

  return {
    deltaScore: Math.round(deltaScore * 10) / 10,
    deltaPercentage: Math.round(deltaPercentage * 10) / 10,
    direction,
  }
}

/**
 * Calculate raw momentum score without trend (internal helper)
 */
function calculateMomentumScoreRaw(
  studyLogs: StudyLog[],
  focusSessions: FocusSession[],
  deadlines: SchoolDeadline[],
  currentStreak: number,
  weekStart?: Date
): number {
  const consistency = calculateConsistency(studyLogs, weekStart)
  const deadlineControl = calculateDeadlineControl(deadlines)
  const focusScore = calculateFocusScore(focusSessions, weekStart)
  const streakBonus = calculateStreakBonus(currentStreak)

  return (
    consistency * WEIGHTS.CONSISTENCY +
    deadlineControl * WEIGHTS.DEADLINE_CONTROL +
    focusScore * WEIGHTS.FOCUS_SCORE +
    streakBonus * WEIGHTS.STREAK_BONUS
  )
}

/**
 * Calculate complete momentum score with breakdown and trend
 */
export function calculateMomentumScore(
  studyLogs: StudyLog[],
  focusSessions: FocusSession[],
  deadlines: SchoolDeadline[],
  currentStreak: number
): MomentumScore {
  const consistency = calculateConsistency(studyLogs)
  const deadlineControl = calculateDeadlineControl(deadlines)
  const focusScore = calculateFocusScore(focusSessions)
  const streakBonus = calculateStreakBonus(currentStreak)

  const breakdown: MomentumBreakdown = {
    consistency: Math.round(consistency),
    deadlineControl: Math.round(deadlineControl),
    focusScore: Math.round(focusScore),
    streakBonus: Math.round(streakBonus),
  }

  const score =
    consistency * WEIGHTS.CONSISTENCY +
    deadlineControl * WEIGHTS.DEADLINE_CONTROL +
    focusScore * WEIGHTS.FOCUS_SCORE +
    streakBonus * WEIGHTS.STREAK_BONUS

  const trend = calculateWeeklyTrend(studyLogs, focusSessions, deadlines, currentStreak)

  return {
    score: Math.round(score),
    breakdown,
    trend,
  }
}
