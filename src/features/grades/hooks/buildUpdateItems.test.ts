import { describe, it, expect } from 'vitest'
import { buildUpdateItems } from './useGradePage'
import type { Grade } from '@/types'

function makeGrade(id: number): Grade {
  return { id, subject: 'MATH', score: 80, grade: 'B' }
}

describe('buildUpdateItems', () => {
  it('정상 케이스: id, subject, score 객체로 매핑한다', () => {
    const grades = [makeGrade(1), makeGrade(2)]
    const result = buildUpdateItems({ 1: '90', 2: '85' }, grades)
    expect(result).toEqual([
      { id: 1, subject: 'MATH', score: 90 },
      { id: 2, subject: 'MATH', score: 85 },
    ])
  })

  it('tempId (음수)는 제외한다', () => {
    const grades = [makeGrade(1)]
    const result = buildUpdateItems({ [-1]: '90', 1: '80' }, grades)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('빈 문자열 값은 제외한다', () => {
    const grades = [makeGrade(1), makeGrade(2)]
    const result = buildUpdateItems({ 1: '', 2: '85' }, grades)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(2)
  })

  it('공백만 있는 값은 제외한다', () => {
    const grades = [makeGrade(1)]
    const result = buildUpdateItems({ 1: '   ' }, grades)
    expect(result).toHaveLength(0)
  })

  it('NaN 값은 제외한다', () => {
    const grades = [makeGrade(1)]
    const result = buildUpdateItems({ 1: 'abc' }, grades)
    expect(result).toHaveLength(0)
  })

  it('editedScores가 비어있으면 빈 배열을 반환한다', () => {
    const result = buildUpdateItems({}, [makeGrade(1)])
    expect(result).toEqual([])
  })
})
