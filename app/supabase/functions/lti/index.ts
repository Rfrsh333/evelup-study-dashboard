// Supabase Edge Function: lti
// Placeholder endpoints for LTI 1.3 login/launch

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const path = url.pathname

  if (path.endsWith('/login')) {
    return new Response('LTI login placeholder', { status: 200 })
  }

  if (path.endsWith('/launch')) {
    // Store placeholder launch context (real validation later)
    await supabase.from('lti_launches').insert({
      issuer: 'placeholder',
      context: { note: 'LTI launch received' },
      created_at: new Date().toISOString(),
    })
    return new Response('LTI launch placeholder', { status: 200 })
  }

  return new Response('Not found', { status: 404 })
}
