import { useEffect, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { CardShell } from '@/components/common/CardShell'
import { SystemBanner } from '@/components/common/SystemBanner'
import { fetchInsights, getMockInsights, type InsightsData } from '@/lib/insights'
import { useAppState } from '@/app/AppStateProvider'
import { useTranslation } from '@/i18n'
import { getBlockIds, getBlockProgress } from '@/domain/block-progress'

export function InsightsPage() {
  const { dbUnavailable, state } = useAppState()
  const { t } = useTranslation()
  const [data, setData] = useState<InsightsData>(() => getMockInsights())
  const [loading, setLoading] = useState(true)
  const blockIds = getBlockIds(state.assessments)
  const [activeBlock, setActiveBlock] = useState<string>('') 

  useEffect(() => {
    if (!activeBlock && blockIds.length > 0) setActiveBlock(blockIds[0])
  }, [activeBlock, blockIds])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const result = await fetchInsights()
        if (active) setData(result)
      } catch {
        if (active) setData(getMockInsights())
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [dbUnavailable])

  return (
    <div className="space-y-6">
      <SystemBanner />

      <CardShell title={t('insights.dauTitle')}>
        <div className="h-64 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.dauSeries} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line type="monotone" dataKey="dau" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardShell>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CardShell title={t('insights.d1Title')}>
          <div className="flex h-40 items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-semibold">{loading ? '—' : `${data.retention.d1}%`}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t('insights.d1Subtitle')}</p>
            </div>
          </div>
        </CardShell>

        <CardShell title={t('insights.w1Title')}>
          <div className="flex h-40 items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-semibold">{loading ? '—' : `${data.retention.w1}%`}</div>
              <p className="mt-2 text-sm text-muted-foreground">{t('insights.w1Subtitle')}</p>
            </div>
          </div>
        </CardShell>
      </div>

      <CardShell title={t('blockOverview.title')}>
        {blockIds.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                value={activeBlock}
                onChange={(event) => setActiveBlock(event.target.value)}
              >
                {blockIds.map((block) => (
                  <option key={block} value={block}>
                    {block}
                  </option>
                ))}
              </select>
              {activeBlock && (
                <span className="text-xs text-muted-foreground">
                  {t('blockProgress.summary', {
                    passed: getBlockProgress(state.assessments, activeBlock).passed,
                    total: getBlockProgress(state.assessments, activeBlock).total,
                  })}
                </span>
              )}
            </div>
            <div className="space-y-2 text-sm">
              {state.assessments
                .filter((assessment) => assessment.blockId === activeBlock)
                .map((assessment) => (
                <div key={assessment.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div>
                    <div className="font-medium">{assessment.item}</div>
                    <div className="text-xs text-muted-foreground">{assessment.course}</div>
                  </div>
                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] uppercase tracking-wide">
                    {assessment.status === 'passed'
                      ? t('blockProgress.status.passed')
                      : assessment.status === 'failed'
                        ? t('blockProgress.status.failed')
                        : t('blockProgress.status.pending')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">{t('blockOverview.empty')}</div>
        )}
      </CardShell>
    </div>
  )
}
