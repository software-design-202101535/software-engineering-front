import { test, expect, json, mockApiFallback } from './fixtures'
import type { Page } from '@playwright/test'

/**
 * 카카오 OAuth 콜백/완료 분기 + 일반(이메일) 회원가입. 단위로 못 잡는 영역:
 * 실제 라우팅(기존→역할홈, 신규→/oauth/complete), tempToken 가드, 가입 성공→/login,
 * 비밀번호 불일치 클라이언트 검증.
 */

const KAKAO = '**/api/auth/oauth/kakao'

test.describe('카카오 콜백 분기', () => {
  test('기존 사용자면 역할 홈으로 이동한다', async ({ page, auth }) => {
    await auth.anon()
    await mockApiFallback(page)
    await page.route(KAKAO, (route) =>
      json(route, {
        newUser: false,
        loginData: { accessToken: 'tok', userId: 1, email: 'k@test.com', name: '카카오', role: 'STUDENT' },
      }),
    )

    await page.goto('/oauth/kakao/callback?code=abc123')

    await expect(page).toHaveURL(/\/student\/grades$/)
  })

  test('신규 사용자면 tempToken을 들고 /oauth/complete로 이동한다', async ({ page, auth }) => {
    await auth.anon()
    await page.route(KAKAO, (route) =>
      json(route, { newUser: true, tempToken: 'tok123', email: 'k@test.com', name: '카카오' }),
    )

    await page.goto('/oauth/kakao/callback?code=abc123')

    await expect(page).toHaveURL(/\/oauth\/complete\?tempToken=tok123/)
    await expect(page.getByRole('heading', { name: '추가 정보 입력' })).toBeVisible()
  })

  test('code가 없으면 실패 화면을 보여준다', async ({ page, auth }) => {
    await auth.anon()
    await page.goto('/oauth/kakao/callback')

    await expect(page.getByText('인증 코드가 없습니다. 다시 로그인해 주세요.')).toBeVisible()
  })
})

test('tempToken 없이 /oauth/complete에 들어오면 안내 화면을 보여준다', async ({ page, auth }) => {
  await auth.anon()
  await page.goto('/oauth/complete')

  await expect(page.getByRole('heading', { name: '인증 정보 없음' })).toBeVisible()
  await expect(page.getByText('인증 정보가 유실되었습니다.', { exact: false })).toBeVisible()
})

async function fillTeacherSignup(page: Page, password: string, passwordConfirm: string) {
  await page.getByPlaceholder('홍길동').fill('김교사')
  await page.getByPlaceholder('example@school.kr').fill('teacher@test.com')
  await page.getByPlaceholder('8자 이상 입력').fill(password)
  await page.getByPlaceholder('비밀번호 재입력').fill(passwordConfirm)
}

test('교사 회원가입 성공 시 /login으로 이동한다', async ({ page, auth }) => {
  await auth.anon()
  await page.route('**/api/auth/register/teacher', (route) => json(route, {}))

  await page.goto('/signup/teacher')
  await expect(page.getByRole('heading', { name: '교사 회원가입' })).toBeVisible()

  await fillTeacherSignup(page, 'pw123456', 'pw123456')
  await page.getByRole('button', { name: '가입 신청하기' }).click()

  await expect(page).toHaveURL(/\/login$/)
})

test('비밀번호 확인이 다르면 에러를 노출하고 가입하지 않는다', async ({ page, auth }) => {
  await auth.anon()
  let registerCalled = false
  await page.route('**/api/auth/register/**', (route) => {
    registerCalled = true
    return json(route, {})
  })

  await page.goto('/signup/teacher')
  await fillTeacherSignup(page, 'pw123456', 'different1')
  await page.getByRole('button', { name: '가입 신청하기' }).click()

  await expect(page.getByText('비밀번호가 일치하지 않습니다.')).toBeVisible()
  await expect(page).toHaveURL(/\/signup\/teacher$/)
  expect(registerCalled).toBe(false)
})
