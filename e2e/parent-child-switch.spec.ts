import { test, expect, json, mockApiFallback } from './fixtures'
import type { Page, Route } from '@playwright/test'

/**
 * 학부모 자녀 전환. 단위로 못 잡는 영역:
 * 드롭다운 변경→URL ?childId= 반영 + 선택 자녀로 재조회, 잘못된 childId→첫 자녀 폴백.
 *
 * fetchStudent(selectedChildId)가 GET /api/students/{id}로 자녀 정보를 받아 이름을 표시하므로
 * id별로 다른 이름을 돌려주면 어느 자녀가 활성인지 화면으로 확인할 수 있다.
 */

function mockChildStudent(route: Route) {
  const path = new URL(route.request().url()).pathname
  const id = Number(path.split('/').pop())
  const name = id === 102 ? '박둘째' : '박첫째'
  return json(route, { id, name, grade: 2, classNum: 3, number: 5, birthDate: '2010-01-01' })
}

// 학기/시험 select과 구분하기 위해 자녀 옵션을 가진 select로 좁힌다.
const childSelect = (page: Page) =>
  page.locator('select').filter({ has: page.getByRole('option', { name: '박첫째' }) })

async function setup(page: Page) {
  await mockApiFallback(page)
  await page.route('**/api/students/*', mockChildStudent)
}

test('드롭다운으로 자녀를 바꾸면 URL childId가 갱신되고 해당 자녀로 재조회한다', async ({ page, auth }) => {
  await auth.loginAs('parent')
  await setup(page)

  await page.goto('/parent/grades')
  // 기본은 첫 자녀(101). 이름은 드롭다운 옵션에도 있으므로 본문(main)으로 스코프.
  await expect(page.getByRole('main').getByText('박첫째')).toBeVisible()

  await childSelect(page).selectOption('102')

  await expect(page).toHaveURL(/childId=102/)
  await expect(page.getByRole('main').getByText('박둘째')).toBeVisible()
})

test('쿼리의 childId가 잘못되면 첫 자녀로 폴백한다', async ({ page, auth }) => {
  await auth.loginAs('parent')
  await setup(page)

  // 999는 자녀 목록(101,102)에 없음 → 첫 자녀 101로 폴백.
  await page.goto('/parent/grades?childId=999')

  await expect(childSelect(page)).toHaveValue('101')
  await expect(page.getByRole('main').getByText('박첫째')).toBeVisible()
})
