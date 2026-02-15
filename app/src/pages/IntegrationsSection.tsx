import { useMemo, useState } from 'react'
import { CardShell } from '@/components/common/CardShell'
import { useTranslation } from '@/i18n'
import { useAppState } from '@/app/AppStateProvider'
import { useAuth } from '@/app/AuthProvider'
import { SystemBanner } from '@/components/common/SystemBanner'
import { parseIcs, classifyIcsEvents, type NormalizedIcsEvent } from '@/integrations/calendar/icsImport'
import { trackEvent } from '@/lib/analytics'
import { useToast } from '@/components/ui/toast'
import { setGlobalDbUnavailable, supabase, supabaseStatus } from '@/lib/supabase'
import { isSupabaseTableMissing } from '@/lib/supabase-errors'
import { getOnboardingProgress } from '@/domain/onboarding'
import {
  calculateGradeSummaries,
  guessMapping,
  mapRowsToAssessments,
  parseCsv,
  slugifyCourse,
  type CsvMapping,
  type CsvRow,
} from '@/integrations/brightspace/csvImport'

type PdfRow = {
  id: string
  course: string | null
  item: string
  status: 'passed' | 'failed' | 'pending'
}

function assessmentKey(assessment: {
  blockId?: string
  course: string
  item: string
  date?: Date
}): string {
  const dateKey = assessment.date ? assessment.date.toISOString() : ''
  return `${assessment.blockId ?? ''}|${assessment.course}|${assessment.item}|${dateKey}`
}

function dedupeAssessments<T extends { blockId?: string; course: string; item: string; date?: Date; score: number | null; status: string }>(
  assessments: T[]
): T[] {
  const map = new Map<string, T>()
  assessments.forEach((assessment) => {
    const key = assessmentKey(assessment)
    const existing = map.get(key)
    if (!existing) {
      map.set(key, assessment)
      return
    }
    const scoreBoost = assessment.score !== null ? 1 : 0
    const statusBoost = assessment.status !== 'pending' ? 1 : 0
    const existingScoreBoost = existing.score !== null ? 1 : 0
    const existingStatusBoost = existing.status !== 'pending' ? 1 : 0
    if (scoreBoost + statusBoost >= existingScoreBoost + existingStatusBoost) {
      map.set(key, assessment)
    }
  })
  return Array.from(map.values())
}

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
  const [icsPreview, setIcsPreview] = useState<NormalizedIcsEvent[]>([])
  const [icsError, setIcsError] = useState<string | null>(null)
  const [icsDebug, setIcsDebug] = useState<{
    veventCount: number
    previewLines: string[]
    veventSamples: string[]
    parsedTotal: number
    keptTotal: number
    pastDroppedCount: number
    outOfRangeCount: number
    windowStart: string
    windowEnd: string
  } | null>(null)
  const [includeRecent, setIncludeRecent] = useState(true)
  const [csvText, setCsvText] = useState('')
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvRows, setCsvRows] = useState<CsvRow[]>([])
  const [csvMapping, setCsvMapping] = useState<CsvMapping | null>(null)
  const [csvStatus, setCsvStatus] = useState<string | null>(null)
  const [csvError, setCsvError] = useState<string | null>(null)
  const [csvStep, setCsvStep] = useState<'map' | 'preview'>('map')
  const [icsUrlError, setIcsUrlError] = useState<string | null>(null)
  const [icsNeedsManual, setIcsNeedsManual] = useState(false)
  const [gradesTab, setGradesTab] = useState<'pdf' | 'csv'>('pdf')
  const [blockLabel, setBlockLabel] = useState<string>(
    () => localStorage.getItem(BLOCK_LABEL_KEY) ?? '25/26 Blok 3'
  )
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfRows, setPdfRows] = useState<PdfRow[]>([])
  const [pdfWarnings, setPdfWarnings] = useState<string[]>([])
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)


  const csvHasData = csvHeaders.length > 0 && csvRows.length > 0

  const handleIcsUpload = async (file: File | null) => {
    if (!file) return
    const text = await file.text()
    const result = parseIcs(text)
    setIcsDebug(result.debug)
    setIcsError(null)
    setIcsStatus(null)
    if (import.meta.env.DEV) {
      console.debug('ICS parse debug', {
        parsedTotal: result.debug.parsedTotal,
        keptTotal: result.debug.keptTotal,
        windowStart: result.debug.windowStart,
        windowEnd: result.debug.windowEnd,
      })
    }

    if (result.error) {
      if (result.error.kind === 'NO_VEVENT') {
        setIcsError(t('integrations.calendar.errorNoVevent'))
      } else {
        setIcsError(t('integrations.calendar.errorParse'))
      }
      setIcsDebug({ ...result.debug })
      return
    }

    if (result.events.length === 0) {
      if (result.debug.parsedTotal > 0 && result.debug.keptTotal === 0) {
        setIcsError(
          t('integrations.calendar.errorOutOfWindow', {
            count: result.debug.parsedTotal,
          })
        )
      } else {
        setIcsError(t('integrations.calendar.errorEmpty'))
      }
      return
    }

    setIcsPreview(result.events)
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

    const assessments = dedupeAssessments(
      mapRowsToAssessments(csvRows, csvMapping, blockLabel).filter(
        (assessment) => assessment.course && assessment.item
      )
    )
    if (assessments.length === 0) {
      setCsvError(t('integrations.csv.parseError'))
      return
    }
    assessments.forEach((assessment) => addAssessment(assessment))

    const summaries = calculateGradeSummaries(assessments)

    if (user && !dbUnavailable && !supabaseStatus.dbUnavailable) {
      try {
        const { error: assessmentError } = await supabase.from('assessments').upsert(
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
          })),
          { onConflict: 'user_id,block_id,course,item' }
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
    localStorage.setItem('levelup-new-assessments', '1')
    setCsvStep('map')
  }

  const handlePdfAnalyse = async () => {
    if (!pdfFile) return
    setPdfError(null)
    setPdfLoading(true)
    setPdfWarnings([])
    try {
      const { extractTextFromPdf, parseProgressSummary } = await import(
        '@/integrations/brightspace/pdfImport'
      )
      const text = await extractTextFromPdf(pdfFile)
      const result = parseProgressSummary(text)
      setPdfWarnings(result.warnings)
      const rows = result.rows.map((row) => ({
        id: crypto.randomUUID(),
        course: row.course,
        item: row.item,
        status: row.status,
      }))
      setPdfRows(rows)
      if (rows.length === 0) {
        setPdfError(t('integrations.pdf.empty'))
      }
    } catch (error) {
      console.error('PDF parse error:', error)
      setPdfError(t('integrations.pdf.parseError'))
    } finally {
      setPdfLoading(false)
    }
  }

  const handlePdfSave = async () => {
    if (pdfRows.length === 0) return
    localStorage.setItem(BLOCK_LABEL_KEY, blockLabel)

    const existing = new Set(
      state.assessments
        .filter((assessment) => assessment.blockId === blockLabel)
        .map((assessment) => `${assessment.course}-${assessment.item}`)
    )

    const uniqueRows = pdfRows.filter(
      (row) => !existing.has(`${row.course ?? 'Course'}-${row.item}`)
    )

    const { toAssessment } = await import('@/integrations/brightspace/pdfImport')
    const assessments = dedupeAssessments(
      uniqueRows.map((row) =>
        toAssessment(
          {
            course: row.course,
            item: row.item,
            status: row.status,
            assessed_at: null,
            weight: null,
            score: null,
          },
          blockLabel
        )
      )
    )

    assessments.forEach((assessment) => addAssessment(assessment))

    if (user && !dbUnavailable && !supabaseStatus.dbUnavailable) {
      const { error } = await supabase.from('assessments').upsert(
        assessments.map((assessment) => ({
          user_id: user.id,
          course: assessment.course,
          item: assessment.item,
          score: assessment.score,
          weight: assessment.weight,
          assessed_at: assessment.date?.toISOString() ?? null,
          status: assessment.status,
          block_id: assessment.blockId ?? blockLabel,
          source: 'pdf',
        })),
        { onConflict: 'user_id,block_id,course,item' }
      )
      if (error && isSupabaseTableMissing(error, 'assessments')) {
        setGlobalDbUnavailable(true)
      }
    }

    addToast({ message: t('integrations.pdf.imported', { count: assessments.length }) })
    localStorage.setItem('levelup-new-assessments', '1')
    window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'dashboard' } }))
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

  const confirmIcsImport = () => {
    if (icsPreview.length === 0) return
    const filteredPreview = includeRecent ? icsPreview : icsPreview.filter((event) => {
      const now = new Date()
      return event.start >= now
    })
    const { personalEvents, schoolDeadlines } = classifyIcsEvents(filteredPreview)

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

    if (import.meta.env.DEV) {
      console.debug('ICS imported events:', {
        personal: nextPersonal.length,
        school: nextDeadlines.length,
      })
    }

    nextPersonal.forEach(({ event }) => addPersonalEvent(event))
    nextDeadlines.forEach(({ event }) => addSchoolDeadline(event))

    const importedCount = nextPersonal.length + nextDeadlines.length
    if (importedCount === 0) {
      setIcsError(t('integrations.calendar.errorEmpty'))
      setIcsPreview([])
      return
    }

    setIcsStatus(t('integrations.calendar.imported', { count: importedCount }))
    localStorage.setItem('levelup-new-personal-events', String(nextPersonal.length))
    addToast({ message: t('integrations.calendar.imported', { count: importedCount }) })
    window.dispatchEvent(
      new CustomEvent('app:navigate', {
        detail: { view: 'week', focusTab: nextPersonal.length > 0 ? 'personal' : 'school' },
      })
    )
    setIcsPreview([])
    void trackEvent('calendar_import')
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

  const onboarding = useMemo(
    () => getOnboardingProgress(state, icsUrl),
    [state, icsUrl]
  )

  if (!ready) {
    return <div className="h-32 rounded-lg bg-muted/40" aria-hidden />
  }

  return (
    <div className="space-y-6">
      <SystemBanner />

      <CardShell
        title={t('integrations.startHere.title')}
        action={
          <div className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs">
            {t('integrations.startHere.progress', { count: onboarding.completedCount })}
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">{t('integrations.startHere.subtitle')}</p>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                onboarding.scheduleDone
                  ? 'bg-emerald-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {onboarding.scheduleDone ? '✓' : '1'}
            </span>
            <span>{t('integrations.startHere.stepSchedule')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold ${
                onboarding.gradesDone
                  ? 'bg-emerald-500 text-white'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {onboarding.gradesDone ? '✓' : '2'}
            </span>
            <span>{t('integrations.startHere.stepGrades')}</span>
          </div>
        </div>
      </CardShell>

      <CardShell
        title={t('integrations.steps.schedule.title')}
        action={
          onboarding.scheduleDone ? (
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs">
              {t('integrations.step.done')}
            </span>
          ) : null
        }
      >
        <div className="rounded-md border border-border/60 bg-muted/30 p-3">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            {t('integrations.steps.valueTitle')}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('integrations.steps.schedule.value')}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex cursor-pointer items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            {t('integrations.steps.schedule.ctaImport')}
            <input
              type="file"
              accept=".ics,text/calendar"
              className="hidden"
              onChange={(event) => void handleIcsUpload(event.target.files?.[0] ?? null)}
            />
          </label>
          <button
            className="rounded-md border border-border px-4 py-2 text-sm font-medium"
            onClick={() =>
              window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'week' } }))
            }
          >
            {t('integrations.steps.schedule.ctaViewWeek')}
          </button>
          <span className="text-xs text-muted-foreground">
            {dbUnavailable
              ? t('integrations.status.localMode')
              : onboarding.scheduleDone
                ? t('integrations.status.connected')
                : t('integrations.status.disconnected')}
          </span>
          {icsStatus && <span className="text-xs text-muted-foreground">{icsStatus}</span>}
        </div>

        {icsError && (
          <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">
            <div>{icsError}</div>
            {icsDebug && icsDebug.parsedTotal > 0 && icsDebug.keptTotal === 0 && (
              <div className="mt-1 text-[10px] text-rose-900/80">
                {t('integrations.calendar.window', {
                  start: new Date(icsDebug.windowStart).toLocaleDateString(),
                  end: new Date(icsDebug.windowEnd).toLocaleDateString(),
                })}
              </div>
            )}
            {icsDebug && import.meta.env.DEV && (
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-medium">
                  {t('integrations.calendar.debugToggle')}
                </summary>
                <div className="mt-2 space-y-1 text-[10px] text-rose-900/80">
                  <div>{t('integrations.calendar.debugVevents', { count: icsDebug.veventCount })}</div>
                  <div>
                    {t('integrations.calendar.debugTotals', {
                      parsed: icsDebug.parsedTotal,
                      kept: icsDebug.keptTotal,
                      dropped: icsDebug.pastDroppedCount + icsDebug.outOfRangeCount,
                    })}
                  </div>
                  {icsDebug.veventSamples.length > 0 && (
                    <pre className="whitespace-pre-wrap">{icsDebug.veventSamples.join('\n\n')}</pre>
                  )}
                  <pre className="whitespace-pre-wrap">{icsDebug.previewLines.join('\n')}</pre>
                </div>
              </details>
            )}
          </div>
        )}

        {icsPreview.length > 0 && (
          <div className="mt-4 rounded-md border border-border bg-muted/30 p-3">
            <div className="text-xs font-medium">
              {t('integrations.calendar.previewTitle', { count: icsPreview.length })}
            </div>
            <label className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
              <input
                type="checkbox"
                checked={includeRecent}
                onChange={(event) => setIncludeRecent(event.target.checked)}
              />
              {t('integrations.calendar.includeRecent')}
            </label>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              {icsPreview.slice(0, 10).map((event) => (
                <div key={`${event.uid}-${event.start.toISOString()}`} className="flex justify-between">
                  <span className="truncate">{event.title}</span>
                  <span className="text-[10px]">{event.start.toLocaleDateString()}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <button
                className="rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
                onClick={confirmIcsImport}
              >
                {t('integrations.calendar.confirm')}
              </button>
              <button
                className="rounded-md border border-border px-3 py-2 text-xs font-medium"
                onClick={() => setIcsPreview([])}
              >
                {t('integrations.calendar.cancel')}
              </button>
            </div>
          </div>
        )}

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
          {icsNeedsManual
            ? t('integrations.calendar.needsManual')
            : t('integrations.calendar.refreshNote')}
        </p>

        <details className="mt-4 rounded-md border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
          <summary className="cursor-pointer text-xs font-medium">
            {t('integrations.faq.ics.title')}
          </summary>
          <p className="mt-2">{t('integrations.faq.ics.body')}</p>
        </details>
      </CardShell>

      <CardShell
        title={t('integrations.steps.grades.title')}
        action={
          onboarding.gradesDone ? (
            <span className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs">
              {t('integrations.step.done')}
            </span>
          ) : null
        }
      >
        <div className="rounded-md border border-border/60 bg-muted/30 p-3">
          <div className="text-xs font-semibold uppercase text-muted-foreground">
            {t('integrations.steps.valueTitle')}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('integrations.steps.grades.value')}
          </p>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-lg border border-border bg-muted p-1 text-xs">
            <button
              className={`rounded-md px-3 py-1 ${gradesTab === 'pdf' ? 'bg-background text-foreground' : 'text-muted-foreground'}`}
              onClick={() => setGradesTab('pdf')}
            >
              {t('integrations.steps.grades.tabPdf')}
            </button>
            <button
              className={`rounded-md px-3 py-1 ${gradesTab === 'csv' ? 'bg-background text-foreground' : 'text-muted-foreground'}`}
              onClick={() => setGradesTab('csv')}
            >
              {t('integrations.steps.grades.tabCsv')}
            </button>
          </div>
          <button
            className="rounded-md border border-border px-3 py-2 text-xs font-medium"
            onClick={() =>
              window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'dashboard' } }))
            }
          >
            {t('integrations.steps.grades.ctaViewDashboard')}
          </button>
          <span className="text-xs text-muted-foreground">
            {dbUnavailable
              ? t('integrations.status.localMode')
              : onboarding.gradesDone
                ? t('integrations.status.connected')
                : t('integrations.status.disconnected')}
          </span>
        </div>

        {gradesTab === 'csv' && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex cursor-pointer items-center rounded-md bg-muted px-4 py-2 text-sm font-medium">
                {t('integrations.csv.upload')}
                <input
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={(event) => void handleCsvUpload(event.target.files?.[0] ?? null)}
                />
              </label>
              {csvStatus && <span className="text-xs text-muted-foreground">{csvStatus}</span>}
            </div>
            {csvError && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900">
                {csvError}
              </div>
            )}
            <textarea
              className="h-32 w-full rounded-md border border-border bg-background px-3 py-2 text-xs"
              placeholder={t('integrations.csv.pastePlaceholder')}
              value={csvText}
              onChange={(event) => {
                setCsvText(event.target.value)
                parseCsvInput(event.target.value)
              }}
            />
            <div className="grid gap-3 md:grid-cols-2">
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
              <div className="grid gap-3 md:grid-cols-2">
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
              <div className="flex items-center gap-3">
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
              <div className="rounded-lg border border-border bg-muted/30 p-4">
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
              <div className="text-xs text-muted-foreground">{t('integrations.csv.waiting')}</div>
            )}
          </div>
        )}

        {gradesTab === 'pdf' && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <label className="inline-flex cursor-pointer items-center rounded-md bg-muted px-4 py-2 text-sm font-medium">
                {t('integrations.pdf.upload')}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(event) => setPdfFile(event.target.files?.[0] ?? null)}
                />
              </label>
              {pdfFile && <span className="text-xs text-muted-foreground">{pdfFile.name}</span>}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="text-xs">
                {t('integrations.pdf.blockLabel')}
                <input
                  className="mt-1 w-full rounded-md border border-border bg-background px-2 py-2 text-sm"
                  value={blockLabel}
                  onChange={(event) => setBlockLabel(event.target.value)}
                  placeholder="25/26 Blok 3"
                />
              </label>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                onClick={() => void handlePdfAnalyse()}
                disabled={!pdfFile || pdfLoading}
              >
                {pdfLoading ? t('integrations.pdf.analyzing') : t('integrations.pdf.analyze')}
              </button>
              {pdfError && <span className="text-xs text-rose-500">{pdfError}</span>}
            </div>

            {pdfWarnings.length > 0 && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                {t('integrations.pdf.warning')}
              </div>
            )}

            {pdfRows.length > 0 && (
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground">
                  {t('integrations.pdf.found', {
                    total: pdfRows.length,
                    passed: pdfRows.filter((row) => row.status === 'passed').length,
                    pending: pdfRows.filter((row) => row.status === 'pending').length,
                  })}
                </div>
                <div className="space-y-2">
                  {pdfRows.map((row) => (
                    <div
                      key={row.id}
                      className="grid gap-2 rounded-md border border-border bg-background p-3 md:grid-cols-[1fr_auto_auto]"
                    >
                      <input
                        className="w-full rounded-md border border-border bg-background px-2 py-1 text-xs"
                        value={row.item}
                        onChange={(event) =>
                          setPdfRows((prev) =>
                            prev.map((item) =>
                              item.id === row.id ? { ...item, item: event.target.value } : item
                            )
                          )
                        }
                      />
                      <select
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                        value={row.status}
                        onChange={(event) =>
                          setPdfRows((prev) =>
                            prev.map((item) =>
                              item.id === row.id
                                ? {
                                    ...item,
                                    status: event.target.value as PdfRow['status'],
                                  }
                                : item
                            )
                          )
                        }
                      >
                        <option value="passed">{t('blockProgress.status.passed')}</option>
                        <option value="pending">{t('blockProgress.status.pending')}</option>
                        <option value="failed">{t('blockProgress.status.failed')}</option>
                      </select>
                      <button
                        className="text-xs text-rose-500"
                        onClick={() => setPdfRows((prev) => prev.filter((item) => item.id !== row.id))}
                      >
                        {t('integrations.pdf.remove')}
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    onClick={() => void handlePdfSave()}
                  >
                    {t('integrations.pdf.confirm')}
                  </button>
                  <button
                    className="rounded-md border border-border px-4 py-2 text-sm font-medium"
                    onClick={() => setPdfRows([])}
                  >
                    {t('integrations.pdf.back')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <details className="mt-4 rounded-md border border-border/60 bg-muted/30 p-3 text-xs text-muted-foreground">
          <summary className="cursor-pointer text-xs font-medium">
            {t('integrations.faq.grades.title')}
          </summary>
          <p className="mt-2">{t('integrations.faq.grades.body')}</p>
        </details>
      </CardShell>
    </div>
  )
}
