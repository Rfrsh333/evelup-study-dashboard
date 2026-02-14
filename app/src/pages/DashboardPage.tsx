import { DailyObjectiveCard } from '@/components/features/daily-objectives/DailyObjectiveCard'
import { WeeklyChallengeCard } from '@/components/features/weekly-challenge/WeeklyChallengeCard'
import { MomentumCard } from '@/components/features/momentum/MomentumCard'
import { DeadlinesCard } from '@/components/features/deadlines/DeadlinesCard'
import { FocusCard } from '@/components/features/focus/FocusCard'
import { StudyChartCard } from '@/components/features/study/StudyChartCard'
import { RetentionBanner } from '@/components/features/retention/RetentionBanner'
import { BlockProgressCard } from '@/components/features/block-progress/BlockProgressCard'
import { useAppState } from '@/app/AppStateProvider'
import { getTodayOverview } from '@/domain/today'
import { pickBestFocusWindow, getBusyIntervalsForDay, getFreeWindows } from '@/domain/schedule'
import { useTranslation } from '@/i18n'
import { trackEvent } from '@/lib/analytics'
import { CardShell } from '@/components/common/CardShell'

export function DashboardPage() {
  const { state, addPersonalEvent } = useAppState()
  const { t } = useTranslation()
  const { schoolUrgent, personalToday } = getTodayOverview(
    state.schoolDeadlines,
    state.personalEvents
  )
  const now = new Date()
  const windowStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const windowEnd = new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000)
  const personalWindowCount = state.personalEvents.filter(
    (ev) => ev.start >= windowStart && ev.start <= windowEnd
  ).length

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
    if (!suggestion) return
    addPersonalEvent({
      title:
        t('today.focusSuggestion.focusTitle', { minutes: suggestion.minutes }) ??
        `Focusblok (${suggestion.minutes} min)`,
      start: suggestion.start,
      end: suggestion.end,
      source: 'manual',
      tag: 'focus_block',
    })
    void trackEvent('focus_block_scheduled', {
      minutes: suggestion.minutes,
      startTime: suggestion.start.toISOString(),
      reasonCode: suggestion.reasonCode,
    })
  }

  return (
    <div className="space-y-6">
      {/* Retention messaging */}
      <RetentionBanner />

      <CardShell title={t('dashboard.promise.title')}>
        <p className="text-sm text-muted-foreground">{t('dashboard.promise.subtitle')}</p>
        <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {t('dashboard.onboarding.step', { step: 1 })}
            </p>
            <p className="mt-1 font-medium">{t('dashboard.onboarding.step1')}</p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {t('dashboard.onboarding.step', { step: 2 })}
            </p>
            <p className="mt-1 font-medium">{t('dashboard.onboarding.step2')}</p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {t('dashboard.onboarding.step', { step: 3 })}
            </p>
            <p className="mt-1 font-medium">{t('dashboard.onboarding.step3')}</p>
          </div>
        </div>
      </CardShell>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('today.school.title')}</h2>
          <button
            className="text-xs font-medium text-primary"
            onClick={() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'week' } }))}
          >
            {t('today.school.cta')}
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-3">
            {schoolUrgent.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('today.school.empty')}</p>
            )}
            {schoolUrgent.map((dl) => (
              <div key={dl.id} className="rounded-lg border border-border bg-card/50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>{dl.title}</span>
                  <span className="text-xs text-muted-foreground">School</span>
                </div>
                <p className="text-xs text-muted-foreground">{dl.status}</p>
              </div>
            ))}
          </div>
          <BlockProgressCard />
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('today.personal.title')}</h2>
          {personalToday.length === 0 && (
            <button
              className="text-xs font-medium text-primary"
              onClick={() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'settings' } }))}
            >
              {t('today.personal.cta')}
            </button>
          )}
        </div>
        <div className="space-y-3">
          {personalToday.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {personalWindowCount > 0
                ? t('calendar.outOfWindow', { count: personalWindowCount })
                : t('today.personal.empty')}
            </p>
          ) : (
            personalToday.map((ev) => (
              <div key={ev.id} className="rounded-lg border border-border bg-card/50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>{ev.title}</span>
                  <span className="text-xs text-muted-foreground">Persoonlijk</span>
                </div>
              </div>
            ))
          )}
        </div>
        {personalToday.length === 0 && personalWindowCount > 0 && (
          <button
            className="text-xs font-medium text-primary"
            onClick={() =>
              window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'week' } }))
            }
          >
            {t('today.personal.viewWeek')}
          </button>
        )}

        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
          <p className="font-medium">{t('today.focusSuggestion.title')}</p>
          {suggestion ? (
            <>
              <p className="text-xs text-muted-foreground">
                {t('today.focusSuggestion.body', {
                  time: suggestion.start.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
                  minutes: suggestion.minutes,
                })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {suggestion.reasonCode === 'preferred_window'
                  ? t('today.focusSuggestion.reason.preferred')
                  : suggestion.reasonCode === 'before_deadline'
                    ? t('today.focusSuggestion.reason.deadline')
                    : t('today.focusSuggestion.reason.gap')}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground"
                  onClick={handleScheduleFocus}
                >
                  {t('today.focusSuggestion.cta.schedule')}
                </button>
                <button className="rounded-md border border-border px-3 py-1 text-xs font-medium">
                  {t('today.focusSuggestion.cta.otherTime')}
                </button>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">{t('today.focusSuggestion.empty')}</p>
          )}
        </div>
      </section>

      {/* Daily Objectives - Top Priority */}
      <DailyObjectiveCard />

      {/* Weekly Challenge */}
      <WeeklyChallengeCard />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MomentumCard />
        <DeadlinesCard />
        <FocusCard />
        <StudyChartCard />
      </div>
    </div>
  )
}
