import { test, expect, json, mockApiFallback } from './fixtures'
import type { RankDetail, RankScope, StudentRanks, SubjectCode, SubjectRank, GradeLevel } from '../src/types'

/**
 * 학생 성적 페이지의 "석차" 서브탭(RankView). 단위로 못 잡는 영역:
 * 탭 전환 후 RankView 렌더, 부분/전체 null 분기 메시지, 과목 비대칭 머지 시 "-".
 */

const overall = (rank: number): RankDetail => ({ rank, totalCount: 28, percentile: 7, avgScore: 90 })

const subjectRank = (subject: SubjectCode, rank: number, gradeLevel: GradeLevel): SubjectRank => ({
  subject,
  rank,
  totalCount: 28,
  percentile: 12,
  avgScore: 86,
  gradeLevel,
})

const scope = (overallRank: number, subjects: SubjectRank[]): RankScope => ({
  overall: overall(overallRank),
  subjects,
})

function ranks(overrides: Partial<StudentRanks> = {}): StudentRanks {
  return {
    studentId: 101,
    semester: '2026-1',
    updatedAt: '2026-06-01T09:00:00',
    class: scope(3, [subjectRank('KOREAN', 2, 'A'), subjectRank('MATH', 5, 'B')]),
    grade: scope(31, [subjectRank('KOREAN', 18, 'A'), subjectRank('MATH', 40, 'B')]),
    ...overrides,
  }
}

async function gotoRankTab(page: import('@playwright/test').Page, body: StudentRanks) {
  await mockApiFallback(page)
  await page.route('**/api/analytics/students/*/ranks**', (route) => json(route, body))
  await page.goto('/student/grades')
  await page.getByRole('button', { name: '석차' }).click()
}

test('석차 탭: 종합 카드 2개와 과목별 석차 테이블을 보여준다', async ({ page, auth }) => {
  await auth.loginAs('student')
  await gotoRankTab(page, ranks())

  await expect(page.getByText('반 석차 (종합)')).toBeVisible()
  await expect(page.getByText('전교 석차 (종합)')).toBeVisible()
  await expect(page.getByRole('heading', { name: '과목별 석차' })).toBeVisible()
  await expect(page.getByText('상위 7%').first()).toBeVisible()
  // 과목 행.
  await expect(page.getByRole('row', { name: /국어/ })).toBeVisible()
  await expect(page.getByRole('row', { name: /수학/ })).toBeVisible()
})

test('한쪽 집계만 있으면 다른 카드는 "집계 준비 중"', async ({ page, auth }) => {
  await auth.loginAs('student')
  await gotoRankTab(page, ranks({ grade: null }))

  // 반 석차는 숫자, 전교 석차 카드는 집계 준비 중.
  await expect(page.getByText('집계 준비 중')).toBeVisible()
  await expect(page.getByRole('heading', { name: '과목별 석차' })).toBeVisible()
})

test('class·grade 모두 null이면 "아직 석차 집계가 없습니다."', async ({ page, auth }) => {
  await auth.loginAs('student')
  await gotoRankTab(page, ranks({ class: null, grade: null }))

  await expect(page.getByText('아직 석차 집계가 없습니다.')).toBeVisible()
  await expect(page.getByRole('heading', { name: '과목별 석차' })).toHaveCount(0)
})

test('과목이 비대칭이면 빠진 석차 셀은 "-"로 머지된다', async ({ page, auth }) => {
  await auth.loginAs('student')
  // grade에는 국어만 → 수학 행의 전교 석차 셀은 "-".
  await gotoRankTab(
    page,
    ranks({ grade: scope(31, [subjectRank('KOREAN', 18, 'A')]) }),
  )

  const mathRow = page.getByRole('row', { name: /수학/ })
  await expect(mathRow).toBeVisible()
  await expect(mathRow.getByText('-', { exact: true })).toBeVisible()
})
