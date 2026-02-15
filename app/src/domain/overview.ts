import type { PersonalEvent, SchoolDeadline } from './types'

export interface PreviewItem {
  id: string
  title: string
  date: Date
  kind: 'school' | 'personal'
}

export function getTodayPriorities(deadlines: SchoolDeadline[], now = new Date()): SchoolDeadline[] {
  const within72h = new Date(now.getTime() + 72 * 60 * 60 * 1000)
  return deadlines
    .filter((dl) => dl.deadline <= within72h && dl.status !== 'completed' && dl.status !== 'failed')
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
    .slice(0, 3)
}

export function getWeekPreviewItems(
  deadlines: SchoolDeadline[],
  events: PersonalEvent[],
  now = new Date()
): PreviewItem[] {
  const windowEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const schoolItems = deadlines
    .filter((dl) => dl.deadline >= now && dl.deadline <= windowEnd)
    .map((dl) => ({
      id: dl.id,
      title: dl.title,
      date: dl.deadline,
      kind: 'school' as const,
    }))

  const personalItems = events
    .filter((ev) => ev.start >= now && ev.start <= windowEnd)
    .map((ev) => ({
      id: ev.id,
      title: ev.title,
      date: ev.start,
      kind: 'personal' as const,
    }))

  return [...schoolItems, ...personalItems]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3)
}
