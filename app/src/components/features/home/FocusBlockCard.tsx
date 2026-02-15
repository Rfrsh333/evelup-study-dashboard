import { CardShell } from '@/components/common/CardShell'
import { useTranslation } from '@/i18n'

interface FocusBlockCardProps {
  onStart: () => void
  helperText: string
  secondaryCta: string
  onSecondary: () => void
}

export function FocusBlockCard({ onStart, helperText, secondaryCta, onSecondary }: FocusBlockCardProps) {
  const { t } = useTranslation()

  return (
    <CardShell title={t('focusBlock.title')}>
      <p className="text-sm text-muted-foreground">{helperText}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground"
          onClick={onStart}
        >
          {t('focusBlock.ctaPrimary')}
        </button>
        <button
          className="rounded-md border border-border px-4 py-2 text-xs font-medium"
          onClick={onSecondary}
        >
          {secondaryCta}
        </button>
      </div>
    </CardShell>
  )
}
