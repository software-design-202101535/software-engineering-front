import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { client, setAccessToken, getAccessToken } from './client'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''
const url = (path: string) => `${BASE}${path}`

beforeEach(() => {
  setAccessToken(null)
  vi.restoreAllMocks()
})


describe('setAccessToken / getAccessToken', () => {
  it('토큰 설정 시 localStorage와 메모리 변수를 모두 업데이트한다', () => {
    setAccessToken('my-token')
    expect(getAccessToken()).toBe('my-token')
    expect(localStorage.getItem('accessToken')).toBe('my-token')
  })

  it('null 설정 시 localStorage에서 제거하고 메모리도 null이 된다', () => {
    setAccessToken('my-token')
    setAccessToken(null)
    expect(getAccessToken()).toBeNull()
    expect(localStorage.getItem('accessToken')).toBeNull()
  })
})

describe('request interceptor', () => {
  it('토큰이 있으면 보호 경로에 Authorization 헤더를 부착한다', async () => {
    setAccessToken('test-token')
    let capturedAuth: string | null = null
    server.use(
      http.get(url('/api/protected'), ({ request }) => {
        capturedAuth = request.headers.get('authorization')
        return HttpResponse.json({})
      }),
    )
    await client.get('/api/protected')
    expect(capturedAuth).toBe('Bearer test-token')
  })

  it('토큰이 없으면 Authorization 헤더를 부착하지 않는다', async () => {
    let capturedAuth: string | null = null
    server.use(
      http.get(url('/api/protected'), ({ request }) => {
        capturedAuth = request.headers.get('authorization')
        return HttpResponse.json({})
      }),
    )
    await client.get('/api/protected')
    expect(capturedAuth).toBeNull()
  })

  it.each([
    '/api/auth/login/school',
    '/api/auth/login/email',
    '/api/auth/refresh',
  ])('퍼블릭 경로 %s 에는 토큰을 부착하지 않는다', async (path) => {
    setAccessToken('test-token')
    let capturedAuth: string | null = null
    server.use(
      http.post(url(path), ({ request }) => {
        capturedAuth = request.headers.get('authorization')
        return HttpResponse.json({})
      }),
    )
    await client.post(path)
    expect(capturedAuth).toBeNull()
  })
})

describe('response interceptor - 401 처리', () => {
  it('401 응답 시 refresh를 호출하고 새 토큰으로 원 요청을 재시도한다', async () => {
    setAccessToken('old-token')
    vi.spyOn(axios, 'post').mockResolvedValueOnce({
      data: { accessToken: 'new-token' },
    })
    let requestCount = 0
    server.use(
      http.get(url('/api/protected'), () => {
        requestCount++
        if (requestCount === 1) return new HttpResponse(null, { status: 401 })
        return HttpResponse.json({ ok: true })
      }),
    )
    const res = await client.get('/api/protected')
    expect(axios.post).toHaveBeenCalledOnce()
    expect(getAccessToken()).toBe('new-token')
    expect(res.data).toEqual({ ok: true })
  })

  it('refresh 실패 시 토큰과 user를 localStorage에서 제거한다', async () => {
    setAccessToken('old-token')
    localStorage.setItem('user', JSON.stringify({ name: 'test' }))
    vi.spyOn(axios, 'post').mockRejectedValueOnce(new Error('refresh failed'))
    server.use(
      http.get(url('/api/protected'), () => new HttpResponse(null, { status: 401 })),
    )
    await client.get('/api/protected').catch(() => {})
    expect(getAccessToken()).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('퍼블릭 경로의 401은 refresh를 시도하지 않는다', async () => {
    const postSpy = vi.spyOn(axios, 'post')
    server.use(
      http.post(url('/api/auth/login/email'), () =>
        new HttpResponse(null, { status: 401 }),
      ),
    )
    await expect(client.post('/api/auth/login/email')).rejects.toThrow()
    expect(postSpy).not.toHaveBeenCalled()
  })
})
