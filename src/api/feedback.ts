import type { Feedback } from '@/types'
import { mockFeedbacks } from '@/mocks'

let localFeedbacks = [...mockFeedbacks]

export async function fetchFeedbacks(studentId: number): Promise<Feedback[]> {
  await new Promise((r) => setTimeout(r, 300))
  return localFeedbacks.filter((f) => f.studentId === studentId)
}

export async function createFeedback(data: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt'>): Promise<Feedback> {
  await new Promise((r) => setTimeout(r, 400))
  const newFeedback: Feedback = {
    ...data,
    id: Math.max(...localFeedbacks.map((f) => f.id), 0) + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  localFeedbacks.push(newFeedback)
  return newFeedback
}

export async function updateFeedback(id: number, data: Partial<Feedback>): Promise<Feedback> {
  await new Promise((r) => setTimeout(r, 400))
  const idx = localFeedbacks.findIndex((f) => f.id === id)
  if (idx === -1) throw new Error('피드백을 찾을 수 없습니다.')
  localFeedbacks[idx] = { ...localFeedbacks[idx], ...data, updatedAt: new Date().toISOString() }
  return localFeedbacks[idx]
}

export async function deleteFeedback(id: number): Promise<void> {
  await new Promise((r) => setTimeout(r, 300))
  localFeedbacks = localFeedbacks.filter((f) => f.id !== id)
}
