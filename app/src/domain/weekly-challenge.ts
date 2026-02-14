import { startOfWeek, endOfWeek, isSameWeek } from 'date-fns'
import type { FocusSession, StudyLog } from './types'
import { getStudyDaysInWeek } from './streak'

export type ChallengeType = 'focus_sessions' | 'study_days' | 'study_minutes'

export interface WeeklyChallenge {
  type: ChallengeType
  target: number
  current: number
  completed: boolean
  weekStart: Date
  bonusXP: number
  xpAwarded: boolean
}

export const WEEKLY_CHALLENGE_XP = 40

/**
 * Get default weekly challenge for a new week
 * Primary challenge: 5 focus sessions per week
 */
export function getDefaultWeeklyChallenge(weekStart?: Date): WeeklyChallenge {
  const start = weekStart || startOfWeek(new Date(), { weekStartsOn: 1 })

  return {
    type: 'focus_sessions',
    target: 5,
    current: 0,
    completed: false,
    weekStart: start,
    bonusXP: WEEKLY_CHALLENGE_XP,
    xpAwarded: false,
  }
}

/**
 * Check if weekly challenge needs to be reset for new week
 */
export function shouldResetWeeklyChallenge(challenge: WeeklyChallenge | null): boolean {
  if (!challenge) return true

  const now = new Date()
  const challengeWeekStart = new Date(challenge.weekStart)

  return !isSameWeek(now, challengeWeekStart, { weekStartsOn: 1 })
}

/**
 * Calculate current progress for weekly challenge
 */
export function calculateChallengeProgress(
  challenge: WeeklyChallenge,
  studyLogs: StudyLog[],
  focusSessions: FocusSession[]
): WeeklyChallenge {
  const weekStart = new Date(challenge.weekStart)
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

  let current = 0

  switch (challenge.type) {
    case 'focus_sessions': {
      current = focusSessions.filter((session) => {
        const sessionDate = new Date(session.startTime)
        return session.completed && sessionDate >= weekStart && sessionDate <= weekEnd
      }).length
      break
    }

    case 'study_days': {
      current = getStudyDaysInWeek(studyLogs, weekStart)
      break
    }

    case 'study_minutes': {
      current = studyLogs
        .filter((log) => {
          const logDate = new Date(log.date)
          return logDate >= weekStart && logDate <= weekEnd
        })
        .reduce((sum, log) => sum + log.minutes, 0)
      break
    }
  }

  const completed = current >= challenge.target

  return {
    ...challenge,
    current,
    completed,
  }
}

/**
 * Get challenge label for display
 */
export function getChallengeLabel(
  challenge: WeeklyChallenge,
  language: 'nl' | 'en' = 'nl'
): string {
  const { type, target } = challenge

  if (language === 'nl') {
    switch (type) {
      case 'focus_sessions':
        return `${target} focussessies deze week`
      case 'study_days':
        return `${target} studeerdagen deze week`
      case 'study_minutes':
        return `${target} studeerminuten deze week`
    }
  } else {
    switch (type) {
      case 'focus_sessions':
        return `${target} focus sessions this week`
      case 'study_days':
        return `${target} study days this week`
      case 'study_minutes':
        return `${target} study minutes this week`
    }
  }
}
