import type { Student, StudentSummary, UpdateStudentRequest } from '@/types'
import { client } from './client'

export async function fetchStudents(): Promise<StudentSummary[]> {
  const { data } = await client.get('/api/students')
  return data
}

export async function fetchStudent(studentId: number): Promise<Student> {
  const { data } = await client.get(`/api/students/${studentId}`)
  return data
}

export async function updateStudent(studentId: number, body: UpdateStudentRequest): Promise<Student> {
  const { data } = await client.patch(`/api/students/${studentId}`, body)
  return data
}
