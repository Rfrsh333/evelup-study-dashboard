import type { Assessment } from '@/domain/types'

export interface BlockProgressSummary {
  total: number
  passed: number
  failed: number
  pending: number
  percentPassed: number
}

export function getBlockProgress(
  assessments: Assessment[],
  blockId: string
): BlockProgressSummary {
  const filtered = assessments.filter((assessment) => assessment.blockId === blockId)
  const total = filtered.length
  const passed = filtered.filter((assessment) => assessment.status === 'passed').length
  const failed = filtered.filter((assessment) => assessment.status === 'failed').length
  const pending = filtered.filter((assessment) => assessment.status === 'pending').length
  const percentPassed = total > 0 ? Math.round((passed / total) * 100) : 0

  return { total, passed, failed, pending, percentPassed }
}

export function getBlockTodoList(assessments: Assessment[], blockId: string): Assessment[] {
  return assessments
    .filter((assessment) => assessment.blockId === blockId && assessment.status !== 'passed')
    .sort((a, b) => a.item.localeCompare(b.item))
}

export function getBlockIds(assessments: Assessment[]): string[] {
  const ids = new Set<string>()
  assessments.forEach((assessment) => {
    if (assessment.blockId) ids.add(assessment.blockId)
  })
  return Array.from(ids).sort((a, b) => b.localeCompare(a))
}
