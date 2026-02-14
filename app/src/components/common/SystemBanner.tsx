import { useTranslation } from '@/i18n'
import { useAppState } from '@/app/AppStateProvider'

export function SystemBanner() {
  const { dbUnavailable } = useAppState()
  const { t, ready } = useTranslation()

  if (!dbUnavailable || !ready) return null

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-900">
      <p className="text-sm font-medium">{t('system.dbLocalMode.title')}</p>
      <p className="text-xs opacity-80">{t('system.dbLocalMode.subtitle')}</p>
    </div>
  )
}
