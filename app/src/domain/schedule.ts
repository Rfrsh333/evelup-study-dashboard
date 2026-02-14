import type { PersonalEvent } from './types'

export interface BusyInterval {
  start: Date
  end: Date
}

export interface FocusSuggestion {
  start: Date
  end: Date
  minutes: number
  reasonCode: 'preferred_window' | 'before_deadline' | 'largest_gap' | 'fallback_15'
  confidence: number
}

export interface FocusPreferences {
  preferredStart: string
  preferredEnd: string
  minMinutes: number
}

export interface FocusContext {
  urgentCount: number
  nearestDue?: Date
}

export function normalizeEvents(events: BusyInterval[]): BusyInterval[] {
  const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime())
  const merged: BusyInterval[] = []

  for (const evt of sorted) {
    const last = merged[merged.length - 1]
    if (!last || evt.start > last.end) {
      merged.push({ ...evt })
    } else {
      last.end = new Date(Math.max(last.end.getTime(), evt.end.getTime()))
    }
  }

  return merged
}

export function getBusyIntervalsForDay(events: PersonalEvent[], day: Date): BusyInterval[] {
  const startOfDay = new Date(day)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(day)
  endOfDay.setHours(23, 59, 59, 999)

  return normalizeEvents(
    events
      .filter((ev) => ev.start >= startOfDay && ev.start <= endOfDay)
      .map((ev) => ({ start: ev.start, end: ev.end }))
  )
}

export function getFreeWindows(
  busy: BusyInterval[],
  dayStart: Date,
  dayEnd: Date,
  minMinutes: number
): BusyInterval[] {
  const windows: BusyInterval[] = []
  let cursor = new Date(dayStart)

  for (const interval of busy) {
    if (interval.start > cursor) {
      const diff = (interval.start.getTime() - cursor.getTime()) / 60000
      if (diff >= minMinutes) {
        windows.push({ start: new Date(cursor), end: new Date(interval.start) })
      }
    }
    cursor = new Date(Math.max(cursor.getTime(), interval.end.getTime()))
  }

  if (cursor < dayEnd) {
    const diff = (dayEnd.getTime() - cursor.getTime()) / 60000
    if (diff >= minMinutes) {
      windows.push({ start: new Date(cursor), end: new Date(dayEnd) })
    }
  }

  return windows
}

function parseTime(day: Date, hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(day)
  d.setHours(h || 0, m || 0, 0, 0)
  return d
}

export function pickBestFocusWindow(
  freeWindows: BusyInterval[],
  preferences: FocusPreferences,
  context: FocusContext,
  day: Date
): FocusSuggestion | null {
  const minMinutes = preferences.minMinutes
  if (freeWindows.length === 0) return null

  const preferredStart = parseTime(day, preferences.preferredStart)
  const preferredEnd = parseTime(day, preferences.preferredEnd)

  const preferred = freeWindows.find(
    (win) =>
      win.start <= preferredStart &&
      preferredStart.getTime() + minMinutes * 60000 <= preferredEnd.getTime() &&
      win.end >= new Date(preferredStart.getTime() + minMinutes * 60000)
  )

  if (preferred) {
    return {
      start: preferredStart,
      end: new Date(preferredStart.getTime() + minMinutes * 60000),
      minutes: minMinutes,
      reasonCode: 'preferred_window',
      confidence: 0.9,
    }
  }

  if (context.urgentCount > 0) {
    const early = freeWindows[0]
    return {
      start: early.start,
      end: new Date(early.start.getTime() + minMinutes * 60000),
      minutes: minMinutes,
      reasonCode: 'before_deadline',
      confidence: 0.8,
    }
  }

  const largest = freeWindows.reduce((a, b) =>
    b.end.getTime() - b.start.getTime() > a.end.getTime() - a.start.getTime() ? b : a
  )
  const duration = (largest.end.getTime() - largest.start.getTime()) / 60000
  if (duration >= minMinutes) {
    return {
      start: largest.start,
      end: new Date(largest.start.getTime() + minMinutes * 60000),
      minutes: minMinutes,
      reasonCode: minMinutes === 15 ? 'fallback_15' : 'largest_gap',
      confidence: 0.7,
    }
  }

  if (duration >= 15) {
    return {
      start: largest.start,
      end: new Date(largest.start.getTime() + 15 * 60000),
      minutes: 15,
      reasonCode: 'fallback_15',
      confidence: 0.6,
    }
  }

  return null
}
