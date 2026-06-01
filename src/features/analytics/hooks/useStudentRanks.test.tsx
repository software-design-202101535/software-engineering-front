import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useStudentRanks } from './useStudentRanks'
import type { StudentRanks } from '@/types'
import type { ReactNode } from 'react'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const url = (path: string) => `${BASE}${path}`

const fakeRanks: StudentRanks = {
  studentId: 12,
  semester: '2025-1',
  updatedAt: '2026-05-31T04:00:00',
  class: {
    overall: { rank: 3, totalCount: 28, percentile: 89.3, avgScore: 85.3 },
    subjects: [
      { subject: 'MATH', rank: 5, totalCount: 28, percentile: 82.1, avgScore: 88, gradeLevel: 'B' },
    ],
  },
  grade: null,
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useStudentRanks', () => {
  it('studentId와 semester가 있으면 석차를 조회한다', async () => {
    server.use(
      http.get(url('/api/analytics/students/12/ranks'), () => HttpResponse.json(fakeRanks)),
    )
    const { result } = renderHook(() => useStudentRanks(12, '2025-1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.class?.overall.rank).toBe(3)
  })

  it('semester를 쿼리 파라미터로 전달한다', async () => {
    let capturedSemester: string | null = null
    server.use(
      http.get(url('/api/analytics/students/12/ranks'), ({ request }) => {
        capturedSemester = new URL(request.url).searchParams.get('semester')
        return HttpResponse.json(fakeRanks)
      }),
    )
    const { result } = renderHook(() => useStudentRanks(12, '2025-1'), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(capturedSemester).toBe('2025-1')
  })

  it('studentId가 0이면 조회하지 않는다 (enabled 가드)', async () => {
    let called = false
    server.use(
      http.get(url('/api/analytics/students/0/ranks'), () => {
        called = true
        return HttpResponse.json(fakeRanks)
      }),
    )
    const { result } = renderHook(() => useStudentRanks(0, '2025-1'), { wrapper: makeWrapper() })
    await new Promise((r) => setTimeout(r, 50))
    expect(result.current.fetchStatus).toBe('idle')
    expect(called).toBe(false)
  })
})
