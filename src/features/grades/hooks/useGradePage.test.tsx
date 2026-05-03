import { renderHook, act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useGradePage } from './useGradePage'
import type { ReactNode } from 'react'
import type { Grade, StudentSummary, BatchGradeRequest } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const url = (path: string) => `${BASE}${path}`

const fakeGrade: Grade = { id: 1, subject: 'MATH', score: 80, grade: 'B' }
const fakeStudent: StudentSummary = { id: 1, name: '홍길동', grade: 2, classNum: 3, number: 5 }

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
    http.get(url('/api/students/1/grades'), () => HttpResponse.json([fakeGrade])),
    http.get(url('/api/students'), () => HttpResponse.json([fakeStudent])),
  )
})

describe('displayGrades', () => {
  it('서버 성적에서 pendingDeletes 항목을 제외한다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleDelete(1) })
    expect(result.current.grades).toHaveLength(0)
  })

  it('pendingCreates 항목을 displayGrades에 포함한다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => {
      result.current.setNewSubject('ENGLISH')
      result.current.setNewScore('90')
    })
    act(() => { result.current.handleConfirmAdd() })
    expect(result.current.grades).toHaveLength(2)
    expect(result.current.grades.some((g) => g.id < 0)).toBe(true)
  })
})

describe('handleConfirmAdd', () => {
  it('음수 tempId를 발급한다', () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    act(() => {
      result.current.setNewSubject('MATH')
      result.current.setNewScore('85')
    })
    act(() => { result.current.handleConfirmAdd() })
    const tempId = result.current.grades.find((g) => g.id < 0)?.id
    expect(tempId).toBeLessThan(0)
  })

  it('subject나 score가 비어있으면 추가하지 않는다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleConfirmAdd() })
    expect(result.current.grades).toHaveLength(1)
  })
})

describe('handleScoreChange', () => {
  it('양수 id → editedScores에 저장한다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleScoreChange(1, '95') })
    expect(result.current.editedScores[1]).toBe('95')
  })

  it('음수 id → pendingCreates의 score를 업데이트한다', () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    act(() => {
      result.current.setNewSubject('MATH')
      result.current.setNewScore('70')
    })
    act(() => { result.current.handleConfirmAdd() })
    const tempId = result.current.grades.find((g) => g.id < 0)!.id
    act(() => { result.current.handleScoreChange(tempId, '99') })
    expect(result.current.grades.find((g) => g.id === tempId)?.score).toBe(99)
  })
})

describe('handleDelete', () => {
  it('양수 id → pendingDeletes에 추가해 displayGrades에서 제거한다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleDelete(1) })
    expect(result.current.grades).toHaveLength(0)
  })

  it('음수 id → pendingCreates에서 제거한다', () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    act(() => {
      result.current.setNewSubject('MATH')
      result.current.setNewScore('70')
    })
    act(() => { result.current.handleConfirmAdd() })
    const tempId = result.current.grades.find((g) => g.id < 0)!.id
    act(() => { result.current.handleDelete(tempId) })
    expect(result.current.grades.every((g) => g.id >= 0)).toBe(true)
  })
})

describe('handleSemesterChange', () => {
  it('tableMode를 read로 변경하고 pendingCreates를 초기화한다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => {
      result.current.setNewSubject('MATH')
      result.current.setNewScore('70')
    })
    act(() => { result.current.handleConfirmAdd() })
    expect(result.current.grades.some((g) => g.id < 0)).toBe(true)
    act(() => { result.current.handleSemesterChange('2026-2') })
    expect(result.current.tableMode).toBe('read')
    expect(result.current.grades.some((g) => g.id < 0)).toBe(false)
  })
})

describe('handleSave', () => {
  it('변경사항이 없으면 mutation을 호출하지 않는다', async () => {
    const mutateSpy = vi.fn()
    server.use(
      http.put(url('/api/students/1/grades/batch'), () => {
        mutateSpy()
        return HttpResponse.json([])
      }),
    )
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await act(async () => { await result.current.handleSave() })
    expect(mutateSpy).not.toHaveBeenCalled()
  })

  it('수정된 점수가 있으면 update payload로 mutation을 호출하고 read 모드로 전환한다', async () => {
    let capturedBody: BatchGradeRequest | null = null
    server.use(
      http.put(url('/api/students/1/grades/batch'), async ({ request }) => {
        capturedBody = await request.json() as BatchGradeRequest
        return HttpResponse.json([])
      }),
    )
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleScoreChange(1, '95') })
    await act(async () => { await result.current.handleSave() })
    expect(capturedBody?.update).toEqual([{ id: 1, subject: 'MATH', score: 95 }])
    expect(result.current.tableMode).toBe('read')
  })

  it('신규 항목이 있으면 create payload를 포함한다', async () => {
    let capturedBody: BatchGradeRequest | null = null
    server.use(
      http.put(url('/api/students/1/grades/batch'), async ({ request }) => {
        capturedBody = await request.json() as BatchGradeRequest
        return HttpResponse.json([])
      }),
    )
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    act(() => {
      result.current.setNewSubject('ENGLISH')
      result.current.setNewScore('88')
    })
    act(() => { result.current.handleConfirmAdd() })
    await act(async () => { await result.current.handleSave() })
    expect(capturedBody?.create).toEqual([{ subject: 'ENGLISH', score: 88 }])
  })
})

describe('handleCancel', () => {
  it('tableMode를 read로 되돌리고 pendingCreates를 초기화한다', () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    act(() => { result.current.setTableMode('edit') })
    act(() => {
      result.current.setNewSubject('MATH')
      result.current.setNewScore('70')
    })
    act(() => { result.current.handleConfirmAdd() })
    expect(result.current.grades.some((g) => g.id < 0)).toBe(true)
    act(() => { result.current.handleCancel() })
    expect(result.current.tableMode).toBe('read')
    expect(result.current.grades.some((g) => g.id < 0)).toBe(false)
  })
})

describe('avg', () => {
  it('displayGrades의 점수 평균을 계산한다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    expect(result.current.avg).toBe(80)
  })
})

describe('handleBulkConfirm', () => {
  it('class 타겟이면 전체 학생에게 일괄 적용한다', async () => {
    const student2: StudentSummary = { id: 2, name: '김철수', grade: 2, classNum: 3, number: 6 }
    const calledIds: number[] = []
    server.use(
      http.get(url('/api/students'), () => HttpResponse.json([fakeStudent, student2])),
      http.put(url('/api/students/:id/grades/batch'), ({ params }) => {
        calledIds.push(Number(params.id))
        return HttpResponse.json([])
      }),
    )
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.classStudents).toHaveLength(2))
    act(() => { result.current.setBulkTarget('class') })
    await act(async () => { await result.current.handleBulkConfirm(['MATH']) })
    expect(calledIds.sort()).toEqual([1, 2])
  })

  it('selected 타겟이면 선택한 학생에게만 적용한다', async () => {
    const student2: StudentSummary = { id: 2, name: '김철수', grade: 2, classNum: 3, number: 6 }
    const calledIds: number[] = []
    server.use(
      http.get(url('/api/students'), () => HttpResponse.json([fakeStudent, student2])),
      http.put(url('/api/students/:id/grades/batch'), ({ params }) => {
        calledIds.push(Number(params.id))
        return HttpResponse.json([])
      }),
    )
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.classStudents).toHaveLength(2))
    act(() => {
      result.current.setBulkTarget('selected')
      result.current.handleToggleSelect(2)
    })
    await act(async () => { await result.current.handleBulkConfirm(['MATH']) })
    expect(calledIds).toEqual([2])
  })
})
