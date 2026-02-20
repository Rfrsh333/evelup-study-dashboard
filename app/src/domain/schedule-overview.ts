import { differenceInMinutes, endOfDay, format, isAfter, isSameDay, startOfDay } from 'date-fns'
import type { AppState, PersonalEvent, SchoolDeadline } from './types'

export function getUpcomingEvents(state: AppState, now = new Date(), limit = 5): PersonalEvent[] {
  return state.personalEvents
    .filter((event) => isAfter(event.end, now))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, limit)
}

export function getTodayEvents(state: AppState, today = new Date(), limit = 3): PersonalEvent[] {
  return state.personalEvents
    .filter((event) => isSameDay(event.start, today))
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, limit)
}

export function getNextDeadline(state: AppState, now = new Date()): SchoolDeadline | null {
  const deadlines = state.schoolDeadlines
    .filter((deadline) => deadline.status !== 'completed' && deadline.status !== 'failed')
    .filter((deadline) => isAfter(deadline.deadline, now))
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
  return deadlines[0] ?? null
}

export function getTodayCounts(state: AppState, today = new Date()): { classes: number; deadlines: number } {
  const dayStart = startOfDay(today)
  const dayEnd = endOfDay(today)
  const classes = state.personalEvents.filter((event) => isSameDay(event.start, today)).length
  const deadlines = state.schoolDeadlines.filter(
    (deadline) => deadline.deadline >= dayStart && deadline.deadline <= dayEnd
  ).length
  return { classes, deadlines }
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`
}

export function getRelativeTimeParts(
  date: Date,
  now = new Date()
): { isNow: boolean; hours: number; minutes: number } {
  const minutes = differenceInMinutes(date, now)
  if (minutes <= 0) return { isNow: true, hours: 0, minutes: 0 }
  return {
    isNow: false,
    hours: Math.floor(minutes / 60),
    minutes: minutes % 60,
  }
}
