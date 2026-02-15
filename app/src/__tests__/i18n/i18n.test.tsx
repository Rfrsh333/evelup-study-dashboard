import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nProvider, useTranslation, useI18n } from '@/i18n'

const STORAGE_KEY = 'levelup-language'

// Test component that uses i18n
function TestComponent() {
  const { t } = useTranslation()
  const { language, setLanguage } = useI18n()

  return (
    <div>
      <div data-testid="current-language">{language}</div>
      <div data-testid="translated-text">{t('dashboard.startHere.title')}</div>
      <button onClick={() => setLanguage('en')}>Switch to EN</button>
      <button onClick={() => setLanguage('nl')}>Switch to NL</button>
    </div>
  )
}

describe('i18n', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('I18nProvider', () => {
    it('should default to Dutch when no preference is stored', async () => {
      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('nl')
      })
    })

    it('should load language preference from localStorage', async () => {
      localStorage.setItem(STORAGE_KEY, 'en')

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en')
      })
    })

    it('should ignore invalid language in localStorage', async () => {
      localStorage.setItem(STORAGE_KEY, 'invalid')

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('nl')
      })
    })
  })

  describe('language switching', () => {
    it('should switch from NL to EN', async () => {
      const user = userEvent.setup()

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      )

      // Start with NL
      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('nl')
      })

      // Switch to EN
      const switchButton = screen.getByRole('button', { name: 'Switch to EN' })
      await user.click(switchButton)

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en')
      })
    })

    it('should persist language choice to localStorage', async () => {
      const user = userEvent.setup()

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      )

      const switchButton = screen.getByRole('button', { name: 'Switch to EN' })
      await user.click(switchButton)

      await waitFor(() => {
        expect(localStorage.getItem(STORAGE_KEY)).toBe('en')
      })
    })

    it('should update translations when language changes', async () => {
      const user = userEvent.setup()

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      )

      // Check initial NL translation
      await waitFor(() => {
        const translatedText = screen.getByTestId('translated-text')
        expect(translatedText).toHaveTextContent('Start hier')
      })

      // Switch to EN
      const switchButton = screen.getByRole('button', { name: 'Switch to EN' })
      await user.click(switchButton)

      // Check EN translation
      await waitFor(() => {
        const translatedText = screen.getByTestId('translated-text')
        expect(translatedText).toHaveTextContent('Start here')
      })
    })
  })

  describe('useTranslation', () => {
    function TranslationTestComponent() {
      const { t } = useTranslation()

      return (
        <div>
          <div data-testid="simple-key">{t('common.save')}</div>
          <div data-testid="nested-key">{t('dashboard.startHere.title')}</div>
          <div data-testid="with-params">{t('momentum.topPercentile', { percentile: 25 })}</div>
          <div data-testid="missing-key">{t('nonexistent.key')}</div>
        </div>
      )
    }

    it('should translate simple keys', () => {
      render(
        <I18nProvider>
          <TranslationTestComponent />
        </I18nProvider>
      )

      expect(screen.getByTestId('simple-key')).toHaveTextContent('Opslaan')
    })

    it('should translate nested keys', () => {
      render(
        <I18nProvider>
          <TranslationTestComponent />
        </I18nProvider>
      )

      expect(screen.getByTestId('nested-key')).toHaveTextContent('Start hier')
    })

    it('should replace placeholders in translations', () => {
      render(
        <I18nProvider>
          <TranslationTestComponent />
        </I18nProvider>
      )

      const translatedText = screen.getByTestId('with-params').textContent
      // Should contain "Top 25% deze week" (NL) or "Top 25% this week" (EN)
      expect(translatedText).toContain('25')
      expect(translatedText).toContain('Top')
    })

    it('should return key path for missing translations', () => {
      render(
        <I18nProvider>
          <TranslationTestComponent />
        </I18nProvider>
      )

      expect(screen.getByTestId('missing-key')).toHaveTextContent('nonexistent.key')
    })
  })

  describe('language validation', () => {
    it('should only accept nl or en', async () => {
      const user = userEvent.setup()
      localStorage.setItem(STORAGE_KEY, 'nl')

      render(
        <I18nProvider>
          <TestComponent />
        </I18nProvider>
      )

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('nl')
      })

      // Switch to EN (valid)
      const switchButton = screen.getByRole('button', { name: 'Switch to EN' })
      await user.click(switchButton)

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en')
        expect(localStorage.getItem(STORAGE_KEY)).toBe('en')
      })
    })
  })
})
