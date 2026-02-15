/**
 * LanguageToggle - Minimal NL/EN switcher
 * Elite design: no flags, no labels, just clean toggle
 */

import { useI18n, useTranslation } from '@/i18n'
import { cn } from '@/lib/utils'

interface LanguageToggleProps {
  className?: string
}

export function LanguageToggle({ className }: LanguageToggleProps) {
  const { language, setLanguage } = useI18n()
  const { t } = useTranslation()

  const handleToggle = (lang: 'nl' | 'en') => {
    if (lang !== language) {
      void setLanguage(lang)
    }
  }

  return (
    <div
      className={cn('inline-flex rounded-md border border-border bg-background p-0.5', className)}
      role="group"
      aria-label={t('common.language')}
      data-testid="language-toggle"
    >
      <button
        type="button"
        onClick={() => handleToggle('nl')}
        aria-pressed={language === 'nl'}
        data-testid="lang-nl"
        className={cn(
          'rounded px-2.5 py-1 text-xs font-medium transition-colors',
          language === 'nl'
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        NL
      </button>
      <button
        type="button"
        onClick={() => handleToggle('en')}
        aria-pressed={language === 'en'}
        data-testid="lang-en"
        className={cn(
          'rounded px-2.5 py-1 text-xs font-medium transition-colors',
          language === 'en'
            ? 'bg-foreground text-background'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        EN
      </button>
    </div>
  )
}
