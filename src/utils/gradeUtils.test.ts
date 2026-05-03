import { describe, it, expect } from 'vitest'
import { calculateAverage } from './gradeUtils'
import type { Grade } from '@/types'

function makeGrade(id: number, score: number | null): Grade {
  return { id, subject: 'MATH', score, grade: null }
}

describe('calculateAverage', () => {
  it('빈 배열이면 0을 반환한다', () => {
    expect(calculateAverage([])).toBe(0)
  })

  it('모든 점수가 null이면 0을 반환한다', () => {
    const grades = [makeGrade(1, null), makeGrade(2, null)]
    expect(calculateAverage(grades)).toBe(0)
  })

  it('null 점수는 제외하고 비-null만 평균 낸다', () => {
    const grades = [makeGrade(1, 80), makeGrade(2, 100), makeGrade(3, null)]
    expect(calculateAverage(grades)).toBe(90)
  })

  it('단일 점수는 그대로 반환한다', () => {
    expect(calculateAverage([makeGrade(1, 75)])).toBe(75)
  })

  it('평균을 반올림한다', () => {
    // (89 + 90) / 2 = 89.5 → 90
    const grades = [makeGrade(1, 89), makeGrade(2, 90)]
    expect(calculateAverage(grades)).toBe(90)
  })

  it('버림 케이스도 처리한다', () => {
    // (89 + 88) / 2 = 88.5 → 89 (Math.round)
    const grades = [makeGrade(1, 89), makeGrade(2, 88)]
    expect(calculateAverage(grades)).toBe(89)
  })
})
