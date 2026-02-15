import { CardShell } from '@/components/common/CardShell'
import type { PreviewItem } from '@/domain/overview'
import { useTranslation } from '@/i18n'

interface WeekPreviewCardProps {
  items: PreviewItem[]
  emptyMessage: string
  onViewWeek: () => void
}

export function WeekPreviewCard({ items, emptyMessage, onViewWeek }: WeekPreviewCardProps) {
  const { t } = useTranslation()

  return (
    <CardShell title={t('week.preview.title')}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span className="truncate">{item.title}</span>
              <span className="text-xs text-muted-foreground">
                {item.date.toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="mt-4">
        <button
          className="rounded-md border border-border px-4 py-2 text-xs font-medium"
          onClick={onViewWeek}
        >
          {t('week.preview.cta')}
        </button>
      </div>
    </CardShell>
  )
}
