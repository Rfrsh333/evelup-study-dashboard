// Supabase Edge Function: canvas-oauth-start
// Redirects user to Canvas OAuth authorization endpoint.

const canvasBaseUrl = Deno.env.get('CANVAS_BASE_URL') ?? ''
const canvasClientId = Deno.env.get('CANVAS_CLIENT_ID') ?? ''
const callbackUrl = Deno.env.get('CANVAS_REDIRECT_URI') ?? ''

export default async function handler(req: Request): Promise<Response> {
  if (!canvasBaseUrl || !canvasClientId || !callbackUrl) {
    return new Response('Canvas OAuth not configured', { status: 500 })
  }

  const url = new URL(req.url)
  const state = url.searchParams.get('state') ?? ''
  const authUrl = new URL('/login/oauth2/auth', canvasBaseUrl)
  authUrl.searchParams.set('client_id', canvasClientId)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('redirect_uri', callbackUrl)
  authUrl.searchParams.set('state', state)

  return Response.redirect(authUrl.toString(), 302)
}
