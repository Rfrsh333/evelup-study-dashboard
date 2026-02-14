// Supabase Edge Function: send-daily-reminders
// Deploy with: supabase functions deploy send-daily-reminders
// Requires secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'https://esm.sh/web-push@3.6.7'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') ?? ''
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:team@levelup.app'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

function getPayload(language: string, type: 'daily' | 'inactive') {
  if (language === 'nl') {
    return type === 'daily'
      ? {
          title: 'LevelUp: tijd voor 1 focusblok',
          body: '15 minuten nu. Houd je streak alive.',
        }
      : {
          title: 'LevelUp: kleine comeback',
          body: '2 dagen stil. Start met 1 korte sessie.',
        }
  }
  return type === 'daily'
    ? {
        title: 'LevelUp: one focus block',
        body: '15 minutes now. Keep the streak alive.',
      }
    : {
        title: 'LevelUp: quick comeback',
        body: '2 days quiet. Start with 1 short session.',
      }
}

export default async function handler(): Promise<Response> {
  if (!supabaseUrl || !supabaseServiceKey) {
    return new Response('Supabase service role missing', { status: 500 })
  }

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, preferred_language')

  if (usersError) {
    return new Response('Failed to load users', { status: 500 })
  }

  const { data: subscriptions, error: subsError } = await supabase
    .from('push_subscriptions')
    .select('user_id, endpoint, p256dh, auth')

  if (subsError) {
    return new Response('Failed to load subscriptions', { status: 500 })
  }

  const subsByUser = new Map<string, typeof subscriptions>()
  for (const sub of subscriptions ?? []) {
    const list = subsByUser.get(sub.user_id) ?? []
    list.push(sub)
    subsByUser.set(sub.user_id, list)
  }

  let sent = 0
  for (const user of users ?? []) {
    const userSubs = subsByUser.get(user.id)
    if (!userSubs || userSubs.length === 0) continue

    const payload = getPayload(user.preferred_language ?? 'en', 'daily')

    for (const sub of userSubs) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        )
        sent += 1
        await supabase.from('events').insert({
          user_id: user.id,
          type: 'push_sent',
          metadata: { type: 'daily' },
          created_at: new Date().toISOString(),
        })
      } catch {
        // swallow per-subscription errors
      }
    }
  }

  return new Response(JSON.stringify({ sent }), {
    headers: { 'content-type': 'application/json' },
  })
}
