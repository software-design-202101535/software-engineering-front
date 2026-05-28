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

function makeLoginResponse(role: string, extras: Record<string, unknown> = {}) {
  return {
    accessToken: 'access',
    userId: 1,
    email: 'user@test.com',
    name: '테스터',
    role,
    ...extras,
  }
}

beforeEach(() => {
  mockNavigate.mockClear()
})

describe('initialEmail', () => {
  it('initialEmail이 주어지면 fields.email 초기값으로 사용한다', () => {
    const { result } = renderHook(() => useOAuthCompleteForm('tk-1', 'kakao@test.com'), { wrapper })
    expect(result.current.fields.email).toBe('kakao@test.com')
  })

  it('initialEmail이 없으면 빈 문자열로 시작한다', () => {
    const { result } = renderHook(() => useOAuthCompleteForm('tk-2'), { wrapper })
    expect(result.current.fields.email).toBe('')
  })
})

describe('handleSubmit - 역할 미선택', () => {
  it('역할이 null이면 API 호출 없이 error 메시지를 세팅한다', async () => {
    let received: unknown = null
    server.use(
      http.post(url('/api/auth/oauth/kakao/register'), async ({ request }) => {
        received = await request.json()
        return HttpResponse.json(makeLoginResponse('TEACHER'))
      }),
    )
    const { result } = renderHook(() => useOAuthCompleteForm('tk-1'), { wrapper })
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(received).toBeNull()
    expect(result.current.error).toBe('역할을 선택해 주세요.')
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

describe('handleSubmit - 역할별 payload 빌드', () => {
  it('TEACHER 역할이면 teacherInfo가 포함된 payload를 전송하고 /dashboard로 이동한다', async () => {
    let received: { tempToken?: string; role?: string; teacherInfo?: { school?: string; grade?: number } } = {}
    server.use(
      http.post(url('/api/auth/oauth/kakao/register'), async ({ request }) => {
        received = (await request.json()) as typeof received
        return HttpResponse.json(makeLoginResponse('TEACHER'))
      }),
    )
    const { result } = renderHook(() => useOAuthCompleteForm('tk-teacher', 'k@test.com'), { wrapper })
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
    expect(received.tempToken).toBe('tk-teacher')
    expect(received.role).toBe('TEACHER')
    expect(received.teacherInfo?.school).toBe('SUNRIN_HIGH_SCHOOL')
    expect(received.teacherInfo?.grade).toBe(2)
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true })
  })

  it('STUDENT 역할이면 studentInfo가 포함된 payload를 전송한다', async () => {
    let received: { role?: string; studentInfo?: { school?: string; number?: number } } = {}
    server.use(
      http.post(url('/api/auth/oauth/kakao/register'), async ({ request }) => {
        received = (await request.json()) as typeof received
        return HttpResponse.json(makeLoginResponse('STUDENT', { studentId: 42 }))
      }),
    )
    const { result } = renderHook(() => useOAuthCompleteForm('tk-student'), { wrapper })
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

  it('PARENT 역할이면 parentInfo.childEmails가 포함된 payload를 전송한다', async () => {
    let received: { role?: string; parentInfo?: { childEmails?: string[] } } = {}
    server.use(
      http.post(url('/api/auth/oauth/kakao/register'), async ({ request }) => {
        received = (await request.json()) as typeof received
        return HttpResponse.json(makeLoginResponse('PARENT'))
      }),
    )
    const { result } = renderHook(() => useOAuthCompleteForm('tk-parent'), { wrapper })
    act(() => {
      result.current.setRole('PARENT')
      result.current.setTermsChecked(true)
      result.current.setPrivacyChecked(true)
    })
    act(() => {
      result.current.setChildEmailAt(0, 'child1@test.com')
      result.current.addChildEmail()
    })
    act(() => {
      result.current.setChildEmailAt(1, 'child2@test.com')
    })
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(received.role).toBe('PARENT')
    expect(received.parentInfo?.childEmails).toEqual(['child1@test.com', 'child2@test.com'])
    expect(mockNavigate).toHaveBeenCalledWith('/parent/grades', { replace: true })
  })

  it('PARENT 역할의 빈 자녀 이메일은 payload에서 제외된다', async () => {
    let received: { parentInfo?: { childEmails?: string[] } } = {}
    server.use(
      http.post(url('/api/auth/oauth/kakao/register'), async ({ request }) => {
        received = (await request.json()) as typeof received
        return HttpResponse.json(makeLoginResponse('PARENT'))
      }),
    )
    const { result } = renderHook(() => useOAuthCompleteForm('tk-parent-empty'), { wrapper })
    act(() => {
      result.current.setRole('PARENT')
      result.current.setTermsChecked(true)
      result.current.setPrivacyChecked(true)
      result.current.addChildEmail()
      result.current.addChildEmail()
    })
    act(() => {
      result.current.setChildEmailAt(1, '  child2@test.com  ')
    })
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(received.parentInfo?.childEmails).toEqual(['child2@test.com'])
  })

  it('비어있는 학년/반/번호는 payload에서 제외한다', async () => {
    let received: { teacherInfo?: { grade?: number; classNum?: number } } = {}
    server.use(
      http.post(url('/api/auth/oauth/kakao/register'), async ({ request }) => {
        received = (await request.json()) as typeof received
        return HttpResponse.json(makeLoginResponse('TEACHER'))
      }),
    )
    const { result } = renderHook(() => useOAuthCompleteForm('tk-5'), { wrapper })
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

  it('email 필드가 비어있으면 payload에 email을 포함하지 않는다', async () => {
    let received: { email?: string } = {}
    server.use(
      http.post(url('/api/auth/oauth/kakao/register'), async ({ request }) => {
        received = (await request.json()) as typeof received
        return HttpResponse.json(makeLoginResponse('TEACHER'))
      }),
    )
    const { result } = renderHook(() => useOAuthCompleteForm('tk-6'), { wrapper })
    act(() => {
      result.current.setRole('TEACHER')
      result.current.setTermsChecked(true)
      result.current.setPrivacyChecked(true)
    })
    act(() => {
      result.current.setField('school')({ target: { value: 'SUNRIN_HIGH_SCHOOL' } } as never)
    })
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect('email' in received).toBe(false)
  })

  it('email 필드가 있으면 payload에 email을 포함한다', async () => {
    let received: { email?: string } = {}
    server.use(
      http.post(url('/api/auth/oauth/kakao/register'), async ({ request }) => {
        received = (await request.json()) as typeof received
        return HttpResponse.json(makeLoginResponse('TEACHER'))
      }),
    )
    const { result } = renderHook(() => useOAuthCompleteForm('tk-7', 'kakao@test.com'), { wrapper })
    act(() => {
      result.current.setRole('TEACHER')
      result.current.setTermsChecked(true)
      result.current.setPrivacyChecked(true)
    })
    act(() => {
      result.current.setField('school')({ target: { value: 'SUNRIN_HIGH_SCHOOL' } } as never)
    })
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(received.email).toBe('kakao@test.com')
  })

  it('termsChecked/privacyChecked가 false면 false 그대로 전송된다', async () => {
    let received: { termsAgreed?: boolean; privacyAgreed?: boolean } = {}
    server.use(
      http.post(url('/api/auth/oauth/kakao/register'), async ({ request }) => {
        received = (await request.json()) as typeof received
        return HttpResponse.json(makeLoginResponse('TEACHER'))
      }),
    )
    const { result } = renderHook(() => useOAuthCompleteForm('tk-8'), { wrapper })
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
      http.post(url('/api/auth/oauth/kakao/register'), () => HttpResponse.json(body, { status })),
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
    const { result } = renderHook(() => useOAuthCompleteForm('tk-7'), { wrapper })
    preparePayload(result)
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(result.current.fieldErrors.school).toBe('학교가 유효하지 않습니다')
    expect(result.current.error).toBe('')
  })

  it('code=INVALID_TEMP_TOKEN면 만료 메시지를 표시한다', async () => {
    setupErrorResponse({ code: 'INVALID_TEMP_TOKEN' })
    const { result } = renderHook(() => useOAuthCompleteForm('expired'), { wrapper })
    preparePayload(result)
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(result.current.error).toContain('인증 정보가 만료')
  })

  it('code=DUPLICATED_USER면 이미 가입된 계정 안내를 표시한다', async () => {
    setupErrorResponse({ code: 'DUPLICATED_USER' }, 409)
    const { result } = renderHook(() => useOAuthCompleteForm('tk-9'), { wrapper })
    preparePayload(result)
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(result.current.error).toContain('이미 가입된 계정')
  })

  it('code=OAUTH_EMAIL_REQUIRED면 이메일 입력 안내를 표시한다', async () => {
    setupErrorResponse({ code: 'OAUTH_EMAIL_REQUIRED' })
    const { result } = renderHook(() => useOAuthCompleteForm('tk-10'), { wrapper })
    preparePayload(result)
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(result.current.error).toContain('이메일을 입력')
  })

  it('code=OAUTH_ROLE_INFO_REQUIRED면 역할 정보 안내를 표시한다', async () => {
    setupErrorResponse({ code: 'OAUTH_ROLE_INFO_REQUIRED' })
    const { result } = renderHook(() => useOAuthCompleteForm('tk-11'), { wrapper })
    preparePayload(result)
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(result.current.error).toContain('역할에 해당하는 정보')
  })

  it('code/errors 없으면 message를 그대로 표시한다', async () => {
    setupErrorResponse({ message: '잠시 후 다시 시도해 주세요' }, 500)
    const { result } = renderHook(() => useOAuthCompleteForm('tk-12'), { wrapper })
    preparePayload(result)
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(result.current.error).toBe('잠시 후 다시 시도해 주세요')
  })

  it('실패해도 isLoading은 false로 돌아온다', async () => {
    setupErrorResponse({ message: 'err' }, 500)
    const { result } = renderHook(() => useOAuthCompleteForm('tk-13'), { wrapper })
    preparePayload(result)
    await act(async () => { await result.current.handleSubmit(fakeEvent) })
    expect(result.current.isLoading).toBe(false)
  })
})
