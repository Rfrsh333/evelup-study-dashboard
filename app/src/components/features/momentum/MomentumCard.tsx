import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { CardShell } from '@/components/common/CardShell'
import { Progress } from '@/components/ui/progress'
import { useAppState } from '@/app/AppStateProvider'
import { cn } from '@/lib/utils'

export function MomentumCard() {
  const { state, derived } = useAppState()
  const { momentum } = derived
  const { score, breakdown, trend } = momentum
  const { currentStreak } = state.streak

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

  return (
    <CardShell title="Momentum this week">
      <div className="flex flex-col gap-6">
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
          <div className="mt-6 flex gap-8 text-center">
            <div>
              <p className="text-2xl font-bold">{currentStreak}</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div>
              <p className="text-2xl font-bold">{derived.thisWeekFocusSessions}</p>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3 border-t border-border pt-4">
          <p className="text-sm font-medium text-muted-foreground">Breakdown</p>
          <div className="space-y-3">
            <BreakdownItem
              label="Consistency"
              value={breakdown.consistency}
              weight={40}
              max={100}
            />
            <BreakdownItem
              label="Deadline Control"
              value={breakdown.deadlineControl}
              weight={30}
              max={100}
            />
            <BreakdownItem label="Focus Score" value={breakdown.focusScore} weight={20} max={100} />
            <BreakdownItem label="Streak" value={breakdown.streakBonus} weight={10} max={100} />
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
