import { useEffect, useMemo, useState } from 'react'
import { useAppState } from '@/app/AppStateProvider'
import { CardShell } from '@/components/common/CardShell'
import { useTranslation } from '@/i18n'
import { toDate } from '@/lib/datetime'

type WeekFilter = 'school' | 'personal'

export function WeekPage() {
  const { state } = useAppState()
  const { t } = useTranslation()
  const [filter, setFilter] = useState<WeekFilter>('school')
  const [highlightPersonal, setHighlightPersonal] = useState(false)
  const { windowStart, windowEnd } = useMemo(() => {
    const now = new Date()
    return {
      windowStart: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      windowEnd: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
    }
  }, [])
  const normalizedPersonal = useMemo(
    () =>
      state.personalEvents
        .map((ev) => ({
          ...ev,
          start: toDate(ev.start),
          end: toDate(ev.end),
        }))
        .filter((ev) => Boolean(ev.start)),
    [state.personalEvents]
  )
  const normalizedSchool = useMemo(
    () =>
      state.schoolDeadlines
        .map((dl) => ({
          ...dl,
          deadline: toDate(dl.deadline),
        }))
        .filter((dl) => Boolean(dl.deadline)),
    [state.schoolDeadlines]
  )
  const personalInWindow = normalizedPersonal.filter(
    (ev) => (ev.start as Date) >= windowStart && (ev.start as Date) <= windowEnd
  )
  const schoolInWindow = normalizedSchool.filter(
    (dl) => (dl.deadline as Date) >= windowStart && (dl.deadline as Date) <= windowEnd
  )
  const personalVisible = filter === 'personal' ? personalInWindow : []
  const schoolVisible = filter === 'school' ? schoolInWindow : []

  useEffect(() => {
    if (import.meta.env.DEV) {
      const invalidPersonal = state.personalEvents.filter((ev) => !toDate(ev.start)).length
      const invalidSchool = state.schoolDeadlines.filter((dl) => !toDate(dl.deadline)).length
      console.debug('Week view window', {
        windowStart: windowStart.toISOString(),
        windowEnd: windowEnd.toISOString(),
        personalTotal: state.personalEvents.length,
        personalVisible: personalInWindow.length,
        schoolTotal: state.schoolDeadlines.length,
        schoolVisible: schoolInWindow.length,
        invalidPersonal,
        invalidSchool,
      })
    }
  }, [
    state.personalEvents,
    state.schoolDeadlines,
    personalInWindow.length,
    schoolInWindow.length,
    windowStart,
    windowEnd,
  ])

  useEffect(() => {
    if (filter === 'school' && schoolInWindow.length === 0 && personalInWindow.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilter('personal')
    }
  }, [filter, personalInWindow.length, schoolInWindow.length])

  useEffect(() => {
    const count = Number(localStorage.getItem('levelup-new-personal-events') || '0')
    if (count > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHighlightPersonal(true)
      setFilter('personal')
      localStorage.removeItem('levelup-new-personal-events')
      const timer = window.setTimeout(() => setHighlightPersonal(false), 3000)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [])

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ view?: string; focusTab?: WeekFilter }>).detail
      if (detail?.view === 'week' && detail.focusTab) {
        setFilter(detail.focusTab)
      }
    }
    window.addEventListener('app:navigate', handler)
    return () => window.removeEventListener('app:navigate', handler)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <button
          className={`rounded-full px-3 py-1 text-xs font-medium ${
          filter === 'school' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
          }`}
          onClick={() => setFilter('school')}
        >
          {t('week.filter.school')}
        </button>
        <button
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            filter === 'personal' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
          }`}
          onClick={() => setFilter('personal')}
        >
          {t('week.filter.personal')}
        </button>
      </div>

      {filter === 'school' && (
        <CardShell title={t('week.schoolTitle')}>
          <div className="space-y-3">
            {schoolInWindow.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('week.emptySchool')}</p>
            )}
            {state.schoolDeadlines.length > 0 && schoolInWindow.length === 0 && (
              <p className="text-xs text-muted-foreground">
                {t('calendar.outOfWindow', { count: state.schoolDeadlines.length })}
              </p>
            )}
            {schoolVisible.map((dl) => (
              <div key={dl.id} className="rounded-lg border border-border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>{dl.title}</span>
                  <span className="text-xs text-muted-foreground">{t('week.tag.school')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardShell>
      )}

      {filter === 'personal' && (
        <CardShell title={t('week.personalTitle')}>
          <div className="space-y-3">
            {personalInWindow.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('week.emptyPersonal')}</p>
            )}
            {state.personalEvents.length > 0 && personalInWindow.length === 0 && (
              <p className="text-xs text-muted-foreground">
                {t('calendar.outOfWindow', { count: state.personalEvents.length })}
              </p>
            )}
            {personalVisible.map((ev) => (
              <div
                key={ev.id}
                className={`rounded-lg border border-border p-3 text-sm ${
                  highlightPersonal ? 'ring-2 ring-primary/40' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{ev.title}</span>
                  <span className="text-xs text-muted-foreground">{t('week.tag.personal')}</span>
                </div>
              </div>
            ))}
          </div>
        </CardShell>
      )}
    </div>
  )
}
