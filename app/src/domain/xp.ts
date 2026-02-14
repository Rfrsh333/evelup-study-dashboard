import type { XPState } from './types'

// XP awards for different actions
export const XP_REWARDS = {
  FOCUS_SESSION: 10,
  DEADLINE_COMPLETED: 20,
  STUDY_DAY: 5,
} as const

// Level progression constants
const BASE_XP = 100
const LEVEL_MULTIPLIER = 1.15 // 15% increase per level

/**
 * Calculate the total XP required to reach a specific level
 * Formula: Base XP * (multiplier ^ (level - 1))
 */
export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0
  return Math.floor(BASE_XP * Math.pow(LEVEL_MULTIPLIER, level - 2))
}

/**
 * Calculate the total XP required to reach the next level
 */
export function xpRequiredForNextLevel(currentLevel: number): number {
  return xpRequiredForLevel(currentLevel + 1)
}

/**
 * Calculate cumulative XP required to reach a level
 * (sum of all previous level requirements)
 */
export function cumulativeXPForLevel(level: number): number {
  if (level <= 1) return 0
  let total = 0
  for (let i = 2; i <= level; i++) {
    total += xpRequiredForLevel(i)
  }
  return total
}

/**
 * Calculate level from total XP
 */
export function calculateLevel(totalXP: number): number {
  if (totalXP < 0) return 1

  let level = 1
  let cumulativeXP = 0

  while (true) {
    const nextLevelXP = xpRequiredForLevel(level + 1)
    if (cumulativeXP + nextLevelXP > totalXP) {
      break
    }
    cumulativeXP += nextLevelXP
    level++
  }

  return level
}

/**
 * Calculate XP progress for current level
 */
export function xpForCurrentLevel(totalXP: number, level: number): number {
  const cumulativeXP = cumulativeXPForLevel(level)
  return totalXP - cumulativeXP
}

/**
 * Calculate complete XP state from total XP
 */
export function calculateXPState(totalXP: number): XPState {
  const level = calculateLevel(totalXP)
  const xpForNext = xpRequiredForNextLevel(level)
  const xpForCurrent = xpForCurrentLevel(totalXP, level)

  return {
    totalXP,
    level,
    xpForCurrentLevel: xpForCurrent,
    xpForNextLevel: xpForNext,
  }
}

/**
 * Check if leveling up occurred
 */
export function didLevelUp(previousXP: number, newXP: number): boolean {
  const previousLevel = calculateLevel(previousXP)
  const newLevel = calculateLevel(newXP)
  return newLevel > previousLevel
}

/**
 * Award XP and return updated state with level-up flag
 */
export function awardXP(
  currentState: XPState,
  amount: number
): { newState: XPState; leveledUp: boolean } {
  const newTotalXP = currentState.totalXP + amount
  const newState = calculateXPState(newTotalXP)
  const leveledUp = newState.level > currentState.level

  return { newState, leveledUp }
}

/**
 * Get level title based on level number
 */
export function getLevelTitle(level: number): string {
  if (level === 1) return 'Beginner'
  if (level === 2) return 'Learner'
  if (level === 3) return 'Consistent'
  if (level === 4) return 'Dedicated'
  if (level === 5) return 'Advanced'
  if (level >= 6 && level < 10) return 'Expert'
  if (level >= 10 && level < 15) return 'Master'
  if (level >= 15) return 'Legend'
  return 'Unknown'
}
