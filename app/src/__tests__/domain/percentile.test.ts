import { describe, it, expect } from 'vitest'
import { getPercentileBadge } from '@/domain/percentile'

describe('Percentile', () => {
  describe('getPercentileBadge', () => {
    it('should return top10 badge for 90th percentile or above', () => {
      expect(getPercentileBadge(90)).toBe('top10')
      expect(getPercentileBadge(95)).toBe('top10')
      expect(getPercentileBadge(100)).toBe('top10')
    })

    it('should return top25 badge for 75-89th percentile', () => {
      expect(getPercentileBadge(75)).toBe('top25')
      expect(getPercentileBadge(80)).toBe('top25')
      expect(getPercentileBadge(89)).toBe('top25')
    })

    it('should return top50 badge for 50-74th percentile', () => {
      expect(getPercentileBadge(50)).toBe('top50')
      expect(getPercentileBadge(60)).toBe('top50')
      expect(getPercentileBadge(74)).toBe('top50')
    })

    it('should return null for below 50th percentile', () => {
      expect(getPercentileBadge(0)).toBeNull()
      expect(getPercentileBadge(25)).toBeNull()
      expect(getPercentileBadge(49)).toBeNull()
    })

    it('should handle edge cases correctly', () => {
      expect(getPercentileBadge(50)).toBe('top50') // Exactly 50
      expect(getPercentileBadge(75)).toBe('top25') // Exactly 75
      expect(getPercentileBadge(90)).toBe('top10') // Exactly 90
    })
  })
})
