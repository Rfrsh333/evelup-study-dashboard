import { supabase } from './supabase'
import type { AppState } from '@/domain/types'
import { getDefaultAppState } from './storage'

/**
 * Load app state from Supabase for authenticated user
 * Falls back to default state if no data found
 */
export async function loadAppStateFromSupabase(): Promise<AppState> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return getDefaultAppState()
    }

    const { data, error } = await supabase
      .from('user_state')
      .select('state')
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found - first time user
        return getDefaultAppState()
      }
      console.error('Error loading state from Supabase:', error)
      return getDefaultAppState()
    }

    if (!data || !data.state) {
      return getDefaultAppState()
    }

    // Parse dates from JSON
    const state = data.state as AppState
    return {
      ...state,
      deadlines: state.deadlines.map((dl) => ({
        ...dl,
        deadline: new Date(dl.deadline),
        createdAt: new Date(dl.createdAt),
        completedAt: dl.completedAt ? new Date(dl.completedAt) : undefined,
      })),
      focusSessions: state.focusSessions.map((fs) => ({
        ...fs,
        startTime: new Date(fs.startTime),
        endTime: fs.endTime ? new Date(fs.endTime) : undefined,
      })),
      studyLogs: state.studyLogs.map((log) => ({
        ...log,
        date: new Date(log.date),
      })),
      streak: {
        ...state.streak,
        lastStudyDate: state.streak.lastStudyDate
          ? new Date(state.streak.lastStudyDate)
          : undefined,
      },
      dailyObjectives: state.dailyObjectives
        ? {
            ...state.dailyObjectives,
            date: new Date(state.dailyObjectives.date),
          }
        : null,
      lastUpdated: new Date(state.lastUpdated),
    }
  } catch (error) {
    console.error('Failed to load state from Supabase:', error)
    return getDefaultAppState()
  }
}

/**
 * Save app state to Supabase with optimistic update pattern
 */
export async function saveAppStateToSupabase(state: AppState): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.warn('No user authenticated, cannot save state')
      return
    }

    const stateToSave = {
      ...state,
      lastUpdated: new Date(),
    }

    const { error } = await supabase
      .from('user_state')
      .upsert(
        {
          user_id: user.id,
          state: stateToSave,
        },
        {
          onConflict: 'user_id',
        }
      )

    if (error) {
      console.error('Error saving state to Supabase:', error)
      throw error
    }
  } catch (error) {
    console.error('Failed to save state to Supabase:', error)
    // In production, implement retry logic or queue
  }
}

/**
 * Clear app state from Supabase
 */
export async function clearAppStateFromSupabase(): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return
    }

    await supabase.from('user_state').delete().eq('user_id', user.id)
  } catch (error) {
    console.error('Failed to clear state from Supabase:', error)
  }
}
