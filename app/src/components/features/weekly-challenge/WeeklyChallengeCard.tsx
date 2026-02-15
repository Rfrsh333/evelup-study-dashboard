import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Trophy, CheckCircle2 } from 'lucide-react'
import { useAppState } from '@/app/AppStateProvider'
import { useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

export function WeeklyChallengeCard() {
  const { state } = useAppState()
  const { t } = useTranslation()
  const challenge = state.weeklyChallenge

  // Track when challenge is viewed
  useEffect(() => {
    if (challenge) {
      trackEvent('weekly_challenge_viewed', {
        type: challenge.type,
        target: challenge.target,
        current: challenge.current,
        completed: challenge.completed,
      })
    }
  }, [challenge])

  if (!challenge) return null

  const { current, target, completed, bonusXP } = challenge
  const progress = Math.min((current / target) * 100, 100)

  return (
    <Card
      className={cn(
        'border-2 transition-colors',
        completed ? 'border-amber-500/50 bg-amber-500/5' : 'border-border'
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full',
              completed ? 'bg-amber-500/20' : 'bg-primary/10'
            )}
          >
            {completed ? (
              <CheckCircle2 className="h-6 w-6 text-amber-500" />
            ) : (
              <Trophy className="h-6 w-6 text-primary" />
            )}
          </div>

          <div className="flex-1">
            <div className="mb-3">
              <h3 className="text-lg font-semibold">{t('weeklyChallenge.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {completed
                  ? t('weeklyChallenge.completed')
                  : getChallengeLabel(challenge.type, target, t)}
              </p>
            </div>

            {!completed && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('weeklyChallenge.inProgress', { current, target })}
                  </span>
                  <span className="font-medium text-primary">
                    {t('weeklyChallenge.bonusXP', { xp: bonusXP })}
                  </span>
                </div>
                <Progress value={progress} max={100} className="h-2" />
              </div>
            )}

            {completed && (
              <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
                <span>{t('weeklyChallenge.bonusXP', { xp: bonusXP })}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getChallengeLabel(
  type: 'focus_sessions' | 'study_days' | 'study_minutes',
  target: number,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  switch (type) {
    case 'focus_sessions':
      return t('weeklyChallenge.focusSessions', { target })
    case 'study_days':
      return t('weeklyChallenge.studyDays', { target })
    case 'study_minutes':
      return t('weeklyChallenge.studyMinutes', { target })
  }
}
