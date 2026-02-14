import { useEffect, useMemo, useState } from 'react'
import { CardShell } from '@/components/common/CardShell'
import { useTranslation } from '@/i18n'
import { useAppState } from '@/app/AppStateProvider'
import { useAuth } from '@/app/AuthProvider'
import { SystemBanner } from '@/components/common/SystemBanner'
import { parseIcs, splitIcsEvents } from '@/integrations/calendar/icsImport'
import { trackEvent } from '@/lib/analytics'
import { useToast } from '@/components/ui/toast'
import { setGlobalDbUnavailable, supabase, supabaseStatus } from '@/lib/supabase'
import { isSupabaseTableMissing } from '@/lib/supabase-errors'
import {
  calculateGradeSummaries,
  guessMapping,
  mapRowsToAssessments,
  parseCsv,
  slugifyCourse,
  type CsvMapping,
  type CsvRow,
} from '@/integrations/brightspace/csvImport'

const ICS_URL_KEY = 'levelup-ics-url'
const BLOCK_LABEL_KEY = 'levelup-block-label'

export function IntegrationsSection() {
  const { t, ready } = useTranslation()
  const { addPersonalEvent, addSchoolDeadline, addAssessment, state, dbUnavailable } = useAppState()
  const { user } = useAuth()
  const { addToast } = useToast()
  const [icsStatus, setIcsStatus] = useState<string | null>(null)
  const [icsUrl, setIcsUrl] = useState<string>(() => localStorage.getItem(ICS_URL_KEY) ?? '')
  const [icsLoading, setIcsLoading] = useState(false)
  const [ltiStatus, setLtiStatus] = useState<'connected' | 'disconnected'>('disconnected')
  const [csvText, setCsvText] = useState('')
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvRows, setCsvRows] = useState<CsvRow[]>([])
  const [csvMapping, setCsvMapping] = useState<CsvMapping | null>(null)
  const [csvStatus, setCsvStatus] = useState<string | null>(null)
  const [csvError, setCsvError] = useState<string | null>(null)
  const [csvStep, setCsvStep] = useState<'map' | 'preview'>('map')
  const [icsUrlError, setIcsUrlError] = useState<string | null>(null)
  const [icsNeedsManual, setIcsNeedsManual] = useState(false)
  const [blockLabel, setBlockLabel] = useState<string>(
    () => localStorage.getItem(BLOCK_LABEL_KEY) ?? '25/26 Blok 3'
  )

  useEffect(() => {
    let active = true
    async function loadStatus() {
      if (supabaseStatus.dbUnavailable || !user) return
      const { data, error } = await supabase
        .from('integrations')
        .select('status')
        .eq('user_id', user.id)
        .eq('provider', 'lti')
        .single()
      if (error && isSupabaseTableMissing(error, 'integrations')) {
        setGlobalDbUnavailable(true)
        return
      }
      if (active && data?.status === 'connected') setLtiStatus('connected')
    }
    loadStatus()
    return () => {
      active = false
    }
  }, [user])

  const csvHasData = csvHeaders.length > 0 && csvRows.length > 0

  const handleIcsUpload = async (file: File | null) => {
    if (!file) return
    const text = await file.text()
    const events = parseIcs(text)
    const { personalEvents, schoolDeadlines } = splitIcsEvents(events)

    const existingPersonal = new Set(
      state.personalEvents.map((ev) => `${ev.title}-${ev.start.toISOString()}`)
    )
    const existingDeadlines = new Set(
      state.schoolDeadlines.map((dl) => `${dl.title}-${dl.deadline.toISOString()}`)
    )

    const nextPersonal = personalEvents.filter(({ uid, event }) => {
      const key = `${uid}-${event.start.toISOString()}`
      const fallbackKey = `${event.title}-${event.start.toISOString()}`
      return !existingPersonal.has(key) && !existingPersonal.has(fallbackKey)
    })

    const nextDeadlines = schoolDeadlines.filter(({ uid, event }) => {
      const key = `${uid}-${event.deadline.toISOString()}`
      const fallbackKey = `${event.title}-${event.deadline.toISOString()}`
      return !existingDeadlines.has(key) && !existingDeadlines.has(fallbackKey)
    })

    nextPersonal.forEach(({ event }) => addPersonalEvent(event))
    nextDeadlines.forEach(({ event }) => addSchoolDeadline(event))

    const importedCount = nextPersonal.length + nextDeadlines.length
    setIcsStatus(t('integrations.calendar.imported', { count: importedCount }))
    localStorage.setItem('levelup-new-personal-events', String(nextPersonal.length))
    addToast({ message: t('integrations.calendar.imported', { count: importedCount }) })
    window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'week' } }))
    void trackEvent('calendar_import')
  }

  const handleRequestLti = () => {
    addToast({ message: t('integrations.ltiRequested') })
  }

  const parseCsvInput = (text: string) => {
    setCsvError(null)
    try {
      const parsed = parseCsv(text)
      setCsvHeaders(parsed.headers)
      setCsvRows(parsed.rows)
      const guessed = guessMapping(parsed.headers)
      if (guessed) {
        setCsvMapping(guessed)
        return
      }
      if (parsed.headers.length > 0) {
        setCsvMapping({
          course: parsed.headers[0] ?? '',
          item: parsed.headers[1] ?? parsed.headers[0] ?? '',
          score: parsed.headers[2] ?? parsed.headers[0] ?? '',
          weight: null,
          date: null,
          status: null,
          block: null,
        })
      } else {
        setCsvMapping(null)
      }
    } catch (error) {
      console.error('CSV parse error:', error)
      setCsvError(t('integrations.csv.parseError'))
      setCsvHeaders([])
      setCsvRows([])
      setCsvMapping(null)
    }
  }

  const handleCsvUpload = async (file: File | null) => {
    if (!file) return
    const text = await file.text()
    setCsvText(text)
    parseCsvInput(text)
  }

  const handleCsvImport = async () => {
    if (!csvMapping || csvRows.length === 0) return

    localStorage.setItem(BLOCK_LABEL_KEY, blockLabel)

    const assessments = mapRowsToAssessments(csvRows, csvMapping, blockLabel).filter(
      (assessment) => assessment.course && assessment.item
    )
    if (assessments.length === 0) {
      setCsvError(t('integrations.csv.parseError'))
      return
    }
    assessments.forEach((assessment) => addAssessment(assessment))

    const summaries = calculateGradeSummaries(assessments)

    if (user && !dbUnavailable && !supabaseStatus.dbUnavailable) {
      try {
        const { error: assessmentError } = await supabase.from('assessments').insert(
          assessments.map((assessment) => ({
            user_id: user.id,
            course: assessment.course,
            item: assessment.item,
            score: assessment.score,
            weight: assessment.weight,
            assessed_at: assessment.date?.toISOString() ?? null,
            status: assessment.status,
            block_id: assessment.blockId ?? blockLabel,
            source: assessment.source,
          }))
        )

        if (assessmentError && isSupabaseTableMissing(assessmentError, 'assessments')) {
          setGlobalDbUnavailable(true)
        }

        if (!supabaseStatus.dbUnavailable) {
          const { error: gradesError } = await supabase.from('grades').upsert(
            summaries.map((summary) => ({
              user_id: user.id,
              course_id: slugifyCourse(summary.course) || 'course',
              course_name: summary.course,
              predicted_score: summary.predicted,
              required_score: summary.required,
              source: 'import',
              updated_at: new Date().toISOString(),
            })),
            { onConflict: 'user_id,course_id' }
          )
          if (gradesError && isSupabaseTableMissing(gradesError, 'grades')) {
            setGlobalDbUnavailable(true)
          }
        }
      } catch (error) {
        console.error('CSV import error:', error)
      }
    }

    setCsvStatus(t('integrations.csv.imported', { count: assessments.length }))
    addToast({ message: t('integrations.csv.imported', { count: assessments.length }) })
    setCsvStep('map')
  }

  const handleIcsUrlSave = async () => {
    localStorage.setItem(ICS_URL_KEY, icsUrl)
    if (!user || dbUnavailable || supabaseStatus.dbUnavailable) return
    const { error } = await supabase.from('calendar_sources').upsert(
      {
        user_id: user.id,
        name: 'ICS',
        ics_url: icsUrl,
      },
      { onConflict: 'user_id,ics_url' }
    )
    if (error && isSupabaseTableMissing(error, 'calendar_sources')) {
      setGlobalDbUnavailable(true)
    }
  }

  const handleIcsRefresh = async () => {
    if (!icsUrl) return
    setIcsLoading(true)
    setIcsUrlError(null)
    try {
      const response = await fetch(icsUrl)
      if (!response.ok) {
        setIcsUrlError(t('integrations.calendar.refreshError'))
        setIcsNeedsManual(true)
        return
      }
      const text = await response.text()
      await handleIcsUpload(new File([text], 'calendar.ics', { type: 'text/calendar' }))
      setIcsNeedsManual(false)
      addToast({ message: t('integrations.calendar.refreshSuccess') })
    } catch (error) {
      console.error('ICS refresh error:', error)
      setIcsUrlError(t('integrations.calendar.refreshError'))
      setIcsNeedsManual(true)
    } finally {
      setIcsLoading(false)
    }
  }

  const mappingOptions = useMemo(
    () => csvHeaders.map((header) => ({ value: header, label: header })),
    [csvHeaders]
  )

  const csvPreview = useMemo(() => {
    if (!csvMapping || csvRows.length === 0) return null
    const assessments = mapRowsToAssessments(csvRows, csvMapping, blockLabel)
    const distinctCourses = new Set(assessments.map((assessment) => assessment.course))
    const summaries = calculateGradeSummaries(assessments)
    return {
      rows: assessments.slice(0, 3),
      count: assessments.length,
      courses: distinctCourses.size,
      summary: summaries[0],
    }
  }, [csvMapping, csvRows])

  if (!ready) {
    return <div className="h-32 rounded-lg bg-muted/40" aria-hidden />
  }

  return (
    <div className="space-y-6">
      <SystemBanner />

      <CardShell title={t('integrations.header')}>
        <p className="text-sm text-muted-foreground">{t('integrations.explainer')}</p>
      </CardShell>

      <CardShell title={t('integrations.onboarding.title')}>
        <p className="text-sm text-muted-foreground">{t('integrations.onboarding.subtitle')}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              {t('integrations.onboarding.step', { step: 1 })}
            </div>
            <div className="mt-1 text-sm font-medium">{t('integrations.calendar.title')}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('integrations.calendar.description')}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <div className="text-xs font-semibold uppercase text-muted-foreground">
              {t('integrations.onboarding.step', { step: 2 })}
            </div>
            <div className="mt-1 text-sm font-medium">{t('integrations.csv.title')}</div>
            <p className="mt-1 text-xs text-muted-foreground">{t('integrations.csv.description')}</p>
          </div>
        </div>
      </CardShell>

      <CardShell title={t('integrations.brightspace.title')}>
        <p className="text-sm text-muted-foreground">{t('integrations.brightspace.description')}</p>
        <div className="mt-4 flex items-center gap-4">
          <button
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            onClick={handleRequestLti}
          >
            {t('integrations.brightspace.connect')}
          </button>
          <span className="text-xs text-muted-foreground">
            {dbUnavailable
              ? t('integrations.status.localMode')
              : ltiStatus === 'connected'
                ? t('integrations.status.connected')
                : t('integrations.status.disconnected')}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {t('integrations.brightspace.note')}
        </p>
      </CardShell>

      <CardShell title={t('integrations.calendar.title')}>
        <p className="text-sm text-muted-foreground">{t('integrations.calendar.description')}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="inline-flex cursor-pointer items-center rounded-md bg-muted px-4 py-2 text-sm font-medium">
            {t('integrations.calendar.import')}
            <input
              type="file"
              accept=".ics,text/calendar"
              className="hidden"
              onChange={(event) => void handleIcsUpload(event.target.files?.[0] ?? null)}
            />
          </label>
          <span className="text-xs text-muted-foreground">
            {dbUnavailable ? t('integrations.status.localMode') : t('integrations.status.disconnected')}
          </span>
          {icsStatus && <span className="text-xs text-muted-foreground">{icsStatus}</span>}
        </div>
        {icsUrlError && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <div className="font-semibold">{t('integrations.calendar.refreshErrorTitle')}</div>
            <div className="mt-1">{icsUrlError}</div>
            <button
              className="mt-2 rounded-md bg-amber-900/10 px-2 py-1 text-xs font-medium text-amber-900"
              onClick={() => setIcsUrlError(null)}
            >
              {t('integrations.calendar.uploadCta')}
            </button>
          </div>
        )}
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder={t('integrations.calendar.urlPlaceholder')}
            value={icsUrl}
            onChange={(event) => setIcsUrl(event.target.value)}
            onBlur={() => void handleIcsUrlSave()}
          />
          <button
            className="rounded-md border border-border px-3 py-2 text-sm font-medium"
            onClick={() => void handleIcsRefresh()}
            disabled={!icsUrl || icsLoading}
          >
            {icsLoading ? t('integrations.calendar.refreshing') : t('integrations.calendar.refresh')}
          </button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {icsNeedsManual ? t('integrations.calendar.needsManual') : t('integrations.calendar.refreshNote')}
        </p>
      </CardShell>

      <CardShell title={t('integrations.csv.title')}>
        <p className="text-sm text-muted-foreground">{t('integrations.csv.description')}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <label className="inline-flex cursor-pointer items-center rounded-md bg-muted px-4 py-2 text-sm font-medium">
            {t('integrations.csv.upload')}
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => void handleCsvUpload(event.target.files?.[0] ?? null)}
            />
          </label>
          <span className="text-xs text-muted-foreground">
            {dbUnavailable ? t('integrations.status.localMode') : t('integrations.status.disconnected')}
          </span>
          {csvStatus && <span className="text-xs text-muted-foreground">{csvStatus}</span>}
        </div>
        {csvError && (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">
            {csvError}
          </div>
        )}
        <textarea
          className="mt-4 h-32 w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
          placeholder={t('integrations.csv.pastePlaceholder')}
          value={csvText}
          onChange={(event) => {
            setCsvText(event.target.value)
            parseCsvInput(event.target.value)
          }}
        />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="text-xs">
            {t('integrations.csv.blockLabel')}
            <input
              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
              value={blockLabel}
              onChange={(event) => setBlockLabel(event.target.value)}
              placeholder="25/26 Blok 3"
            />
          </label>
        </div>
        {csvHasData && csvMapping && csvStep === 'map' && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <label className="text-xs">
              {t('integrations.csv.mapping.course')}
              <select
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
                value={csvMapping.course}
                onChange={(event) =>
                  setCsvMapping({ ...csvMapping, course: event.target.value })
                }
              >
                {mappingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              {t('integrations.csv.mapping.item')}
              <select
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
                value={csvMapping.item}
                onChange={(event) => setCsvMapping({ ...csvMapping, item: event.target.value })}
              >
                {mappingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              {t('integrations.csv.mapping.score')}
              <select
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
                value={csvMapping.score}
                onChange={(event) => setCsvMapping({ ...csvMapping, score: event.target.value })}
              >
                {mappingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              {t('integrations.csv.mapping.weight')}
              <select
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
                value={csvMapping.weight ?? ''}
                onChange={(event) =>
                  setCsvMapping({
                    ...csvMapping,
                    weight: event.target.value || null,
                  })
                }
              >
                <option value="">{t('integrations.csv.mapping.optional')}</option>
                {mappingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              {t('integrations.csv.mapping.date')}
              <select
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
                value={csvMapping.date ?? ''}
                onChange={(event) =>
                  setCsvMapping({
                    ...csvMapping,
                    date: event.target.value || null,
                  })
                }
              >
                <option value="">{t('integrations.csv.mapping.optional')}</option>
                {mappingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              {t('integrations.csv.mapping.status')}
              <select
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
                value={csvMapping.status ?? ''}
                onChange={(event) =>
                  setCsvMapping({
                    ...csvMapping,
                    status: event.target.value || null,
                  })
                }
              >
                <option value="">{t('integrations.csv.mapping.optional')}</option>
                {mappingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              {t('integrations.csv.mapping.block')}
              <select
                className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
                value={csvMapping.block ?? ''}
                onChange={(event) =>
                  setCsvMapping({
                    ...csvMapping,
                    block: event.target.value || null,
                  })
                }
              >
                <option value="">{t('integrations.csv.mapping.optional')}</option>
                {mappingOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        {csvHasData && csvMapping && csvStep === 'map' && (
          <div className="mt-4 flex items-center gap-3">
            <button
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              onClick={() => setCsvStep('preview')}
            >
              {t('integrations.csv.preview')}
            </button>
            <span className="text-xs text-muted-foreground">
              {t('integrations.csv.rows', { count: csvRows.length })}
            </span>
          </div>
        )}
        {csvStep === 'preview' && csvPreview && (
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
            <div className="text-sm font-medium">{t('integrations.csv.previewTitle')}</div>
            <div className="mt-2 text-xs text-muted-foreground">
              {t('integrations.csv.previewStats', {
                rows: csvPreview.count,
                courses: csvPreview.courses,
              })}
            </div>
            <div className="mt-3 grid gap-2 text-xs">
              {csvPreview.rows.map((row, index) => (
                <div key={`${row.course}-${row.item}-${index}`} className="flex flex-wrap gap-2">
                  <span className="rounded bg-background px-2 py-1">{row.course}</span>
                  <span className="rounded bg-background px-2 py-1">{row.item}</span>
                  <span className="rounded bg-background px-2 py-1">{row.score ?? '—'}</span>
                  <span className="rounded bg-background px-2 py-1">{row.weight ?? '—'}</span>
                </div>
              ))}
            </div>
            {csvPreview.summary && (
              <div className="mt-3 text-xs text-muted-foreground">
                {t('integrations.csv.previewSummary', {
                  course: csvPreview.summary.course,
                  predicted: csvPreview.summary.predicted ?? '—',
                  required: csvPreview.summary.required ?? '—',
                })}
              </div>
            )}
            <div className="mt-4 flex items-center gap-3">
              <button
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                onClick={() => void handleCsvImport()}
              >
                {t('integrations.csv.confirm')}
              </button>
              <button
                className="rounded-md border border-border px-4 py-2 text-sm font-medium"
                onClick={() => setCsvStep('map')}
              >
                {t('integrations.csv.back')}
              </button>
            </div>
          </div>
        )}
        {!csvHasData && (
          <div className="mt-4 text-xs text-muted-foreground">{t('integrations.csv.waiting')}</div>
        )}
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
