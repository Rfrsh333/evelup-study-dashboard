import { CardShell } from '@/components/common/CardShell'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'
import { useAppState } from '@/app/AppStateProvider'
import { formatDistance } from 'date-fns'

export function DeadlinesCard() {
  const { state } = useAppState()

  // Filter active deadlines (not completed or failed) and sort by deadline
  const activeDeadlines = state.schoolDeadlines
    .filter((dl) => dl.status === 'on-track' || dl.status === 'at-risk')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 5) // Show max 5 deadlines

  if (activeDeadlines.length === 0) {
    return (
      <CardShell title="Upcoming Deadlines">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Calendar className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No active deadlines</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Use Seed Demo to load sample data
          </p>
        </div>
      </CardShell>
    )
  }

  return (
    <CardShell title="Upcoming Deadlines">
      <div className="space-y-4">
        {activeDeadlines.map((deadline) => {
          const deadlineDate = new Date(deadline.deadline)
          const timeUntil = formatDistance(deadlineDate, new Date(), { addSuffix: true })

          return (
            <div
              key={deadline.id}
              className="flex items-start justify-between rounded-lg border border-border bg-card/50 p-4 transition-colors hover:bg-accent/50"
            >
              <div className="flex-1 space-y-1">
                <p className="font-medium leading-none">{deadline.title}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{timeUntil}</span>
                  <span className="text-xs">•</span>
                  <span>{deadline.xp} XP</span>
                  <span className="text-xs">•</span>
                  <span>{deadline.source === 'lti' ? 'LTI' : 'School'}</span>
                </div>
              </div>
              <Badge
                variant={deadline.status === 'on-track' ? 'default' : 'destructive'}
                className="ml-4"
              >
                {deadline.status === 'on-track' ? 'On Track' : 'At Risk'}
              </Badge>
            </div>
          )
        })}
      </div>
    </CardShell>
  )
}
