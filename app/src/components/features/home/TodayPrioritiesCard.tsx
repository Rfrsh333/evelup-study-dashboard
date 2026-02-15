import { CardShell } from '@/components/common/CardShell'
import type { SchoolDeadline } from '@/domain/types'
import { useTranslation } from '@/i18n'

interface TodayPrioritiesCardProps {
  priorities: SchoolDeadline[]
  onPlanFocus: () => void
}

export function TodayPrioritiesCard({ priorities, onPlanFocus }: TodayPrioritiesCardProps) {
  const { t } = useTranslation()

  return (
    <CardShell title={t('today.priorities.title')}>
      {priorities.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('today.priorities.empty')}</p>
      ) : (
        <div className="space-y-3">
          {priorities.map((dl) => (
            <div key={dl.id} className="rounded-lg border border-border bg-card/50 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span>{dl.title}</span>
                <span className="text-xs text-muted-foreground">{t('today.priorities.tag')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4">
        <button
          className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
          onClick={onPlanFocus}
        >
          {t('today.priorities.cta')}
        </button>
      </div>
    </CardShell>
  )
}
