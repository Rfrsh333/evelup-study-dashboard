import { CardShell } from '@/components/common/CardShell'
import { Button } from '@/components/ui/button'
import { Play, Timer } from 'lucide-react'
import { useAppState } from '@/app/AppStateProvider'

export function FocusCard() {
  const { derived } = useAppState()
  const sessionsThisWeek = derived.thisWeekFocusSessions

  return (
    <CardShell title="Focus Timer">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="mb-8 flex items-center gap-3">
          <Timer className="h-12 w-12 text-muted-foreground/50" />
          <div className="text-7xl font-bold tabular-nums tracking-tighter text-muted-foreground">
            25:00
          </div>
        </div>
        <Button size="lg" disabled className="w-full gap-2">
          <Play className="h-5 w-5" />
          Start Session
        </Button>
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">Focus Sessions This Week</p>
          <p className="mt-1 text-2xl font-bold">{sessionsThisWeek}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {sessionsThisWeek * 10} XP earned this week
          </p>
        </div>
      </div>
    </CardShell>
  )
}
