import { startOfDay, isToday, isBefore } from 'date-fns'
import type { StudyLog, FocusSession } from './types'

export type MomentumMode = 'recovery' | 'stable' | 'performance'

export interface DailyObjective {
  id: string
  type: 'focus_sessions' | 'study_minutes' | 'deadline_review'
  target: number
  current: number
  completed: boolean
  label: string
  labelNL: string
}

export interface DailyObjectivesState {
  date: Date
  objectives: DailyObjective[]
  allCompleted: boolean
  momentumMode: MomentumMode
  bonusXPAwarded: boolean
}

/**
 * Generate daily objectives for today
 * - 2 focus sessions
 * - 45 minutes study
 * - 1 deadline review
 */
export function generateDailyObjectives(): DailyObjective[] {
  return [
    {
      id: 'focus-sessions',
      type: 'focus_sessions',
      target: 2,
      current: 0,
      completed: false,
      label: 'Complete 2 focus sessions',
      labelNL: 'Voltooi 2 focussessies',
    },
    {
      id: 'study-minutes',
      type: 'study_minutes',
      target: 45,
      current: 0,
      completed: false,
      label: 'Study for 45 minutes',
      labelNL: 'Studeer 45 minuten',
    },
    {
      id: 'deadline-review',
      type: 'deadline_review',
      target: 1,
      current: 0,
      completed: false,
      label: 'Review upcoming deadlines',
      labelNL: 'Bekijk aankomende deadlines',
    },
  ]
}

/**
 * Check if daily objectives need to be regenerated
 */
export function shouldRegenerateObjectives(currentObjectives: DailyObjectivesState | null): boolean {
  if (!currentObjectives) return true
  const objectiveDate = startOfDay(new Date(currentObjectives.date))
  const today = startOfDay(new Date())
  return isBefore(objectiveDate, today)
}

/**
 * Calculate current progress for daily objectives
 */
export function calculateObjectiveProgress(
  objectives: DailyObjective[],
  studyLogs: StudyLog[],
  focusSessions: FocusSession[]
): DailyObjective[] {

  // Count today's focus sessions
  const todaysFocusSessions = focusSessions.filter(
    (session) => session.completed && isToday(new Date(session.startTime))
  ).length

  // Sum today's study minutes
  const todaysStudyMinutes = studyLogs
    .filter((log) => isToday(new Date(log.date)))
    .reduce((sum, log) => sum + log.minutes, 0)

  return objectives.map((objective) => {
    let current = objective.current

    if (objective.type === 'focus_sessions') {
      current = todaysFocusSessions
    } else if (objective.type === 'study_minutes') {
      current = todaysStudyMinutes
    }
    // deadline_review is manually marked complete

    const completed = current >= objective.target

    return {
      ...objective,
      current,
      completed,
    }
  })
}

/**
 * Calculate momentum mode based on recent performance
 * Recovery: < 50% completion rate last 3 days
 * Stable: 50-80% completion rate
 * Performance: > 80% completion rate
 */
export function calculateMomentumMode(
  objectivesHistory: DailyObjectivesState[]
): MomentumMode {
  if (objectivesHistory.length === 0) return 'stable'

  // Get last 3 days
  const recentDays = objectivesHistory.slice(-3)
  const completionRates = recentDays.map((day) => {
    const completed = day.objectives.filter((obj) => obj.completed).length
    const total = day.objectives.length
    return completed / total
  })

  const avgCompletionRate =
    completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length

  if (avgCompletionRate < 0.5) return 'recovery'
  if (avgCompletionRate > 0.8) return 'performance'
  return 'stable'
}

/**
 * Get XP multiplier based on momentum mode
 */
export function getXPMultiplier(mode: MomentumMode): number {
  switch (mode) {
    case 'recovery':
      return 0.9
    case 'stable':
      return 1.0
    case 'performance':
      return 1.1
    default:
      return 1.0
  }
}

/**
 * Get bonus XP for completing all daily objectives
 */
export const DAILY_OBJECTIVES_BONUS_XP = 25

/**
 * Get mode display text
 */
export function getModeText(mode: MomentumMode, language: 'nl' | 'en' = 'nl') {
  const texts = {
    recovery: { nl: 'Herstel Modus', en: 'Recovery Mode' },
    stable: { nl: 'Stabiel Modus', en: 'Stable Mode' },
    performance: { nl: 'Prestatie Modus', en: 'Performance Mode' },
  }
  return texts[mode][language]
}
