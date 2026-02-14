// Core domain types for LevelUp study dashboard

export type QuestStatus = 'on-track' | 'at-risk' | 'completed' | 'failed'

export interface SchoolDeadline {
  id: string
  title: string
  deadline: Date
  status: QuestStatus
  xp: number
  createdAt: Date
  completedAt?: Date
  source: 'lti' | 'manual'
}

export interface PersonalEvent {
  id: string
  title: string
  start: Date
  end: Date
  source: 'ics' | 'manual'
  tag?: 'focus_block'
}

export interface Assessment {
  id: string
  course: string
  item: string
  score: number | null
  weight: number | null
  date?: Date
  source: 'csv' | 'manual'
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
  percentileThisWeek?: number // 0-100 (user's percentile rank)
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

// User preferences
export interface UserPreferences {
  studyWindowStart: string // HH:mm format (e.g., '16:00')
  studyWindowEnd: string // HH:mm format (e.g., '18:00')
  language: 'nl' | 'en'
  preferredFocusStart: string // HH:mm
  preferredFocusEnd: string // HH:mm
  preferredFocusMinutes: number // 25 default
}

// Weekly challenge state
export interface WeeklyChallengeState {
  type: 'focus_sessions' | 'study_days' | 'study_minutes'
  target: number
  current: number
  completed: boolean
  weekStart: Date
  bonusXP: number
  xpAwarded: boolean
}

// Complete application state
export interface AppState {
  schoolDeadlines: SchoolDeadline[]
  personalEvents: PersonalEvent[]
  assessments: Assessment[]
  focusSessions: FocusSession[]
  studyLogs: StudyLog[]
  xp: XPState
  streak: StreakState
  dailyObjectives: DailyObjectivesState | null
  weeklyChallenge: WeeklyChallengeState | null
  preferences: UserPreferences
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

// Quest is an alias for SchoolDeadline (keeping for backward compatibility)
export type Quest = SchoolDeadline

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
