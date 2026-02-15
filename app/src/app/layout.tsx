import type { ReactNode } from 'react'
import { AppShell } from '@/components/common/AppShell'
import type { AppView } from '@/components/common/Sidebar'

interface LayoutProps {
  children: ReactNode
  currentView: AppView
  onNavigate: (view: AppView) => void
  showInsights?: boolean
}

export function Layout({ children, currentView, onNavigate, showInsights }: LayoutProps) {
  return (
    <AppShell currentView={currentView} onNavigate={onNavigate} showInsights={showInsights}>
      {children}
    </AppShell>
  )
}
