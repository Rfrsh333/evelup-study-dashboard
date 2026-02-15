import { Suspense, useEffect, useRef, useState } from 'react'
import { useAuth } from './app/AuthProvider'
import { useAppState } from './app/AppStateProvider'
import { Layout } from './app/layout'
import { LoadingScreen } from './components/common/LoadingScreen'
import type { AppView } from './components/common/Sidebar'
import { trackEvent } from './lib/analytics'
import { useTranslation } from './i18n'
import { lazy } from 'react'

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((mod) => ({ default: mod.DashboardPage })))
const InsightsPage = lazy(() => import('./pages/InsightsPage').then((mod) => ({ default: mod.InsightsPage })))
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((mod) => ({ default: mod.SettingsPage })))
const WeekPage = lazy(() => import('./pages/WeekPage').then((mod) => ({ default: mod.WeekPage })))
const AuthPage = lazy(() => import('./pages/AuthPage').then((mod) => ({ default: mod.AuthPage })))

function App() {
  const { user, loading: authLoading, error: authError } = useAuth()
  const { loading: stateLoading } = useAppState()
  const firstRenderLogged = useRef(false)
  const [currentView, setCurrentView] = useState<AppView>('dashboard')
  const { t } = useTranslation()

  useEffect(() => {
    if (authLoading || stateLoading) return
    if (firstRenderLogged.current) return
    firstRenderLogged.current = true
    if (import.meta.env.DEV) {
      console.debug('FIRST_RENDER', performance.now())
    }
  }, [authLoading, stateLoading])

  useTrackAppOpen(Boolean(user) && !authLoading)

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ view: AppView }>).detail
      if (detail?.view) setCurrentView(detail.view)
    }
    window.addEventListener('app:navigate', handler)
    return () => window.removeEventListener('app:navigate', handler)
  }, [])

  // Show loading screen while checking auth
  if (authLoading || stateLoading) {
    return <LoadingScreen />
  }

  const notices: string[] = []
  if (authError) notices.push(authError)

  // Show auth page if not logged in
  if (!user) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <div className="space-y-4">
          {notices.length > 0 && <NoticeBanner messages={notices} />}
          <AuthPage />
        </div>
      </Suspense>
    )
  }

  const isAdmin = isAdminEmail(user?.email)

  // Show dashboard if logged in
  return (
    <Layout currentView={currentView} onNavigate={setCurrentView} showInsights={isAdmin}>
      {notices.length > 0 && <NoticeBanner messages={notices} />}
      <Suspense fallback={<LoadingScreen />}>
        {currentView === 'dashboard' && <DashboardPage />}
        {currentView === 'week' && <WeekPage />}
        {currentView === 'insights' &&
          (isAdmin ? <InsightsPage /> : <AccessDenied message={t('insights.adminOnly')} />)}
        {currentView === 'settings' && <SettingsPage />}
      </Suspense>
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

function AccessDenied({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}

function isAdminEmail(email?: string | null): boolean {
  if (!email) return false
  const raw = import.meta.env.VITE_ADMIN_EMAILS || ''
  const list = raw
    .split(',')
    .map((entry: string) => entry.trim().toLowerCase())
    .filter(Boolean)
  return list.includes(email.toLowerCase())
}
