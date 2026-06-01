import { test, expect, json } from './fixtures'
import type { ClassSummary } from '../src/types'

/**
 * 인프라 스모크: webServer 기동 + 픽스처(인증 주입 + page.route 목킹)가
 * 실제로 동작하는지 확인하는 최소 검증. 도메인별 상세 시나리오는 후속 스펙에서 다룬다.
 */

const summary: ClassSummary = {
  school: 'SUNRIN_HIGH_SCHOOL',
  grade: 1,
  classNum: 3,
  semester: '2026-1',
  updatedAt: '2026-06-01T09:00:00',
  subjects: [
    {
      subject: 'KOREAN',
      avgScore: 82.4,
      maxScore: 98,
      minScore: 55,
      studentCount: 28,
      distribution: { A: 8, B: 10, C: 6, D: 3, F: 1 },
    },
    {
      subject: 'MATH',
      avgScore: 74.1,
      maxScore: 100,
      minScore: 40,
      studentCount: 28,
      distribution: { A: 5, B: 7, C: 9, D: 5, F: 2 },
    },
  ],
}

test('공개 라우트: 미인증 상태에서 /login이 렌더된다', async ({ page, auth }) => {
  await auth.anon()
  await page.goto('/login')
  await expect(page.getByRole('textbox').first()).toBeVisible()
})

test('인증 주입 + 목킹: 교사가 /analytics에서 반 통계 대시보드를 본다', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  await page.route('**/api/analytics/class-summary**', (route) => json(route, summary))

  await page.goto('/analytics')

  await expect(page.getByRole('heading', { name: '반 성적 통계' })).toBeVisible()
  // recharts 막대/도넛이 실제 SVG로 렌더된다.
  await expect(page.locator('svg.recharts-surface').first()).toBeVisible()
})
