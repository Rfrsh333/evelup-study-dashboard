import { startOfDay, differenceInDays } from 'date-fns'
import type { StudyLog, StreakState } from './types'

/**
 * Calculate streak state from study logs
 * A streak is maintained if there are consecutive days of study
 */
export function calculateStreak(studyLogs: StudyLog[]): StreakState {
  if (studyLogs.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: undefined,
    }
  }

  // Sort logs by date descending (most recent first)
  const sortedLogs = [...studyLogs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Get unique study days (in case multiple logs per day)
  const uniqueDays = Array.from(
    new Set(sortedLogs.map((log) => startOfDay(new Date(log.date)).getTime()))
  )
    .map((timestamp) => new Date(timestamp))
    .sort((a, b) => b.getTime() - a.getTime())

  if (uniqueDays.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: undefined,
    }
  }

  const today = startOfDay(new Date())
  const mostRecentDay = startOfDay(uniqueDays[0])
  const lastStudyDate = uniqueDays[0]

  // Check if streak is active (studied today or yesterday)
  const daysSinceLastStudy = differenceInDays(today, mostRecentDay)
  const isStreakActive = daysSinceLastStudy <= 1

  // Calculate current streak
  let currentStreak = 0
  if (isStreakActive) {
    currentStreak = 1
    for (let i = 1; i < uniqueDays.length; i++) {
      const prevDay = startOfDay(uniqueDays[i - 1])
      const currentDay = startOfDay(uniqueDays[i])
      const diff = differenceInDays(prevDay, currentDay)

      if (diff === 1) {
        currentStreak++
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0
  let tempStreak = 1

  for (let i = 1; i < uniqueDays.length; i++) {
    const prevDay = startOfDay(uniqueDays[i - 1])
    const currentDay = startOfDay(uniqueDays[i])
    const diff = differenceInDays(prevDay, currentDay)

    if (diff === 1) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 1
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

  return {
    currentStreak,
    longestStreak,
    lastStudyDate,
  }
}

/**
 * Check if user studied today
 */
export function studiedToday(studyLogs: StudyLog[]): boolean {
  const today = startOfDay(new Date())
  return studyLogs.some((log) => {
    const logDay = startOfDay(new Date(log.date))
    return logDay.getTime() === today.getTime()
  })
}

/**
 * Get study days in a specific week
 */
export function getStudyDaysInWeek(studyLogs: StudyLog[], weekStart: Date): number {
  const weekStartDay = startOfDay(weekStart)
  const weekEndDay = new Date(weekStartDay)
  weekEndDay.setDate(weekEndDay.getDate() + 7)

  const uniqueDays = new Set(
    studyLogs
      .filter((log) => {
        const logDate = new Date(log.date)
        return logDate >= weekStartDay && logDate < weekEndDay
      })
      .map((log) => startOfDay(new Date(log.date)).getTime())
  )

  return uniqueDays.size
}
