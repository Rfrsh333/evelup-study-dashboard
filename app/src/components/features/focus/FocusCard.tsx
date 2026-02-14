import { CardShell } from '@/components/common/CardShell'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

export function FocusCard() {
  const sessionsThisWeek = 4

  return (
    <CardShell title="Focus Timer">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="mb-8 text-7xl font-bold tabular-nums tracking-tighter text-muted-foreground">
          25:00
        </div>
        <Button size="lg" disabled className="w-full gap-2">
          <Play className="h-5 w-5" />
          Start Session
        </Button>
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">Focus Sessions This Week</p>
          <p className="mt-1 text-2xl font-bold">{sessionsThisWeek}</p>
        </div>
      </div>
    </CardShell>
  )
}
