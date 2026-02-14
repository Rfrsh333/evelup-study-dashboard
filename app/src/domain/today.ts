import type { PersonalEvent, SchoolDeadline } from './types'

export interface TodayOverview {
  schoolUrgent: SchoolDeadline[]
  personalToday: PersonalEvent[]
}

export function getTodayOverview(
  schoolDeadlines: SchoolDeadline[],
  personalEvents: PersonalEvent[],
  now = new Date()
): TodayOverview {
  const within72h = new Date(now.getTime() + 72 * 60 * 60 * 1000)

  const schoolUrgent = schoolDeadlines
    .filter((dl) => dl.deadline <= within72h && dl.status !== 'completed' && dl.status !== 'failed')
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
    .slice(0, 3)

  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  const personalToday = personalEvents
    .filter((ev) => ev.start >= startOfDay && ev.start <= endOfDay)
    .sort((a, b) => a.start.getTime() - b.start.getTime())

  return { schoolUrgent, personalToday }
}
