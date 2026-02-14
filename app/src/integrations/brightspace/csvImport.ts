import type { Assessment } from '@/domain/types'

export type CsvRow = Record<string, string>

export interface CsvMapping {
  course: string
  item: string
  score: string
  weight: string | null
  date: string | null
}

export interface GradeSummary {
  course: string
  predicted: number | null
  required: number | null
  totalItems: number
}

export function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const rows: string[][] = []
  let current: string[] = []
  let value = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && (char === ',' || char === ';')) {
      current.push(value.trim())
      value = ''
      continue
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (value || current.length > 0) {
        current.push(value.trim())
        rows.push(current)
        current = []
        value = ''
      }
      continue
    }

    value += char
  }

  if (value || current.length > 0) {
    current.push(value.trim())
    rows.push(current)
  }

  if (rows.length === 0) return { headers: [], rows: [] }

  const headers = rows[0].map((header) => header.trim())
  const dataRows = rows.slice(1).filter((row) => row.some((cell) => cell.trim().length > 0))

  return {
    headers,
    rows: dataRows.map((row) => {
      const record: CsvRow = {}
      headers.forEach((header, idx) => {
        record[header] = row[idx] ?? ''
      })
      return record
    }),
  }
}

function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/\s+/g, '')
}

export function guessMapping(headers: string[]): CsvMapping | null {
  if (headers.length === 0) return null

  const normalized = headers.map((header) => normalizeHeader(header))
  const find = (candidates: string[]) => {
    const index = normalized.findIndex((header) => candidates.includes(header))
    return index >= 0 ? headers[index] : ''
  }

  const course = find(['course', 'vak', 'cursus', 'module', 'coursecode'])
  const item = find(['item', 'assignment', 'opdracht', 'titel', 'name'])
  const score = find(['score', 'grade', 'cijfer', 'points', 'punten'])
  const weight = find(['weight', 'weging', 'percentage', 'gewicht'])
  const date = find(['date', 'due', 'deadline', 'datum'])

  if (!course || !item || !score) return null

  return {
    course,
    item,
    score,
    weight: weight || null,
    date: date || null,
  }
}

function parseNumber(value: string): number | null {
  const normalized = value.replace(',', '.').replace(/[^0-9.-]/g, '')
  if (!normalized) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return parsed
  return undefined
}

export function mapRowsToAssessments(
  rows: CsvRow[],
  mapping: CsvMapping
): Omit<Assessment, 'id'>[] {
  return rows.map((row) => {
    const weight = mapping.weight ? parseNumber(row[mapping.weight] ?? '') : null
    const score = parseNumber(row[mapping.score] ?? '')
    return {
      course: row[mapping.course] || 'Course',
      item: row[mapping.item] || 'Assessment',
      score,
      weight,
      date: mapping.date ? parseDate(row[mapping.date] ?? '') : undefined,
      source: 'csv',
    }
  })
}

function normalizeWeights(weights: number[]): number[] {
  if (weights.length === 0) return []
  const maxWeight = Math.max(...weights)
  if (maxWeight > 1.5) {
    return weights.map((weight) => weight / 100)
  }
  return weights
}

export function calculateGradeSummaries(
  assessments: Omit<Assessment, 'id'>[],
  target = 5.5
): GradeSummary[] {
  const byCourse = new Map<string, Omit<Assessment, 'id'>[]>()

  assessments.forEach((assessment) => {
    const list = byCourse.get(assessment.course) ?? []
    list.push(assessment)
    byCourse.set(assessment.course, list)
  })

  const summaries: GradeSummary[] = []

  byCourse.forEach((courseAssessments, course) => {
    const weights = normalizeWeights(
      courseAssessments.map((assessment) => (assessment.weight ?? 1))
    )

    const scored = courseAssessments.filter((assessment) => assessment.score !== null)
    const scoredWeights = normalizeWeights(
      scored.map((assessment) => (assessment.weight ?? 1))
    )

    const totalWeight = weights.reduce((acc, weight) => acc + weight, 0)
    const completedWeight = scoredWeights.reduce((acc, weight) => acc + weight, 0)

    if (totalWeight === 0 || completedWeight === 0) {
      summaries.push({
        course,
        predicted: null,
        required: null,
        totalItems: courseAssessments.length,
      })
      return
    }

    const completedScoreWeighted = scored.reduce((acc, assessment, idx) => {
      const weight = scoredWeights[idx] ?? 1
      return acc + (assessment.score ?? 0) * weight
    }, 0)

    const completedAverage = completedScoreWeighted / completedWeight
    const remainingWeight = Math.max(totalWeight - completedWeight, 0)

    const predicted = totalWeight > 0 ? completedAverage : null
    const required =
      remainingWeight > 0
        ? (target * totalWeight - completedScoreWeighted) / remainingWeight
        : null

    summaries.push({
      course,
      predicted: predicted !== null ? Number(predicted.toFixed(2)) : null,
      required: required !== null ? Number(required.toFixed(2)) : null,
      totalItems: courseAssessments.length,
    })
  })

  return summaries
}

export function slugifyCourse(course: string): string {
  return course.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
