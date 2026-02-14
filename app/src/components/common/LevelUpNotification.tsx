import { useEffect, useState } from 'react'
import { useAppState } from '@/app/AppStateProvider'
import { getLevelTitle } from '@/domain/xp'
import { cn } from '@/lib/utils'

export function LevelUpNotification() {
  const { state, derived, clearLevelUpNotification } = useAppState()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (derived.levelUpTriggered) {
      setIsVisible(true)

      // Auto-hide after 1.5 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
        // Clear the flag after animation completes
        setTimeout(() => {
          clearLevelUpNotification()
        }, 300) // Wait for fade-out animation
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [derived.levelUpTriggered, clearLevelUpNotification])

  if (!derived.levelUpTriggered && !isVisible) return null

  const levelTitle = getLevelTitle(state.xp.level)

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div
        className={cn(
          'rounded-2xl border-2 border-primary/50 bg-card px-12 py-8 shadow-2xl transition-all duration-300',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        )}
      >
        <div className="text-center">
          <h2 className="mb-2 text-5xl font-bold tracking-tight">Level Up</h2>
          <p className="text-2xl text-muted-foreground">
            Level {state.xp.level} – {levelTitle}
          </p>
        </div>
      </div>
    </div>
  )
}
