import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const upsertMock = vi.fn()
const maybeSingleMock = vi.fn()
const getUserMock = vi.fn()

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: getUserMock,
    },
    from: () => ({
      upsert: upsertMock,
      select: () => ({
        eq: () => ({
          maybeSingle: maybeSingleMock,
        }),
      }),
    }),
  },
  isSupabaseConfigured: true,
  setGlobalDbUnavailable: vi.fn(),
  supabaseStatus: { dbUnavailable: false },
}))

vi.mock('@/lib/supabase-errors', () => ({
  isSupabaseTableMissing: () => false,
}))

async function renderWithProvider() {
  const mod = await import('@/i18n')
  const { I18nProvider, useI18n, useTranslation } = mod

  function TestComponent() {
    const { language, setLanguage } = useI18n()
    const { t } = useTranslation()
    return (
      <div>
        <div data-testid="current-language">{language}</div>
        <div data-testid="translated">{t('dashboard.startHere.title')}</div>
        <button onClick={() => setLanguage('en')}>Switch to EN</button>
      </div>
    )
  }

  render(
    <I18nProvider>
      <TestComponent />
    </I18nProvider>
  )
}

describe('i18n supabase integration', () => {
  beforeEach(() => {
    localStorage.clear()
    upsertMock.mockReset()
    maybeSingleMock.mockReset()
    getUserMock.mockReset()
  })

  it('loads preferred_language from Supabase when available', async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: 'u1', email: 'a@b.com' } }, error: null })
    upsertMock.mockResolvedValue({ error: null })
    maybeSingleMock.mockResolvedValue({ data: { preferred_language: 'en' }, error: null })

    await renderWithProvider()

    await waitFor(() => {
      expect(screen.getByTestId('current-language')).toHaveTextContent('en')
      expect(screen.getByTestId('translated')).toHaveTextContent('Start here')
    })
  })

  it('setLanguage upserts preference to Supabase', async () => {
    const user = userEvent.setup()
    getUserMock.mockResolvedValue({ data: { user: { id: 'u2', email: 'b@c.com' } }, error: null })
    upsertMock.mockResolvedValue({ error: null })
    maybeSingleMock.mockResolvedValue({ data: null, error: null })

    await renderWithProvider()

    const button = await screen.findByRole('button', { name: 'Switch to EN' })
    await user.click(button)

    await waitFor(() => {
      expect(upsertMock).toHaveBeenCalled()
    })
  })
})
