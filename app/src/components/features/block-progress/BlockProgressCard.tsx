import { useEffect, useMemo, useState } from 'react'
import { CardShell } from '@/components/common/CardShell'
import { useAppState } from '@/app/AppStateProvider'
import { useTranslation } from '@/i18n'
import { getBlockIds, getBlockProgress, getBlockTodoList } from '@/domain/block-progress'

const BLOCK_FILTER_KEY = 'levelup-block-filter'

export function BlockProgressCard() {
  const { state } = useAppState()
  const { t } = useTranslation()
  const blockIds = useMemo(() => getBlockIds(state.assessments), [state.assessments])
  const [activeBlock, setActiveBlock] = useState<string>('')
  const [highlight, setHighlight] = useState(false)

  useEffect(() => {
    if (activeBlock) return
    const stored = localStorage.getItem(BLOCK_FILTER_KEY)
    if (stored && blockIds.includes(stored)) {
      setActiveBlock(stored)
      return
    }
    if (blockIds.length > 0) {
      setActiveBlock(blockIds[0])
    }
  }, [blockIds, activeBlock])

  useEffect(() => {
    const flag = localStorage.getItem('levelup-new-assessments')
    if (flag === '1') {
      setHighlight(true)
      localStorage.removeItem('levelup-new-assessments')
      const timer = window.setTimeout(() => setHighlight(false), 3000)
      return () => window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    if (activeBlock) {
      localStorage.setItem(BLOCK_FILTER_KEY, activeBlock)
    }
  }, [activeBlock])

  const progress = activeBlock ? getBlockProgress(state.assessments, activeBlock) : null
  const todo = activeBlock
    ? getBlockTodoList(state.assessments, activeBlock).filter(
        (assessment) => assessment.status === 'pending'
      )
    : []

  return (
    <CardShell title={t('blockProgress.title')} className={highlight ? 'ring-2 ring-primary/40' : ''}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-sm text-muted-foreground">
          {activeBlock ? t('blockProgress.blockLabel', { block: activeBlock }) : t('blockProgress.noBlock')}
        </div>
        {blockIds.length > 1 && (
          <select
            className="rounded-md border border-border bg-background px-2 py-1 text-xs"
            value={activeBlock}
            onChange={(event) => setActiveBlock(event.target.value)}
          >
            {blockIds.map((block) => (
              <option key={block} value={block}>
                {block}
              </option>
            ))}
          </select>
        )}
      </div>

      {progress && progress.total > 0 ? (
        <div className="mt-4">
          <div className="text-2xl font-semibold">
            {t('blockProgress.summary', { passed: progress.passed, total: progress.total })}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {t('blockProgress.subtitle', {
              pending: progress.pending,
              failed: progress.failed,
              percent: progress.percentPassed,
            })}
          </div>
          {todo.length > 0 && (
            <div className="mt-3 space-y-2">
              {todo.slice(0, 3).map((assessment, index) => {
                const keyBase = [
                  assessment.id ?? '',
                  assessment.blockId ?? '',
                  assessment.course ?? '',
                  assessment.item ?? '',
                  assessment.date ? assessment.date.toISOString() : '',
                  assessment.source ?? '',
                ].join('|')
                const key = `${keyBase}|${index}`
                return (
                  <div key={key} className="flex items-center justify-between text-xs">
                  <span className="truncate">{assessment.item}</span>
                  <span className="rounded-full bg-muted px-2 py-1 text-[10px] uppercase tracking-wide">
                    {t('blocks.status.pending')}
                  </span>
                </div>
                )
              })}
              <button
                className="text-xs font-medium text-primary"
                onClick={() =>
                  window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'insights' } }))
                }
              >
                {t('blockProgress.viewAll')}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 text-sm text-muted-foreground">
          <div>{t('blockProgress.empty')}</div>
          <button
            className="mt-2 text-xs font-medium text-primary"
            onClick={() =>
              window.dispatchEvent(new CustomEvent('app:navigate', { detail: { view: 'settings' } }))
            }
          >
            {t('blockProgress.cta')}
          </button>
        </div>
      )}
    </CardShell>
  )
}
