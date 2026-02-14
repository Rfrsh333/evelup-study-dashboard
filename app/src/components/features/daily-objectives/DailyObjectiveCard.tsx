import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useAppState } from '@/app/AppStateProvider'
import { cn } from '@/lib/utils'

export function DailyObjectiveCard() {
  const { state, markObjectiveComplete } = useAppState()
  const dailyObjectives = state.dailyObjectives

  if (!dailyObjectives) return null

  const { objectives, allCompleted } = dailyObjectives
  const completedCount = objectives.filter((obj) => obj.completed).length

  return (
    <Card
      className={cn(
        'border-2 transition-colors',
        allCompleted
          ? 'border-green-500/50 bg-green-500/5'
          : 'border-primary/50 bg-primary/5'
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {allCompleted ? 'Dagdoelen voltooid! 🎯' : 'Dagdoelen'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {allCompleted
                    ? '+25 XP bonus ontvangen'
                    : `${completedCount} van ${objectives.length} voltooid`}
                </p>
              </div>
              {allCompleted && (
                <div className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-500">
                  Bonus XP
                </div>
              )}
            </div>

            <div className="space-y-3">
              {objectives.map((objective) => (
                <div
                  key={objective.id}
                  className={cn(
                    'flex items-center justify-between rounded-lg border p-3 transition-colors',
                    objective.completed
                      ? 'border-green-500/30 bg-green-500/10'
                      : 'border-border bg-card/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full border-2',
                        objective.completed
                          ? 'border-green-500 bg-green-500'
                          : 'border-muted-foreground'
                      )}
                    >
                      {objective.completed && <Check className="h-4 w-4 text-white" />}
                    </div>
                    <div>
                      <p
                        className={cn(
                          'font-medium',
                          objective.completed && 'line-through opacity-60'
                        )}
                      >
                        {objective.labelNL}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {objective.current} / {objective.target}
                        {objective.type === 'study_minutes' && ' minuten'}
                        {objective.type === 'focus_sessions' && ' sessies'}
                      </p>
                    </div>
                  </div>

                  {objective.type === 'deadline_review' && !objective.completed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markObjectiveComplete(objective.id)}
                    >
                      Markeer voltooid
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
