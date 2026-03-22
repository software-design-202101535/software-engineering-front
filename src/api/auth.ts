import type { LoginRequest, LoginResponse } from '@/types'
import { mockUsers } from '@/mocks'

// 나중에 real API로 교체: client.post('/api/auth/login', data)
export async function login(data: LoginRequest): Promise<LoginResponse> {
  await new Promise((r) => setTimeout(r, 500))

  let user
  if (data.role === 'PARENT') {
    user = mockUsers.find((u) => u.email === data.email && u.role === 'PARENT')
  } else {
    // mock에서는 role로만 매칭 (실제 서버는 school + identifier로 조회)
    user = mockUsers.find((u) => u.role === data.role)
  }

  if (!user || data.password !== 'password') {
    throw new Error('정보가 올바르지 않습니다.')
  }

  return {
    accessToken: `mock-access-token-${user.id}`,
    refreshToken: `mock-refresh-token-${user.id}`,
    user,
  }
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  await new Promise((r) => setTimeout(r, 300))
  return {
    accessToken: `mock-access-token-refreshed`,
    refreshToken,
  }
}

export async function logout(): Promise<void> {
  await new Promise((r) => setTimeout(r, 200))
}
