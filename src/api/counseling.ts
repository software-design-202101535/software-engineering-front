import type { Counseling } from '@/types'
import { mockCounselings } from '@/mocks'

let localCounselings = [...mockCounselings]

export async function fetchCounselings(studentId: number): Promise<Counseling[]> {
  await new Promise((r) => setTimeout(r, 300))
  return localCounselings.filter((c) => c.studentId === studentId)
}

export async function createCounseling(data: Omit<Counseling, 'id' | 'createdAt'>): Promise<Counseling> {
  await new Promise((r) => setTimeout(r, 400))
  const newCounseling: Counseling = {
    ...data,
    id: Math.max(...localCounselings.map((c) => c.id), 0) + 1,
    createdAt: new Date().toISOString(),
  }
  localCounselings.push(newCounseling)
  return newCounseling
}

export async function updateCounseling(id: number, data: Partial<Counseling>): Promise<Counseling> {
  await new Promise((r) => setTimeout(r, 400))
  const idx = localCounselings.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error('상담 기록을 찾을 수 없습니다.')
  localCounselings[idx] = { ...localCounselings[idx], ...data }
  return localCounselings[idx]
}

export async function deleteCounseling(id: number): Promise<void> {
  await new Promise((r) => setTimeout(r, 300))
  localCounselings = localCounselings.filter((c) => c.id !== id)
}
