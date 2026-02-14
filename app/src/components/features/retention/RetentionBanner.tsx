import { AlertCircle, TrendingUp, Calendar } from 'lucide-react'
import { useAppState } from '@/app/AppStateProvider'
import { useTranslation } from '@/i18n'
import { differenceInHours, format } from 'date-fns'

export function RetentionBanner() {
  const { state, derived, dbUnavailable } = useAppState()
  const { t, ready } = useTranslation()
  const { currentStreak, lastStudyDate } = state.streak
  const { studyWindowStart, studyWindowEnd } = state.preferences

  if (!ready) {
    return <div className="h-10 rounded-lg bg-muted/40" aria-hidden />
  }

  if (dbUnavailable) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-900">
        <p className="text-sm font-medium">{t('system.dbLocalMode.title')}</p>
        <p className="text-xs opacity-80">{t('system.dbLocalMode.subtitle')}</p>
      </div>
    )
  }

  // Check if user is inactive (>24h since last study)
  const isInactive =
    lastStudyDate && differenceInHours(new Date(), new Date(lastStudyDate)) > 24

  // Check if current time is within study window
  const isWithinStudyWindow = () => {
    try {
      const now = new Date()
      const currentTime = format(now, 'HH:mm')
      const start = studyWindowStart
      const end = studyWindowEnd

      // Simple string comparison for time
      return currentTime >= start && currentTime <= end
    } catch {
      return false
    }
  }

  const withinWindow = isWithinStudyWindow()

  // Show streak broken message if streak was broken
  const streakBroken = currentStreak === 0 && lastStudyDate

  // Show variable reward insight
  const showInsight = derived.momentum.trend?.direction === 'up'

  // Priority: streak broken > inactive warning > study window > insight
  if (streakBroken) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <Calendar className="h-5 w-5 flex-shrink-0 text-amber-600" />
        <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
          {t('retention.streakBroken')}
        </p>
      </div>
    )
  }

  if (isInactive) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
        <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
        <p className="text-sm font-medium text-red-900 dark:text-red-100">
          {t('retention.inactiveWarning')}
        </p>
      </div>
    )
  }

  if (withinWindow) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
        <Calendar className="h-5 w-5 flex-shrink-0 text-primary" />
        <p className="text-sm font-medium text-primary">
          {t('retention.withinStudyWindow')}
        </p>
      </div>
    )
  }

  if (showInsight) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3">
        <TrendingUp className="h-5 w-5 flex-shrink-0 text-green-600" />
        <p className="text-sm font-medium text-green-900 dark:text-green-100">
          {t('retention.consistencyRising')}
        </p>
      </div>
    )
  }

  // No banner to show
  return null
}
