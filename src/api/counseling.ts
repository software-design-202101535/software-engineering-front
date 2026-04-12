import type { Counseling, CounselingRequest } from '@/types'
import { client } from './client'

export async function fetchCounselings(
  studentId: number,
  params?: { year?: number; month?: number; search?: string },
): Promise<Counseling[]> {
  const { data } = await client.get<Counseling[]>(`/api/students/${studentId}/counselings`, {
    params,
  })
  return data
}

export async function createCounseling(
  studentId: number,
  body: CounselingRequest,
): Promise<Counseling> {
  const { data } = await client.post<Counseling>(`/api/students/${studentId}/counselings`, body)
  return data
}

export async function updateCounseling(
  studentId: number,
  counselingId: number,
  body: CounselingRequest,
): Promise<Counseling> {
  const { data } = await client.put<Counseling>(
    `/api/students/${studentId}/counselings/${counselingId}`,
    body,
  )
  return data
}

export async function deleteCounseling(studentId: number, counselingId: number): Promise<void> {
  await client.delete(`/api/students/${studentId}/counselings/${counselingId}`)
}

export async function patchCounselingShare(
  studentId: number,
  counselingId: number,
  body: { sharedWithTeachers: boolean },
): Promise<Counseling> {
  const { data } = await client.patch<Counseling>(
    `/api/students/${studentId}/counselings/${counselingId}/share`,
    body,
  )
  return data
}
