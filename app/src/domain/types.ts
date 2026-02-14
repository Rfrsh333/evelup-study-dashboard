export type QuestStatus = 'on-track' | 'at-risk' | 'completed' | 'failed'

export interface Quest {
  id: string
  title: string
  deadline: Date
  status: QuestStatus
  xp: number
}

export interface FocusSession {
  id: string
  startTime: Date
  endTime?: Date
  duration: number
  completed: boolean
}

export interface StudyData {
  date: Date
  hours: number
  xp: number
}

export interface MomentumScore {
  value: number
  trend: number
  streak: number
}

export interface UserProgress {
  level: number
  currentXP: number
  nextLevelXP: number
  totalXP: number
}
