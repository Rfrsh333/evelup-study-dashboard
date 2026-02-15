import { CardShell } from '@/components/common/CardShell'
import { useTranslation } from '@/i18n'

type StartHereCardProps = {
  compact?: boolean
}

function navigateToSettings(focus: 'calendar' | 'grades') {
  window.location.hash = focus === 'calendar' ? '#calendar' : '#grades'
  window.dispatchEvent(
    new CustomEvent('app:navigate', { detail: { view: 'settings', focus } })
  )
}

export function StartHereCard({ compact = false }: StartHereCardProps) {
  const { t } = useTranslation()

  if (compact) {
    return (
      <div data-testid="start-here-card">
        <CardShell title={t('dashboard.startHere.title')}>
        <p className="text-sm text-muted-foreground">{t('dashboard.startHere.compact')}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            className="rounded-md border border-border px-4 py-2 text-xs font-medium"
            onClick={() =>
              window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'week' } }))
            }
            data-testid="start-here-view-week"
          >
            {t('dashboard.startHere.cta.viewWeek')}
          </button>
        </div>
        </CardShell>
      </div>
    )
  }

  return (
    <div data-testid="start-here-card">
      <CardShell title={t('dashboard.startHere.title')}>
      <p className="text-sm text-muted-foreground">{t('dashboard.startHere.subtitle')}</p>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        <li>• {t('dashboard.startHere.bullets.importCalendar')}</li>
        <li>• {t('dashboard.startHere.bullets.importGrades')}</li>
        <li>• {t('dashboard.startHere.bullets.makeFocusBlocks')}</li>
      </ul>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
          onClick={() => navigateToSettings('calendar')}
          data-testid="start-here-import-calendar"
        >
          {t('dashboard.startHere.cta.importCalendar')}
        </button>
        <button
          className="rounded-md border border-border px-4 py-2 text-xs font-medium"
          onClick={() => navigateToSettings('grades')}
          data-testid="start-here-import-grades"
        >
          {t('dashboard.startHere.cta.importGrades')}
        </button>
        <button
          className="rounded-md border border-border px-4 py-2 text-xs font-medium"
          onClick={() =>
            window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'week' } }))
          }
          data-testid="start-here-view-week"
        >
          {t('dashboard.startHere.cta.viewWeek')}
        </button>
      </div>
      </CardShell>
    </div>
  )
}
