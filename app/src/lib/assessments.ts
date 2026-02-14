import type { Assessment } from '@/domain/types'
import { supabase, supabaseStatus, setGlobalDbUnavailable } from '@/lib/supabase'
import { isSupabaseTableMissing } from '@/lib/supabase-errors'

const FULL_SELECT = 'user_id,course,item,score,weight,assessed_at,status,block_id,source'
const FALLBACK_SELECT = 'user_id,course,item,score,weight,assessed_at,source'

export async function fetchAssessmentsSafe(): Promise<Assessment[]> {
  if (supabaseStatus.dbUnavailable) return []

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('assessments')
    .select(FULL_SELECT)
    .eq('user_id', user.id)

  if (error) {
    if (error.message?.includes('column')) {
      const { data: fallback, error: fallbackError } = await supabase
        .from('assessments')
        .select(FALLBACK_SELECT)
        .eq('user_id', user.id)

      if (fallbackError) {
        if (isSupabaseTableMissing(fallbackError, 'assessments')) {
          setGlobalDbUnavailable(true)
          return []
        }
        console.warn('Assessments fallback fetch error (non-fatal):', fallbackError)
        return []
      }

      return (fallback ?? []).map((row) => ({
        course: row.course,
        item: row.item,
        score: row.score ?? null,
        weight: row.weight ?? null,
        date: row.assessed_at ? new Date(row.assessed_at) : undefined,
        status: 'pending',
        blockId: undefined,
        source: row.source ?? 'csv',
        id: `${row.course}-${row.item}-${row.assessed_at ?? ''}`,
      }))
    }

    if (isSupabaseTableMissing(error, 'assessments')) {
      setGlobalDbUnavailable(true)
      return []
    }

    console.warn('Assessments fetch error (non-fatal):', error)
    return []
  }

  return (data ?? []).map((row) => ({
    course: row.course,
    item: row.item,
    score: row.score ?? null,
    weight: row.weight ?? null,
    date: row.assessed_at ? new Date(row.assessed_at) : undefined,
    status: row.status ?? 'pending',
    blockId: row.block_id ?? undefined,
    source: row.source ?? 'csv',
    id: `${row.course}-${row.item}-${row.assessed_at ?? ''}`,
  }))
}
