export function isSupabaseTableMissing(error: unknown, tableName?: string): boolean {
  if (!error || typeof error !== 'object') return false
  const err = error as { code?: string; status?: number; message?: string }
  if (err.code === 'PGRST205') return true
  if (err.code === 'PGRST204') return true
  if (err.status === 404) return true
  if (err.message && err.message.includes('schema cache')) return true
  if (err.message && err.message.includes('Could not find the table')) return true
  if (err.message && err.message.includes('column')) return true
  if (tableName && err.message && !err.message.includes(tableName)) return false
  return false
}

export function isUserStateTableMissing(error: unknown): boolean {
  return isSupabaseTableMissing(error, 'user_state')
}

export class SupabaseTableMissingError extends Error {
  code = 'PGRST205'
  constructor(message = 'Supabase table public.user_state is missing') {
    super(message)
    this.name = 'SupabaseTableMissingError'
  }
}
