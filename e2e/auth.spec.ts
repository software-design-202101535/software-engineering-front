import { test, expect, json, mockApiFallback } from './fixtures'
import type { LoginResponse } from '../src/types'

/**
 * 인증 흐름 E2E. 단위테스트로 못 잡는 영역만:
 * 실제 라우팅/리다이렉트, 인터셉터(401→refresh), localStorage 세션 복구.
 *
 * 핵심: 앱에 라우트 가드가 없다. 접근 제어는 API 401 → client.ts 인터셉터 →
 * refresh 실패 시 window.location.href='/login'으로만 일어난다.
 */

function loginResponse(role: LoginResponse['role'], extra: Partial<LoginResponse> = {}): LoginResponse {
  return { accessToken: 'fresh-token', userId: 1, email: 'u@test.com', name: '사용자', role, ...extra }
}

/** 로그인 폼을 채우고 제출한다. */
async function submitLogin(page: import('@playwright/test').Page): Promise<void> {
  await page.getByPlaceholder('example@email.com').fill('u@test.com')
  await page.getByPlaceholder('••••••••').fill('pw1234!')
  await page.getByRole('button', { name: '로그인' }).click()
}

test.describe('로그인 역할별 랜딩', () => {
  // 랜딩 페이지의 데이터 fetch가 401로 가드를 트리거하지 않도록 모든 API를 무해 응답 처리.
  const okAll = (page: import('@playwright/test').Page) => mockApiFallback(page, [])

  test('교사는 로그인 후 /students로 이동한다', async ({ page, auth }) => {
    await auth.anon()
    await okAll(page)
    await page.route('**/api/auth/login/email', (route) => json(route, loginResponse('TEACHER')))

    await page.goto('/login')
    await submitLogin(page)

    await expect(page).toHaveURL(/\/students$/)
  })

  test('학생은 로그인 후 /student/grades로 이동한다', async ({ page, auth }) => {
    await auth.anon()
    await okAll(page)
    await page.route('**/api/auth/login/email', (route) =>
      json(route, loginResponse('STUDENT', { studentId: 101 })),
    )

    await page.goto('/login')
    await submitLogin(page)

    await expect(page).toHaveURL(/\/student\/grades$/)
  })

  test('학부모는 로그인 후 /parent/grades로 이동한다', async ({ page, auth }) => {
    await auth.anon()
    await okAll(page)
    await page.route('**/api/auth/login/email', (route) =>
      json(route, loginResponse('PARENT', { children: [{ studentId: 101, name: '자녀' }] })),
    )

    await page.goto('/login')
    await submitLogin(page)

    await expect(page).toHaveURL(/\/parent\/grades$/)
  })
})

test('로그인 실패 시 에러 메시지를 노출하고 머무른다', async ({ page, auth }) => {
  await auth.anon()
  await page.route('**/api/auth/login/email', (route) =>
    json(route, { message: '이메일 또는 비밀번호가 올바르지 않습니다.' }, 401),
  )

  await page.goto('/login')
  await submitLogin(page)

  await expect(page.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeVisible()
  await expect(page).toHaveURL(/\/login$/)
})

test('로그아웃하면 /login으로 돌아간다', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  await page.route('**/api/analytics/class-summary**', (route) => json(route, emptySummary))

  await page.goto('/analytics')
  await expect(page.getByRole('heading', { name: '반 성적 통계' })).toBeVisible()

  await page.locator('button[title="로그아웃"]:visible').first().click()
  await expect(page).toHaveURL(/\/login$/)
})

test('가드 부재: 보호 페이지 401 + refresh 실패 → /login으로 리다이렉트', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  // 데이터 fetch 401, refresh도 401 → handleAuthFailure → window.location.href='/login'
  await page.route('**/api/analytics/class-summary**', (route) => route.fulfill({ status: 401, body: '{}' }))
  await page.route('**/api/auth/refresh', (route) => route.fulfill({ status: 401, body: '{}' }))

  await page.goto('/analytics')

  await expect(page).toHaveURL(/\/login$/)
})

test('401 후 refresh 성공 시 원요청을 재시도해 화면이 렌더된다', async ({ page, auth }) => {
  await auth.loginAs('teacher')

  let summaryCalls = 0
  await page.route('**/api/analytics/class-summary**', (route) => {
    summaryCalls += 1
    // 첫 호출은 만료(401), refresh 후 재시도는 성공.
    if (summaryCalls === 1) return route.fulfill({ status: 401, body: '{}' })
    return json(route, emptySummary)
  })
  await page.route('**/api/auth/refresh', (route) => json(route, { accessToken: 'renewed-token' }))

  await page.goto('/analytics')

  await expect(page.getByRole('heading', { name: '반 성적 통계' })).toBeVisible()
  await expect(page).toHaveURL(/\/analytics$/)
})

test('새로고침해도 localStorage 세션이 복구된다', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  await page.route('**/api/analytics/class-summary**', (route) => json(route, emptySummary))

  await page.goto('/analytics')
  await expect(page.getByRole('heading', { name: '반 성적 통계' })).toBeVisible()

  await page.reload()

  await expect(page.getByRole('heading', { name: '반 성적 통계' })).toBeVisible()
  await expect(page).toHaveURL(/\/analytics$/)
})

const emptySummary = {
  school: 'SUNRIN_HIGH_SCHOOL',
  grade: 1,
  classNum: 3,
  semester: '2026-1',
  updatedAt: '2026-06-01T09:00:00',
  subjects: [],
}
