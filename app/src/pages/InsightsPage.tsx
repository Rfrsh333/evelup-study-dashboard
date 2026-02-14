import { useEffect, useState } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { CardShell } from '@/components/common/CardShell'
import { SystemBanner } from '@/components/common/SystemBanner'
import { fetchInsights, getMockInsights, type InsightsData } from '@/lib/insights'
import { useAppState } from '@/app/AppStateProvider'
import { useTranslation } from '@/i18n'

export function InsightsPage() {
  const { dbUnavailable } = useAppState()
  const { t } = useTranslation()
  const [data, setData] = useState<InsightsData>(() => getMockInsights())
  const [loading, setLoading] = useState(true)

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
    </div>
  )
}
