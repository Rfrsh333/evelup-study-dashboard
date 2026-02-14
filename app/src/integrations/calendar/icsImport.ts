import type { PersonalEvent, SchoolDeadline } from '@/domain/types'

export interface NormalizedIcsEvent {
  uid: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  description?: string
  location?: string
  rawSource: 'ics'
}

export type IcsParseError = {
  kind: 'NO_VEVENT'
  message: string
}

export type IcsParseResult = {
  events: NormalizedIcsEvent[]
  error?: IcsParseError
  debug: {
    veventCount: number
    previewLines: string[]
  }
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
  'submission',
]

function unfoldLines(input: string): string[] {
  const normalized = input.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const rawLines = normalized.split('\n')
  const lines: string[] = []

  for (const line of rawLines) {
    if (line.startsWith(' ') || line.startsWith('\t')) {
      const prev = lines.pop() ?? ''
      lines.push(prev + line.slice(1))
    } else {
      lines.push(line)
    }
  }

  return lines
}

function parseDateTime(value: string, hasTimeZone: boolean): Date | null {
  if (!value) return null
  if (value.length === 8) {
    const year = Number(value.slice(0, 4))
    const month = Number(value.slice(4, 6)) - 1
    const day = Number(value.slice(6, 8))
    return new Date(year, month, day, 0, 0, 0)
  }

  const datePart = value.slice(0, 8)
  const timePart = value.slice(9, 15)
  const year = Number(datePart.slice(0, 4))
  const month = Number(datePart.slice(4, 6)) - 1
  const day = Number(datePart.slice(6, 8))
  const hour = Number(timePart.slice(0, 2))
  const minute = Number(timePart.slice(2, 4))
  const second = Number(timePart.slice(4, 6))

  if (hasTimeZone) {
    return new Date(Date.UTC(year, month, day, hour, minute, second))
  }
  return new Date(year, month, day, hour, minute, second)
}

function parseDateField(rawKey: string, rawValue: string): { date: Date | null; allDay: boolean } {
  const value = rawValue.trim()
  const isUtc = value.endsWith('Z')
  const keyParts = rawKey.split(';')
  const tzSpecified = keyParts.some((part) => part.startsWith('TZID='))

  if (value.length === 8) {
    return { date: parseDateTime(value, false), allDay: true }
  }

  const cleaned = isUtc ? value.slice(0, -1) : value
  const date = parseDateTime(cleaned, isUtc ? true : !tzSpecified ? false : false)
  return { date, allDay: false }
}

function getField(line: string): { key: string; value: string } | null {
  const splitIndex = line.indexOf(':')
  if (splitIndex === -1) return null
  const key = line.slice(0, splitIndex)
  const value = line.slice(splitIndex + 1)
  return { key, value }
}

export function parseIcs(text: string): IcsParseResult {
  const lines = unfoldLines(text).filter((line) => line.trim().length > 0)
  const previewLines = lines.slice(0, 30)
  const events: NormalizedIcsEvent[] = []
  let veventCount = 0

  let current: Partial<NormalizedIcsEvent> & {
    rawStart?: { date: Date; allDay: boolean }
    rawEnd?: { date: Date; allDay: boolean }
  } = {}

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      veventCount += 1
      current = {}
      continue
    }
    if (line === 'END:VEVENT') {
      if (current.uid && current.title && current.rawStart?.date) {
        const start = current.rawStart.date
        const allDay = current.rawStart.allDay
        let end = current.rawEnd?.date
        if (!end) {
          if (allDay) {
            end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
          } else {
            end = new Date(start.getTime() + 60 * 60 * 1000)
          }
        }

        events.push({
          uid: current.uid,
          title: current.title,
          start,
          end,
          allDay,
          description: current.description,
          location: current.location,
          rawSource: 'ics',
        })
      }
      current = {}
      continue
    }

    if (Object.keys(current).length === 0 && !line.startsWith('UID') && !line.startsWith('SUMMARY')) {
      continue
    }

    const field = getField(line)
    if (!field) continue

    const baseKey = field.key.split(';')[0]
    if (baseKey === 'UID') current.uid = field.value.trim()
    if (baseKey === 'SUMMARY') current.title = field.value.trim()
    if (baseKey === 'DESCRIPTION') current.description = field.value.trim()
    if (baseKey === 'LOCATION') current.location = field.value.trim()

    if (baseKey === 'DTSTART') {
      const parsed = parseDateField(field.key, field.value)
      if (parsed.date) current.rawStart = { date: parsed.date, allDay: parsed.allDay }
    }
    if (baseKey === 'DTEND') {
      const parsed = parseDateField(field.key, field.value)
      if (parsed.date) current.rawEnd = { date: parsed.date, allDay: parsed.allDay }
    }
  }

  if (veventCount === 0) {
    return {
      events: [],
      error: {
        kind: 'NO_VEVENT',
        message: 'No VEVENT blocks found in ICS file.',
      },
      debug: { veventCount, previewLines },
    }
  }

  return { events, debug: { veventCount, previewLines } }
}

function hasDeadlineKeyword(text: string): boolean {
  const normalized = text.toLowerCase()
  return DEADLINE_KEYWORDS.some((keyword) => normalized.includes(keyword))
}

function isDueMoment(event: NormalizedIcsEvent): boolean {
  const text = `${event.title} ${event.description ?? ''}`.toLowerCase()
  if (text.includes('due')) return true
  if (!event.allDay) return true
  return false
}

export function classifyIcsEvents(events: NormalizedIcsEvent[]): {
  personalEvents: { uid: string; event: Omit<PersonalEvent, 'id'> }[]
  schoolDeadlines: { uid: string; event: Omit<SchoolDeadline, 'id' | 'createdAt'> }[]
} {
  const personalEvents: { uid: string; event: Omit<PersonalEvent, 'id'> }[] = []
  const schoolDeadlines: { uid: string; event: Omit<SchoolDeadline, 'id' | 'createdAt'> }[] = []

  events.forEach((event) => {
    const text = `${event.title} ${event.description ?? ''}`
    if (hasDeadlineKeyword(text) && isDueMoment(event)) {
      schoolDeadlines.push({
        uid: event.uid,
        event: {
          title: event.title,
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
        title: event.title,
        start: event.start,
        end: event.end,
        source: 'ics',
      },
    })
  })

  return { personalEvents, schoolDeadlines }
}

export function debugParseSampleIcs(): IcsParseResult {
  const sample = [
    'BEGIN:VCALENDAR',
    'BEGIN:VEVENT',
    'UID:sample-1',
    'SUMMARY:S0 - Inleveropdracht',
    'DTSTART;TZID=Europe/Amsterdam:20260216T090000',
    'DTEND;TZID=Europe/Amsterdam:20260216T100000',
    'DESCRIPTION:Deadline voor opdracht',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n')

  return parseIcs(sample)
}
