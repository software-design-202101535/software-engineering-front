import { http, HttpResponse } from 'msw'

const BASE = import.meta.env.VITE_API_BASE_URL ?? ''

export const handlers = [
  http.post(`${BASE}/api/auth/logout`, () => HttpResponse.json({}, { status: 200 })),
  http.get(`${BASE}/api/students`, () => HttpResponse.json([])),
  http.get(`${BASE}/api/students/:id/grades`, () => HttpResponse.json([])),
  http.put(`${BASE}/api/students/:id/grades/batch`, () => HttpResponse.json([])),
  http.get(`${BASE}/api/students/:id/feedbacks`, () => HttpResponse.json([])),
  http.post(`${BASE}/api/students/:id/feedbacks`, () => HttpResponse.json({})),
  http.put(`${BASE}/api/students/:id/feedbacks/:feedbackId`, () => HttpResponse.json({})),
  http.delete(`${BASE}/api/students/:id/feedbacks/:feedbackId`, () => new HttpResponse(null, { status: 204 })),
  http.patch(`${BASE}/api/students/:id/feedbacks/:feedbackId/visibility`, () => HttpResponse.json({})),
]
