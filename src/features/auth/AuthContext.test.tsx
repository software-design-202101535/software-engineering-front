import { renderHook, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { AuthProvider, useAuth } from './AuthContext'
import { setAccessToken, getAccessToken } from '@/api/client'
import type { ReactNode } from 'react'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const url = (path: string) => `${BASE}${path}`

const baseLoginResponse = {
  accessToken: 'access-token',
  userId: 1,
  email: 'teacher@test.com',
  name: '김선생',
  role: 'TEACHER',
}

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

beforeEach(() => {
  setAccessToken(null)
})

describe('AuthProvider 초기화', () => {
  it('localStorage에 user가 없으면 비인증 상태로 시작한다', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('localStorage에 user가 있으면 복구하여 인증 상태로 시작한다', () => {
    const savedUser = { id: 1, email: 'teacher@test.com', name: '김선생', role: 'TEACHER' }
    localStorage.setItem('user', JSON.stringify(savedUser))

    const { result } = renderHook(() => useAuth(), { wrapper })
    expect(result.current.user?.email).toBe('teacher@test.com')
    expect(result.current.isAuthenticated).toBe(true)
  })
})

describe('login', () => {
  beforeEach(() => {
    server.use(
      http.post(url('/api/auth/login/email'), () =>
        HttpResponse.json(baseLoginResponse),
      ),
    )
  })

  it('성공 시 accessToken을 저장하고 isAuthenticated를 true로 만든다', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.login({ email: 'teacher@test.com', password: 'pass' })
    })
    expect(getAccessToken()).toBe('access-token')
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.name).toBe('김선생')
  })

  it('user 정보를 localStorage에 저장한다', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.login({ email: 'teacher@test.com', password: 'pass' })
    })
    const saved = JSON.parse(localStorage.getItem('user') ?? '{}')
    expect(saved.email).toBe('teacher@test.com')
    expect(saved.role).toBe('TEACHER')
  })

  it('studentId가 응답에 있으면 user 객체에 포함한다', async () => {
    server.use(
      http.post(url('/api/auth/login/email'), () =>
        HttpResponse.json({ ...baseLoginResponse, role: 'STUDENT', studentId: 42 }),
      ),
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.login({ email: 'student@test.com', password: 'pass' })
    })
    expect(result.current.user?.studentId).toBe(42)
  })

  it('studentId가 응답에 없으면 user 객체에 포함하지 않는다', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.login({ email: 'teacher@test.com', password: 'pass' })
    })
    expect('studentId' in (result.current.user ?? {})).toBe(false)
  })

  it('children이 응답에 있으면 user 객체에 포함한다', async () => {
    const children = [{ studentId: 10, name: '자녀1' }]
    server.use(
      http.post(url('/api/auth/login/email'), () =>
        HttpResponse.json({ ...baseLoginResponse, role: 'PARENT', children }),
      ),
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.login({ email: 'parent@test.com', password: 'pass' })
    })
    expect(result.current.user?.children).toEqual(children)
  })
})

describe('oauthLogin', () => {
  it('isNewUser=false 응답이면 accessToken을 저장하고 인증 상태로 만든다', async () => {
    server.use(
      http.post(url('/api/auth/oauth/kakao'), () =>
        HttpResponse.json({
          isNewUser: false,
          accessToken: 'oauth-access',
          userId: 7,
          email: 'kakao@test.com',
          name: '카카오유저',
          role: 'TEACHER',
        }),
      ),
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => { await result.current.oauthLogin('code-123') })
    expect(getAccessToken()).toBe('oauth-access')
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.email).toBe('kakao@test.com')
  })

  it('isNewUser=true 응답이면 응답을 그대로 반환하되 인증 상태는 변하지 않는다', async () => {
    server.use(
      http.post(url('/api/auth/oauth/kakao'), () =>
        HttpResponse.json({
          isNewUser: true,
          tempToken: 'temp-xyz',
          email: 'new@kakao.com',
          name: '신규유저',
        }),
      ),
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    let returned: Awaited<ReturnType<typeof result.current.oauthLogin>> | undefined
    await act(async () => { returned = await result.current.oauthLogin('code-new') })
    expect(returned?.isNewUser).toBe(true)
    if (returned?.isNewUser) {
      expect(returned.tempToken).toBe('temp-xyz')
      expect(returned.email).toBe('new@kakao.com')
    }
    expect(getAccessToken()).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('OAUTH_PROVIDER_ERROR 같은 실패 응답은 에러를 던진다', async () => {
    server.use(
      http.post(url('/api/auth/oauth/kakao'), () =>
        HttpResponse.json({ code: 'OAUTH_PROVIDER_ERROR' }, { status: 502 }),
      ),
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    await expect(
      act(async () => { await result.current.oauthLogin('bad-code') }),
    ).rejects.toBeDefined()
    expect(result.current.isAuthenticated).toBe(false)
  })
})

describe('oauthRegister', () => {
  it('성공 시 accessToken과 user를 저장하고 인증 상태로 만든다', async () => {
    server.use(
      http.post(url('/api/auth/oauth/kakao/register'), () =>
        HttpResponse.json({
          accessToken: 'register-access',
          userId: 9,
          email: 'new@test.com',
          name: '신규유저',
          role: 'STUDENT',
          studentId: 42,
        }),
      ),
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.oauthRegister({
        tempToken: 'temp-xyz',
        role: 'STUDENT',
        termsAgreed: true,
        privacyAgreed: true,
        studentInfo: { school: 'SUNRIN_HIGH_SCHOOL' },
      })
    })
    expect(getAccessToken()).toBe('register-access')
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.studentId).toBe(42)
  })

  it('실패 시 인증 상태를 유지하지 않고 에러를 던진다', async () => {
    server.use(
      http.post(url('/api/auth/oauth/kakao/register'), () =>
        HttpResponse.json({ code: 'INVALID_TEMP_TOKEN' }, { status: 400 }),
      ),
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    await expect(
      act(async () => {
        await result.current.oauthRegister({
          tempToken: 'expired',
          role: 'TEACHER',
          termsAgreed: true,
          privacyAgreed: true,
          teacherInfo: { school: 'SUNRIN_HIGH_SCHOOL' },
        })
      }),
    ).rejects.toBeDefined()
    expect(result.current.isAuthenticated).toBe(false)
  })
})

describe('logout', () => {
  it('토큰, localStorage.user, 인증 상태를 모두 초기화한다', async () => {
    server.use(
      http.post(url('/api/auth/login/email'), () =>
        HttpResponse.json(baseLoginResponse),
      ),
    )
    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(async () => {
      await result.current.login({ email: 'teacher@test.com', password: 'pass' })
    })
    expect(result.current.isAuthenticated).toBe(true)

    await act(async () => {
      await result.current.logout()
    })

    expect(getAccessToken()).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})

describe('useAuth', () => {
  it('AuthProvider 밖에서 사용하면 에러를 던진다', () => {
    expect(() => renderHook(() => useAuth())).toThrow(
      'useAuth must be used within AuthProvider',
    )
  })
})
