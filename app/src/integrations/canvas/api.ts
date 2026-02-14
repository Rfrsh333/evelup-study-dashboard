export interface CanvasAssignment {
  id: number
  name: string
  due_at: string | null
  points_possible?: number | null
  score?: number | null
  weight?: number | null
}

export interface CanvasCourse {
  id: number
  name: string
}

export interface CanvasGradeSummary {
  requiredScore: number | null
  predictedFinal: number | null
  completedWeight: number
}

export function calculateRequiredScore(
  target: number,
  completedWeight: number,
  currentAverage: number
): number | null {
  const remainingWeight = 100 - completedWeight
  if (remainingWeight <= 0) return null
  const required = (target - (currentAverage * completedWeight) / 100) / (remainingWeight / 100)
  return Math.max(0, Math.min(10, Math.round(required * 10) / 10))
}

export function calculatePredictedFinal(
  completedWeight: number,
  currentAverage: number,
  remainingAverage = currentAverage
): number | null {
  if (completedWeight <= 0) return null
  const remainingWeight = 100 - completedWeight
  const predicted = (currentAverage * completedWeight + remainingAverage * remainingWeight) / 100
  return Math.round(predicted * 10) / 10
}
