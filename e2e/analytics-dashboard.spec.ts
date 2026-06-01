import { test, expect, json } from './fixtures'
import type { ClassSummary } from '../src/types'

/**
 * 교사 통계 대시보드(/analytics). 단위로 못 잡는 영역:
 * recharts 실 SVG 렌더, 막대/행 클릭→도넛 동기화, 반↔학년전체 토글의 classNum 파라미터,
 * 빈 응답 placeholder.
 */

function summary(overrides: Partial<ClassSummary> = {}): ClassSummary {
  return {
    school: 'SUNRIN_HIGH_SCHOOL',
    grade: 1,
    classNum: 3,
    semester: '2026-1',
    updatedAt: '2026-06-01T09:00:00',
    subjects: [
      { subject: 'KOREAN', avgScore: 82, maxScore: 98, minScore: 55, studentCount: 28, distribution: { A: 8, B: 10, C: 6, D: 3, F: 1 } },
      { subject: 'MATH', avgScore: 74, maxScore: 100, minScore: 40, studentCount: 25, distribution: { A: 5, B: 7, C: 9, D: 3, F: 1 } },
    ],
    ...overrides,
  }
}

// "등급 분포" 카드(도넛)로 스코프를 좁혀 과목 라벨이 축/테이블의 같은 텍스트와 겹치지 않게 한다.
// 헤딩의 부모 카드 div를 잡으면 도넛 영역만 포함된다.
const donutCard = (page: import('@playwright/test').Page) =>
  page.getByRole('heading', { name: '등급 분포' }).locator('xpath=..')

test('막대·도넛이 실제 SVG로 렌더된다', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  await page.route('**/api/analytics/class-summary**', (route) => json(route, summary()))

  await page.goto('/analytics')

  await expect(page.getByRole('heading', { name: '반 성적 통계' })).toBeVisible()
  // 막대 차트 + 도넛 = recharts surface 2개 이상.
  await expect(page.locator('svg.recharts-surface')).toHaveCount(2)
  await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(2)
})

test('막대 클릭 시 도넛이 해당 과목으로 동기화된다', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  await page.route('**/api/analytics/class-summary**', (route) => json(route, summary()))

  await page.goto('/analytics')

  // 초기 선택은 첫 과목(국어).
  await expect(donutCard(page).getByText('국어')).toBeVisible()
  await expect(donutCard(page).getByText('28')).toBeVisible()

  // 두 번째 막대(수학) 클릭 → 도넛이 수학으로 전환.
  await page.locator('.recharts-bar-rectangle').nth(1).click()

  await expect(donutCard(page).getByText('수학')).toBeVisible()
  await expect(donutCard(page).getByText('25')).toBeVisible()
})

test('과목 상세 행 클릭도 도넛을 동기화한다', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  await page.route('**/api/analytics/class-summary**', (route) => json(route, summary()))

  await page.goto('/analytics')
  await expect(donutCard(page).getByText('국어')).toBeVisible()

  await page.getByRole('row', { name: /수학/ }).click()

  await expect(donutCard(page).getByText('수학')).toBeVisible()
})

test('반↔학년 전체 토글이 classNum 파라미터를 포함/제외한다', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  const urls: string[] = []
  await page.route('**/api/analytics/class-summary**', (route) => {
    urls.push(route.request().url())
    return json(route, summary())
  })

  await page.goto('/analytics')
  await expect(page.locator('svg.recharts-surface').first()).toBeVisible()

  // 기본(반) 요청에는 classNum이 들어간다(교사 fixture classNum=3).
  expect(urls[0]).toContain('classNum=3')

  // 학년 전체로 토글 → classNum 없는 요청이 새로 나간다.
  await page.getByRole('button', { name: '학년 전체' }).click()
  await expect.poll(() => urls.length).toBeGreaterThan(1)
  expect(urls.some((u) => !u.includes('classNum'))).toBe(true)
})

test('빈 응답이면 "집계 준비 중" placeholder를 보여준다', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  await page.route('**/api/analytics/class-summary**', (route) => json(route, summary({ subjects: [] })))

  await page.goto('/analytics')

  await expect(page.getByText('집계 준비 중입니다.')).toBeVisible()
  await expect(page.locator('.recharts-bar-rectangle')).toHaveCount(0)
})
