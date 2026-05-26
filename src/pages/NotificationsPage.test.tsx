import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { AuthProvider } from '@/features/auth'
import { setAccessToken } from '@/api/client'
import { NotificationsPage } from './NotificationsPage'
import type { Notification, UserRole, ChildSummary } from '@/types'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

function LocationProbe() {
  const loc = useLocation()
  return <div data-testid="loc">{loc.pathname + loc.search + loc.hash}</div>
}

function renderPage(role: UserRole, children?: ChildSummary[]) {
  const user = { id: 1, email: 'a@b.com', name: '테스트', role, ...(children ? { children } : {}) }
  localStorage.setItem('user', JSON.stringify(user))
  setAccessToken('test-token')

  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/notifications']}>
        <AuthProvider>
          <Routes>
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="*" element={<LocationProbe />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const sample: Notification = {
  id: 1,
  type: 'GRADE_UPDATED',
  title: '성적 업데이트',
  message: '성적 3건이 등록/수정되었습니다.',
  read: false,
  referenceId: 7,
  referenceType: 'GRADE',
  referenceStudentId: 7,
  referenceStudentName: '홍길동',
  createdAt: new Date().toISOString(),
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    server.use(http.get(`${BASE}/api/notifications`, () => HttpResponse.json([sample])))
  })

  it('알림 목록을 렌더링한다', async () => {
    renderPage('STUDENT')
    expect(await screen.findByText('성적 업데이트')).toBeInTheDocument()
    expect(screen.getByText('성적 3건이 등록/수정되었습니다.')).toBeInTheDocument()
  })

  it('학부모는 메시지에 자녀 이름 prefix를 붙인다', async () => {
    renderPage('PARENT', [{ studentId: 7, name: '홍길동' }])
    expect(
      await screen.findByText('홍길동 학생: 성적 3건이 등록/수정되었습니다.'),
    ).toBeInTheDocument()
  })

  it('알림 클릭 시 markRead 호출 + deep link로 이동', async () => {
    let markedId: string | null = null
    server.use(
      http.patch(`${BASE}/api/notifications/:id/read`, ({ params }) => {
        markedId = String(params.id)
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderPage('STUDENT')
    await screen.findByText('성적 업데이트')

    await userEvent.click(screen.getByText('성적 업데이트'))

    await waitFor(() => expect(markedId).toBe('1'))
    expect(screen.getByTestId('loc')).toHaveTextContent('/student/grades')
  })

  it('모두 읽음 버튼 클릭 시 read-all 호출', async () => {
    let calledAll = false
    server.use(
      http.patch(`${BASE}/api/notifications/read-all`, () => {
        calledAll = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderPage('STUDENT')
    await screen.findByText('성적 업데이트')

    await userEvent.click(screen.getByRole('button', { name: '모두 읽음' }))
    await waitFor(() => expect(calledAll).toBe(true))
  })

  it('빈 목록일 때 안내 메시지 표시', async () => {
    server.use(http.get(`${BASE}/api/notifications`, () => HttpResponse.json([])))
    renderPage('STUDENT')
    expect(await screen.findByText('받은 알림이 없습니다.')).toBeInTheDocument()
  })

  it('모두 읽음 버튼은 unread 0건이면 비활성화', async () => {
    server.use(
      http.get(`${BASE}/api/notifications`, () =>
        HttpResponse.json([{ ...sample, read: true }]),
      ),
    )
    renderPage('STUDENT')
    await screen.findByText('성적 업데이트')
    expect(screen.getByRole('button', { name: '모두 읽음' })).toBeDisabled()
  })
})
