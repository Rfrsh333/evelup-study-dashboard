// Core domain types for LevelUp study dashboard

export type QuestStatus = 'on-track' | 'at-risk' | 'completed' | 'failed'

export interface Deadline {
  id: string
  title: string
  deadline: Date
  status: QuestStatus
  xp: number
  createdAt: Date
  completedAt?: Date
}

export interface FocusSession {
  id: string
  startTime: Date
  endTime?: Date
  duration: number // in minutes
  completed: boolean
  xpAwarded: number
}

export interface StudyLog {
  id: string
  date: Date
  minutes: number
  xpAwarded: number
  notes?: string
}

export interface StreakState {
  currentStreak: number
  longestStreak: number
  lastStudyDate?: Date
}

export interface XPState {
  totalXP: number
  level: number
  xpForCurrentLevel: number
  xpForNextLevel: number
}

export interface MomentumBreakdown {
  consistency: number // 0-100
  deadlineControl: number // 0-100
  focusScore: number // 0-100
  streakBonus: number // 0-100
}

export interface MomentumScore {
  score: number // 0-100 (weighted total)
  breakdown: MomentumBreakdown
  trend?: MomentumTrend
}

export interface MomentumTrend {
  deltaScore: number
  deltaPercentage: number
  direction: 'up' | 'down' | 'neutral'
}

export interface WeeklyData {
  studyMinutes: number
  focusSessions: number
  deadlineControlPercentage: number
  consistencyScore: number
}

export interface DailyObjectivesState {
  date: Date
  objectives: DailyObjective[]
  allCompleted: boolean
  momentumMode: 'recovery' | 'stable' | 'performance'
  bonusXPAwarded: boolean
}

export interface DailyObjective {
  id: string
  type: 'focus_sessions' | 'study_minutes' | 'deadline_review'
  target: number
  current: number
  completed: boolean
  label: string
  labelNL: string
}

// Complete application state
export interface AppState {
  deadlines: Deadline[]
  focusSessions: FocusSession[]
  studyLogs: StudyLog[]
  xp: XPState
  streak: StreakState
  dailyObjectives: DailyObjectivesState | null
  version: number
  lastUpdated: Date
}

// UI-specific derived state (calculated, not stored)
export interface DerivedState {
  momentum: MomentumScore
  thisWeekStudyMinutes: number
  thisWeekFocusSessions: number
  levelUpTriggered: boolean
}

// Quest is an alias for Deadline (keeping for backward compatibility)
export type Quest = Deadline

// Legacy types (keeping for compatibility)
export interface StudyData {
  date: Date
  hours: number
  xp: number
}

export interface UserProgress {
  level: number
  currentXP: number
  nextLevelXP: number
  totalXP: number
}
