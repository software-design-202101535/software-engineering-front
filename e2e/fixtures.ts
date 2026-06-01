import { test as base, expect, type Page, type Route } from '@playwright/test'
import type { User } from '../src/types'

/**
 * 목킹 E2E 공통 픽스처.
 *
 * - 라우트 가드가 없으므로(메뉴 분기만 존재) 인증은 localStorage(accessToken/user) 주입으로 흉내낸다.
 * - 모든 /api 요청은 .env.e2e가 base URL을 비워 preview 오리진(상대경로)으로 나가고
 *   page.route로 가로채진다. 실 백엔드에는 닿지 않는다.
 * - page.route는 LIFO: 먼저 등록한 baseMocks(부수 API)는 테스트가 나중에 등록하는
 *   구체 목으로 덮어쓸 수 있다.
 */

type RoleKey = 'teacher' | 'student' | 'parent' | 'parentSingle' | 'admin'

const USERS: Record<RoleKey, User> = {
  teacher: { id: 1, email: 'teacher@test.com', name: '김교사', role: 'TEACHER', grade: 1, classNum: 3 },
  student: { id: 2, email: 'student@test.com', name: '이학생', role: 'STUDENT', studentId: 101, grade: 2, classNum: 3 },
  parent: {
    id: 3,
    email: 'parent@test.com',
    name: '박학부모',
    role: 'PARENT',
    children: [
      { studentId: 101, name: '박첫째' },
      { studentId: 102, name: '박둘째' },
    ],
  },
  parentSingle: {
    id: 4,
    email: 'parent1@test.com',
    name: '최학부모',
    role: 'PARENT',
    children: [{ studentId: 201, name: '최외동' }],
  },
  admin: { id: 5, email: 'admin@test.com', name: '관리자', role: 'ADMIN' },
}

/**
 * 실제 API 호출(/api/로 시작하는 pathname)만 매칭하는 fallback 목.
 *
 * 주의: 와일드카드 글롭(api 양쪽 더블스타)은 Vite dev가 서빙하는 앱 모듈 `/src/api/*.ts`까지
 * 매칭해 앱을 깨뜨린다. pathname.startsWith('/api/') predicate로 그것을 피한다.
 * page.route는 LIFO라 이걸 먼저 깔고 구체 목을 나중에 등록하면 구체 목이 우선한다.
 */
export async function mockApiFallback(page: Page, body: unknown = []): Promise<void> {
  await page.route(
    (url) => url.pathname.startsWith('/api/'),
    (route) => json(route, body),
  )
}

/** JSON 200 응답 헬퍼. */
export async function json(route: Route, body: unknown, status = 200): Promise<void> {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

/**
 * 앱 로드 시 자동 발생하는 부수 API를 무해하게 처리한다.
 * (FCM 디바이스 등록, 알림 배지 조회 등) — 구체 테스트가 덮어쓰지 않는 한 성공/빈 응답.
 */
export async function installBaseMocks(page: Page): Promise<void> {
  await page.route('**/api/devices/tokens', (route) => json(route, {}))
  await page.route('**/api/devices/tokens/*', (route) => route.fulfill({ status: 204 }))
  await page.route('**/api/notifications', (route) => json(route, []))
  await page.route('**/api/auth/logout', (route) => json(route, {}))
}

/** localStorage에 accessToken/user를 주입해 인증 상태로 부팅시킨다(페이지 스크립트 실행 전). */
export async function seedAuth(page: Page, user: User, token = 'e2e-access-token'): Promise<void> {
  await page.addInitScript(
    ([t, u]) => {
      localStorage.setItem('accessToken', t as string)
      localStorage.setItem('user', u as string)
    },
    [token, JSON.stringify(user)] as const,
  )
}

interface AuthFixture {
  /** 지정 역할로 로그인된 상태를 만들고(localStorage + 부수 목) User를 반환한다. goto 이전에 호출. */
  loginAs: (role: RoleKey, overrides?: Partial<User>) => Promise<User>
  /** 인증 없이 부수 목만 설치(가드 부재/401 흐름 테스트용). */
  anon: () => Promise<void>
}

export const test = base.extend<{ auth: AuthFixture }>({
  auth: async ({ page }, use) => {
    await use({
      loginAs: async (role, overrides) => {
        const user = { ...USERS[role], ...overrides }
        await installBaseMocks(page)
        await seedAuth(page, user)
        return user
      },
      anon: async () => {
        await installBaseMocks(page)
      },
    })
  },
})

export { expect, USERS }
export type { RoleKey }
