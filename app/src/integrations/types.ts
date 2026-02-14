export type IntegrationStatus = 'connected' | 'disconnected' | 'error' | 'pending'

export type Provider =
  | 'calendar'
  | 'lti'

export interface IntegrationRecord {
  id: string
  user_id: string
  provider: Provider
  status: IntegrationStatus
  created_at: string
}
