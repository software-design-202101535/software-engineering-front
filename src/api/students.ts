import type { Student, StudentSummary } from '@/types'
import { client } from './client'

export async function fetchStudents(): Promise<StudentSummary[]> {
  const { data } = await client.get('/api/students')
  return data
}

export async function fetchStudent(studentId: number): Promise<Student> {
  const { data } = await client.get(`/api/students/${studentId}`)
  return data
}
