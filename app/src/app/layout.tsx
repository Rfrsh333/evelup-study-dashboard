import type { ReactNode } from 'react'
import { AppShell } from '@/components/common/AppShell'
import type { AppView } from '@/components/common/Sidebar'

interface LayoutProps {
  children: ReactNode
  currentView: AppView
  onNavigate: (view: AppView) => void
}

export function Layout({ children, currentView, onNavigate }: LayoutProps) {
  return (
    <AppShell currentView={currentView} onNavigate={onNavigate}>
      {children}
    </AppShell>
  )
}
