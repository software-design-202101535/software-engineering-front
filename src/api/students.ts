import type { StudentSummary } from '@/types'
import { client } from './client'

export async function fetchStudents(): Promise<StudentSummary[]> {
  const { data } = await client.get('/api/students')
  return data
}
