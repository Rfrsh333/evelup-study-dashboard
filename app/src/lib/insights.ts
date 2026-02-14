import { supabase, setGlobalDbUnavailable, supabaseStatus } from '@/lib/supabase'
import { isSupabaseTableMissing } from '@/lib/supabase-errors'

export interface DailyActivePoint {
  date: string
  dau: number
}

export interface RetentionSummary {
  d1: number
  w1: number
}

export interface InsightsData {
  dauSeries: DailyActivePoint[]
  retention: RetentionSummary
}

const MS_IN_DAY = 1000 * 60 * 60 * 24

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function getMockInsights(): InsightsData {
  const today = new Date()
  const dauSeries = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today.getTime() - (13 - i) * MS_IN_DAY)
    return {
      date: toDateKey(date),
      dau: Math.max(1, Math.round(5 + Math.sin(i / 2) * 3)),
    }
  })
  return {
    dauSeries,
    retention: { d1: 42, w1: 24 },
  }
}

export async function fetchInsights(): Promise<InsightsData> {
  if (supabaseStatus.dbUnavailable) return getMockInsights()

  const since = new Date(Date.now() - 13 * MS_IN_DAY)
  const { data, error } = await supabase
    .from('events')
    .select('user_id, created_at, type')
    .in('type', ['login', 'app_open'])
    .gte('created_at', since.toISOString())

  if (error) {
    if (isSupabaseTableMissing(error, 'events')) {
      setGlobalDbUnavailable(true)
      return getMockInsights()
    }
    throw error
  }

  const dauMap = new Map<string, Set<string>>()
  for (const row of data || []) {
    const dateKey = toDateKey(new Date(row.created_at))
    const users = dauMap.get(dateKey) ?? new Set<string>()
    users.add(row.user_id)
    dauMap.set(dateKey, users)
  }

  const dauSeries: DailyActivePoint[] = []
  for (let i = 13; i >= 0; i -= 1) {
    const date = new Date(Date.now() - i * MS_IN_DAY)
    const key = toDateKey(date)
    dauSeries.push({ date: key, dau: dauMap.get(key)?.size ?? 0 })
  }

  const retention = await computeRetention()
  return { dauSeries, retention }
}

async function computeRetention(): Promise<RetentionSummary> {
  if (supabaseStatus.dbUnavailable) return getMockInsights().retention

  const since = new Date(Date.now() - 30 * MS_IN_DAY)
  const { data, error } = await supabase
    .from('events')
    .select('user_id, created_at, type')
    .eq('type', 'login')
    .gte('created_at', since.toISOString())

  if (error) {
    if (isSupabaseTableMissing(error, 'events')) {
      setGlobalDbUnavailable(true)
      return getMockInsights().retention
    }
    throw error
  }

  const firstLogin = new Map<string, Date>()
  const loginsByUser = new Map<string, Date[]>()

  for (const row of data || []) {
    const ts = new Date(row.created_at)
    const existing = firstLogin.get(row.user_id)
    if (!existing || ts < existing) {
      firstLogin.set(row.user_id, ts)
    }
    const list = loginsByUser.get(row.user_id) ?? []
    list.push(ts)
    loginsByUser.set(row.user_id, list)
  }

  let totalUsers = 0
  let d1Retained = 0
  let w1Retained = 0

  for (const [userId, first] of firstLogin.entries()) {
    totalUsers += 1
    const logins = loginsByUser.get(userId) ?? []
    const d1 = new Date(first.getTime() + MS_IN_DAY)
    const w1End = new Date(first.getTime() + 7 * MS_IN_DAY)
    const returnedDay1 = logins.some((ts) => toDateKey(ts) === toDateKey(d1))
    const returnedWeek1 = logins.some((ts) => ts > first && ts <= w1End)
    if (returnedDay1) d1Retained += 1
    if (returnedWeek1) w1Retained += 1
  }

  if (totalUsers === 0) return { d1: 0, w1: 0 }

  return {
    d1: Math.round((d1Retained / totalUsers) * 100),
    w1: Math.round((w1Retained / totalUsers) * 100),
  }
}
