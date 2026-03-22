import type { Grade } from '@/types'
import { mockGrades } from '@/mocks'

let localGrades = [...mockGrades]

export async function fetchGrades(studentId: number): Promise<Grade[]> {
  await new Promise((r) => setTimeout(r, 300))
  return localGrades.filter((g) => g.studentId === studentId)
}

export async function createGrade(data: Omit<Grade, 'id' | 'grade' | 'createdAt' | 'updatedAt'>): Promise<Grade> {
  await new Promise((r) => setTimeout(r, 400))
  const scoreToGrade = (score: number): Grade['grade'] => {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }
  const newGrade: Grade = {
    ...data,
    id: Math.max(...localGrades.map((g) => g.id)) + 1,
    grade: scoreToGrade(data.score),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  localGrades.push(newGrade)
  return newGrade
}

export async function updateGrade(id: number, data: Partial<Pick<Grade, 'score' | 'subject' | 'semester' | 'year'>>): Promise<Grade> {
  await new Promise((r) => setTimeout(r, 400))
  const scoreToGrade = (score: number): Grade['grade'] => {
    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }
  const idx = localGrades.findIndex((g) => g.id === id)
  if (idx === -1) throw new Error('성적을 찾을 수 없습니다.')
  const updated = {
    ...localGrades[idx],
    ...data,
    grade: data.score !== undefined ? scoreToGrade(data.score) : localGrades[idx].grade,
    updatedAt: new Date().toISOString(),
  }
  localGrades[idx] = updated
  return updated
}

export async function deleteGrade(id: number): Promise<void> {
  await new Promise((r) => setTimeout(r, 300))
  localGrades = localGrades.filter((g) => g.id !== id)
}
