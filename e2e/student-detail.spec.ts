import { test, expect, json, mockApiFallback } from './fixtures'
import type { Page } from '@playwright/test'
import type { Grade, Student, StudentSummary } from '../src/types'

/**
 * 교사 학생 상세(성적 탭). 단위로 못 잡는 영역:
 * 목록→상세 라우팅+헤더, 상세 탭 전환 시 편집상태 리셋(언마운트), 성적 batch 저장 요청 본문,
 * RadarChart 실 SVG 렌더.
 */

const STUDENT_SUMMARY: StudentSummary = { id: 7, name: '홍길동', grade: 2, classNum: 3, number: 7 }
const STUDENT: Student = {
  id: 7,
  name: '홍길동',
  grade: 2,
  classNum: 3,
  number: 7,
  birthDate: '2010-03-01',
}
type BatchBody = { update?: { id: number; subject: string; score: number }[] }

// RadarChart는 과목 3개 이상이어야 렌더되므로 3개 제공.
const GRADES: Grade[] = [
  { id: 1, subject: 'KOREAN', score: 80, grade: 'B' },
  { id: 2, subject: 'MATH', score: 72, grade: 'C' },
  { id: 3, subject: 'ENGLISH', score: 91, grade: 'A' },
]

async function setupTeacher(page: Page) {
  await mockApiFallback(page)
  await page.route('**/api/students', (route) => json(route, [STUDENT_SUMMARY]))
  await page.route('**/api/students/*', (route) => json(route, STUDENT))
  // 조회 URL에 ?semester=...&examType=... 쿼리가 붙으므로 trailing ** 필요.
  await page.route('**/api/students/*/grades**', (route) => json(route, GRADES))
}

test('학생 목록에서 카드를 누르면 상세(성적 탭)로 이동하고 헤더에 이름이 보인다', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  await setupTeacher(page)

  await page.goto('/students')
  await page.getByRole('button', { name: /홍길동/ }).click()

  await expect(page).toHaveURL(/\/students\/7\/grades$/)
  // 학생 정보 바에 이름·학년/반/번호가 표시된다(헤더 banner가 아닌 별도 바).
  await expect(page.getByText('2학년 3반 7번')).toBeVisible()
})

test('상세 탭을 전환하면 성적 편집 상태가 리셋된다', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  await setupTeacher(page)

  await page.goto('/students/7/grades')
  await page.getByRole('button', { name: '수정하기' }).click()
  // 편집 모드: 저장 버튼 노출.
  await expect(page.getByRole('button', { name: '저장' })).toBeVisible()

  // 다른 탭으로 갔다가 돌아오면 페이지가 언마운트→리마운트되어 읽기 모드로 초기화.
  await page.getByRole('link', { name: '출결' }).click()
  await page.getByRole('link', { name: '성적' }).click()

  await expect(page.getByRole('button', { name: '수정하기' })).toBeVisible()
  await expect(page.getByRole('button', { name: '저장' })).toHaveCount(0)
})

test('성적 수정 후 저장하면 batch PUT 본문에 변경분이 담긴다', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  await setupTeacher(page)

  // 배열에 모아 TS 제어흐름이 단일 변수를 null로 좁히는 것을 피한다.
  const bodies: BatchBody[] = []
  await page.route('**/api/students/*/grades/batch', (route) => {
    bodies.push(route.request().postDataJSON())
    return json(route, GRADES)
  })

  await page.goto('/students/7/grades')
  await page.getByRole('button', { name: '수정하기' }).click()

  // 첫 점수 input(국어 80) → 95로 변경.
  await page.getByRole('spinbutton').first().fill('95')
  await page.getByRole('button', { name: '저장' }).click()

  await expect.poll(() => bodies[0]?.update?.[0]?.score).toBe(95)
  expect(bodies[0]?.update?.[0]).toMatchObject({ id: 1, subject: 'KOREAN', score: 95 })
})

test('시각화 서브탭에서 RadarChart가 SVG로 렌더된다', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  await setupTeacher(page)

  await page.goto('/students/7/grades')
  await page.getByRole('button', { name: '시각화' }).click()

  await expect(page.getByRole('heading', { name: '성적 시각화' })).toBeVisible()
  await expect(page.locator('svg').first()).toBeVisible()
})
