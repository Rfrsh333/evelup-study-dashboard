import { useAppState } from '@/app/AppStateProvider'
import { getTodayOverview } from '@/domain/today'
import { getTodayPriorities, getWeekPreviewItems } from '@/domain/overview'
import { pickBestFocusWindow, getBusyIntervalsForDay, getFreeWindows } from '@/domain/schedule'
import { useTranslation } from '@/i18n'
import { trackEvent } from '@/lib/analytics'
import { StartHereCard } from '@/components/common/StartHereCard'
import { TodayPrioritiesCard } from '@/components/features/home/TodayPrioritiesCard'
import { FocusBlockCard } from '@/components/features/home/FocusBlockCard'
import { WeekPreviewCard } from '@/components/features/home/WeekPreviewCard'
import { EliteHeader } from '@/components/features/performance/EliteHeader'

export function DashboardPage() {
  const { state, derived, addPersonalEvent } = useAppState()
  const { t } = useTranslation()
  const { schoolUrgent, personalToday } = getTodayOverview(
    state.schoolDeadlines,
    state.personalEvents
  )
  const priorities = getTodayPriorities(state.schoolDeadlines)
  const weekPreview = getWeekPreviewItems(state.schoolDeadlines, state.personalEvents)
  const hasAnyData =
    state.schoolDeadlines.length > 0 ||
    state.personalEvents.length > 0 ||
    state.assessments.length > 0
  const now = new Date()
  const windowStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000)
  const personalWindowCount = state.personalEvents.filter(
    (ev) => ev.start >= windowStart && ev.start <= windowEnd
  ).length
  const schoolWindowCount = state.schoolDeadlines.filter(
    (dl) => dl.deadline >= windowStart && dl.deadline <= windowEnd
  ).length
  const windowCount = personalWindowCount + schoolWindowCount

  if (import.meta.env.DEV) {
    console.debug('Dashboard window', {
      windowStart: windowStart.toISOString(),
      windowEnd: windowEnd.toISOString(),
      personalWindowCount,
      personalToday: personalToday.length,
    })
  }
  const busy = getBusyIntervalsForDay(state.personalEvents, now)
  const dayStart = new Date(now)
  dayStart.setHours(8, 0, 0, 0)
  const dayEnd = new Date(now)
  dayEnd.setHours(22, 0, 0, 0)
  const freeWindows = getFreeWindows(
    busy,
    dayStart,
    dayEnd,
    Math.max(15, state.preferences.preferredFocusMinutes)
  )
  let suggestion = pickBestFocusWindow(
    freeWindows,
    {
      preferredStart: state.preferences.preferredFocusStart,
      preferredEnd: state.preferences.preferredFocusEnd,
      minMinutes: state.preferences.preferredFocusMinutes,
    },
    {
      urgentCount: schoolUrgent.length,
      nearestDue: schoolUrgent[0]?.deadline,
    },
    now
  )
  if (!suggestion) {
    const fallbackWindows = getFreeWindows(busy, dayStart, dayEnd, 15)
    suggestion = pickBestFocusWindow(
      fallbackWindows,
      {
        preferredStart: state.preferences.preferredFocusStart,
        preferredEnd: state.preferences.preferredFocusEnd,
        minMinutes: 15,
      },
      {
        urgentCount: schoolUrgent.length,
        nearestDue: schoolUrgent[0]?.deadline,
      },
      now
    )
  }

  const handleScheduleFocus = () => {
    const minutes = suggestion?.minutes ?? 25
    if (suggestion) {
      addPersonalEvent({
        title:
          t('today.focusSuggestion.focusTitle', { minutes }) ?? `Focusblok (${minutes} min)`,
        start: suggestion.start,
        end: suggestion.end,
        source: 'manual',
        tag: 'focus_block',
      })
      void trackEvent('focus_block_scheduled', {
        minutes,
        startTime: suggestion.start.toISOString(),
        reasonCode: suggestion.reasonCode,
      })
      return
    }

    const fallbackStart = new Date(now)
    fallbackStart.setDate(fallbackStart.getDate() + 1)
    const [hours, mins] = state.preferences.preferredFocusStart.split(':').map(Number)
    fallbackStart.setHours(hours || 9, mins || 0, 0, 0)
    const fallbackEnd = new Date(fallbackStart.getTime() + minutes * 60 * 1000)
    addPersonalEvent({
      title: t('today.focusSuggestion.focusTitle', { minutes }) ?? `Focusblok (${minutes} min)`,
      start: fallbackStart,
      end: fallbackEnd,
      source: 'manual',
      tag: 'focus_block',
    })
    void trackEvent('focus_block_scheduled', {
      minutes,
      startTime: fallbackStart.toISOString(),
      reasonCode: 'fallback_tomorrow',
    })
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{t('dashboard.hero.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('dashboard.hero.subtitle')}</p>
      </header>

      {hasAnyData && (
        <EliteHeader
          performanceIndex={derived.performanceIndex}
          percentile={derived.percentile}
        />
      )}

      {!hasAnyData && <StartHereCard />}
      {hasAnyData && <StartHereCard compact />}

      {hasAnyData && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TodayPrioritiesCard priorities={priorities} onPlanFocus={handleScheduleFocus} />
          <FocusBlockCard
            onStart={handleScheduleFocus}
            helperText={t('focusBlock.helper')}
            secondaryCta={t('focusBlock.ctaSecondary')}
            onSecondary={() =>
              window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'week' } }))
            }
          />
          <WeekPreviewCard
            items={weekPreview}
            emptyMessage={
              windowCount > 0
                ? t('calendar.outOfWindow', { count: windowCount })
                : t('week.preview.empty')
            }
            onViewWeek={() =>
              window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'week' } }))
            }
          />
        </div>
      )}

      {!hasAnyData && (
        <FocusBlockCard
          onStart={handleScheduleFocus}
          helperText={t('focusBlock.helper')}
          secondaryCta={t('focusBlock.ctaSecondary')}
          onSecondary={() =>
            window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'week' } }))
          }
        />
      )}
    </div>
  )
}
