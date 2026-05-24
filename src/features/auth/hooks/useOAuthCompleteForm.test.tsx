import { renderHook, act } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth'
import { useOAuthCompleteForm } from './useOAuthCompleteForm'
import type { ReactNode } from 'react'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const url = (path: string) => `${BASE}${path}`

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

function wrapper({ children }: { children: ReactNode }) {
  return (
    <MemoryRouter>
      <AuthProvider>{children}</AuthProvider>
    </MemoryRouter>
  )
}

const fakeEvent = { preventDefault: vi.fn() } as unknown as React.FormEvent

beforeEach(() => {
  mockNavigate.mockClear()
})

describe('handleSubmit - 역할 미선택', () => {
  it('역할이 null이면 API 호출 없이 error 메시지를 세팅한다', async () => {
    let received: unknown = null
    server.use(
      http.post(url('/api/auth/oauth/complete'), async ({ request }) => {
        received = await request.json()
        return HttpResponse.json({})
      }),
    )
    const { result } = renderHook(() => useOAuthCompleteForm('code-1'), { wrapper })
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(received).toBeNull()
    expect(result.current.error).toBe('역할을 선택해 주세요.')
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

describe('handleSubmit - 역할별 payload 빌드', () => {
  it('TEACHER 역할이면 teacherInfo가 포함된 payload를 전송하고 /dashboard로 이동한다', async () => {
    let received: { role?: string; teacherInfo?: { school?: string; grade?: number } } = {}
    server.use(
      http.post(url('/api/auth/oauth/complete'), async ({ request }) => {
        received = (await request.json()) as typeof received
        return HttpResponse.json({
          accessToken: 't',
          refreshToken: 'r',
          user: { id: 1, email: 't@t.com', name: 'T', role: 'TEACHER' },
        })
      }),
    )
    const { result } = renderHook(() => useOAuthCompleteForm('code-2'), { wrapper })
    act(() => {
      result.current.setRole('TEACHER')
      result.current.setTermsChecked(true)
      result.current.setPrivacyChecked(true)
    })
    act(() => {
      result.current.setField('school')({ target: { value: 'SUNRIN_HIGH_SCHOOL' } } as never)
      result.current.setField('grade')({ target: { value: '2' } } as never)
    })
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(received.role).toBe('TEACHER')
    expect(received.teacherInfo?.school).toBe('SUNRIN_HIGH_SCHOOL')
    expect(received.teacherInfo?.grade).toBe(2)
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })

  it('STUDENT 역할이면 studentInfo가 포함된 payload를 전송한다', async () => {
    let received: { role?: string; studentInfo?: { school?: string; number?: number } } = {}
    server.use(
      http.post(url('/api/auth/oauth/complete'), async ({ request }) => {
        received = (await request.json()) as typeof received
        return HttpResponse.json({
          accessToken: 't',
          refreshToken: 'r',
          user: { id: 1, email: 's@t.com', name: 'S', role: 'STUDENT' },
        })
      }),
    )
    const { result } = renderHook(() => useOAuthCompleteForm('code-3'), { wrapper })
    act(() => {
      result.current.setRole('STUDENT')
      result.current.setTermsChecked(true)
      result.current.setPrivacyChecked(true)
    })
    act(() => {
      result.current.setField('school')({ target: { value: 'SUNRIN_HIGH_SCHOOL' } } as never)
      result.current.setField('number')({ target: { value: '15' } } as never)
    })
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(received.role).toBe('STUDENT')
    expect(received.studentInfo?.school).toBe('SUNRIN_HIGH_SCHOOL')
    expect(received.studentInfo?.number).toBe(15)
    expect(mockNavigate).toHaveBeenCalledWith('/student/grades', { replace: true })
  })

  it('PARENT 역할이면 parentInfo.childInfo가 포함된 payload를 전송한다', async () => {
    let received: { role?: string; parentInfo?: { childInfo?: string } } = {}
    server.use(
      http.post(url('/api/auth/oauth/complete'), async ({ request }) => {
        received = (await request.json()) as typeof received
        return HttpResponse.json({
          accessToken: 't',
          refreshToken: 'r',
          user: { id: 1, email: 'p@t.com', name: 'P', role: 'PARENT' },
        })
      }),
    )
    const { result } = renderHook(() => useOAuthCompleteForm('code-4'), { wrapper })
    act(() => {
      result.current.setRole('PARENT')
      result.current.setTermsChecked(true)
      result.current.setPrivacyChecked(true)
    })
    act(() => {
      result.current.setField('childInfo')({ target: { value: 'child@test.com' } } as never)
    })
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(received.role).toBe('PARENT')
    expect(received.parentInfo?.childInfo).toBe('child@test.com')
    expect(mockNavigate).toHaveBeenCalledWith('/parent/grades', { replace: true })
  })

  it('비어있는 학년/반/번호는 payload에서 제외한다', async () => {
    let received: { teacherInfo?: { grade?: number; classNum?: number } } = {}
    server.use(
      http.post(url('/api/auth/oauth/complete'), async ({ request }) => {
        received = (await request.json()) as typeof received
        return HttpResponse.json({
          accessToken: 't',
          refreshToken: 'r',
          user: { id: 1, email: 't@t.com', name: 'T', role: 'TEACHER' },
        })
      }),
    )
    const { result } = renderHook(() => useOAuthCompleteForm('code-5'), { wrapper })
    act(() => {
      result.current.setRole('TEACHER')
      result.current.setTermsChecked(true)
      result.current.setPrivacyChecked(true)
    })
    act(() => {
      result.current.setField('school')({ target: { value: 'SUNRIN_HIGH_SCHOOL' } } as never)
    })
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect('grade' in (received.teacherInfo ?? {})).toBe(false)
    expect('classNum' in (received.teacherInfo ?? {})).toBe(false)
  })

  it('termsChecked/privacyChecked가 false면 false 그대로 전송된다', async () => {
    let received: { termsAgreed?: boolean; privacyAgreed?: boolean } = {}
    server.use(
      http.post(url('/api/auth/oauth/complete'), async ({ request }) => {
        received = (await request.json()) as typeof received
        return HttpResponse.json({
          accessToken: 't',
          refreshToken: 'r',
          user: { id: 1, email: 't@t.com', name: 'T', role: 'TEACHER' },
        })
      }),
    )
    const { result } = renderHook(() => useOAuthCompleteForm('code-6'), { wrapper })
    act(() => { result.current.setRole('TEACHER') })
    act(() => {
      result.current.setField('school')({ target: { value: 'SUNRIN_HIGH_SCHOOL' } } as never)
    })
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(received.termsAgreed).toBe(false)
    expect(received.privacyAgreed).toBe(false)
  })
})

describe('handleSubmit - 에러 처리', () => {
  function setupErrorResponse(body: Record<string, unknown>, status = 400) {
    server.use(
      http.post(url('/api/auth/oauth/complete'), () => HttpResponse.json(body, { status })),
    )
  }

  function preparePayload(result: { current: ReturnType<typeof useOAuthCompleteForm> }) {
    act(() => {
      result.current.setRole('TEACHER')
      result.current.setTermsChecked(true)
      result.current.setPrivacyChecked(true)
    })
    act(() => {
      result.current.setField('school')({ target: { value: 'SUNRIN_HIGH_SCHOOL' } } as never)
    })
  }

  it('errors 객체가 있으면 fieldErrors에 세팅한다', async () => {
    setupErrorResponse({ errors: { school: '학교가 유효하지 않습니다' } })
    const { result } = renderHook(() => useOAuthCompleteForm('code-7'), { wrapper })
    preparePayload(result)
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(result.current.fieldErrors.school).toBe('학교가 유효하지 않습니다')
    expect(result.current.error).toBe('')
  })

  it('code=OAUTH_INVALID_AUTHCODE면 만료 메시지를 표시한다', async () => {
    setupErrorResponse({ code: 'OAUTH_INVALID_AUTHCODE' })
    const { result } = renderHook(() => useOAuthCompleteForm('expired'), { wrapper })
    preparePayload(result)
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(result.current.error).toContain('인증 코드가 만료')
  })

  it('code=EMAIL_ALREADY_EXISTS면 가입된 이메일 안내 메시지를 표시한다', async () => {
    setupErrorResponse({ code: 'EMAIL_ALREADY_EXISTS' }, 409)
    const { result } = renderHook(() => useOAuthCompleteForm('code-8'), { wrapper })
    preparePayload(result)
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(result.current.error).toContain('이미 가입된 이메일')
  })

  it('code/errors 없으면 message를 그대로 표시한다', async () => {
    setupErrorResponse({ message: '잠시 후 다시 시도해 주세요' }, 500)
    const { result } = renderHook(() => useOAuthCompleteForm('code-9'), { wrapper })
    preparePayload(result)
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(result.current.error).toBe('잠시 후 다시 시도해 주세요')
  })

  it('실패해도 isLoading은 false로 돌아온다', async () => {
    setupErrorResponse({ message: 'err' }, 500)
    const { result } = renderHook(() => useOAuthCompleteForm('code-10'), { wrapper })
    preparePayload(result)
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(result.current.isLoading).toBe(false)
  })
})
