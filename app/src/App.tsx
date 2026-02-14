import { useAuth } from './app/AuthProvider'
import { useAppState } from './app/AppStateProvider'
import { Layout } from './app/layout'
import { DashboardPage } from './pages/DashboardPage'
import { AuthPage } from './pages/AuthPage'

function App() {
  const { user, loading: authLoading } = useAuth()
  const { loading: stateLoading } = useAppState()

  // Show loading screen while checking auth
  if (authLoading || stateLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Laden...</p>
        </div>
      </div>
    )
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />
  }

  // Show dashboard if logged in
  return (
    <Layout>
      <DashboardPage />
    </Layout>
  )
}

export default App
