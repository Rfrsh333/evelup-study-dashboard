import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { AppState, DerivedState, Deadline, FocusSession, StudyLog } from '@/domain/types'
import { loadAppState, saveAppState, clearAppState, getDefaultAppState } from '@/lib/storage'
import { calculateStreak } from '@/domain/streak'
import { calculateXPState, awardXP, XP_REWARDS } from '@/domain/xp'
import { calculateMomentumScore } from '@/domain/momentum'
import { startOfWeek, endOfWeek } from 'date-fns'
import { generateDemoData } from '@/lib/demo-data'

interface AppStateContextValue {
  // Core state
  state: AppState
  derived: DerivedState

  // Actions
  addDeadline: (deadline: Omit<Deadline, 'id' | 'createdAt'>) => void
  updateDeadline: (id: string, updates: Partial<Deadline>) => void
  completeDeadline: (id: string) => void
  deleteDeadline: (id: string) => void

  addFocusSession: (session: Omit<FocusSession, 'id'>) => void
  completeFocusSession: (id: string) => void

  addStudyLog: (log: Omit<StudyLog, 'id'>) => void

  resetAppState: () => void
  seedDemoData: () => void

  // Level-up notification
  clearLevelUpNotification: () => void
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadAppState())
  const [levelUpTriggered, setLevelUpTriggered] = useState(false)

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    saveAppState(state)
  }, [state])

  // Calculate derived state with memoization
  const derived = useMemo<DerivedState>(() => {
    const momentum = calculateMomentumScore(
      state.studyLogs,
      state.focusSessions,
      state.deadlines,
      state.streak.currentStreak
    )

    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

    const thisWeekStudyMinutes = state.studyLogs
      .filter((log) => {
        const logDate = new Date(log.date)
        return logDate >= weekStart && logDate <= weekEnd
      })
      .reduce((sum, log) => sum + log.minutes, 0)

    const thisWeekFocusSessions = state.focusSessions.filter((session) => {
      const sessionDate = new Date(session.startTime)
      return session.completed && sessionDate >= weekStart && sessionDate <= weekEnd
    }).length

    return {
      momentum,
      thisWeekStudyMinutes,
      thisWeekFocusSessions,
      levelUpTriggered,
    }
  }, [state, levelUpTriggered])

  // Actions
  const addDeadline = useCallback((deadline: Omit<Deadline, 'id' | 'createdAt'>) => {
    const newDeadline: Deadline = {
      ...deadline,
      id: `dl-${Date.now()}`,
      createdAt: new Date(),
    }
    setState((prev) => ({
      ...prev,
      deadlines: [...prev.deadlines, newDeadline],
    }))
  }, [])

  const updateDeadline = useCallback((id: string, updates: Partial<Deadline>) => {
    setState((prev) => ({
      ...prev,
      deadlines: prev.deadlines.map((dl) => (dl.id === id ? { ...dl, ...updates } : dl)),
    }))
  }, [])

  const completeDeadline = useCallback((id: string) => {
    setState((prev) => {
      if (!prev.deadlines.find((dl) => dl.id === id)) return prev

      // Award XP for completing deadline
      const { newState: newXP, leveledUp } = awardXP(prev.xp, XP_REWARDS.DEADLINE_COMPLETED)
      if (leveledUp) setLevelUpTriggered(true)

      return {
        ...prev,
        deadlines: prev.deadlines.map((dl) =>
          dl.id === id ? { ...dl, status: 'completed', completedAt: new Date() } : dl
        ),
        xp: newXP,
      }
    })
  }, [])

  const deleteDeadline = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      deadlines: prev.deadlines.filter((dl) => dl.id !== id),
    }))
  }, [])

  const addFocusSession = useCallback((session: Omit<FocusSession, 'id'>) => {
    const newSession: FocusSession = {
      ...session,
      id: `fs-${Date.now()}`,
    }
    setState((prev) => ({
      ...prev,
      focusSessions: [...prev.focusSessions, newSession],
    }))
  }, [])

  const completeFocusSession = useCallback((id: string) => {
    setState((prev) => {
      // Award XP for completing focus session
      const { newState: newXP, leveledUp } = awardXP(prev.xp, XP_REWARDS.FOCUS_SESSION)
      if (leveledUp) setLevelUpTriggered(true)

      return {
        ...prev,
        focusSessions: prev.focusSessions.map((fs) =>
          fs.id === id ? { ...fs, completed: true, xpAwarded: XP_REWARDS.FOCUS_SESSION } : fs
        ),
        xp: newXP,
      }
    })
  }, [])

  const addStudyLog = useCallback((log: Omit<StudyLog, 'id'>) => {
    setState((prev) => {
      const newLog: StudyLog = {
        ...log,
        id: `log-${Date.now()}`,
      }

      const newStudyLogs = [...prev.studyLogs, newLog]

      // Recalculate streak
      const newStreak = calculateStreak(newStudyLogs)

      // Award XP for study day (if log has XP)
      let newXP = prev.xp
      let leveledUp = false
      if (log.xpAwarded > 0) {
        const result = awardXP(prev.xp, log.xpAwarded)
        newXP = result.newState
        leveledUp = result.leveledUp
        if (leveledUp) setLevelUpTriggered(true)
      }

      return {
        ...prev,
        studyLogs: newStudyLogs,
        streak: newStreak,
        xp: newXP,
      }
    })
  }, [])

  const resetAppState = useCallback(() => {
    clearAppState()
    setState(getDefaultAppState())
    setLevelUpTriggered(false)
  }, [])

  const seedDemoData = useCallback(() => {
    const { deadlines, focusSessions, studyLogs } = generateDemoData()

    // Calculate total XP from demo data
    const totalXP =
      studyLogs.reduce((sum, log) => sum + log.xpAwarded, 0) +
      focusSessions.reduce((sum, fs) => sum + (fs.completed ? fs.xpAwarded : 0), 0) +
      deadlines
        .filter((dl) => dl.status === 'completed')
        .reduce((sum) => sum + XP_REWARDS.DEADLINE_COMPLETED, 0)

    const xpState = calculateXPState(totalXP)
    const streak = calculateStreak(studyLogs)

    setState({
      deadlines,
      focusSessions,
      studyLogs,
      xp: xpState,
      streak,
      version: 1,
      lastUpdated: new Date(),
    })

    setLevelUpTriggered(false)
  }, [])

  const clearLevelUpNotification = useCallback(() => {
    setLevelUpTriggered(false)
  }, [])

  const value: AppStateContextValue = {
    state,
    derived,
    addDeadline,
    updateDeadline,
    completeDeadline,
    deleteDeadline,
    addFocusSession,
    completeFocusSession,
    addStudyLog,
    resetAppState,
    seedDemoData,
    clearLevelUpNotification,
  }

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
}

export function useAppState() {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider')
  }
  return context
}
