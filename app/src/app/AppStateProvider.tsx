import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react'
import type { ReactNode } from 'react'
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import type {
  AppState,
  DerivedState,
  SchoolDeadline,
  FocusSession,
  StudyLog,
  PersonalEvent,
  Assessment,
} from '@/domain/types'
import { loadAppState, saveAppState, clearAppState, getDefaultAppState } from '@/lib/storage'
import { loadAppStateFromSupabase, saveAppStateToSupabase, clearAppStateFromSupabase } from '@/lib/supabase-storage'
import { calculateStreak } from '@/domain/streak'
import { calculateXPState, awardXP, XP_REWARDS } from '@/domain/xp'
import { calculateMomentumScore } from '@/domain/momentum'
import { calculatePerformanceIndex } from '@/domain/performance-index'
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
import { useAuth } from './AuthProvider'
import { SupabaseTableMissingError } from '@/lib/supabase-errors'
import { isSupabaseConfigured, setGlobalDbUnavailable, supabaseStatus } from '@/lib/supabase'
import { checkSupabaseHealth } from '@/lib/supabase-health'
import { calculatePercentile } from '@/domain/percentile'
import { makeId } from '@/lib/id'
import { fetchAssessmentsSafe } from '@/lib/assessments'
import { toDate, toIso } from '@/lib/datetime'

interface AppStateContextValue {
  // Core state
  state: AppState
  derived: DerivedState
  dbUnavailable: boolean

  // Actions
  addSchoolDeadline: (deadline: Omit<SchoolDeadline, 'id' | 'createdAt'>) => void
  addPersonalEvent: (event: Omit<PersonalEvent, 'id'>) => void
  importPersonalEvents: (events: Array<Omit<PersonalEvent, 'id'> & { uid?: string }>) => void
  addAssessment: (assessment: Omit<Assessment, 'id'>) => void
  updateDeadline: (id: string, updates: Partial<SchoolDeadline>) => void
  completeDeadline: (id: string) => void
  deleteDeadline: (id: string) => void

  addFocusSession: (session: Omit<FocusSession, 'id'>) => void
  completeFocusSession: (id: string) => void

  addStudyLog: (log: Omit<StudyLog, 'id'>) => void
  updatePreferences: (updates: Partial<AppState['preferences']>) => void

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

type PersonalEventInput = Omit<PersonalEvent, 'id'> & { id?: string; uid?: string }

function normalizePersonalEvent(event: PersonalEventInput, fallbackId?: string): PersonalEvent | null {
  const start = toDate(event.start)
  if (!start) return null
  const end = toDate(event.end) ?? new Date(start.getTime() + 60 * 60 * 1000)
  return {
    id: event.id ?? fallbackId ?? makeId('pe'),
    title: event.title,
    start,
    end,
    location: event.location,
    source: event.source,
    tag: event.tag,
  }
}

function personalEventKey(event: PersonalEventInput): string {
  const start = toDate(event.start)
  const startIso = start ? toIso(start) : 'invalid'
  if (event.uid) return event.uid
  return `${event.source}|${startIso}|${event.title}`
}

function mergePersonalEvents(
  existing: PersonalEvent[],
  incoming: PersonalEventInput[]
): { merged: PersonalEvent[]; invalidDates: number } {
  const map = new Map<string, PersonalEvent>()
  let invalidDates = 0

  existing.forEach((event) => {
    const normalized = normalizePersonalEvent(event, event.id)
    if (!normalized) {
      invalidDates += 1
      return
    }
    map.set(personalEventKey(normalized), normalized)
  })

  incoming.forEach((event) => {
    const normalized = normalizePersonalEvent(event)
    if (!normalized) {
      invalidDates += 1
      return
    }
    const key = personalEventKey({ ...normalized, uid: event.uid })
    if (!map.has(key)) {
      map.set(key, normalized)
    }
  })

  const merged = Array.from(map.values()).sort((a, b) => a.start.getTime() - b.start.getTime())
  return { merged, invalidDates }
}

function normalizeDeadline(deadline: SchoolDeadline): SchoolDeadline | null {
  const date = toDate(deadline.deadline)
  const createdAt = toDate(deadline.createdAt)
  if (!date || !createdAt) return null
  return {
    ...deadline,
    deadline: date,
    createdAt,
    completedAt: deadline.completedAt ? toDate(deadline.completedAt) ?? undefined : undefined,
  }
}

function normalizeState(state: AppState): AppState {
  const deadlines = state.schoolDeadlines
    .map((dl) => normalizeDeadline(dl))
    .filter((dl): dl is SchoolDeadline => Boolean(dl))
  const { merged: personalEvents } = mergePersonalEvents(state.personalEvents, [])
  return { ...state, schoolDeadlines: deadlines, personalEvents }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(getDefaultAppState)
  const [levelUpTriggered, setLevelUpTriggered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [persistReady, setPersistReady] = useState(false)
  const [dbUnavailable, setDbUnavailable] = useState(false)
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ value: boolean }>).detail
      if (detail?.value !== undefined) {
        setDbUnavailable(detail.value)
      }
    }
    window.addEventListener('supabase:dbUnavailable', handler)
    return () => window.removeEventListener('supabase:dbUnavailable', handler)
  }, [])

  // Load initial state based on auth status
  useEffect(() => {
    if (authLoading) return
    let cancelled = false

    const loadInitialState = async () => {
      if (!dbUnavailable && isSupabaseConfigured) {
        await checkSupabaseHealth()
      }
      if (supabaseStatus.dbUnavailable) {
        setDbUnavailable(true)
        setGlobalDbUnavailable(true)
      }

      setPersistReady(false)

      if (dbUnavailable) {
        try {
          const localState = loadAppState()
          if (!cancelled) setState(normalizeState(localState))
        } catch (error) {
          if (!cancelled) {
            console.error('Error loading local state:', error)
            setState(getDefaultAppState())
          }
        } finally {
          if (!cancelled) {
            setLoading(false)
            setPersistReady(true)
          }
        }
        return
      }

      if (!isSupabaseConfigured) {
        setDbUnavailable(true)
        setGlobalDbUnavailable(true)
        setIsAuthenticated(false)
        try {
          const localState = loadAppState()
          if (!cancelled) setState(normalizeState(localState))
        } catch (error) {
          if (!cancelled) {
            console.error('Error loading local state:', error)
            setState(getDefaultAppState())
          }
        } finally {
          if (!cancelled) {
            setLoading(false)
            setPersistReady(true)
          }
        }
        return
      }

      setDbUnavailable(false)
      setGlobalDbUnavailable(false)

      if (user) {
        setIsAuthenticated(true)
        // Allow rendering immediately; hydrate from Supabase in the background.
        setLoading(false)
        try {
          const supabaseState = await loadAppStateFromSupabase()
          if (!cancelled) setState(normalizeState(supabaseState))
        } catch (error) {
          if (!cancelled) {
            if (error instanceof SupabaseTableMissingError) {
              setDbUnavailable(true)
              setGlobalDbUnavailable(true)
              const localState = loadAppState()
              setState(normalizeState(localState))
            } else {
              console.error('Error loading Supabase state:', error)
              setState(getDefaultAppState())
            }
          }
        } finally {
          if (!cancelled) setPersistReady(true)
        }
        return
      }

      setIsAuthenticated(false)
      try {
        const localState = loadAppState()
        if (!cancelled) setState(normalizeState(localState))
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading local state:', error)
          setState(getDefaultAppState())
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
          setPersistReady(true)
        }
      }
    }

    loadInitialState()

    return () => {
      cancelled = true
    }
  }, [authLoading, user?.id, dbUnavailable])

  useEffect(() => {
    if (!user || dbUnavailable || !isSupabaseConfigured || supabaseStatus.dbUnavailable) return
    let cancelled = false
    async function loadAssessments() {
      const assessments = await fetchAssessmentsSafe()
      if (cancelled || assessments.length === 0) return
      setState((prev) => {
        const existing = new Set(
          prev.assessments.map((assessment) => `${assessment.course}-${assessment.item}`)
        )
        const merged = [
          ...prev.assessments,
          ...assessments.filter(
            (assessment) => !existing.has(`${assessment.course}-${assessment.item}`)
          ),
        ]
        return { ...prev, assessments: merged }
      })
    }
    loadAssessments()
    return () => {
      cancelled = true
    }
  }, [user?.id, dbUnavailable])

  // Persist state with debouncing (optimistic updates)
  useEffect(() => {
    if (loading || !persistReady) return // Don't save during initial load

    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Debounce save (500ms)
    saveTimeoutRef.current = setTimeout(async () => {
      if (isAuthenticated && !dbUnavailable) {
        try {
          await saveAppStateToSupabase(state)
        } catch (error) {
          if (error instanceof SupabaseTableMissingError) {
            setDbUnavailable(true)
            setGlobalDbUnavailable(true)
            saveAppState(state) // Fallback to localStorage
            return
          }
          console.error('Error saving state to Supabase:', error)
          saveAppState(state)
        }
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
      state.schoolDeadlines,
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

    // Calculate Performance Index
    const performanceIndex = calculatePerformanceIndex(
      state.assessments,
      state.schoolDeadlines,
      state.focusSessions,
      state.studyLogs,
      state.streak,
      weekStart
    )

    return {
      momentum,
      thisWeekStudyMinutes,
      thisWeekFocusSessions,
      levelUpTriggered,
      performanceIndex,
      percentile: momentum.percentileThisWeek,
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
  const addSchoolDeadline = useCallback((deadline: Omit<SchoolDeadline, 'id' | 'createdAt'>) => {
    const normalizedDeadline = {
      ...deadline,
      deadline: toDate(deadline.deadline) ?? new Date(),
    }
    const newDeadline: SchoolDeadline = {
      ...normalizedDeadline,
      id: makeId('dl'),
      createdAt: new Date(),
    }
    setState((prev) => {
      const next = {
        ...prev,
        schoolDeadlines: [...prev.schoolDeadlines, newDeadline],
      }
      if (import.meta.env.DEV) {
        console.debug('State after import: schoolDeadlines', {
          added: newDeadline,
          total: next.schoolDeadlines.length,
        })
      }
      return next
    })
    trackEvent('deadline_added', { title: deadline.title })
  }, [])

  const addPersonalEvent = useCallback((event: Omit<PersonalEvent, 'id'>) => {
    setState((prev) => {
      const { merged, invalidDates } = mergePersonalEvents(prev.personalEvents, [event])
      if (import.meta.env.DEV) {
        console.debug('State after import: personalEvents', {
          added: event,
          total: merged.length,
          invalidDates,
        })
      }
      return { ...prev, personalEvents: merged }
    })
  }, [])

  const importPersonalEvents = useCallback(
    (events: Array<Omit<PersonalEvent, 'id'> & { uid?: string }>) => {
      if (events.length === 0) return
      setState((prev) => {
        const { merged, invalidDates } = mergePersonalEvents(prev.personalEvents, events)
        if (import.meta.env.DEV) {
          console.debug('ICS import merge', {
            incoming: events.length,
            total: merged.length,
            invalidDates,
          })
        }
        return { ...prev, personalEvents: merged }
      })
    },
    []
  )

  const addAssessment = useCallback((assessment: Omit<Assessment, 'id'>) => {
    const newAssessment: Assessment = {
      ...assessment,
      id: makeId('as'),
    }
    setState((prev) => ({
      ...prev,
      assessments: [...prev.assessments, newAssessment],
    }))
  }, [])

  const updateDeadline = useCallback((id: string, updates: Partial<SchoolDeadline>) => {
    setState((prev) => ({
      ...prev,
      schoolDeadlines: prev.schoolDeadlines.map((dl) => (dl.id === id ? { ...dl, ...updates } : dl)),
    }))
  }, [])

  const completeDeadline = useCallback((id: string) => {
    setState((prev) => {
      if (!prev.schoolDeadlines.find((dl) => dl.id === id)) return prev

      // Award XP for completing deadline
      const { newState: newXP, leveledUp } = awardXP(prev.xp, XP_REWARDS.DEADLINE_COMPLETED)
      if (leveledUp) {
        setLevelUpTriggered(true)
        trackEvent('level_up', { new_level: newXP.level })
      }

      trackEvent('deadline_completed', { deadline_id: id })

      return {
        ...prev,
        schoolDeadlines: prev.schoolDeadlines.map((dl) =>
          dl.id === id ? { ...dl, status: 'completed', completedAt: new Date() } : dl
        ),
        xp: newXP,
      }
    })
  }, [])

  const deleteDeadline = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      schoolDeadlines: prev.schoolDeadlines.filter((dl) => dl.id !== id),
    }))
  }, [])

  const addFocusSession = useCallback((session: Omit<FocusSession, 'id'>) => {
    const newSession: FocusSession = {
      ...session,
      id: makeId('fs'),
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
        id: makeId('log'),
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

  const updatePreferences = useCallback((updates: Partial<AppState['preferences']>) => {
    setState((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        ...updates,
      },
    }))
  }, [])

  const resetAppState = useCallback(async () => {
    trackEvent('data_reset')
    if (isAuthenticated && !dbUnavailable) {
      try {
        await clearAppStateFromSupabase()
      } catch (error) {
        if (error instanceof SupabaseTableMissingError) {
          setDbUnavailable(true)
          setGlobalDbUnavailable(true)
        }
      }
    } else {
      clearAppState()
    }
    setState(getDefaultAppState())
    setLevelUpTriggered(false)
  }, [isAuthenticated, dbUnavailable])

  const seedDemoData = useCallback(() => {
    trackEvent('demo_data_loaded')
    const { schoolDeadlines, personalEvents, focusSessions, studyLogs } = generateDemoData()

    // Calculate total XP from demo data
    const totalXP =
      studyLogs.reduce((sum, log) => sum + log.xpAwarded, 0) +
      focusSessions.reduce((sum, fs) => sum + (fs.completed ? fs.xpAwarded : 0), 0) +
      schoolDeadlines
        .filter((dl) => dl.status === 'completed')
        .reduce((sum) => sum + XP_REWARDS.DEADLINE_COMPLETED, 0)

    const xpState = calculateXPState(totalXP)
    const streak = calculateStreak(studyLogs)

    setState({
      schoolDeadlines,
      personalEvents,
      assessments: [],
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
        preferredFocusStart: '16:00',
        preferredFocusEnd: '18:00',
        preferredFocusMinutes: 25,
      },
      tier: 'free',
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
    dbUnavailable,
    addSchoolDeadline,
    addPersonalEvent,
    importPersonalEvents,
    addAssessment,
    updateDeadline,
    completeDeadline,
    deleteDeadline,
    addFocusSession,
    completeFocusSession,
    addStudyLog,
    updatePreferences,
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
