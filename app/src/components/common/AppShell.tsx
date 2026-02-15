import type { ReactNode } from 'react'
import { Sidebar, type AppView } from './Sidebar'
import { Header } from './Header'
import { LevelUpNotification } from './LevelUpNotification'

interface AppShellProps {
  children: ReactNode
  currentView: AppView
  onNavigate: (view: AppView) => void
  showInsights?: boolean
}

export function AppShell({ children, currentView, onNavigate, showInsights }: AppShellProps) {
  const viewLabel =
    currentView === 'dashboard'
      ? 'Vandaag'
      : currentView === 'week'
        ? 'Week'
        : currentView === 'insights'
          ? 'Insights'
          : 'Settings'

  return (
    <div className="min-h-screen bg-background">
      <Sidebar currentView={currentView} onNavigate={onNavigate} showInsights={showInsights} />
      <div className="ml-64">
        <Header
          currentView={viewLabel}
          className="sticky top-0 z-10 border-b border-border bg-background/95 px-8 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        />
        <main className="p-8">{children}</main>
      </div>
      <LevelUpNotification />
    </div>
  )
}
