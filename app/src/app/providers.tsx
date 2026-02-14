import type { ReactNode } from 'react'
import { AppStateProvider } from './AppStateProvider'
import { ToastProvider } from '@/components/ui/toast'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ToastProvider>
      <AppStateProvider>{children}</AppStateProvider>
    </ToastProvider>
  )
}
