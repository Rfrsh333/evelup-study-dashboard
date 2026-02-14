import { useEffect, useRef, useState } from 'react'
import { useAuth } from './app/AuthProvider'
import { useAppState } from './app/AppStateProvider'
import { Layout } from './app/layout'
import { DashboardPage } from './pages/DashboardPage'
import { AuthPage } from './pages/AuthPage'
import { LoadingScreen } from './components/common/LoadingScreen'
import { InsightsPage } from './pages/InsightsPage'
import { SettingsPage } from './pages/SettingsPage'
import type { AppView } from './components/common/Sidebar'
import { trackEvent } from './lib/analytics'

function App() {
  const { user, loading: authLoading, error: authError } = useAuth()
  const { loading: stateLoading } = useAppState()
  const firstRenderLogged = useRef(false)
  const [currentView, setCurrentView] = useState<AppView>('dashboard')

  useEffect(() => {
    if (authLoading || stateLoading) return
    if (firstRenderLogged.current) return
    firstRenderLogged.current = true
    if (import.meta.env.DEV) {
      console.debug('FIRST_RENDER', performance.now())
    }
  }, [authLoading, stateLoading])

  useTrackAppOpen(Boolean(user) && !authLoading)

  // Show loading screen while checking auth
  if (authLoading || stateLoading) {
    return <LoadingScreen />
  }

  const notices: string[] = []
  if (authError) notices.push(authError)

  // Show auth page if not logged in
  if (!user) {
    return (
      <div className="space-y-4">
        {notices.length > 0 && <NoticeBanner messages={notices} />}
        <AuthPage />
      </div>
    )
  }

  // Show dashboard if logged in
  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {notices.length > 0 && <NoticeBanner messages={notices} />}
      {currentView === 'dashboard' && <DashboardPage />}
      {currentView === 'insights' && <InsightsPage />}
      {currentView === 'settings' && <SettingsPage />}
    </Layout>
  )
}

export default App

function useTrackAppOpen(ready: boolean) {
  const tracked = useRef(false)
  useEffect(() => {
    if (!ready || tracked.current) return
    tracked.current = true
    void trackEvent('app_open')
  }, [ready])
}

function NoticeBanner({ messages }: { messages: string[] }) {
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">Let op</p>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  )
}
