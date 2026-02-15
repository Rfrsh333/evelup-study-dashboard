import { CardShell } from '@/components/common/CardShell'
import { useTranslation } from '@/i18n'

export function StartHereCard() {
  const { t } = useTranslation()

  return (
    <CardShell title={t('dashboard.startHere.title')}>
      <p className="text-sm text-muted-foreground">{t('dashboard.startHere.subtitle')}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
          onClick={() =>
            window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'settings' } }))
          }
        >
          {t('dashboard.startHere.ctaSchedule')}
        </button>
        <button
          className="rounded-md border border-border px-4 py-2 text-xs font-medium"
          onClick={() =>
            window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'settings' } }))
          }
        >
          {t('dashboard.startHere.ctaProgress')}
        </button>
      </div>
    </CardShell>
  )
}
