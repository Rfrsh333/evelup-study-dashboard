// Supabase Edge Function: canvas-oauth-callback
// Exchanges Canvas OAuth code for tokens and stores server-side.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const canvasBaseUrl = Deno.env.get('CANVAS_BASE_URL') ?? ''
const canvasClientId = Deno.env.get('CANVAS_CLIENT_ID') ?? ''
const canvasClientSecret = Deno.env.get('CANVAS_CLIENT_SECRET') ?? ''
const callbackUrl = Deno.env.get('CANVAS_REDIRECT_URI') ?? ''

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: Request): Promise<Response> {
  if (!canvasBaseUrl || !canvasClientId || !canvasClientSecret || !callbackUrl) {
    return new Response('Canvas OAuth not configured', { status: 500 })
  }

  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  if (!code || !state) {
    return new Response('Missing code/state', { status: 400 })
  }

  const tokenUrl = new URL('/login/oauth2/token', canvasBaseUrl)
  tokenUrl.searchParams.set('grant_type', 'authorization_code')
  tokenUrl.searchParams.set('client_id', canvasClientId)
  tokenUrl.searchParams.set('client_secret', canvasClientSecret)
  tokenUrl.searchParams.set('redirect_uri', callbackUrl)
  tokenUrl.searchParams.set('code', code)

  const tokenResp = await fetch(tokenUrl.toString(), { method: 'POST' })
  if (!tokenResp.ok) {
    return new Response('Token exchange failed', { status: 500 })
  }

  const tokenData = await tokenResp.json()
  const expiresAt = tokenData.expires_in
    ? new Date(Date.now() + Number(tokenData.expires_in) * 1000).toISOString()
    : null

  await supabase.from('oauth_tokens').insert({
    user_id: state,
    provider: 'canvas',
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token ?? null,
    expires_at: expiresAt,
  })

  await supabase.from('integrations').upsert({
    user_id: state,
    provider: 'canvas',
    status: 'connected',
  })

  return new Response('Canvas connected. You can close this tab.', { status: 200 })
}
