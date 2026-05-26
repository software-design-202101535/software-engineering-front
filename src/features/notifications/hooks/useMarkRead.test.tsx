import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { useMarkRead } from './useMarkRead'
import { NOTIFICATIONS_QUERY_KEY } from './useNotifications'
import type { Notification } from '@/types'
import type { ReactNode } from 'react'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

const sample: Notification = {
  id: 1,
  type: 'GRADE_UPDATED',
  title: 't',
  message: 'm',
  read: false,
  referenceId: 7,
  referenceType: 'GRADE',
  referenceStudentId: 7,
  referenceStudentName: '홍길동',
  createdAt: new Date().toISOString(),
}

function setup() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  qc.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, [sample])
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  }
  return { qc, Wrapper }
}

describe('useMarkRead', () => {
  it('성공 시 캐시에 낙관적으로 read=true 반영', async () => {
    const { qc, Wrapper } = setup()
    const { result } = renderHook(() => useMarkRead(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.mutateAsync(1)
    })

    const updated = qc.getQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY)
    expect(updated?.[0].read).toBe(true)
  })

  it('실패 시 이전 상태로 롤백', async () => {
    server.use(
      http.patch(`${BASE}/api/notifications/:id/read`, () =>
        new HttpResponse(null, { status: 500 }),
      ),
    )
    const { qc, Wrapper } = setup()
    const { result } = renderHook(() => useMarkRead(), { wrapper: Wrapper })

    await act(async () => {
      await result.current.mutateAsync(1).catch(() => {})
    })

    const restored = qc.getQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY)
    expect(restored?.[0].read).toBe(false)
  })
})
