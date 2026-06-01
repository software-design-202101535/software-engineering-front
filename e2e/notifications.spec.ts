import { test, expect, json, mockApiFallback } from './fixtures'
import type { Page } from '@playwright/test'
import type { Notification, NotificationReferenceType } from '../src/types'

/**
 * 알림 배지·목록. 단위로 못 잡는 영역:
 * 사이드바 배지와 목록의 unread 일관성, 클릭 시 낙관적 읽음→배지 감소→네비게이션,
 * 모두 읽음→0, 빈 상태.
 *
 * 배지(useUnreadCount)와 목록(useNotifications)은 같은 쿼리키를 공유한다.
 * mark read/all은 낙관적 업데이트 후 onSuccess에서 invalidate→refetch 하므로
 * GET 목을 stateful하게 만들어 refetch가 낙관적 상태를 되돌리지 않게 한다.
 */

function notif(
  id: number,
  read: boolean,
  referenceType: NotificationReferenceType = 'GRADE',
): Notification {
  return {
    id,
    type: 'GRADE_UPDATED',
    title: `알림 ${id}`,
    message: `메시지 ${id}`,
    read,
    referenceId: id,
    referenceType,
    referenceStudentId: 101,
    referenceStudentName: '학생',
    createdAt: '2026-06-01T08:00:00',
  }
}

/** stateful 알림 목킹: 목록 GET + 읽음/모두읽음 PATCH가 같은 in-memory 상태를 갱신. */
async function mockNotifications(page: Page, initial: Notification[]) {
  let items = initial
  await mockApiFallback(page)
  await page.route('**/api/notifications', (route) => json(route, items))
  await page.route('**/api/notifications/read-all', (route) => {
    items = items.map((n) => ({ ...n, read: true }))
    return json(route, {})
  })
  await page.route('**/api/notifications/*/read', (route) => {
    const id = Number(new URL(route.request().url()).pathname.split('/').at(-2))
    items = items.map((n) => (n.id === id ? { ...n, read: true } : n))
    return json(route, {})
  })
}

// 사이드바 알림 메뉴 안의 배지(숫자). 메뉴 접근명에는 아이콘 리거처가 섞이므로 부분일치.
const navBadge = (page: Page) => page.getByRole('link', { name: '알림' }).getByText(/^\d+$/)
// 알림 항목 버튼만(헤더의 "모두 읽음" 버튼 제외) — 목록 <ul> 안으로 스코프.
const listItems = (page: Page) => page.getByRole('main').getByRole('list').getByRole('button')

test('배지와 목록의 unread 개수가 일치한다', async ({ page, auth }) => {
  await auth.loginAs('student')
  await mockNotifications(page, [notif(1, false), notif(2, false), notif(3, true)])

  await page.goto('/student/notifications')

  // 3개 중 2개 unread → 배지 "2", 목록 3개.
  await expect(navBadge(page)).toHaveText('2')
  await expect(listItems(page)).toHaveCount(3)
})

test('알림 클릭 시 낙관적으로 읽음 처리되고 배지가 줄며 링크로 이동한다', async ({ page, auth }) => {
  await auth.loginAs('student')
  await mockNotifications(page, [notif(1, false), notif(2, false)])

  await page.goto('/student/notifications')
  await expect(navBadge(page)).toHaveText('2')

  // 첫 알림(GRADE) 클릭 → /student/grades로 이동, 배지 2→1.
  await listItems(page).first().click()

  await expect(page).toHaveURL(/\/student\/grades$/)
  await expect(navBadge(page)).toHaveText('1')
})

test('모두 읽음을 누르면 배지가 사라진다', async ({ page, auth }) => {
  await auth.loginAs('student')
  await mockNotifications(page, [notif(1, false), notif(2, false)])

  await page.goto('/student/notifications')
  await expect(navBadge(page)).toHaveText('2')

  await page.getByRole('button', { name: '모두 읽음' }).click()

  // unread 0 → 배지 미표시, 버튼 비활성.
  await expect(navBadge(page)).toHaveCount(0)
  await expect(page.getByRole('button', { name: '모두 읽음' })).toBeDisabled()
})

test('알림이 없으면 빈 상태를 보여준다', async ({ page, auth }) => {
  await auth.loginAs('student')
  await mockNotifications(page, [])

  await page.goto('/student/notifications')

  await expect(page.getByText('받은 알림이 없습니다.')).toBeVisible()
  await expect(navBadge(page)).toHaveCount(0)
})
