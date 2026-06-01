import { test, expect, mockApiFallback } from './fixtures'
import type { Page } from '@playwright/test'

/**
 * 역할별 사이드바 네비게이션 분기 + 학부모 자녀 드롭다운.
 * 라우트 가드가 없어 메뉴 구성이 사실상 유일한 역할별 화면 차이이므로 P0.
 */

// 사이드바 NavLink의 접근명에는 아이콘 리거처 텍스트가 섞이므로 부분일치(exact: false)로 본다.
const navLink = (page: Page, name: string) => page.getByRole('link', { name })

test('교사 사이드바: 학생 관리·공유 상담·통계, 알림 없음', async ({ page, auth }) => {
  await auth.loginAs('teacher')
  await mockApiFallback(page)
  await page.goto('/students')

  await expect(navLink(page, '학생 관리')).toBeVisible()
  await expect(navLink(page, '공유 상담')).toBeVisible()
  await expect(navLink(page, '통계')).toBeVisible()
  await expect(navLink(page, '알림')).toHaveCount(0)
})

test('학생 사이드바: 성적·피드백·알림', async ({ page, auth }) => {
  await auth.loginAs('student')
  await mockApiFallback(page)
  await page.goto('/student/grades')

  await expect(navLink(page, '성적')).toBeVisible()
  await expect(navLink(page, '피드백')).toBeVisible()
  await expect(navLink(page, '알림')).toBeVisible()
  // 교사 전용 메뉴는 없다.
  await expect(navLink(page, '공유 상담')).toHaveCount(0)
})

test('학부모 사이드바: 성적·피드백·알림', async ({ page, auth }) => {
  await auth.loginAs('parent')
  await mockApiFallback(page)
  await page.goto('/parent/grades')

  await expect(navLink(page, '성적')).toBeVisible()
  await expect(navLink(page, '피드백')).toBeVisible()
  await expect(navLink(page, '알림')).toBeVisible()
})

test('학부모 자녀 2명: 자녀 선택 드롭다운에 두 자녀가 보인다', async ({ page, auth }) => {
  await auth.loginAs('parent')
  await mockApiFallback(page)
  await page.goto('/parent/grades')

  await expect(page.getByText('자녀 선택')).toBeVisible()
  const select = page.locator('select')
  await expect(select.locator('option', { hasText: '박첫째' })).toHaveCount(1)
  await expect(select.locator('option', { hasText: '박둘째' })).toHaveCount(1)
})

test('학부모 자녀 1명: 자녀 선택 드롭다운이 숨겨진다', async ({ page, auth }) => {
  await auth.loginAs('parentSingle')
  await mockApiFallback(page)
  await page.goto('/parent/grades')

  await expect(page.getByText('자녀 선택')).toHaveCount(0)
})
