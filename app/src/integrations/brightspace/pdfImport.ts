import type { Assessment } from '@/domain/types'
import * as pdfjs from 'pdfjs-dist'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

export interface ParsedRow {
  course: string | null
  item: string
  status: 'passed' | 'failed' | 'pending'
  assessed_at: null
  weight: null
  score: null
}

export interface ParseResult {
  rows: ParsedRow[]
  warnings: string[]
}

const STATUS_TOKENS = {
  passed: ['voldaan', 'passed'],
  failed: ['niet voldaan', 'not passed', 'failed'],
}

const NOISE_TOKENS = [
  'progress summary',
  'grades received',
  'brightspace',
  'course progress',
  'page',
  'printed',
  'date',
]

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise
  let text = ''

  for (let i = 1; i <= doc.numPages; i += 1) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .filter(Boolean)
      .join('\n')
    text += `${pageText}\n`
  }

  return text
}

function normalizeLine(line: string): string {
  return line.replace(/\s+/g, ' ').trim()
}

function isNoise(line: string): boolean {
  const normalized = line.toLowerCase()
  return NOISE_TOKENS.some((token) => normalized.includes(token))
}

function detectStatus(line: string): 'passed' | 'failed' | 'pending' | null {
  const normalized = line.toLowerCase()
  if (STATUS_TOKENS.failed.some((token) => normalized.includes(token))) return 'failed'
  if (STATUS_TOKENS.passed.some((token) => normalized.includes(token))) return 'passed'
  return null
}

function detectCourse(line: string): string | null {
  const match = line.match(/(?:course|cursus)\s*[:-]\s*(.+)/i)
  if (match?.[1]) return match[1].trim()
  return null
}

function detectItem(line: string): string | null {
  const normalized = normalizeLine(line)
  const match = normalized.match(/^(S\d+\s*-\s*)(.+)$/i)
  if (match?.[2]) return match[2].trim()
  if (normalized.length > 6 && !normalized.match(/\d{2}\/\d{2}\/\d{4}/)) {
    return normalized
  }
  return null
}

export function parseProgressSummary(text: string): ParseResult {
  const warnings: string[] = []
  const lines = text.split(/\r?\n/).map(normalizeLine).filter(Boolean)
  const rows: ParsedRow[] = []
  let currentCourse: string | null = null
  let pendingItem: string | null = null

  const flushPending = (status: 'passed' | 'failed' | 'pending') => {
    if (!pendingItem) return
    rows.push({
      course: currentCourse,
      item: pendingItem,
      status,
      assessed_at: null,
      weight: null,
      score: null,
    })
    pendingItem = null
  }

  for (const rawLine of lines) {
    if (!rawLine) continue
    if (isNoise(rawLine)) continue

    const course = detectCourse(rawLine)
    if (course) {
      currentCourse = course
      continue
    }

    const status = detectStatus(rawLine)
    if (status) {
      flushPending(status)
      continue
    }

    const item = detectItem(rawLine)
    if (item) {
      if (pendingItem) {
        flushPending('pending')
      }
      pendingItem = item
    }
  }

  if (pendingItem) {
    flushPending('pending')
  }

  if (rows.length === 0) {
    warnings.push('no_items_detected')
  }

  return { rows, warnings }
}

export function toAssessment(row: ParsedRow, blockId: string): Omit<Assessment, 'id'> {
  return {
    course: row.course ?? 'Course',
    item: row.item,
    score: null,
    weight: null,
    date: undefined,
    status: row.status,
    blockId,
    source: 'pdf',
  }
}
