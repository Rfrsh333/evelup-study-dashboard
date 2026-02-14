import type { ReactNode } from 'react'
import { AppShell } from '@/components/common/AppShell'
import { Providers } from './providers'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <Providers>
      <AppShell>{children}</AppShell>
    </Providers>
  )
}
