import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
import type { AppState, DerivedState, Deadline, FocusSession, StudyLog } from '@/domain/types'
import { loadAppState, saveAppState, clearAppState, getDefaultAppState } from '@/lib/storage'
import { loadAppStateFromSupabase, saveAppStateToSupabase, clearAppStateFromSupabase } from '@/lib/supabase-storage'
import { supabase } from '@/lib/supabase'
import { calculateStreak } from '@/domain/streak'
import { calculateXPState, awardXP, XP_REWARDS } from '@/domain/xp'
import { calculateMomentumScore } from '@/domain/momentum'
import {
  generateDailyObjectives,
  shouldRegenerateObjectives,
  calculateObjectiveProgress,
  DAILY_OBJECTIVES_BONUS_XP,
} from '@/domain/daily-objectives'
import {
  getDefaultWeeklyChallenge,
  shouldResetWeeklyChallenge,
  calculateChallengeProgress,
  WEEKLY_CHALLENGE_XP,
} from '@/domain/weekly-challenge'
import { startOfWeek, endOfWeek } from 'date-fns'
import { generateDemoData } from '@/lib/demo-data'
import { trackEvent } from '@/lib/analytics'
import { calculatePercentile } from '@/domain/percentile'

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

  // Daily objectives
  markObjectiveComplete: (objectiveId: string) => void

  // Level-up notification
  clearLevelUpNotification: () => void

  // Loading state
  loading: boolean
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(getDefaultAppState)
  const [levelUpTriggered, setLevelUpTriggered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Load initial state based on auth status
  useEffect(() => {
    async function loadInitialState() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setIsAuthenticated(true)
          const supabaseState = await loadAppStateFromSupabase()
          setState(supabaseState)
        } else {
          setIsAuthenticated(false)
          const localState = loadAppState()
          setState(localState)
        }
      } catch (error) {
        console.error('Error loading initial state:', error)
        setState(getDefaultAppState())
      } finally {
        setLoading(false)
      }
    }

    loadInitialState()
  }, [])

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setIsAuthenticated(true)
        setLoading(true)
        const supabaseState = await loadAppStateFromSupabase()
        setState(supabaseState)
        setLoading(false)
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false)
        setState(getDefaultAppState())
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Persist state with debouncing (optimistic updates)
  useEffect(() => {
    if (loading) return // Don't save during initial load

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Debounce save (500ms)
    saveTimeoutRef.current = setTimeout(async () => {
      if (isAuthenticated) {
        await saveAppStateToSupabase(state)
      } else {
        saveAppState(state) // Fallback to localStorage
      }
    }, 500)

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [state, isAuthenticated, loading])

  // Auto-regenerate daily objectives if needed
  useEffect(() => {
    if (loading) return

    if (shouldRegenerateObjectives(state.dailyObjectives)) {
      setState((prev) => ({
        ...prev,
        dailyObjectives: {
          date: new Date(),
          objectives: generateDailyObjectives(),
          allCompleted: false,
          momentumMode: 'stable',
          bonusXPAwarded: false,
        },
      }))
    }
  }, [loading, state.dailyObjectives])

  // Auto-reset weekly challenge if needed
  useEffect(() => {
    if (loading) return

    if (shouldResetWeeklyChallenge(state.weeklyChallenge)) {
      setState((prev) => ({
        ...prev,
        weeklyChallenge: getDefaultWeeklyChallenge(),
      }))
    }
  }, [loading, state.weeklyChallenge])

  // Update weekly challenge progress automatically
  useEffect(() => {
    if (!state.weeklyChallenge || loading) return

    const updatedChallenge = calculateChallengeProgress(
      state.weeklyChallenge,
      state.studyLogs,
      state.focusSessions
    )

    // Award bonus XP if completed and not yet awarded
    if (updatedChallenge.completed && !updatedChallenge.xpAwarded) {
      const { newState: newXP, leveledUp } = awardXP(state.xp, WEEKLY_CHALLENGE_XP)
      if (leveledUp) setLevelUpTriggered(true)

      trackEvent('weekly_challenge_completed', {
        type: updatedChallenge.type,
        target: updatedChallenge.target,
      })

      setState((prev) => ({
        ...prev,
        weeklyChallenge: {
          ...updatedChallenge,
          xpAwarded: true,
        },
        xp: newXP,
      }))
    } else if (
      updatedChallenge.current !== state.weeklyChallenge.current ||
      updatedChallenge.completed !== state.weeklyChallenge.completed
    ) {
      // Just update progress
      setState((prev) => ({
        ...prev,
        weeklyChallenge: updatedChallenge,
      }))
    }
  }, [state.studyLogs, state.focusSessions, loading])

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

  // Fetch percentile asynchronously and update momentum
  useEffect(() => {
    if (loading) return

    async function fetchPercentile() {
      const percentile = await calculatePercentile(derived.momentum.score)
      if (percentile !== undefined && percentile !== derived.momentum.percentileThisWeek) {
        // Update momentum with percentile (without triggering re-render loop)
        derived.momentum.percentileThisWeek = percentile
      }
    }

    fetchPercentile()
  }, [derived.momentum.score, loading])

  // Update daily objectives progress automatically
  useEffect(() => {
    if (!state.dailyObjectives || loading) return

    const updatedObjectives = calculateObjectiveProgress(
      state.dailyObjectives.objectives,
      state.studyLogs,
      state.focusSessions
    )

    const allCompleted = updatedObjectives.every((obj) => obj.completed)

    // Award bonus XP if all completed and not yet awarded
    if (allCompleted && !state.dailyObjectives.bonusXPAwarded) {
      const { newState: newXP, leveledUp } = awardXP(state.xp, DAILY_OBJECTIVES_BONUS_XP)
      if (leveledUp) setLevelUpTriggered(true)

      setState((prev) => ({
        ...prev,
        dailyObjectives: prev.dailyObjectives
          ? {
              ...prev.dailyObjectives,
              objectives: updatedObjectives,
              allCompleted: true,
              bonusXPAwarded: true,
            }
          : null,
        xp: newXP,
      }))
    } else {
      // Just update progress
      setState((prev) => ({
        ...prev,
        dailyObjectives: prev.dailyObjectives
          ? {
              ...prev.dailyObjectives,
              objectives: updatedObjectives,
              allCompleted,
            }
          : null,
      }))
    }
  }, [state.studyLogs, state.focusSessions, loading])

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
    trackEvent('deadline_added', { title: deadline.title })
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
      if (leveledUp) {
        setLevelUpTriggered(true)
        trackEvent('level_up', { new_level: newXP.level })
      }

      trackEvent('deadline_completed', { deadline_id: id })

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
      if (leveledUp) {
        setLevelUpTriggered(true)
        trackEvent('level_up', { new_level: newXP.level })
      }

      trackEvent('focus_completed')

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

  const resetAppState = useCallback(async () => {
    trackEvent('data_reset')
    if (isAuthenticated) {
      await clearAppStateFromSupabase()
    } else {
      clearAppState()
    }
    setState(getDefaultAppState())
    setLevelUpTriggered(false)
  }, [isAuthenticated])

  const seedDemoData = useCallback(() => {
    trackEvent('demo_data_loaded')
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
      dailyObjectives: null, // Will auto-generate on next render
      weeklyChallenge: null, // Will auto-generate on next render
      preferences: {
        studyWindowStart: '16:00',
        studyWindowEnd: '18:00',
        language: 'nl',
      },
      version: 1,
      lastUpdated: new Date(),
    })

    setLevelUpTriggered(false)
  }, [])

  const markObjectiveComplete = useCallback((objectiveId: string) => {
    setState((prev) => {
      if (!prev.dailyObjectives) return prev

      const updatedObjectives = prev.dailyObjectives.objectives.map((obj) =>
        obj.id === objectiveId ? { ...obj, completed: true, current: obj.target } : obj
      )

      const allCompleted = updatedObjectives.every((obj) => obj.completed)

      // Award bonus XP if all completed
      let newXP = prev.xp
      let bonusAwarded = prev.dailyObjectives.bonusXPAwarded

      trackEvent('daily_objective_completed', { objective_id: objectiveId })

      if (allCompleted && !bonusAwarded) {
        const { newState, leveledUp } = awardXP(prev.xp, DAILY_OBJECTIVES_BONUS_XP)
        newXP = newState
        bonusAwarded = true
        if (leveledUp) {
          setLevelUpTriggered(true)
          trackEvent('level_up', { new_level: newXP.level })
        }
        trackEvent('all_daily_objectives_completed')
      }

      return {
        ...prev,
        dailyObjectives: {
          ...prev.dailyObjectives,
          objectives: updatedObjectives,
          allCompleted,
          bonusXPAwarded: bonusAwarded,
        },
        xp: newXP,
      }
    })
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
    markObjectiveComplete,
    clearLevelUpNotification,
    loading,
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
