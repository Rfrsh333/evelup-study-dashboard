import type { ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'
import { AppStateProvider } from './AppStateProvider'
import { ToastProvider } from '@/components/ui/toast'
import { I18nProvider } from '@/i18n'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <I18nProvider>
        <AppStateProvider>
          <ToastProvider>{children}</ToastProvider>
        </AppStateProvider>
      </I18nProvider>
    </AuthProvider>
  )
}
