import { describe, it, expect } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useClassSummary } from './useClassSummary'
import type { ClassSummary, ClassSummaryParams } from '@/types'
import type { ReactNode } from 'react'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const url = (path: string) => `${BASE}${path}`

const fakeSummary: ClassSummary = {
  school: 'SUNRIN_HIGH_SCHOOL',
  grade: 3,
  classNum: 2,
  semester: '2025-1',
  updatedAt: '2026-05-31T04:00:00',
  subjects: [
    {
      subject: 'MATH',
      avgScore: 79.1,
      maxScore: 98,
      minScore: 45,
      studentCount: 28,
      distribution: { A: 3, B: 10, C: 8, D: 5, F: 2 },
    },
  ],
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const validParams: ClassSummaryParams = {
  school: 'SUNRIN_HIGH_SCHOOL',
  grade: 3,
  classNum: 2,
  semester: '2025-1',
}

describe('useClassSummary', () => {
  it('파라미터가 유효하면 통계를 조회한다', async () => {
    server.use(
      http.get(url('/api/analytics/class-summary'), () => HttpResponse.json(fakeSummary)),
    )
    const { result } = renderHook(() => useClassSummary(validParams), { wrapper: makeWrapper() })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.subjects[0].subject).toBe('MATH')
  })

  it('classNum을 생략하면 요청 쿼리에도 포함하지 않는다 (학년 전체)', async () => {
    let capturedHasClassNum: boolean | null = null
    server.use(
      http.get(url('/api/analytics/class-summary'), ({ request }) => {
        capturedHasClassNum = new URL(request.url).searchParams.has('classNum')
        return HttpResponse.json({ ...fakeSummary, classNum: null })
      }),
    )
    const { result } = renderHook(
      () => useClassSummary({ school: 'SUNRIN_HIGH_SCHOOL', grade: 3, semester: '2025-1' }),
      { wrapper: makeWrapper() },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(capturedHasClassNum).toBe(false)
  })

  it('grade가 0이면 조회하지 않는다 (enabled 가드)', async () => {
    let called = false
    server.use(
      http.get(url('/api/analytics/class-summary'), () => {
        called = true
        return HttpResponse.json(fakeSummary)
      }),
    )
    const { result } = renderHook(
      () => useClassSummary({ school: 'SUNRIN_HIGH_SCHOOL', grade: 0, semester: '2025-1' }),
      { wrapper: makeWrapper() },
    )
    await new Promise((r) => setTimeout(r, 50))
    expect(result.current.fetchStatus).toBe('idle')
    expect(called).toBe(false)
  })
})
