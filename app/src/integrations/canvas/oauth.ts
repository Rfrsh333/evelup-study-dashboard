export interface CanvasOAuthConfig {
  baseUrl: string
  clientId: string
  redirectUri: string
}

export function buildCanvasAuthorizeUrl(config: CanvasOAuthConfig, state: string) {
  const url = new URL('/login/oauth2/auth', config.baseUrl)
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', config.redirectUri)
  url.searchParams.set('state', state)
  return url.toString()
}
