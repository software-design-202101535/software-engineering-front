import { renderHook, act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useAttendancePage } from './useAttendancePage'
import type { ReactNode } from 'react'
import type { Attendance } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const url = (path: string) => `${BASE}${path}`

const fakeRecord: Attendance = {
  id: 1,
  studentId: 1,
  date: '2026-01-10',
  status: 'ABSENT',
  reason: '감기',
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
    http.get(url('/api/students/1/attendance'), () => HttpResponse.json([fakeRecord])),
  )
})

describe('summary', () => {
  it('status별 개수를 집계한다', async () => {
    const records: Attendance[] = [
      { ...fakeRecord, id: 1, status: 'ABSENT' },
      { ...fakeRecord, id: 2, status: 'ABSENT' },
      { ...fakeRecord, id: 3, status: 'LATE' },
      { ...fakeRecord, id: 4, status: 'EARLY_LEAVE' },
      { ...fakeRecord, id: 5, status: 'SICK' },
    ]
    server.use(
      http.get(url('/api/students/1/attendance'), () => HttpResponse.json(records)),
    )
    const { result } = renderHook(() => useAttendancePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.records).toHaveLength(5))
    expect(result.current.summary).toEqual({ absent: 2, late: 1, earlyLeave: 1, sick: 1 })
  })
})

describe('handleStartAdd', () => {
  it('inlineMode를 adding으로 변경하고 form을 초기화한다', () => {
    const { result } = renderHook(() => useAttendancePage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleStartAdd() })
    expect(result.current.inlineMode.type).toBe('adding')
    expect(result.current.form.date).toBe('')
    expect(result.current.form.status).toBe('ABSENT')
  })
})

describe('handleStartEdit', () => {
  it('record 데이터로 form을 채우고 editing 모드로 전환한다', async () => {
    const { result } = renderHook(() => useAttendancePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.records).toHaveLength(1))
    act(() => { result.current.handleStartEdit(1) })
    expect(result.current.inlineMode).toEqual({ type: 'editing', id: 1 })
    expect(result.current.form.date).toBe(fakeRecord.date)
    expect(result.current.form.status).toBe(fakeRecord.status)
    expect(result.current.form.reason).toBe(fakeRecord.reason)
  })

  it('존재하지 않는 id면 inlineMode를 변경하지 않는다', async () => {
    const { result } = renderHook(() => useAttendancePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.records).toHaveLength(1))
    act(() => { result.current.handleStartEdit(999) })
    expect(result.current.inlineMode.type).toBe('idle')
  })
})

describe('handleStartDelete', () => {
  it('inlineMode를 deleting으로 변경한다', () => {
    const { result } = renderHook(() => useAttendancePage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleStartDelete(1) })
    expect(result.current.inlineMode).toEqual({ type: 'deleting', id: 1 })
  })
})

describe('handleCancel', () => {
  it('inlineMode를 idle로 되돌린다', () => {
    const { result } = renderHook(() => useAttendancePage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleStartAdd() })
    act(() => { result.current.handleCancel() })
    expect(result.current.inlineMode.type).toBe('idle')
  })
})

describe('handleSave', () => {
  it('adding 모드에서 date와 status가 있으면 POST를 호출하고 idle로 전환한다', async () => {
    server.use(
      http.post(url('/api/students/1/attendance'), () =>
        HttpResponse.json({ ...fakeRecord, id: 99 }),
      ),
    )
    const { result } = renderHook(() => useAttendancePage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleStartAdd() })
    act(() => {
      result.current.handleFormChange('date', '2026-02-01')
      result.current.handleFormChange('status', 'LATE')
    })
    act(() => { result.current.handleSave() })
    await waitFor(() => expect(result.current.inlineMode.type).toBe('idle'))
  })

  it('date가 없으면 POST를 호출하지 않는다', async () => {
    let postCalled = false
    server.use(
      http.post(url('/api/students/1/attendance'), () => {
        postCalled = true
        return HttpResponse.json({})
      }),
    )
    const { result } = renderHook(() => useAttendancePage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleStartAdd() })
    act(() => { result.current.handleSave() })
    await new Promise((r) => setTimeout(r, 50))
    expect(postCalled).toBe(false)
  })

  it('editing 모드에서 PATCH를 호출하고 idle로 전환한다', async () => {
    server.use(
      http.patch(url('/api/students/1/attendance/1'), () =>
        HttpResponse.json({ ...fakeRecord, status: 'LATE' }),
      ),
    )
    const { result } = renderHook(() => useAttendancePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.records).toHaveLength(1))
    act(() => { result.current.handleStartEdit(1) })
    act(() => { result.current.handleFormChange('status', 'LATE') })
    act(() => { result.current.handleSave() })
    await waitFor(() => expect(result.current.inlineMode.type).toBe('idle'))
  })
})

describe('handleConfirmDelete', () => {
  it('deleting 상태에서 DELETE를 호출하고 idle로 전환한다', async () => {
    let deleteCalled = false
    server.use(
      http.delete(url('/api/students/1/attendance/1'), () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const { result } = renderHook(() => useAttendancePage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleStartDelete(1) })
    act(() => { result.current.handleConfirmDelete() })
    await waitFor(() => expect(result.current.inlineMode.type).toBe('idle'))
    expect(deleteCalled).toBe(true)
  })

  it('idle 상태에서는 DELETE를 호출하지 않는다', async () => {
    let deleteCalled = false
    server.use(
      http.delete(url('/api/students/1/attendance/1'), () => {
        deleteCalled = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    const { result } = renderHook(() => useAttendancePage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleConfirmDelete() })
    await new Promise((r) => setTimeout(r, 50))
    expect(deleteCalled).toBe(false)
  })
})

describe('handleFormChange', () => {
  it('form 필드를 업데이트한다', () => {
    const { result } = renderHook(() => useAttendancePage(), { wrapper: makeWrapper() })
    act(() => { result.current.handleFormChange('reason', '병원 방문') })
    expect(result.current.form.reason).toBe('병원 방문')
  })
})
