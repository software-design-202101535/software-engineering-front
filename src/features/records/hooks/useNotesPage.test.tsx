import { renderHook, act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useNotesPage } from './useNotesPage'
import type { ReactNode } from 'react'
import type { Note } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const url = (path: string) => `${BASE}${path}`

const fakeNote: Note = {
  id: 1,
  studentId: 1,
  teacherId: 1,
  category: 'ACHIEVEMENT',
  content: '수학 올림피아드 수상',
  date: '2026-01-10',
  createdAt: '2026-01-10T09:00:00',
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/students/1']}>
          <Routes>
            <Route path="/students/:studentId" element={<>{children}</>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}

beforeEach(() => {
  server.use(
    http.get(url('/api/students/1/notes'), () => HttpResponse.json([fakeNote])),
  )
})

describe('categoryFilter', () => {
  it('ALL이면 category 파라미터 없이 전체 조회한다', async () => {
    const { result } = renderHook(() => useNotesPage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.notes).toHaveLength(1))
    expect(result.current.categoryFilter).toBe('ALL')
  })

  it('특정 카테고리 선택 시 해당 카테고리로 다시 조회한다', async () => {
    const specialNote: Note = { ...fakeNote, id: 2, category: 'SPECIAL' }
    server.use(
      http.get(url('/api/students/1/notes'), ({ request }) => {
        const category = new URL(request.url).searchParams.get('category')
        return HttpResponse.json(category === 'SPECIAL' ? [specialNote] : [fakeNote])
      }),
    )
    const { result } = renderHook(() => useNotesPage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.notes).toHaveLength(1))
    act(() => { result.current.setCategoryFilter('SPECIAL') })
    await waitFor(() => expect(result.current.notes[0].category).toBe('SPECIAL'))
  })
})

describe('handleOpenAdd', () => {
  it('modalMode를 adding으로 변경하고 form을 초기화한다', () => {
    const { result } = renderHook(() => useNotesPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleFormChange('content', '임시내용') })
    act(() => { result.current.handleOpenAdd() })
    expect(result.current.modalMode.type).toBe('adding')
    expect(result.current.form.content).toBe('')
  })
})

describe('handleOpenEdit', () => {
  it('note 데이터로 form을 채우고 editing 모드로 전환한다', async () => {
    const { result } = renderHook(() => useNotesPage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.notes).toHaveLength(1))
    act(() => { result.current.handleOpenEdit(1) })
    expect(result.current.modalMode).toEqual({ type: 'editing', id: 1 })
    expect(result.current.form.content).toBe(fakeNote.content)
    expect(result.current.form.category).toBe(fakeNote.category)
  })

  it('존재하지 않는 id면 modalMode를 변경하지 않는다', async () => {
    const { result } = renderHook(() => useNotesPage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.notes).toHaveLength(1))
    act(() => { result.current.handleOpenEdit(999) })
    expect(result.current.modalMode.type).toBe('closed')
  })
})

describe('handleCloseModal', () => {
  it('modalMode를 closed로 변경한다', () => {
    const { result } = renderHook(() => useNotesPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleOpenAdd() })
    act(() => { result.current.handleCloseModal() })
    expect(result.current.modalMode.type).toBe('closed')
  })
})

describe('handleModalSave', () => {
  it('adding 모드에서 POST를 호출하고 성공 시 modalMode를 closed로 변경한다', async () => {
    server.use(
      http.post(url('/api/students/1/notes'), () =>
        HttpResponse.json({ ...fakeNote, id: 99 }),
      ),
    )
    const { result } = renderHook(() => useNotesPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleOpenAdd() })
    act(() => {
      result.current.handleFormChange('content', '새 특기사항')
      result.current.handleFormChange('date', '2026-03-01')
    })
    act(() => { result.current.handleModalSave() })
    await waitFor(() => expect(result.current.modalMode.type).toBe('closed'))
  })

  it('content가 비어있으면 POST를 호출하지 않는다', async () => {
    let postCalled = false
    server.use(
      http.post(url('/api/students/1/notes'), () => {
        postCalled = true
        return HttpResponse.json({})
      }),
    )
    const { result } = renderHook(() => useNotesPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleOpenAdd() })
    act(() => { result.current.handleFormChange('date', '2026-03-01') })
    act(() => { result.current.handleModalSave() })
    await new Promise((r) => setTimeout(r, 50))
    expect(postCalled).toBe(false)
  })

  it('editing 모드에서 PATCH를 호출하고 성공 시 modalMode를 closed로 변경한다', async () => {
    server.use(
      http.patch(url('/api/students/1/notes/1'), () =>
        HttpResponse.json({ ...fakeNote, content: '수정된 내용' }),
      ),
    )
    const { result } = renderHook(() => useNotesPage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.notes).toHaveLength(1))
    act(() => { result.current.handleOpenEdit(1) })
    act(() => { result.current.handleFormChange('content', '수정된 내용') })
    act(() => { result.current.handleModalSave() })
    await waitFor(() => expect(result.current.modalMode.type).toBe('closed'))
  })
})

describe('handleStartDelete / handleCancelDelete', () => {
  it('handleStartDelete는 deleteState를 confirming으로 변경한다', () => {
    const { result } = renderHook(() => useNotesPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleStartDelete(1) })
    expect(result.current.deleteState).toEqual({ type: 'confirming', id: 1 })
  })

  it('handleCancelDelete는 deleteState를 idle로 되돌린다', () => {
    const { result } = renderHook(() => useNotesPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleStartDelete(1) })
    act(() => { result.current.handleCancelDelete() })
    expect(result.current.deleteState).toEqual({ type: 'idle' })
  })
})

describe('handleConfirmDelete', () => {
  it('confirming 상태에서 DELETE를 호출하고 성공 시 idle로 되돌린다', async () => {
    let deleteCalled = false
    server.use(
      http.delete(url('/api/students/1/notes/1'), () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const { result } = renderHook(() => useNotesPage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleStartDelete(1) })
    act(() => { result.current.handleConfirmDelete() })
    await waitFor(() => expect(result.current.deleteState.type).toBe('idle'))
    expect(deleteCalled).toBe(true)
  })
})
