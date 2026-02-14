import type { PersonalEvent, SchoolDeadline } from '@/domain/types'

export interface IcsEvent {
  uid: string
  summary: string
  start: Date
  end?: Date
}

function parseDate(value: string): Date | null {
  // Handles YYYYMMDD or YYYYMMDDTHHMMSSZ
  if (!value) return null
  if (value.includes('T')) {
    const normalized = value.endsWith('Z') ? value : `${value}Z`
    const year = normalized.slice(0, 4)
    const month = normalized.slice(4, 6)
    const day = normalized.slice(6, 8)
    const hour = normalized.slice(9, 11)
    const minute = normalized.slice(11, 13)
    const second = normalized.slice(13, 15)
    return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`)
  }
  const year = value.slice(0, 4)
  const month = value.slice(4, 6)
  const day = value.slice(6, 8)
  return new Date(`${year}-${month}-${day}T00:00:00Z`)
}

export function parseIcs(text: string): IcsEvent[] {
  const lines = text.split(/\r?\n/)
  const events: IcsEvent[] = []
  let current: Partial<IcsEvent> = {}

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line === 'BEGIN:VEVENT') {
      current = {}
      continue
    }
    if (line === 'END:VEVENT') {
      if (current.uid && current.summary && current.start) {
        events.push(current as IcsEvent)
      }
      current = {}
      continue
    }

    const [key, value] = line.split(':', 2)
    if (!key || !value) continue
    if (key.startsWith('UID')) current.uid = value
    if (key.startsWith('SUMMARY')) current.summary = value
    if (key.startsWith('DTSTART')) {
      const date = parseDate(value)
      if (date) current.start = date
    }
    if (key.startsWith('DTEND')) {
      const date = parseDate(value)
      if (date) current.end = date
    }
  }

  return events
}

const DEADLINE_KEYWORDS = [
  'deadline',
  'due',
  'assignment',
  'opdracht',
  'inlever',
  'quiz',
  'exam',
  'tentamen',
  'toets',
]

function isDeadlineTitle(title: string): boolean {
  const normalized = title.toLowerCase()
  return DEADLINE_KEYWORDS.some((keyword) => normalized.includes(keyword))
}

export function splitIcsEvents(events: IcsEvent[]): {
  personalEvents: { uid: string; event: Omit<PersonalEvent, 'id'> }[]
  schoolDeadlines: { uid: string; event: Omit<SchoolDeadline, 'id' | 'createdAt'> }[]
} {
  const personalEvents: { uid: string; event: Omit<PersonalEvent, 'id'> }[] = []
  const schoolDeadlines: { uid: string; event: Omit<SchoolDeadline, 'id' | 'createdAt'> }[] = []

  events.forEach((event) => {
    if (isDeadlineTitle(event.summary)) {
      schoolDeadlines.push({
        uid: event.uid,
        event: {
          title: event.summary,
          deadline: event.start,
          status: 'on-track',
          xp: 50,
          source: 'manual',
        },
      })
      return
    }
    personalEvents.push({
      uid: event.uid,
      event: {
        title: event.summary,
        start: event.start,
        end: event.end ?? new Date(event.start.getTime() + 60 * 60 * 1000),
        source: 'ics',
      },
    })
  })

  return { personalEvents, schoolDeadlines }
}
