/**
 * EliteHeader - Top performance dashboard component
 *
 * Displays:
 * - Performance Index (0-100)
 * - Percentile ranking (Top X%)
 * - Trend indicator (↑/↓/→)
 * - Target average
 * - Score gap
 * - Elite performance messaging
 */

import { ArrowUp, ArrowDown, ArrowRight, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { PerformanceIndex, PerformanceTrend } from '@/domain/types'
import { getPerformanceTier, getPerformanceMessage } from '@/domain/performance-index'
import { LanguageToggle } from '@/components/common/LanguageToggle'
import { useTranslation } from '@/i18n'

interface EliteHeaderProps {
  performanceIndex: PerformanceIndex
  percentile?: number
  className?: string
}

export function EliteHeader({ performanceIndex, percentile, className }: EliteHeaderProps) {
  const { t } = useTranslation()
  const { index, trend, targetAverage, scoreGap } = performanceIndex
  const tier = getPerformanceTier(index)
  const message = getPerformanceMessage(index, trend, percentile)

  return (
    <Card className={cn('overflow-hidden border-2', getTierBorderColor(tier), className)}>
      <CardContent className="relative p-8">
        {/* Language Toggle - Top Right */}
        <div className="absolute right-4 top-4">
          <LanguageToggle />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Performance Index */}
          <div className="flex flex-col items-center justify-center lg:items-start">
            <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {t('dashboard.performanceIndex.title')}
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <div className={cn('text-6xl font-bold tabular-nums', getTierTextColor(tier))}>
                {index}
              </div>
              <div className="text-2xl font-medium text-muted-foreground">/100</div>
            </div>
            <TrendIndicator trend={trend} className="mt-4" />
          </div>

          {/* Center: Percentile & Tier */}
          <div className="flex flex-col items-center justify-center">
            {percentile !== undefined && percentile >= 50 && (
              <>
                <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  {t('dashboard.performanceIndex.percentile', { value: (100 - percentile).toString() })}
                </div>
                <div className="mt-2 text-4xl font-bold text-foreground">
                  {t('dashboard.performanceIndex.percentile', { value: (100 - percentile).toString() })}
                </div>
              </>
            )}
            <div
              className={cn(
                'mt-4 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wide',
                getTierBadgeStyle(tier)
              )}
            >
              {getTierLabel(tier, t)}
            </div>
          </div>

          {/* Right: Target & Gap */}
          <div className="flex flex-col items-center justify-center lg:items-end">
            <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {t('dashboard.eliteHeader.labelTargetAverage')}
            </div>
            <div className="mt-2 text-4xl font-bold text-foreground">{targetAverage}</div>
            {scoreGap !== 0 && (
              <div className="mt-3 text-sm">
                <span className="text-muted-foreground">{t('dashboard.eliteHeader.labelScoreGap')}: </span>
                <span
                  className={cn(
                    'font-semibold',
                    scoreGap < 0 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                  )}
                >
                  {scoreGap > 0 ? '+' : ''}
                  {scoreGap.toFixed(2)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Performance Message */}
        <div className="mt-8 flex items-start gap-3 rounded-lg bg-muted/50 p-4">
          <TrendingUp className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
          <p className="text-sm font-medium leading-relaxed text-foreground">
            {t(message.key, message.params)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function TrendIndicator({ trend, className }: { trend: PerformanceTrend; className?: string }) {
  const { t } = useTranslation()
  const Icon =
    trend.direction === 'up' ? ArrowUp : trend.direction === 'down' ? ArrowDown : ArrowRight

  const iconColor =
    trend.direction === 'up'
      ? 'text-green-600 dark:text-green-400'
      : trend.direction === 'down'
        ? 'text-red-600 dark:text-red-400'
        : 'text-muted-foreground'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Icon className={cn('h-5 w-5', iconColor)} />
      <div className="text-sm">
        <span className={cn('font-semibold', iconColor)}>
          {trend.deltaIndex > 0 ? '+' : ''}
          {trend.deltaIndex.toFixed(1)}
        </span>
        <span className="ml-1.5 text-muted-foreground">{t(`dashboard.trend.${trend.direction}`)}</span>
      </div>
    </div>
  )
}

function getTierBorderColor(tier: ReturnType<typeof getPerformanceTier>): string {
  switch (tier) {
    case 'elite':
      return 'border-purple-500/30 dark:border-purple-400/30'
    case 'high-performer':
      return 'border-blue-500/30 dark:border-blue-400/30'
    case 'on-track':
      return 'border-green-500/30 dark:border-green-400/30'
    case 'needs-improvement':
      return 'border-amber-500/30 dark:border-amber-400/30'
  }
}

function getTierTextColor(tier: ReturnType<typeof getPerformanceTier>): string {
  switch (tier) {
    case 'elite':
      return 'text-purple-600 dark:text-purple-400'
    case 'high-performer':
      return 'text-blue-600 dark:text-blue-400'
    case 'on-track':
      return 'text-green-600 dark:text-green-400'
    case 'needs-improvement':
      return 'text-amber-600 dark:text-amber-400'
  }
}

function getTierBadgeStyle(tier: ReturnType<typeof getPerformanceTier>): string {
  switch (tier) {
    case 'elite':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200'
    case 'high-performer':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200'
    case 'on-track':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
    case 'needs-improvement':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200'
  }
}

function getTierLabel(
  tier: ReturnType<typeof getPerformanceTier>,
  t: (key: string) => string
): string {
  switch (tier) {
    case 'elite':
      return t('tiers.elite')
    case 'high-performer':
      return t('tiers.highPerformer')
    case 'on-track':
      return t('tiers.onTrack')
    case 'needs-improvement':
      return t('tiers.needsImprovement')
  }
}
