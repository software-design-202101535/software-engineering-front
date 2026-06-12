import { renderHook, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { server } from '@/test/mocks/server'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth'
import { useLoginForm } from './useLoginForm'
import type { ReactNode } from 'react'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const url = (path: string) => `${BASE}${path}`

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>{children}</AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  )
}

const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent

function makeLoginResponse(role: string, extras = {}) {
  return { accessToken: 'token', userId: 1, email: 'test@test.com', name: '테스터', role, ...extras }
}

beforeEach(() => {
  mockNavigate.mockClear()
})

describe('handleSubmit - 성공 시 역할별 라우팅', () => {
  it.each([
    ['TEACHER', '/dashboard'],
    ['STUDENT', '/student/grades'],
    ['PARENT', '/parent/grades'],
    ['ADMIN', '/admin'],
  ])('%s 역할이면 %s 로 이동한다', async (role, path) => {
    server.use(
      http.post(url('/api/auth/login/email'), () =>
        HttpResponse.json(makeLoginResponse(role)),
      ),
    )
    const { result } = renderHook(() => useLoginForm(), { wrapper })
    act(() => { result.current.setEmail('test@test.com') })
    act(() => { result.current.setPassword('pass') })
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(mockNavigate).toHaveBeenCalledWith(path)
  })
})

describe('handleSubmit - 실패 시 에러 처리', () => {
  it('errors 객체가 있으면 fieldErrors에 세팅한다', async () => {
    server.use(
      http.post(url('/api/auth/login/email'), () =>
        HttpResponse.json(
          { errors: { email: '이메일 형식이 올바르지 않습니다' } },
          { status: 400 },
        ),
      ),
    )
    const { result } = renderHook(() => useLoginForm(), { wrapper })
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(result.current.fieldErrors.email).toBe('이메일 형식이 올바르지 않습니다')
    expect(result.current.error).toBe('')
  })

  it('message가 있으면 error에 세팅한다', async () => {
    server.use(
      http.post(url('/api/auth/login/email'), () =>
        HttpResponse.json(
          { message: '아이디 또는 비밀번호가 틀렸습니다' },
          { status: 401 },
        ),
      ),
    )
    const { result } = renderHook(() => useLoginForm(), { wrapper })
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(result.current.error).toBe('아이디 또는 비밀번호가 틀렸습니다')
    expect(result.current.fieldErrors).toEqual({})
  })

  it('errors도 message도 없으면 기본 에러 메시지를 세팅한다', async () => {
    server.use(
      http.post(url('/api/auth/login/email'), () =>
        new HttpResponse(null, { status: 500 }),
      ),
    )
    const { result } = renderHook(() => useLoginForm(), { wrapper })
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(result.current.error).toBe('로그인에 실패하였습니다.')
  })

  it('제출 완료 후 isLoading이 false로 돌아온다', async () => {
    server.use(
      http.post(url('/api/auth/login/email'), () =>
        HttpResponse.json(makeLoginResponse('TEACHER')),
      ),
    )
    const { result } = renderHook(() => useLoginForm(), { wrapper })
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(result.current.isLoading).toBe(false)
  })
})

describe('toggleShowPassword', () => {
  it('호출할 때마다 showPassword가 토글된다', () => {
    const { result } = renderHook(() => useLoginForm(), { wrapper })
    expect(result.current.showPassword).toBe(false)
    act(() => { result.current.toggleShowPassword() })
    expect(result.current.showPassword).toBe(true)
    act(() => { result.current.toggleShowPassword() })
    expect(result.current.showPassword).toBe(false)
  })
})
