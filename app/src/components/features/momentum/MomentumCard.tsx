import { TrendingUp, TrendingDown, Minus, Trophy } from 'lucide-react'
import { CardShell } from '@/components/common/CardShell'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAppState } from '@/app/AppStateProvider'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import { getPercentileBadge } from '@/domain/percentile'
import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export function MomentumCard() {
  const { state, derived } = useAppState()
  const { t } = useTranslation()
  const { momentum } = derived
  const { score, breakdown, trend, percentileThisWeek } = momentum
  const { currentStreak } = state.streak
  const momentumMode = state.dailyObjectives?.momentumMode || 'stable'

  const trendColor = trend
    ? trend.direction === 'up'
      ? 'text-green-500'
      : trend.direction === 'down'
        ? 'text-red-500'
        : 'text-muted-foreground'
    : 'text-muted-foreground'

  const TrendIcon = trend
    ? trend.direction === 'up'
      ? TrendingUp
      : trend.direction === 'down'
        ? TrendingDown
        : Minus
    : Minus

  // Track percentile view
  useEffect(() => {
    if (percentileThisWeek !== undefined) {
      trackEvent('percentile_viewed', { percentile: percentileThisWeek })
    }
  }, [percentileThisWeek])

  // Get mode guidance text
  const getModeGuidance = () => {
    switch (momentumMode) {
      case 'recovery':
        return t('momentum.recoveryGuidance')
      case 'stable':
        return t('momentum.stableGuidance')
      case 'performance':
        return t('momentum.performanceGuidance')
      default:
        return t('momentum.stableGuidance')
    }
  }

  const percentileBadge = percentileThisWeek !== undefined ? getPercentileBadge(percentileThisWeek) : null

  return (
    <CardShell title={t('momentum.title')}>
      <div className="flex flex-col gap-6">
        {/* Mode Guidance */}
        <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
          <p className="text-sm font-medium text-foreground">{getModeGuidance()}</p>
        </div>

        {/* Score Display */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative">
            <div className="text-7xl font-bold tracking-tighter">{score}%</div>
            {trend && (
              <div className={cn('absolute -right-12 top-0 flex items-center gap-1', trendColor)}>
                <TrendIcon className="h-5 w-5" />
                <span className="text-lg font-semibold">
                  {trend.deltaPercentage > 0 && '+'}
                  {trend.deltaPercentage}%
                </span>
              </div>
            )}
          </div>

          {/* Percentile Display */}
          {percentileThisWeek !== undefined && (
            <div className="mt-4 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-medium">
                {t('momentum.topPercentile', { percentile: percentileThisWeek })}
              </p>
              {percentileBadge && (
                <Badge variant="outline" className="ml-2">
                  {t(`momentum.${percentileBadge}Badge`)}
                </Badge>
              )}
            </div>
          )}
          {percentileThisWeek !== undefined && (
            <p className="mt-1 text-xs text-muted-foreground">{t('momentum.basedOnActiveUsers')}</p>
          )}

          <div className="mt-6 flex gap-8 text-center">
            <div>
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-sm text-muted-foreground">{t('momentum.dayStreak')}</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div>
              <p className="text-2xl font-bold">{derived.thisWeekFocusSessions}</p>
              <p className="text-sm text-muted-foreground">{t('momentum.sessions')}</p>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-sm font-medium text-muted-foreground">{t('momentum.breakdown')}</p>
          <div className="space-y-3">
            <BreakdownItem
              label={t('momentum.consistency')}
              value={breakdown.consistency}
              weight={40}
              max={100}
            />
            <BreakdownItem
              label={t('momentum.deadlineControl')}
              value={breakdown.deadlineControl}
              weight={30}
              max={100}
            />
            <BreakdownItem label={t('momentum.focusScore')} value={breakdown.focusScore} weight={20} max={100} />
            <BreakdownItem label={t('momentum.streak')} value={breakdown.streakBonus} weight={10} max={100} />
          </div>
        </div>
      </div>
    </CardShell>
  )
}

function BreakdownItem({
  label,
  value,
  weight,
  max,
}: {
  label: string
  value: number
  weight: number
  max: number
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {label} ({weight}%)
        </span>
        <span className="font-medium">{value}%</span>
      </div>
      <Progress value={value} max={max} className="h-1.5" />
    </div>
  )
}
