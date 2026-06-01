import type { ClassSummary, ClassSummaryParams, StudentRanks } from '@/types'
import { client } from './client'

export async function fetchClassSummary(params: ClassSummaryParams): Promise<ClassSummary> {
  const { data } = await client.get('/api/analytics/class-summary', { params })
  return data
}

export async function fetchStudentRanks(
  studentId: number,
  semester: string,
): Promise<StudentRanks> {
  const { data } = await client.get(`/api/analytics/students/${studentId}/ranks`, {
    params: { semester },
  })
  return data
}
