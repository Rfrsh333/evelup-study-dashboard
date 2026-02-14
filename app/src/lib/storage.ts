import { z } from 'zod'
import type { AppState } from '@/domain/types'

// Storage configuration
const STORAGE_KEY = 'levelup-app-state'
const CURRENT_VERSION = 1

// Zod schemas for validation
const DeadlineSchema = z.object({
  id: z.string(),
  title: z.string(),
  deadline: z.coerce.date(),
  status: z.enum(['on-track', 'at-risk', 'completed', 'failed']),
  xp: z.number(),
  createdAt: z.coerce.date(),
  completedAt: z.coerce.date().optional(),
})

const FocusSessionSchema = z.object({
  id: z.string(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  duration: z.number(),
  completed: z.boolean(),
  xpAwarded: z.number(),
})

const StudyLogSchema = z.object({
  id: z.string(),
  date: z.coerce.date(),
  minutes: z.number(),
  xpAwarded: z.number(),
  notes: z.string().optional(),
})

const StreakStateSchema = z.object({
  currentStreak: z.number(),
  longestStreak: z.number(),
  lastStudyDate: z.coerce.date().optional(),
})

const XPStateSchema = z.object({
  totalXP: z.number(),
  level: z.number(),
  xpForCurrentLevel: z.number(),
  xpForNextLevel: z.number(),
})

const AppStateSchema = z.object({
  deadlines: z.array(DeadlineSchema),
  focusSessions: z.array(FocusSessionSchema),
  studyLogs: z.array(StudyLogSchema),
  xp: XPStateSchema,
  streak: StreakStateSchema,
  version: z.number(),
  lastUpdated: z.coerce.date(),
})

// Default initial state
export function getDefaultAppState(): AppState {
  return {
    deadlines: [],
    focusSessions: [],
    studyLogs: [],
    xp: {
      totalXP: 0,
      level: 1,
      xpForCurrentLevel: 0,
      xpForNextLevel: 100,
    },
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastStudyDate: undefined,
    },
    version: CURRENT_VERSION,
    lastUpdated: new Date(),
  }
}

// Load state from localStorage with validation
export function loadAppState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return getDefaultAppState()
    }

    const parsed = JSON.parse(stored)
    const validated = AppStateSchema.parse(parsed)

    // Version migration logic (if needed in future)
    if (validated.version < CURRENT_VERSION) {
      return migrateState(validated)
    }

    return validated
  } catch (error) {
    console.error('Failed to load app state, using defaults:', error)
    return getDefaultAppState()
  }
}

// Save state to localStorage
export function saveAppState(state: AppState): void {
  try {
    const toSave = {
      ...state,
      version: CURRENT_VERSION,
      lastUpdated: new Date(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
  } catch (error) {
    console.error('Failed to save app state:', error)
  }
}

// Clear all app data
export function clearAppState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear app state:', error)
  }
}

// Migrate state from old version to new (placeholder for future)
function migrateState(_oldState: AppState): AppState {
  // For now, just return default state if migration needed
  // In future, implement version-specific migrations
  console.warn('State migration triggered, using defaults')
  return getDefaultAppState()
}

// Generic localStorage helpers (legacy, kept for compatibility)
export function getFromStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`Error reading from storage: ${error}`)
    return null
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`Error saving to storage: ${error}`)
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing from storage: ${error}`)
  }
}
