import { CalendarDays, Settings, TrendingUp, Home } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n'

export type AppView = 'dashboard' | 'week' | 'insights' | 'settings'

interface SidebarProps {
  className?: string
  currentView: AppView
  onNavigate: (view: AppView) => void
  showInsights?: boolean
}

export function Sidebar({ className, currentView, onNavigate, showInsights = false }: SidebarProps) {
  const { t } = useTranslation()
  const navItems: Array<{ icon: typeof Home; label: string; view: AppView; disabled: boolean }> = [
    { icon: Home, label: t('nav.today'), view: 'dashboard', disabled: false },
    { icon: CalendarDays, label: t('nav.week'), view: 'week', disabled: false },
  ]

  if (showInsights) {
    navItems.push({ icon: TrendingUp, label: t('nav.insights'), view: 'insights', disabled: false })
  }

  navItems.push({ icon: Settings, label: t('nav.integrations'), view: 'settings', disabled: false })

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen w-64 border-r border-border bg-card',
        className
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-border px-6">
          <h1 className="text-2xl font-bold tracking-tight">LevelUp</h1>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.label}
              disabled={item.disabled}
              onClick={() => onNavigate(item.view)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                currentView === item.view
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                item.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  )
}
