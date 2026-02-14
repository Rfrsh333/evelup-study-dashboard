import { TrendingUp } from 'lucide-react'
import { CardShell } from '@/components/common/CardShell'

export function MomentumCard() {
  const momentumScore = 72
  const trend = 8

  return (
    <CardShell title="Momentum this week">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="relative">
          <div className="text-7xl font-bold tracking-tighter">{momentumScore}%</div>
          <div className="absolute -right-12 top-0 flex items-center gap-1 text-green-500">
            <TrendingUp className="h-5 w-5" />
            <span className="text-lg font-semibold">+{trend}%</span>
          </div>
        </div>
        <div className="mt-6 flex gap-8 text-center">
          <div>
            <p className="text-2xl font-bold">7</p>
            <p className="text-sm text-muted-foreground">Day Streak</p>
          </div>
          <div className="h-12 w-px bg-border" />
          <div>
            <p className="text-2xl font-bold">12</p>
            <p className="text-sm text-muted-foreground">Sessions</p>
          </div>
        </div>
      </div>
    </CardShell>
  )
}
