import { CardShell } from '@/components/common/CardShell'
import { formatTimeRange } from '@/domain/schedule-overview'
import type { PersonalEvent } from '@/domain/types'
import { useTranslation } from '@/i18n'
import { MapPin } from 'lucide-react'

interface TodayScheduleCardProps {
  events: PersonalEvent[]
  hasMore: boolean
  hasRosterEvents: boolean
  onViewWeek: () => void
  onImportRoster: () => void
}

export function TodayScheduleCard({
  events,
  hasMore,
  hasRosterEvents,
  onViewWeek,
  onImportRoster,
}: TodayScheduleCardProps) {
  const { t } = useTranslation()

  return (
    <div data-testid="today-events">
      <CardShell title={t('dashboard.todayEvents.title')}>
        {events.length === 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{t('dashboard.todayEvents.empty')}</p>
            {!hasRosterEvents && (
              <button
                className="rounded-md border border-border px-4 py-2 text-xs font-medium"
                onClick={onImportRoster}
                data-testid="today-events-import-roster"
              >
                {t('dashboard.nextUp.ctaImportRoster')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="rounded-lg border border-border/70 bg-card/50 p-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="truncate text-sm font-medium">{event.title}</p>
                  <p className="shrink-0 text-xs text-muted-foreground">
                    {formatTimeRange(event.start, event.end)}
                  </p>
                </div>
                {event.location && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {event.location}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <button
            className="rounded-md border border-border px-4 py-2 text-xs font-medium"
            onClick={onViewWeek}
            data-testid="today-events-view-week"
          >
            {hasMore ? t('dashboard.todayEvents.ctaMore') : t('dashboard.nextUp.ctaViewWeek')}
          </button>
        </div>
      </CardShell>
    </div>
  )
}
