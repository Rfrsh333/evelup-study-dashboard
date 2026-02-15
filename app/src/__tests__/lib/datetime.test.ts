import { describe, it, expect } from 'vitest'
import { toDate, toIso } from '@/lib/datetime'

describe('datetime helpers', () => {
  describe('toDate', () => {
    it('should return null for invalid inputs', () => {
      expect(toDate(null)).toBeNull()
      expect(toDate(undefined)).toBeNull()
      expect(toDate({})).toBeNull()
      expect(toDate('invalid')).toBeNull()
      expect(toDate(new Date('invalid'))).toBeNull()
    })

    it('should handle Date objects', () => {
      const now = new Date()
      expect(toDate(now)).toEqual(now)
      expect(toDate(now)).toBeInstanceOf(Date)
    })

    it('should parse ISO strings', () => {
      const isoString = '2026-02-15T12:00:00.000Z'
      const result = toDate(isoString)
      expect(result).toBeInstanceOf(Date)
      expect(result?.toISOString()).toBe(isoString)
    })

    it('should parse timestamps', () => {
      const timestamp = Date.now()
      const result = toDate(timestamp)
      expect(result).toBeInstanceOf(Date)
      expect(result?.getTime()).toBe(timestamp)
    })
  })

  describe('toIso', () => {
    it('should convert Date to ISO string', () => {
      const date = new Date('2026-02-15T12:00:00.000Z')
      expect(toIso(date)).toBe('2026-02-15T12:00:00.000Z')
    })
  })
})
