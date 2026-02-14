import { CardShell } from '@/components/common/CardShell'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'

interface DeadlineItem {
  id: string
  title: string
  deadline: string
  status: 'on-track' | 'at-risk'
  xp: number
}

export function DeadlinesCard() {
  const quests: DeadlineItem[] = [
    {
      id: '1',
      title: 'Complete Linear Algebra Problem Set 3',
      deadline: 'Tomorrow',
      status: 'on-track',
      xp: 250,
    },
    {
      id: '2',
      title: 'React Authentication Module',
      deadline: 'In 3 days',
      status: 'on-track',
      xp: 400,
    },
    {
      id: '3',
      title: 'Database Design Assignment',
      deadline: 'In 2 days',
      status: 'at-risk',
      xp: 350,
    },
  ]

  return (
    <CardShell title="Upcoming Deadlines">
      <div className="space-y-4">
        {quests.map((quest) => (
          <div
            key={quest.id}
            className="flex items-start justify-between rounded-lg border border-border bg-card/50 p-4 transition-colors hover:bg-accent/50"
          >
            <div className="flex-1 space-y-1">
              <p className="font-medium leading-none">{quest.title}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span>{quest.deadline}</span>
                <span className="text-xs">•</span>
                <span>{quest.xp} XP</span>
              </div>
            </div>
            <Badge
              variant={quest.status === 'on-track' ? 'default' : 'destructive'}
              className="ml-4"
            >
              {quest.status === 'on-track' ? 'On Track' : 'At Risk'}
            </Badge>
          </div>
        ))}
      </div>
    </CardShell>
  )
}
