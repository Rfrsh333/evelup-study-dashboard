import { Suspense, useEffect, useMemo, useState, lazy } from 'react'
import { CardShell } from '@/components/common/CardShell'
import { useTranslation } from '@/i18n'
import { trackEvent } from '@/lib/analytics'
import { useAppState } from '@/app/AppStateProvider'
import {
  getExistingSubscription,
  loadLocalSubscription,
  removeSubscriptionFromSupabase,
  saveLocalSubscription,
  saveSubscriptionToSupabase,
  subscribeToPush,
} from '@/lib/push'
const IntegrationsSection = lazy(() =>
  import('./IntegrationsSection').then((mod) => ({ default: mod.IntegrationsSection }))
)

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || ''

export function SettingsPage() {
  const { t, ready } = useTranslation()
  const [enabled, setEnabled] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const { state, updatePreferences } = useAppState()

  const canEnable = useMemo(() => 'Notification' in window && 'serviceWorker' in navigator, [])

  useEffect(() => {
    let active = true
    async function load() {
      const existing = await getExistingSubscription()
      if (!active) return
      if (existing) {
        setEnabled(true)
        return
      }
      const local = loadLocalSubscription()
      setEnabled(Boolean(local))
    }
    load()
    return () => {
      active = false
    }
  }, [])

  if (!ready) {
    return <div className="h-32 rounded-lg bg-muted/40" aria-hidden />
  }

  const handleToggle = async () => {
    if (!canEnable) {
      setError('Notifications not supported in this browser.')
      return
    }

    setStatus('loading')
    setError(null)

    try {
      if (!enabled) {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          setStatus('idle')
          void trackEvent('push_permission_denied')
          return
        }

        if (!VAPID_PUBLIC_KEY) {
          setError('Missing VAPID public key')
          setStatus('error')
          return
        }

        const sub = await subscribeToPush(VAPID_PUBLIC_KEY)
        if (!sub) {
          setError('Failed to register push subscription')
          setStatus('error')
          return
        }

        const json = sub.toJSON()
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
          setError('Invalid push subscription payload')
          setStatus('error')
          return
        }

        await saveSubscriptionToSupabase(
          {
            endpoint: json.endpoint,
            keys: {
              p256dh: json.keys.p256dh,
              auth: json.keys.auth,
            },
          },
          navigator.userAgent
        )
        saveLocalSubscription({
          endpoint: json.endpoint,
          keys: {
            p256dh: json.keys.p256dh,
            auth: json.keys.auth,
          },
        })
        setEnabled(true)
        void trackEvent('push_opt_in')
      } else {
        const sub = await getExistingSubscription()
        if (sub) {
          await removeSubscriptionFromSupabase(sub.endpoint)
        }
        saveLocalSubscription(null)
        await sub?.unsubscribe()
        setEnabled(false)
        void trackEvent('push_opt_out')
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setStatus('error')
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="h-32 rounded-lg bg-muted/40" aria-hidden />}>
        <IntegrationsSection />
      </Suspense>

      <CardShell title={t('settings.focusWindow')}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-xs text-muted-foreground">{t('settings.from')}</label>
            <input
              type="time"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={state.preferences.preferredFocusStart}
              onChange={(event) => updatePreferences({ preferredFocusStart: event.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{t('settings.to')}</label>
            <input
              type="time"
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={state.preferences.preferredFocusEnd}
              onChange={(event) => updatePreferences({ preferredFocusEnd: event.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">{t('settings.focusMinutes')}</label>
            <select
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={state.preferences.preferredFocusMinutes}
              onChange={(event) =>
                updatePreferences({ preferredFocusMinutes: Number(event.target.value) })
              }
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
          </div>
        </div>
      </CardShell>

      <CardShell title={t('settings.notifications')}>
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{t('settings.pushCopy')}</p>
            <p className="text-xs text-muted-foreground">{t('settings.pushNoSpam')}</p>
          </div>

          <button
            className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-sm font-medium ${
              enabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
            }`}
            onClick={handleToggle}
            disabled={status === 'loading'}
          >
            {enabled ? t('settings.notificationsEnabled') : t('settings.notificationsDisabled')}
          </button>

          {!canEnable && (
            <p className="text-xs text-muted-foreground">
              Notifications are not supported in this browser.
            </p>
          )}
          {error && <p className="text-xs text-amber-700">{error}</p>}
        </div>
      </CardShell>
    </div>
  )
}
