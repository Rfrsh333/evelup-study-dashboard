import type { PersonalEvent, SchoolDeadline } from '@/domain/types'
import ICAL from 'ical.js'
import { toDate } from '@/lib/datetime'

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
  kind: 'NO_VEVENT' | 'PARSE_FAILURE'
  message: string
  details?: string[]
}

export type IcsParseResult = {
  events: NormalizedIcsEvent[]
  error?: IcsParseError
  debug: {
    veventCount: number
    previewLines: string[]
    veventSamples: string[]
    parsedTotal: number
    keptTotal: number
    pastDroppedCount: number
    outOfRangeCount: number
    invalidDates: number
    windowStart: string
    windowEnd: string
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

function getRawVeventSamples(text: string, max = 2): string[] {
  const lines = text.replace(/\r\n/g, '\n').split('\n')
  const samples: string[] = []
  let buffer: string[] = []
  let inEvent = false

  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      inEvent = true
      buffer = [line]
      continue
    }
    if (line.startsWith('END:VEVENT')) {
      if (inEvent) {
        buffer.push(line)
        samples.push(buffer.slice(0, 30).join('\n'))
      }
      inEvent = false
      buffer = []
      if (samples.length >= max) break
      continue
    }
    if (inEvent) buffer.push(line)
  }

  return samples
}

function getTitle(summary?: string | null, description?: string | null): string {
  const title = summary?.trim() || description?.trim()
  return title && title.length > 0 ? title : 'Afspraak'
}

export function parseIcs(text: string): IcsParseResult {
  const now = new Date()
  const windowStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000)
  const previewLines = text.replace(/\r\n/g, '\n').split('\n').slice(0, 30)
  const veventSamples = getRawVeventSamples(text)
  const parseErrors: string[] = []

  let component: ICAL.Component
  try {
    const jcal = ICAL.parse(text)
    component = new ICAL.Component(jcal)
  } catch (error) {
    return {
      events: [],
      error: {
        kind: 'PARSE_FAILURE',
        message: 'ICS parsing failed.',
        details: [String(error)],
      },
      debug: {
        veventCount: 0,
        previewLines,
        veventSamples,
        parsedTotal: 0,
        keptTotal: 0,
        pastDroppedCount: 0,
        outOfRangeCount: 0,
        invalidDates: 0,
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
      },
    }
  }

  const vevents = component.getAllSubcomponents('vevent')
  const veventCount = vevents.length
  const events: NormalizedIcsEvent[] = []
  let invalidDates = 0

  vevents.forEach((vevent) => {
    try {
      const uidValue = vevent.getFirstPropertyValue('uid')
      const uid = typeof uidValue === 'string' ? uidValue : crypto.randomUUID()
      const summary = vevent.getFirstPropertyValue('summary')
      const description = vevent.getFirstPropertyValue('description')
      const location = vevent.getFirstPropertyValue('location')
      const summaryText = typeof summary === 'string' ? summary : null
      const descriptionText = typeof description === 'string' ? description : null
      const locationText = typeof location === 'string' ? location : null
      const dtstart = vevent.getFirstPropertyValue('dtstart') as ICAL.Time | null
      const dtend = vevent.getFirstPropertyValue('dtend') as ICAL.Time | null

      if (!dtstart) {
        parseErrors.push(`Missing DTSTART for ${uid}`)
        return
      }

      const start = toDate(dtstart.toJSDate())
      if (!start) {
        parseErrors.push(`Invalid DTSTART for ${uid}`)
        invalidDates += 1
        return
      }

      const allDay = dtstart.isDate

      let end: Date | null = null
      if (dtend) {
        const endDate = toDate(dtend.toJSDate())
        if (endDate) end = endDate
      }

      if (!end) {
        end = allDay
          ? new Date(start.getTime() + 24 * 60 * 60 * 1000)
          : new Date(start.getTime() + 60 * 60 * 1000)
      }

      events.push({
        uid,
        title: getTitle(summaryText, descriptionText),
        start,
        end,
        allDay,
        description: descriptionText ?? undefined,
        location: locationText ?? undefined,
        rawSource: 'ics',
      })
    } catch (error) {
      parseErrors.push(String(error))
    }
  })

  if (veventCount === 0) {
    return {
      events: [],
      error: {
        kind: 'NO_VEVENT',
        message: 'No VEVENT blocks found in ICS file.',
      },
      debug: {
        veventCount,
        previewLines,
        veventSamples,
        parsedTotal: events.length,
        keptTotal: 0,
        pastDroppedCount: 0,
        outOfRangeCount: 0,
        invalidDates,
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
      },
    }
  }

  const parsedTotal = events.length
  let pastDroppedCount = 0
  let outOfRangeCount = 0
  const filtered = events.filter((event) => {
    if (event.start < windowStart) {
      pastDroppedCount += 1
      return false
    }
    if (event.start > windowEnd) {
      outOfRangeCount += 1
      return false
    }
    return true
  })

  if (filtered.length === 0) {
    return {
      events: [],
      error: {
        kind: 'PARSE_FAILURE',
        message: 'VEVENTs found but no valid events parsed.',
        details: parseErrors,
      },
      debug: {
        veventCount,
        previewLines,
        veventSamples,
        parsedTotal,
        keptTotal: 0,
        pastDroppedCount,
        outOfRangeCount,
        invalidDates,
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
      },
    }
  }

  return {
    events: filtered,
    debug: {
      veventCount,
      previewLines,
      veventSamples,
      parsedTotal,
      keptTotal: filtered.length,
      pastDroppedCount,
      outOfRangeCount,
      invalidDates,
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
    },
  }
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
        location: event.location,
        source: 'ics',
      },
    })
  })

  return { personalEvents, schoolDeadlines }
}

export function debugHvaSample(): IcsParseResult {
  const sample = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VTIMEZONE',
    'TZID:Europe/Brussels',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    'UID:hva-1',
    'SUMMARY:Rooster blok',
    'DTSTART;TZID=Europe/Brussels:20260216T090000',
    'DTEND;TZID=Europe/Brussels:20260216T100000',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\n')

  return parseIcs(sample)
}
