import type { Student } from '@/types'
import { mockStudents } from '@/mocks'

// 나중에 real API로 교체: client.get('/api/students', { params })
export async function fetchStudents(params?: { grade?: number; classNum?: number; name?: string }): Promise<Student[]> {
  await new Promise((r) => setTimeout(r, 300))
  let result = [...mockStudents]
  if (params?.grade) result = result.filter((s) => s.grade === params.grade)
  if (params?.classNum) result = result.filter((s) => s.classNum === params.classNum)
  if (params?.name) result = result.filter((s) => s.name.includes(params.name!))
  return result
}

export async function fetchStudent(id: number): Promise<Student> {
  await new Promise((r) => setTimeout(r, 200))
  const student = mockStudents.find((s) => s.id === id)
  if (!student) throw new Error('학생을 찾을 수 없습니다.')
  return student
}

export async function updateStudent(id: number, data: Partial<Student>): Promise<Student> {
  await new Promise((r) => setTimeout(r, 400))
  const student = mockStudents.find((s) => s.id === id)
  if (!student) throw new Error('학생을 찾을 수 없습니다.')
  return { ...student, ...data }
}
