import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { LevelUpNotification } from './LevelUpNotification'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="ml-64">
        <Header className="sticky top-0 z-10 border-b border-border bg-background/95 px-8 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60" />
        <main className="p-8">{children}</main>
      </div>
      <LevelUpNotification />
    </div>
  )
}
