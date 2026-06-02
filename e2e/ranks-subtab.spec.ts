import { test, expect, json, mockApiFallback } from './fixtures'
import type { RankDetail, RankScope, StudentRanks, SubjectCode, SubjectRank, GradeLevel } from '../src/types'

/**
 * 학생 성적 페이지의 "석차" 서브탭(RankView). 단위로 못 잡는 영역:
 * 탭 전환 후 RankView 렌더, 부분/전체 null 분기 메시지, 과목 비대칭 머지 시 "-".
 */

// 백엔드 percentile은 백분위(자기보다 아래 비율, 높을수록 상위). 화면은 100-percentile을 "상위 X%"로 보여준다.
const overall = (rank: number): RankDetail => ({ rank, totalCount: 28, percentile: 90, avgScore: 90 })

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
  // 백엔드 percentile 90(백분위) → 화면은 상위 10%.
  await expect(page.getByText('상위 10%').first()).toBeVisible()
  // 과목 행.
  await expect(page.getByRole('row', { name: /국어/ })).toBeVisible()
  await expect(page.getByRole('row', { name: /수학/ })).toBeVisible()
})

test('상위%는 백엔드 percentile(백분위)의 보수로 표시한다 (27/30 → 상위 90%)', async ({ page, auth }) => {
  await auth.loginAs('student')
  await gotoRankTab(
    page,
    ranks({
      class: { overall: { rank: 27, totalCount: 30, percentile: 10, avgScore: 70 }, subjects: [] },
      grade: null,
    }),
  )

  await expect(page.getByText('반 석차 (종합)')).toBeVisible()
  await expect(page.getByText('상위 90%')).toBeVisible()
  // 백분위 10을 그대로 "상위 10%"로 잘못 표기하면 안 된다.
  await expect(page.getByText('상위 10%')).toHaveCount(0)
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
