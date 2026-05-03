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
