import { formatDate, getToday } from '@/lib/dates'
import { Progress } from '@/components/ui/progress'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const today = getToday()
  const currentXP = 3450
  const nextLevelXP = 5000

  return (
    <header className={className}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-sm text-muted-foreground">{formatDate(today, 'EEEE, MMMM d')}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">Level 3 – Consistent</p>
              <p className="text-xs text-muted-foreground">
                {currentXP.toLocaleString()} / {nextLevelXP.toLocaleString()} XP
              </p>
            </div>
            <div className="w-32">
              <Progress value={currentXP} max={nextLevelXP} className="h-2" />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
