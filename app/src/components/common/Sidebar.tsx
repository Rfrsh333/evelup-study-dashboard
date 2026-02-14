import { BarChart3, Settings, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const navItems = [
    { icon: BarChart3, label: 'Dashboard', active: true, disabled: false },
    { icon: TrendingUp, label: 'Insights', active: false, disabled: true },
    { icon: Settings, label: 'Settings', active: false, disabled: true },
  ]

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
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                item.active
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
