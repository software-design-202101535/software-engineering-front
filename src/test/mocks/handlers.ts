import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({}, { status: 200 })
  }),
]
