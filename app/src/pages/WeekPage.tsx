import { useEffect, useState } from 'react'
import { useAppState } from '@/app/AppStateProvider'
import { CardShell } from '@/components/common/CardShell'
import { useTranslation } from '@/i18n'

type WeekFilter = 'school' | 'personal'

export function WeekPage() {
  const { state } = useAppState()
  const { t } = useTranslation()
  const [filter, setFilter] = useState<WeekFilter>('school')
  const [highlightPersonal, setHighlightPersonal] = useState(false)

  useEffect(() => {
    const count = Number(localStorage.getItem('levelup-new-personal-events') || '0')
    if (count > 0) {
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
            {state.schoolDeadlines.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('week.emptySchool')}</p>
            )}
            {state.schoolDeadlines.map((dl) => (
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
            {state.personalEvents.length === 0 && (
              <p className="text-sm text-muted-foreground">{t('week.emptyPersonal')}</p>
            )}
            {state.personalEvents.map((ev) => (
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
