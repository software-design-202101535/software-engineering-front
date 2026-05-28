import { renderHook, act, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { useGradePage } from './useGradePage'
import type { ReactNode } from 'react'
import type { Grade, StudentSummary } from '@/types'

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

// 수정 모드 진입 후 마지막 trailing empty draft의 tempId를 가져온다
function getLastDraftId(result: { current: ReturnType<typeof useGradePage> }) {
  const drafts = result.current.grades.filter((g) => g.id < 0)
  return drafts[drafts.length - 1].id
}

describe('displayGrades', () => {
  it('서버 성적에서 pendingDeletes 항목을 제외한다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleDelete(1) })
    expect(result.current.grades).toHaveLength(0)
  })

  it('수정 모드 진입 시 trailing empty draft 1개가 자동 추가된다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleEdit() })
    expect(result.current.grades).toHaveLength(2)
    expect(result.current.grades.some((g) => g.id < 0)).toBe(true)
  })
})

describe('handleDraftSubjectChange', () => {
  it('마지막 trailing draft에 과목을 선택하면 새 빈 draft가 자동 추가된다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleEdit() })
    const firstDraftId = getLastDraftId(result)
    act(() => { result.current.handleDraftSubjectChange(firstDraftId, 'ENGLISH') })
    const drafts = result.current.grades.filter((g) => g.id < 0)
    expect(drafts).toHaveLength(2)
    expect(drafts[drafts.length - 1].subject).toBe('')
  })

  it('인변량: 어떤 상태에서도 마지막 draft는 항상 빈 행이어야 한다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleEdit() })
    const firstDraftId = getLastDraftId(result)
    act(() => { result.current.handleDraftSubjectChange(firstDraftId, 'ENGLISH') })
    // 첫 draft 비웠다가 새 마지막 draft 채워도 결국 trailing empty가 유지돼야 함
    act(() => { result.current.handleDraftSubjectChange(firstDraftId, '') })
    const lastEmptyDraftId = getLastDraftId(result)
    act(() => { result.current.handleDraftSubjectChange(lastEmptyDraftId, 'KOREAN') })
    const drafts = result.current.grades.filter((g) => g.id < 0)
    expect(drafts[drafts.length - 1].subject).toBe('')
  })
})

describe('usedSubjects', () => {
  it('기존 성적과 draft에 선택된 과목을 모두 포함한다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleEdit() })
    const draftId = getLastDraftId(result)
    act(() => { result.current.handleDraftSubjectChange(draftId, 'ENGLISH') })
    expect(result.current.usedSubjects.has('MATH')).toBe(true)
    expect(result.current.usedSubjects.has('ENGLISH')).toBe(true)
    expect(result.current.usedSubjects.has('KOREAN')).toBe(false)
  })

  it('pendingDeletes에 들어간 기존 과목은 제외된다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleDelete(1) })
    expect(result.current.usedSubjects.has('MATH')).toBe(false)
  })
})

describe('handleScoreChange', () => {
  it('양수 id → editedScores에 저장한다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleScoreChange(1, '95') })
    expect(result.current.editedScores[1]).toBe('95')
  })

  it('음수 id → 해당 draft의 score를 업데이트한다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleEdit() })
    const draftId = getLastDraftId(result)
    act(() => { result.current.handleDraftSubjectChange(draftId, 'ENGLISH') })
    act(() => { result.current.handleScoreChange(draftId, '99') })
    expect(result.current.grades.find((g) => g.id === draftId)?.score).toBe(99)
  })
})

describe('handleDelete', () => {
  it('양수 id → pendingDeletes에 추가해 displayGrades에서 제거한다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleDelete(1) })
    expect(result.current.grades).toHaveLength(0)
  })

  it('음수 id → draft를 제거하되 trailing empty는 항상 유지된다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleEdit() })
    const firstDraftId = getLastDraftId(result)
    act(() => { result.current.handleDraftSubjectChange(firstDraftId, 'ENGLISH') })
    act(() => { result.current.handleDelete(firstDraftId) })
    const drafts = result.current.grades.filter((g) => g.id < 0)
    expect(drafts).toHaveLength(1)
    expect(drafts[0].subject).toBe('')
  })
})

describe('handleSemesterChange', () => {
  it('tableMode를 read로 변경하고 pendingCreates를 초기화한다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleEdit() })
    const draftId = getLastDraftId(result)
    act(() => { result.current.handleDraftSubjectChange(draftId, 'ENGLISH') })
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
    const spy = vi.fn()
    server.use(
      http.put(url('/api/students/1/grades/batch'), async ({ request }) => {
        spy(await request.json())
        return HttpResponse.json([])
      }),
    )
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleScoreChange(1, '95') })
    await act(async () => { await result.current.handleSave() })
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ update: [{ id: 1, subject: 'MATH', score: 95 }] }),
    )
    expect(result.current.tableMode).toBe('read')
  })

  it('과목이 선택된 draft만 create payload에 포함한다 (빈 trailing은 제외)', async () => {
    const spy = vi.fn()
    server.use(
      http.put(url('/api/students/1/grades/batch'), async ({ request }) => {
        spy(await request.json())
        return HttpResponse.json([])
      }),
    )
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleEdit() })
    const draftId = getLastDraftId(result)
    act(() => { result.current.handleDraftSubjectChange(draftId, 'ENGLISH') })
    act(() => { result.current.handleScoreChange(draftId, '88') })
    await act(async () => { await result.current.handleSave() })
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ create: [{ subject: 'ENGLISH', score: 88 }] }),
    )
  })
})

describe('handleCancel', () => {
  it('tableMode를 read로 되돌리고 pendingCreates를 초기화한다', async () => {
    const { result } = renderHook(() => useGradePage(), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.grades).toHaveLength(1))
    act(() => { result.current.handleEdit() })
    const draftId = getLastDraftId(result)
    act(() => { result.current.handleDraftSubjectChange(draftId, 'ENGLISH') })
    expect(result.current.grades.some((g) => g.id < 0)).toBe(true)
    act(() => { result.current.handleCancel() })
    expect(result.current.tableMode).toBe('read')
    expect(result.current.grades.some((g) => g.id < 0)).toBe(false)
  })
})

describe('avg', () => {
  it('displayGrades의 점수 평균을 계산한다 (빈 draft 제외)', async () => {
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
