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
  http.get(`${BASE}/api/students/:id/counselings`, () => HttpResponse.json([])),
  http.post(`${BASE}/api/students/:id/counselings`, () => HttpResponse.json({})),
  http.put(`${BASE}/api/students/:id/counselings/:counselingId`, () => HttpResponse.json({})),
  http.delete(`${BASE}/api/students/:id/counselings/:counselingId`, () => new HttpResponse(null, { status: 204 })),
  http.patch(`${BASE}/api/students/:id/counselings/:counselingId/share`, () => HttpResponse.json({})),
  http.get(`${BASE}/api/students/:id/attendance`, () => HttpResponse.json([])),
  http.post(`${BASE}/api/students/:id/attendance`, () => HttpResponse.json({})),
  http.patch(`${BASE}/api/students/:id/attendance/:attendanceId`, () => HttpResponse.json({})),
  http.delete(`${BASE}/api/students/:id/attendance/:attendanceId`, () => new HttpResponse(null, { status: 204 })),
  http.get(`${BASE}/api/students/:id/notes`, () => HttpResponse.json([])),
  http.post(`${BASE}/api/students/:id/notes`, () => HttpResponse.json({})),
  http.patch(`${BASE}/api/students/:id/notes/:noteId`, () => HttpResponse.json({})),
  http.delete(`${BASE}/api/students/:id/notes/:noteId`, () => new HttpResponse(null, { status: 204 })),
]
