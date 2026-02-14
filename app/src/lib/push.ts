import { supabase, setGlobalDbUnavailable, supabaseStatus } from '@/lib/supabase'
import { isSupabaseTableMissing } from '@/lib/supabase-errors'

const STORAGE_KEY = 'levelup-push-subscription'

export interface PushSubscriptionPayload {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null
  return navigator.serviceWorker.register('/sw.js')
}

export async function getExistingSubscription(): Promise<PushSubscription | null> {
  const reg = await getServiceWorkerRegistration()
  if (!reg) return null
  return reg.pushManager.getSubscription()
}

export async function subscribeToPush(vapidPublicKey: string): Promise<PushSubscription | null> {
  const reg = await getServiceWorkerRegistration()
  if (!reg) return null
  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
  })
}

export async function unsubscribeFromPush(): Promise<void> {
  const sub = await getExistingSubscription()
  if (sub) await sub.unsubscribe()
}

export function saveLocalSubscription(payload: PushSubscriptionPayload | null) {
  if (!payload) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function loadLocalSubscription(): PushSubscriptionPayload | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as PushSubscriptionPayload
  } catch {
    return null
  }
}

export async function saveSubscriptionToSupabase(payload: PushSubscriptionPayload, userAgent?: string) {
  if (supabaseStatus.dbUnavailable) {
    saveLocalSubscription(payload)
    return
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    saveLocalSubscription(payload)
    return
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        user_id: user.id,
        endpoint: payload.endpoint,
        p256dh: payload.keys.p256dh,
        auth: payload.keys.auth,
        user_agent: userAgent,
      },
      { onConflict: 'user_id,endpoint' }
    )

  if (error && isSupabaseTableMissing(error, 'push_subscriptions')) {
    setGlobalDbUnavailable(true)
    saveLocalSubscription(payload)
  }
}

export async function removeSubscriptionFromSupabase(endpoint: string) {
  if (supabaseStatus.dbUnavailable) {
    saveLocalSubscription(null)
    return
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    saveLocalSubscription(null)
    return
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', user.id)
    .eq('endpoint', endpoint)

  if (error && isSupabaseTableMissing(error, 'push_subscriptions')) {
    setGlobalDbUnavailable(true)
  }
}
