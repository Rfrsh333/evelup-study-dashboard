import { useState } from 'react'
import { CardShell } from '@/components/common/CardShell'
import { useTranslation } from '@/i18n'
import { useAppState } from '@/app/AppStateProvider'
import { useAuth } from '@/app/AuthProvider'
import { SystemBanner } from '@/components/common/SystemBanner'
import { parseIcs, eventsToDeadlines } from '@/integrations/calendar/icsImport'
import { trackEvent } from '@/lib/analytics'

const functionsBase = import.meta.env.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`
  : ''

export function IntegrationsSection() {
  const { t, ready } = useTranslation()
  const { addDeadline, state } = useAppState()
  const { user } = useAuth()
  const [icsStatus, setIcsStatus] = useState<string | null>(null)
  const [canvasStatus] = useState<'connected' | 'disconnected'>('disconnected')

  if (!ready) {
    return <div className="h-32 rounded-lg bg-muted/40" aria-hidden />
  }

  const handleIcsUpload = async (file: File | null) => {
    if (!file) return
    const text = await file.text()
    const events = parseIcs(text)
    const existing = new Set(
      state.deadlines.map((dl) => `${dl.title}-${dl.deadline.toISOString()}`)
    )
    const deadlines = eventsToDeadlines(events).filter(
      (dl) => !existing.has(`${dl.title}-${dl.deadline.toISOString()}`)
    )
    deadlines.forEach((deadline) => addDeadline(deadline))
    setIcsStatus(`${deadlines.length} deadlines toegevoegd`)
    void trackEvent('calendar_import')
  }

  const handleCanvasConnect = () => {
    if (!functionsBase || !user) return
    const stateParam = encodeURIComponent(user.id)
    window.location.href = `${functionsBase}/canvas-oauth-start?state=${stateParam}`
  }

  return (
    <div className="space-y-6">
      <SystemBanner />

      <CardShell title={t('integrations.canvas.title')}>
        <p className="text-sm text-muted-foreground">{t('integrations.canvas.description')}</p>
        <div className="mt-4 flex items-center gap-4">
          <button
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            onClick={handleCanvasConnect}
            disabled={!functionsBase || !user}
          >
            {t('integrations.canvas.connect')}
          </button>
          <span className="text-xs text-muted-foreground">
            {canvasStatus === 'connected' ? t('integrations.status.connected') : t('integrations.status.disconnected')}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {t('integrations.canvas.note')}
        </p>
      </CardShell>

      <CardShell title={t('integrations.calendar.title')}>
        <p className="text-sm text-muted-foreground">{t('integrations.calendar.description')}</p>
        <div className="mt-4 flex items-center gap-4">
          <label className="inline-flex cursor-pointer items-center rounded-md bg-muted px-4 py-2 text-sm font-medium">
            {t('integrations.calendar.import')}
            <input
              type="file"
              accept=".ics,text/calendar"
              className="hidden"
              onChange={(event) => void handleIcsUpload(event.target.files?.[0] ?? null)}
            />
          </label>
          {icsStatus && <span className="text-xs text-muted-foreground">{icsStatus}</span>}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">{t('integrations.calendar.refreshNote')}</p>
      </CardShell>

      <CardShell title={t('integrations.lti.title')}>
        <p className="text-sm text-muted-foreground">{t('integrations.lti.description')}</p>
        <div className="mt-4 inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs">
          {t('integrations.lti.comingSoon')}
        </div>
      </CardShell>
    </div>
  )
}
