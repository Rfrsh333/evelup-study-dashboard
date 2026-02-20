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
  location?: string
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
  status: 'passed' | 'failed' | 'pending'
  blockId?: string
  source: 'csv' | 'pdf' | 'manual'
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

// Elite Performance Index types
export interface PerformanceIndexBreakdown {
  gradeProgression: number // 0-100
  blockCompletion: number // 0-100
  focusConsistency: number // 0-100
  deadlineAdherence: number // 0-100
  weeklyStreak: number // 0-100
}

export interface PerformanceTrend {
  deltaIndex: number
  deltaPercentage: number
  direction: 'up' | 'down' | 'stable'
  weekComparison: string
}

export interface PerformanceIndex {
  index: number // 0-100
  breakdown: PerformanceIndexBreakdown
  trend: PerformanceTrend
  targetAverage: number
  scoreGap: number
}

// Elite tier definition
export type UserTier = 'free' | 'elite'

export interface TierFeatures {
  historyDays: number
  canJoinGroups: boolean
  hasDetailedBreakdown: boolean
  hasMonthlyReport: boolean
}

// Performance groups (Elite tier feature)
export interface PerformanceGroup {
  id: string
  name: string
  inviteCode: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface GroupMember {
  id: string
  groupId: string
  userId: string
  joinedAt: Date
}

export interface WeeklySnapshot {
  id: string
  groupId: string
  userId: string
  weekStart: Date
  performanceIndex: number // 0-100
  percentile: number | null // 0-100
  createdAt: Date
}

// UI-specific group view types
export interface GroupMemberWithStats {
  userId: string
  rank: number // 1-based rank in group
  currentIndex: number
  previousIndex?: number
  trend: 'up' | 'down' | 'stable'
  joinedAt: Date
}

export interface GroupComparison {
  groupId: string
  groupName: string
  weekStart: Date
  members: GroupMemberWithStats[]
  yourRank: number
  totalMembers: number
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
  tier: UserTier
  version: number
  lastUpdated: Date
}

// UI-specific derived state (calculated, not stored)
export interface DerivedState {
  momentum: MomentumScore
  thisWeekStudyMinutes: number
  thisWeekFocusSessions: number
  levelUpTriggered: boolean
  performanceIndex: PerformanceIndex
  percentile?: number
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
