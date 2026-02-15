import { useState } from 'react'
import { formatDate, getToday } from '@/lib/dates'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppState } from '@/app/AppStateProvider'
import { useAuth } from '@/app/AuthProvider'
import { useToast } from '@/components/ui/toast'
import { getLevelTitle } from '@/domain/xp'
import { LogOut } from 'lucide-react'
import { LanguageToggle } from '@/components/common/LanguageToggle'

interface HeaderProps {
  className?: string
  currentView?: string
}

export function Header({ className, currentView }: HeaderProps) {
  const { state, resetAppState, seedDemoData } = useAppState()
  const { signOut } = useAuth()
  const { addToast } = useToast()
  const [resetDialogOpen, setResetDialogOpen] = useState(false)

  const today = getToday()
  const { level, xpForCurrentLevel, xpForNextLevel } = state.xp
  const xpProgress = (xpForCurrentLevel / xpForNextLevel) * 100
  const levelTitle = getLevelTitle(level)

  const handleReset = () => {
    resetAppState()
    setResetDialogOpen(false)
    addToast({ message: 'All data has been reset.' })
  }

  const handleSeedDemo = () => {
    seedDemoData()
    addToast({ message: 'Demo data loaded.' })
  }

  return (
    <>
      <header className={className}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-sm text-muted-foreground">{formatDate(today, 'EEEE, MMMM d')}</p>
            </div>
            {currentView && (
              <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                {currentView}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleSeedDemo}>
              Demo Data
            </Button>
            <Button variant="outline" size="sm" onClick={() => setResetDialogOpen(true)}>
              Reset
            </Button>
            <LanguageToggle />
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">
                  Level {level} – {levelTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {xpForCurrentLevel.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                </p>
              </div>
              <div className="w-32">
                <Progress value={xpProgress} max={100} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset all data?</DialogTitle>
            <DialogDescription>
              This will permanently remove all study data, XP, streaks, and deadlines.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Confirm Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
