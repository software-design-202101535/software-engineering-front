import { describe, it, expect } from 'vitest'
import { groupCounselingsByClass } from './groupCounselingsByClass'
import type { SharedCounseling } from '@/types'

function make(overrides: Partial<SharedCounseling> = {}): SharedCounseling {
  return {
    id: 1,
    studentId: 1,
    studentName: '학생',
    grade: 1,
    classNum: 1,
    number: 1,
    teacherId: 10,
    teacherName: '교사',
    counselingDate: '2026-05-20',
    content: '내용',
    sharedWithTeachers: true,
    createdAt: '2026-05-20T10:00:00',
    ...overrides,
  }
}

describe('groupCounselingsByClass', () => {
  it('빈 배열이면 빈 결과를 반환한다', () => {
    expect(groupCounselingsByClass([])).toEqual([])
  })

  it('같은 학년/반은 한 그룹으로 묶는다', () => {
    const result = groupCounselingsByClass([
      make({ id: 1, grade: 1, classNum: 2, studentName: 'A' }),
      make({ id: 2, grade: 1, classNum: 2, studentName: 'B' }),
    ])
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('1-2')
    expect(result[0].label).toBe('1학년 2반')
    expect(result[0].counselings).toHaveLength(2)
  })

  it('학년 → 반 오름차순으로 정렬한다', () => {
    const result = groupCounselingsByClass([
      make({ id: 1, grade: 2, classNum: 1 }),
      make({ id: 2, grade: 1, classNum: 3 }),
      make({ id: 3, grade: 1, classNum: 1 }),
    ])
    expect(result.map((g) => g.key)).toEqual(['1-1', '1-3', '2-1'])
  })

  it('그룹 내 상담 순서는 입력 순서를 보존한다', () => {
    const result = groupCounselingsByClass([
      make({ id: 1, grade: 1, classNum: 1 }),
      make({ id: 2, grade: 1, classNum: 1 }),
    ])
    expect(result[0].counselings.map((c) => c.id)).toEqual([1, 2])
  })
})
