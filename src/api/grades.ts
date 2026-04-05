import type { Grade, ExamType, BatchGradeRequest } from '@/types'
import { client } from './client'

export async function fetchGrades(
  studentId: number,
  params: { semester: string; examType: ExamType },
): Promise<Grade[]> {
  const { data } = await client.get(`/api/students/${studentId}/grades`, { params })
  return data
}

export async function batchGrades(
  studentId: number,
  req: BatchGradeRequest,
): Promise<Grade[]> {
  const { data } = await client.put(`/api/students/${studentId}/grades/batch`, req)
  return data
}
