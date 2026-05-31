import { describe, it, expect } from 'vitest'
import { mergeSubjectRanks } from './mergeSubjectRanks'
import type { RankScope, SubjectRank } from '@/types'

function subjectRank(overrides: Partial<SubjectRank> & Pick<SubjectRank, 'subject'>): SubjectRank {
  return {
    rank: 1,
    totalCount: 30,
    percentile: 90,
    avgScore: 88,
    gradeLevel: 'B',
    ...overrides,
  }
}

function scope(subjects: SubjectRank[]): RankScope {
  return {
    overall: { rank: 1, totalCount: 30, percentile: 90, avgScore: 88 },
    subjects,
  }
}

describe('mergeSubjectRanks', () => {
  it('둘 다 null이면 빈 배열을 반환한다', () => {
    expect(mergeSubjectRanks(null, null)).toEqual([])
  })

  it('같은 과목은 반/전교 석차를 한 행으로 묶는다', () => {
    const classScope = scope([subjectRank({ subject: 'MATH', rank: 5 })])
    const gradeScope = scope([subjectRank({ subject: 'MATH', rank: 23 })])

    const result = mergeSubjectRanks(classScope, gradeScope)

    expect(result).toHaveLength(1)
    expect(result[0].subject).toBe('MATH')
    expect(result[0].classRank?.rank).toBe(5)
    expect(result[0].gradeRank?.rank).toBe(23)
  })

  it('반에만 있는 과목은 gradeRank가 undefined', () => {
    const classScope = scope([subjectRank({ subject: 'MATH' })])
    const result = mergeSubjectRanks(classScope, scope([]))

    expect(result).toHaveLength(1)
    expect(result[0].classRank).toBeDefined()
    expect(result[0].gradeRank).toBeUndefined()
  })

  it('전교에만 있는 과목은 classRank가 undefined이고 뒤에 붙는다', () => {
    const classScope = scope([subjectRank({ subject: 'MATH' })])
    const gradeScope = scope([
      subjectRank({ subject: 'MATH' }),
      subjectRank({ subject: 'ENGLISH' }),
    ])

    const result = mergeSubjectRanks(classScope, gradeScope)

    expect(result.map((r) => r.subject)).toEqual(['MATH', 'ENGLISH'])
    expect(result[1].classRank).toBeUndefined()
    expect(result[1].gradeRank).toBeDefined()
  })

  it('반 과목 순서를 우선 보존한다', () => {
    const classScope = scope([
      subjectRank({ subject: 'KOREAN' }),
      subjectRank({ subject: 'MATH' }),
    ])
    const gradeScope = scope([
      subjectRank({ subject: 'MATH' }),
      subjectRank({ subject: 'KOREAN' }),
    ])

    const result = mergeSubjectRanks(classScope, gradeScope)

    expect(result.map((r) => r.subject)).toEqual(['KOREAN', 'MATH'])
  })

  it('한쪽이 null이어도 다른 쪽 과목으로 머지한다', () => {
    const gradeScope = scope([subjectRank({ subject: 'SCIENCE', rank: 12 })])

    const result = mergeSubjectRanks(null, gradeScope)

    expect(result).toHaveLength(1)
    expect(result[0].subject).toBe('SCIENCE')
    expect(result[0].classRank).toBeUndefined()
    expect(result[0].gradeRank?.rank).toBe(12)
  })
})
