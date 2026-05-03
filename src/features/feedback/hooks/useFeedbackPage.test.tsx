import { renderHook, act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/features/auth'
import { useFeedbackPage } from './useFeedbackPage'
import type { ReactNode } from 'react'
import type { Feedback } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const url = (path: string) => `${BASE}${path}`

const fakeTeacher = { id: 1, email: 'teacher@test.com', name: '김선생', role: 'TEACHER' }

const fakeFeedback: Feedback = {
  id: 10,
  teacherId: 1,
  teacherName: '김선생',
  category: 'GRADE',
  date: '2026-01-15',
  content: '성적이 향상되었습니다',
  studentVisible: true,
  parentVisible: false,
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
    http.get(url('/api/students/1/feedbacks'), () => HttpResponse.json([fakeFeedback])),
  )
})

describe('categoryFilter', () => {
  it('ALL이면 모든 피드백을 반환한다', async () => {
    const behaviorFb: Feedback = { ...fakeFeedback, id: 11, category: 'BEHAVIOR' }
    server.use(
      http.get(url('/api/students/1/feedbacks'), () =>
        HttpResponse.json([fakeFeedback, behaviorFb]),
      ),
    )
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.feedbacks).toHaveLength(2))
    expect(result.current.categoryFilter).toBe('ALL')
  })

  it('특정 카테고리 선택 시 해당 카테고리만 필터링한다', async () => {
    const behaviorFb: Feedback = { ...fakeFeedback, id: 11, category: 'BEHAVIOR' }
    server.use(
      http.get(url('/api/students/1/feedbacks'), () =>
        HttpResponse.json([fakeFeedback, behaviorFb]),
      ),
    )
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.feedbacks).toHaveLength(2))
    act(() => { result.current.setCategoryFilter('BEHAVIOR') })
    expect(result.current.feedbacks).toHaveLength(1)
    expect(result.current.feedbacks[0].category).toBe('BEHAVIOR')
  })
})

describe('handleOpenAdd', () => {
  it('modalMode를 adding으로 변경한다', () => {
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleOpenAdd() })
    expect(result.current.modalMode.type).toBe('adding')
  })

  it('form을 GRADE 카테고리 기본값으로 초기화한다', () => {
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleFormChange('content', '임시내용') })
    act(() => { result.current.handleOpenAdd() })
    expect(result.current.form.content).toBe('')
    expect(result.current.form.category).toBe('GRADE')
  })
})

describe('handleOpenEdit', () => {
  it('피드백 데이터로 form을 채우고 editing 모드로 전환한다', async () => {
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.feedbacks).toHaveLength(1))
    act(() => { result.current.handleOpenEdit(10) })
    expect(result.current.modalMode).toEqual({ type: 'editing', id: 10 })
    expect(result.current.form.content).toBe(fakeFeedback.content)
    expect(result.current.form.category).toBe(fakeFeedback.category)
  })

  it('존재하지 않는 id면 modalMode를 변경하지 않는다', async () => {
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.feedbacks).toHaveLength(1))
    act(() => { result.current.handleOpenEdit(999) })
    expect(result.current.modalMode.type).toBe('closed')
  })
})

describe('handleCloseModal', () => {
  it('modalMode를 closed로 변경한다', () => {
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleOpenAdd() })
    expect(result.current.modalMode.type).toBe('adding')
    act(() => { result.current.handleCloseModal() })
    expect(result.current.modalMode.type).toBe('closed')
  })
})

describe('handleFormChange', () => {
  it('form 필드를 업데이트한다', () => {
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleFormChange('content', '새 내용') })
    expect(result.current.form.content).toBe('새 내용')
  })

  it('boolean 필드를 업데이트한다', () => {
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleFormChange('studentVisible', true) })
    expect(result.current.form.studentVisible).toBe(true)
  })
})

describe('handleModalSave', () => {
  it('adding 모드에서 POST를 호출하고 성공 시 modalMode를 closed로 변경한다', async () => {
    const createdFb: Feedback = { ...fakeFeedback, id: 20, content: '새 피드백' }
    server.use(
      http.post(url('/api/students/1/feedbacks'), () => HttpResponse.json(createdFb)),
    )
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleOpenAdd() })
    act(() => { result.current.handleFormChange('content', '새 피드백') })
    act(() => { result.current.handleModalSave() })
    await waitFor(() => expect(result.current.modalMode.type).toBe('closed'))
  })

  it('editing 모드에서 PUT을 호출하고 성공 시 modalMode를 closed로 변경한다', async () => {
    const updatedFb: Feedback = { ...fakeFeedback, content: '수정된 내용' }
    server.use(
      http.put(url('/api/students/1/feedbacks/10'), () => HttpResponse.json(updatedFb)),
    )
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.feedbacks).toHaveLength(1))
    act(() => { result.current.handleOpenEdit(10) })
    act(() => { result.current.handleFormChange('content', '수정된 내용') })
    act(() => { result.current.handleModalSave() })
    await waitFor(() => expect(result.current.modalMode.type).toBe('closed'))
  })
})

describe('handleStartDelete / handleCancelDelete', () => {
  it('handleStartDelete는 deleteState를 confirming으로 변경한다', () => {
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleStartDelete(10) })
    expect(result.current.deleteState).toEqual({ type: 'confirming', id: 10 })
  })

  it('handleCancelDelete는 deleteState를 idle로 되돌린다', () => {
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleStartDelete(10) })
    act(() => { result.current.handleCancelDelete() })
    expect(result.current.deleteState).toEqual({ type: 'idle' })
  })
})

describe('handleConfirmDelete', () => {
  it('confirming 상태에서 DELETE를 호출하고 성공 시 idle로 되돌린다', async () => {
    let deleteCalled = false
    server.use(
      http.delete(url('/api/students/1/feedbacks/10'), () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleStartDelete(10) })
    act(() => { result.current.handleConfirmDelete() })
    await waitFor(() => expect(result.current.deleteState.type).toBe('idle'))
    expect(deleteCalled).toBe(true)
  })

  it('idle 상태에서는 DELETE를 호출하지 않는다', async () => {
    let deleteCalled = false
    server.use(
      http.delete(url('/api/students/1/feedbacks/10'), () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleConfirmDelete() })
    await new Promise((r) => setTimeout(r, 50))
    expect(deleteCalled).toBe(false)
  })
})

describe('handleToggleVisibility', () => {
  it('PATCH를 올바른 payload로 호출한다', async () => {
    let capturedBody: { studentVisible: boolean; parentVisible: boolean } | null = null
    server.use(
      http.patch(url('/api/students/1/feedbacks/10/visibility'), async ({ request }) => {
        capturedBody = await request.json() as { studentVisible: boolean; parentVisible: boolean }
        return HttpResponse.json({ ...fakeFeedback, studentVisible: true, parentVisible: true })
      }),
    )
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleToggleVisibility(10, true, true) })
    await waitFor(() => expect(capturedBody).not.toBeNull())
    expect(capturedBody).toEqual({ studentVisible: true, parentVisible: true })
  })
})

describe('isOwner', () => {
  it('user.id와 teacherId가 같으면 true를 반환한다', () => {
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    expect(result.current.isOwner(1)).toBe(true)
  })

  it('user.id와 teacherId가 다르면 false를 반환한다', () => {
    const { result } = renderHook(() => useFeedbackPage(), { wrapper: makeWrapper() })
    expect(result.current.isOwner(2)).toBe(false)
  })
})
