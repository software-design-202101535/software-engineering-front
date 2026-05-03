import { http, HttpResponse } from 'msw'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export const handlers = [
  http.post(`${BASE}/api/auth/logout`, () => {
    return HttpResponse.json({}, { status: 200 })
  }),
]
