// Supabase Edge Function: lti
// Implements LTI 1.3 login + launch for Brightspace

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { jwtVerify, createRemoteJWKSet } from 'https://esm.sh/jose@5.9.6'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const LTI_ISSUER = Deno.env.get('LTI_ISSUER') ?? ''
const LTI_CLIENT_ID = Deno.env.get('LTI_CLIENT_ID') ?? ''
const LTI_REDIRECT_URI = Deno.env.get('LTI_REDIRECT_URI') ?? ''
const LTI_JWKS_URL = Deno.env.get('LTI_JWKS_URL') ?? ''

const JWKS = LTI_JWKS_URL ? createRemoteJWKSet(new URL(LTI_JWKS_URL)) : null

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

async function handleLogin(req: Request): Promise<Response> {
  if (!LTI_ISSUER || !LTI_CLIENT_ID || !LTI_REDIRECT_URI) {
    return json({ error: 'LTI not configured' }, 500)
  }

  const form = await req.formData()
  const loginHint = form.get('login_hint')?.toString()
  const targetLinkUri = form.get('target_link_uri')?.toString() ?? LTI_REDIRECT_URI
  const state = crypto.randomUUID()
  const nonce = crypto.randomUUID()

  if (!loginHint) return json({ error: 'Missing login_hint' }, 400)

  const authUrl = new URL('/lti/auth', LTI_ISSUER)
  authUrl.searchParams.set('client_id', LTI_CLIENT_ID)
  authUrl.searchParams.set('response_type', 'id_token')
  authUrl.searchParams.set('response_mode', 'form_post')
  authUrl.searchParams.set('scope', 'openid')
  authUrl.searchParams.set('redirect_uri', targetLinkUri)
  authUrl.searchParams.set('login_hint', loginHint)
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('nonce', nonce)

  return Response.redirect(authUrl.toString(), 302)
}

async function handleLaunch(req: Request): Promise<Response> {
  if (!JWKS || !LTI_CLIENT_ID) return json({ error: 'LTI not configured' }, 500)

  const form = await req.formData()
  const idToken = form.get('id_token')?.toString()
  if (!idToken) return json({ error: 'Missing id_token' }, 400)

  const { payload } = await jwtVerify(idToken, JWKS, {
    audience: LTI_CLIENT_ID,
    issuer: LTI_ISSUER,
  })

  const userId = payload.sub?.toString() ?? ''
  const email = payload.email?.toString() ?? ''
  const context = payload['https://purl.imsglobal.org/spec/lti/claim/context'] as
    | { id?: string; title?: string }
    | undefined
  const deploymentId =
    (payload['https://purl.imsglobal.org/spec/lti/claim/deployment_id'] as string | undefined) ??
    null

  if (!userId) return json({ error: 'Missing user' }, 400)

  const userPayload: { id: string; email?: string; preferred_language: 'nl' | 'en' } = {
    id: userId,
    preferred_language: 'nl',
  }

  if (email) userPayload.email = email

  await supabase.from('users').upsert(userPayload)

  if (context?.id) {
    await supabase.from('courses').upsert(
      {
        user_id: userId,
        lti_context_id: context.id,
        title: context.title ?? 'Course',
      },
      { onConflict: 'user_id,lti_context_id' }
    )
  }

  await supabase.from('lti_launches').insert({
    user_id: userId,
    issuer: payload.iss ?? '',
    deployment_id: deploymentId,
    context: payload,
    created_at: new Date().toISOString(),
  })

  await supabase.from('integrations').upsert({
    user_id: userId,
    provider: 'lti',
    status: 'connected',
  })

  return Response.redirect(LTI_REDIRECT_URI, 302)
}

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const path = url.pathname

  if (path.endsWith('/login')) {
    return handleLogin(req)
  }

  if (path.endsWith('/launch')) {
    return handleLaunch(req)
  }

  return json({ error: 'Not found' }, 404)
}
