import { CardShell } from '@/components/common/CardShell'
import { getRelativeTimeParts, formatTimeRange } from '@/domain/schedule-overview'
import type { PersonalEvent, SchoolDeadline } from '@/domain/types'
import { useTranslation } from '@/i18n'
import { AlarmClock, CalendarClock, Clock3, MapPin } from 'lucide-react'
import { format } from 'date-fns'

interface NextUpCardProps {
  nextClass: PersonalEvent | null
  nextDeadline: SchoolDeadline | null
  classesToday: number
  deadlinesToday: number
  hasRosterEvents: boolean
  onImportRoster: () => void
  onViewWeek: () => void
}

function formatRelativeLabel(eventStart: Date, t: (key: string, params?: Record<string, string | number>) => string) {
  const parts = getRelativeTimeParts(eventStart)
  if (parts.isNow) return t('dashboard.nextUp.now')
  if (parts.hours > 0 && parts.minutes > 0) {
    return t('dashboard.nextUp.inTime', { value: `${parts.hours}u ${parts.minutes}m` })
  }
  if (parts.hours > 0) {
    return t('dashboard.nextUp.inTime', { value: `${parts.hours}u` })
  }
  return t('dashboard.nextUp.inTime', { value: `${parts.minutes}m` })
}

export function NextUpCard({
  nextClass,
  nextDeadline,
  classesToday,
  deadlinesToday,
  hasRosterEvents,
  onImportRoster,
  onViewWeek,
}: NextUpCardProps) {
  const { t } = useTranslation()

  return (
    <div data-testid="next-up">
      <CardShell
        title={t('dashboard.nextUp.title')}
        className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-background/60 p-4" data-testid="next-class">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <CalendarClock className="h-4 w-4" />
              {t('dashboard.nextUp.nextClass')}
            </div>
            {nextClass ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold">{nextClass.title}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTimeRange(nextClass.start, nextClass.end)}
                </p>
                {nextClass.location && (
                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {nextClass.location}
                  </p>
                )}
                <p className="text-xs font-medium text-primary">
                  {formatRelativeLabel(nextClass.start, t)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('dashboard.nextUp.noClasses')}</p>
            )}
          </div>

          <div className="rounded-lg border border-border/70 bg-background/60 p-4" data-testid="next-deadline">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <AlarmClock className="h-4 w-4" />
              {t('dashboard.nextUp.nextDeadline')}
            </div>
            {nextDeadline ? (
              <div className="space-y-1">
                <p className="text-sm font-semibold">{nextDeadline.title}</p>
                <p className="text-xs text-muted-foreground">
                  {format(nextDeadline.deadline, 'dd MMM • HH:mm')}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('dashboard.nextUp.noDeadlines')}</p>
            )}
          </div>

          <div className="rounded-lg border border-border/70 bg-background/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <Clock3 className="h-4 w-4" />
              {t('dashboard.nextUp.todaySummary')}
            </div>
            <p className="text-sm">
              {t('dashboard.nextUp.todayCounts', { classes: classesToday, deadlines: deadlinesToday })}
            </p>

            <div className="mt-4">
              {!hasRosterEvents ? (
                <button
                  className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
                  onClick={onImportRoster}
                  data-testid="next-up-import-roster"
                >
                  {t('dashboard.nextUp.ctaImportRoster')}
                </button>
              ) : (
                <button
                  className="rounded-md border border-border px-4 py-2 text-xs font-medium"
                  onClick={onViewWeek}
                  data-testid="next-up-view-week"
                >
                  {t('dashboard.nextUp.ctaViewWeek')}
                </button>
              )}
            </div>
          </div>
        </div>
      </CardShell>
    </div>
  )
}
