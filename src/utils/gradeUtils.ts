import type { Grade } from '@/types'

export function calculateAverage(grades: Grade[]): number {
  const scored = grades.filter((g) => g.score !== null)
  if (scored.length === 0) return 0
  return Math.round(scored.reduce((sum, g) => sum + (g.score ?? 0), 0) / scored.length)
}
