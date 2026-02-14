import { CardShell } from '@/components/common/CardShell'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useAppState } from '@/app/AppStateProvider'
import { startOfDay, subDays, format } from 'date-fns'
import { BarChart3 } from 'lucide-react'

export function StudyChartCard() {
  const { state, derived } = useAppState()

  // Get last 7 days of data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = startOfDay(subDays(new Date(), 6 - i))
    const dayLogs = state.studyLogs.filter((log) => {
      const logDay = startOfDay(new Date(log.date))
      return logDay.getTime() === date.getTime()
    })

    const totalMinutes = dayLogs.reduce((sum, log) => sum + log.minutes, 0)
    const hours = totalMinutes / 60

    return {
      day: format(date, 'EEE'),
      hours: Math.round(hours * 10) / 10,
      date,
    }
  })

  const hasData = last7Days.some((day) => day.hours > 0)

  if (!hasData) {
    return (
      <CardShell title="Study Time - Last 7 Days">
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <BarChart3 className="mb-3 h-12 w-12 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No study data yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Use Seed Demo to load sample data
          </p>
        </div>
      </CardShell>
    )
  }

  return (
    <CardShell title="Study Time - Last 7 Days">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={last7Days} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="day"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-sm">
        <span className="text-muted-foreground">Total this week</span>
        <span className="font-semibold">
          {Math.round((derived.thisWeekStudyMinutes / 60) * 10) / 10} hours
        </span>
      </div>
    </CardShell>
  )
}
