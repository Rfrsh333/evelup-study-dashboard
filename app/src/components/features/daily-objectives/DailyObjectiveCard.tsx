import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useAppState } from '@/app/AppStateProvider'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

export function DailyObjectiveCard() {
  const { state, markObjectiveComplete } = useAppState()
  const { t } = useTranslation()
  const dailyObjectives = state.dailyObjectives

  if (!dailyObjectives) return null

  const { objectives, allCompleted } = dailyObjectives
  const completedCount = objectives.filter((obj) => obj.completed).length
  const remainingForBonus = objectives.length - completedCount

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
                  {allCompleted ? t('dailyObjectives.titleCompleted') : t('dailyObjectives.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {allCompleted
                    ? t('dailyObjectives.bonusReceived', { xp: 25 })
                    : t('dailyObjectives.progressCount', {
                        completed: completedCount,
                        total: objectives.length,
                      })}
                </p>
                {/* Micro feedback */}
                {!allCompleted && remainingForBonus === 1 && (
                  <p className="mt-1 text-xs font-medium text-primary">
                    {t('dailyObjectives.oneSessionForBonus')}
                  </p>
                )}
              </div>
              {allCompleted && (
                <div className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-500">
                  {t('dailyObjectives.bonusXP')}
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
                        {getObjectiveLabel(objective.type, objective.target, t)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {objective.current} / {objective.target}
                        {objective.type === 'study_minutes' && ` ${t('dailyObjectives.minutes')}`}
                        {objective.type === 'focus_sessions' && ` ${t('dailyObjectives.sessions')}`}
                      </p>
                    </div>
                  </div>

                  {objective.type === 'deadline_review' && !objective.completed && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markObjectiveComplete(objective.id)}
                    >
                      {t('dailyObjectives.markComplete')}
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

function getObjectiveLabel(
  type: 'focus_sessions' | 'study_minutes' | 'deadline_review',
  target: number,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  switch (type) {
    case 'focus_sessions':
      return t('dailyObjectives.focusSessions', { target })
    case 'study_minutes':
      return t('dailyObjectives.studyMinutes', { target })
    case 'deadline_review':
      return t('dailyObjectives.deadlineReview')
  }
}
