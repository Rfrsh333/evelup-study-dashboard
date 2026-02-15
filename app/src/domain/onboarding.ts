import type { AppState } from '@/domain/types'

export type OnboardingProgress = {
  scheduleDone: boolean
  gradesDone: boolean
  completedCount: number
}

export function getOnboardingProgress(state: AppState, icsUrl?: string | null): OnboardingProgress {
  const scheduleDone =
    state.personalEvents.length > 0 ||
    state.schoolDeadlines.length > 0 ||
    Boolean(icsUrl && icsUrl.trim().length > 0)
  const gradesDone = state.assessments.length > 0
  const completedCount = Number(scheduleDone) + Number(gradesDone)

  return { scheduleDone, gradesDone, completedCount }
}
