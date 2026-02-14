import { useEffect, useState } from 'react'
import { CardShell } from '@/components/common/CardShell'
import { useTranslation } from '@/i18n'
import { supabase, supabaseStatus } from '@/lib/supabase'

export function GradesCard() {
  const { t, ready } = useTranslation()
  const [predicted, setPredicted] = useState<number | null>(null)
  const [required, setRequired] = useState<number | null>(null)
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      if (supabaseStatus.dbUnavailable) return
      const { data, error } = await supabase
        .from('grades')
        .select('predicted_score, required_score, source')
        .eq('source', 'lti')

      if (error || !data || data.length === 0) return
      const predictedScores = data.map((row) => row.predicted_score ?? 0)
      const requiredScores = data.map((row) => row.required_score ?? 0)
      const avgPredicted =
        predictedScores.reduce((sum, val) => sum + val, 0) / predictedScores.length
      const avgRequired =
        requiredScores.reduce((sum, val) => sum + val, 0) / requiredScores.length
      if (active) {
        setPredicted(Math.round(avgPredicted * 10) / 10)
        setRequired(Math.round(avgRequired * 10) / 10)
        setHasData(true)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  if (!ready) {
    return <div className="h-32 rounded-lg bg-muted/40" aria-hidden />
  }

  return (
    <CardShell title={t('grades.title')}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{t('grades.predicted')}</p>
          <p className="text-2xl font-semibold">{predicted ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('grades.required')}</p>
          <p className="text-2xl font-semibold">{required ?? '—'}</p>
        </div>
      </div>
      {!hasData && (
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>{t('grades.empty')}</span>
          <button
            className="rounded-md border border-border px-3 py-1 text-xs font-medium"
            onClick={() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'settings' } }))}
          >
            {t('grades.cta')}
          </button>
        </div>
      )}
    </CardShell>
  )
}
