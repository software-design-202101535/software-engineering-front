import type { Feedback, FeedbackCategory, FeedbackRequest } from '@/types'
import { client } from './client'

export async function fetchFeedbacks(
  studentId: number,
  params?: { category?: FeedbackCategory },
): Promise<Feedback[]> {
  const { data } = await client.get<Feedback[]>(`/api/students/${studentId}/feedbacks`, { params })
  return data
}

export async function createFeedback(studentId: number, body: FeedbackRequest): Promise<Feedback> {
  const { data } = await client.post<Feedback>(`/api/students/${studentId}/feedbacks`, body)
  return data
}

export async function updateFeedback(
  studentId: number,
  feedbackId: number,
  body: FeedbackRequest,
): Promise<Feedback> {
  const { data } = await client.put<Feedback>(
    `/api/students/${studentId}/feedbacks/${feedbackId}`,
    body,
  )
  return data
}

export async function deleteFeedback(studentId: number, feedbackId: number): Promise<void> {
  await client.delete(`/api/students/${studentId}/feedbacks/${feedbackId}`)
}

export async function patchFeedbackVisibility(
  studentId: number,
  feedbackId: number,
  body: { studentVisible: boolean; parentVisible: boolean },
): Promise<Feedback> {
  const { data } = await client.patch<Feedback>(
    `/api/students/${studentId}/feedbacks/${feedbackId}/visibility`,
    body,
  )
  return data
}
