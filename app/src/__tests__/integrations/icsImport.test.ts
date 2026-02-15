import { describe, it, expect } from 'vitest'
import { parseIcs, classifyIcsEvents } from '@/integrations/calendar/icsImport'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const sampleIcs = readFileSync(join(__dirname, '../fixtures/sample.ics'), 'utf-8')

describe('ICS Import', () => {
  describe('parseIcs', () => {
    it('should parse valid ICS file', () => {
      const result = parseIcs(sampleIcs)

      expect(result.error).toBeUndefined()
      expect(result.events.length).toBeGreaterThan(0)
      expect(result.debug.veventCount).toBe(3)
      expect(result.debug.parsedTotal).toBe(3)
    })

    it('should extract event properties correctly', () => {
      const result = parseIcs(sampleIcs)
      const firstEvent = result.events[0]

      expect(firstEvent).toBeDefined()
      expect(firstEvent?.uid).toBeDefined()
      expect(firstEvent?.title).toBeDefined()
      expect(firstEvent?.start).toBeInstanceOf(Date)
      expect(firstEvent?.end).toBeInstanceOf(Date)
    })

    it('should filter events by window (past events)', () => {
      const oldIcs = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:old-event@test
DTSTART:20200101T090000Z
DTEND:20200101T100000Z
SUMMARY:Old Event
END:VEVENT
END:VCALENDAR`

      const result = parseIcs(oldIcs)

      // Old event should be filtered out
      expect(result.events.length).toBe(0)
      expect(result.debug.pastDroppedCount).toBe(1)
    })

    it('should handle malformed ICS gracefully', () => {
      const malformed = 'NOT AN ICS FILE'
      const result = parseIcs(malformed)

      expect(result.error).toBeDefined()
      expect(result.error?.kind).toBe('PARSE_FAILURE')
      expect(result.events.length).toBe(0)
    })

    it('should handle ICS without VEVENT blocks', () => {
      const noEvents = `BEGIN:VCALENDAR
VERSION:2.0
END:VCALENDAR`

      const result = parseIcs(noEvents)

      expect(result.error).toBeDefined()
      expect(result.error?.kind).toBe('NO_VEVENT')
      expect(result.debug.veventCount).toBe(0)
    })
  })

  describe('classifyIcsEvents', () => {
    it('should classify deadline events as school deadlines', () => {
      const result = parseIcs(sampleIcs)
      const classified = classifyIcsEvents(result.events)

      // "Deadline: Programming Assignment 1" should be classified as school deadline
      expect(classified.schoolDeadlines.length).toBeGreaterThan(0)

      const hasDeadline = classified.schoolDeadlines.some(d =>
        d.event.title.includes('Assignment')
      )
      expect(hasDeadline).toBe(true)
    })

    it('should classify regular events as personal events', () => {
      const result = parseIcs(sampleIcs)
      const classified = classifyIcsEvents(result.events)

      // "Software Engineering College" should be personal event
      expect(classified.personalEvents.length).toBeGreaterThan(0)

      const hasCollege = classified.personalEvents.some(e =>
        e.event.title.includes('Software Engineering College')
      )
      expect(hasCollege).toBe(true)
    })
  })
})
