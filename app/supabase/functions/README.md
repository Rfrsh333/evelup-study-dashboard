# Supabase Edge Functions

## send-daily-reminders
Schedules and sends daily push notifications.

### Setup
1. Generate VAPID keys:
   - Store the **public** key in `.env.local` as `VITE_VAPID_PUBLIC_KEY` (client).
   - Store the **private** key in Supabase function secrets (server-only).
2. Set function secrets:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` (e.g. `mailto:team@levelup.app`)
3. Deploy:
```
supabase functions deploy send-daily-reminders
```
4. Schedule via Supabase cron or external cron.

### Local testing
```
supabase functions serve send-daily-reminders --env-file ./supabase/.env
```

## canvas-oauth-start / canvas-oauth-callback
Server-side Canvas OAuth flow. Keep the client secret on the server.

### Required secrets
- `CANVAS_BASE_URL` (e.g. `https://canvas.instructure.com`)
- `CANVAS_CLIENT_ID`
- `CANVAS_CLIENT_SECRET`
- `CANVAS_REDIRECT_URI` (full URL to `.../functions/v1/canvas-oauth-callback`)

### Deploy
```
supabase functions deploy canvas-oauth-start
supabase functions deploy canvas-oauth-callback
```

## lti
Placeholder endpoints:
- `/lti/login`
- `/lti/launch`
