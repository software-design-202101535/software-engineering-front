import { renderHook, act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/features/auth'
import { useCounselingPage } from './useCounselingPage'
import type { ReactNode } from 'react'
import type { Counseling } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const url = (path: string) => `${BASE}${path}`

const fakeTeacher = { id: 1, email: 'teacher@test.com', name: '김선생', role: 'TEACHER' }

const fakeCounseling: Counseling = {
  id: 10,
  studentId: 1,
  teacherId: 1,
  teacherName: '김선생',
  counselingDate: '2026-01-15',
  content: '진로 상담을 진행했습니다',
  nextDate: '2026-02-01',
  nextPlan: '추가 상담 예정',
  sharedWithTeachers: false,
  createdAt: '2026-01-15T10:00:00',
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/students/1']}>
            <Routes>
              <Route path="/students/:studentId" element={<>{children}</>} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </AuthProvider>
    )
  }
}

beforeEach(() => {
  localStorage.setItem('user', JSON.stringify(fakeTeacher))
  server.use(
    http.get(url('/api/students/1/counselings'), () => HttpResponse.json([fakeCounseling])),
  )
})

describe('search 필터', () => {
  it('search가 비어있으면 전체 상담을 반환한다', async () => {
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.counselings).toHaveLength(1))
  })

  it('search가 있으면 content에 포함된 항목만 반환한다', async () => {
    const other: Counseling = { ...fakeCounseling, id: 11, content: '학업 상담' }
    server.use(
      http.get(url('/api/students/1/counselings'), () =>
        HttpResponse.json([fakeCounseling, other]),
      ),
    )
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.counselings).toHaveLength(2))
    act(() => { result.current.setSearch('진로') })
    expect(result.current.counselings).toHaveLength(1)
    expect(result.current.counselings[0].content).toContain('진로')
  })
})

describe('handleOpenAdd', () => {
  it('modalMode를 adding으로 변경한다', () => {
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleOpenAdd() })
    expect(result.current.modalMode.type).toBe('adding')
  })

  it('form을 빈 초기값으로 초기화한다', () => {
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleFormChange('content', '임시내용') })
    act(() => { result.current.handleOpenAdd() })
    expect(result.current.form.content).toBe('')
  })
})

describe('handleOpenEdit', () => {
  it('상담 데이터로 form을 채우고 editing 모드로 전환한다', async () => {
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.counselings).toHaveLength(1))
    act(() => { result.current.handleOpenEdit(10) })
    expect(result.current.modalMode).toEqual({ type: 'editing', id: 10 })
    expect(result.current.form.content).toBe(fakeCounseling.content)
    expect(result.current.form.counselingDate).toBe(fakeCounseling.counselingDate)
  })

  it('존재하지 않는 id면 modalMode를 변경하지 않는다', async () => {
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.counselings).toHaveLength(1))
    act(() => { result.current.handleOpenEdit(999) })
    expect(result.current.modalMode.type).toBe('closed')
  })
})

describe('handleCloseModal', () => {
  it('modalMode를 closed로 변경한다', () => {
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleOpenAdd() })
    act(() => { result.current.handleCloseModal() })
    expect(result.current.modalMode.type).toBe('closed')
  })
})

describe('handleFormChange', () => {
  it('form 필드를 업데이트한다', () => {
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleFormChange('content', '새 상담 내용') })
    expect(result.current.form.content).toBe('새 상담 내용')
  })

  it('boolean 필드를 업데이트한다', () => {
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleFormChange('sharedWithTeachers', true) })
    expect(result.current.form.sharedWithTeachers).toBe(true)
  })
})

describe('handleModalSave', () => {
  it('adding 모드에서 POST를 호출하고 성공 시 modalMode를 closed로 변경한다', async () => {
    server.use(
      http.post(url('/api/students/1/counselings'), () =>
        HttpResponse.json({ ...fakeCounseling, id: 20 }),
      ),
    )
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleOpenAdd() })
    act(() => { result.current.handleFormChange('content', '새 상담') })
    act(() => { result.current.handleModalSave() })
    await waitFor(() => expect(result.current.modalMode.type).toBe('closed'))
  })

  it('editing 모드에서 PUT을 호출하고 성공 시 modalMode를 closed로 변경한다', async () => {
    server.use(
      http.put(url('/api/students/1/counselings/10'), () =>
        HttpResponse.json({ ...fakeCounseling, content: '수정됨' }),
      ),
    )
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.counselings).toHaveLength(1))
    act(() => { result.current.handleOpenEdit(10) })
    act(() => { result.current.handleFormChange('content', '수정됨') })
    act(() => { result.current.handleModalSave() })
    await waitFor(() => expect(result.current.modalMode.type).toBe('closed'))
  })
})

describe('handleStartDelete / handleCancelDelete', () => {
  it('handleStartDelete는 deleteState를 confirming으로 변경한다', () => {
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleStartDelete(10) })
    expect(result.current.deleteState).toEqual({ type: 'confirming', id: 10 })
  })

  it('handleCancelDelete는 deleteState를 idle로 되돌린다', () => {
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleStartDelete(10) })
    act(() => { result.current.handleCancelDelete() })
    expect(result.current.deleteState).toEqual({ type: 'idle' })
  })
})

describe('handleConfirmDelete', () => {
  it('confirming 상태에서 DELETE를 호출하고 성공 시 idle로 되돌린다', async () => {
    let deleteCalled = false
    server.use(
      http.delete(url('/api/students/1/counselings/10'), () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleStartDelete(10) })
    act(() => { result.current.handleConfirmDelete() })
    await waitFor(() => expect(result.current.deleteState.type).toBe('idle'))
    expect(deleteCalled).toBe(true)
  })

  it('idle 상태에서는 DELETE를 호출하지 않는다', async () => {
    let deleteCalled = false
    server.use(
      http.delete(url('/api/students/1/counselings/10'), () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleConfirmDelete() })
    await new Promise((r) => setTimeout(r, 50))
    expect(deleteCalled).toBe(false)
  })
})

describe('handleToggleShare', () => {
  it('PATCH를 올바른 payload로 호출한다', async () => {
    const spy = vi.fn()
    server.use(
      http.patch(url('/api/students/1/counselings/10/share'), async ({ request }) => {
        spy(await request.json())
        return HttpResponse.json({ ...fakeCounseling, sharedWithTeachers: true })
      }),
    )
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleToggleShare(10, true) })
    await waitFor(() => expect(spy).toHaveBeenCalled())
    expect(spy).toHaveBeenCalledWith({ sharedWithTeachers: true })
  })
})

describe('isOwner', () => {
  it('user.id와 teacherId가 같으면 true를 반환한다', () => {
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    expect(result.current.isOwner(1)).toBe(true)
  })

  it('user.id와 teacherId가 다르면 false를 반환한다', () => {
    const { result } = renderHook(() => useCounselingPage(), { wrapper: makeWrapper() })
    expect(result.current.isOwner(2)).toBe(false)
  })
})
