import type { ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'
import { AppStateProvider } from './AppStateProvider'
import { ToastProvider } from '@/components/ui/toast'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppStateProvider>{children}</AppStateProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
