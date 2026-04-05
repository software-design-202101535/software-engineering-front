import type { Attendance, AttendanceRequest } from '@/types'
import { client } from './client'

export async function fetchAttendance(
  studentId: number,
  year: number,
  month: number,
): Promise<Attendance[]> {
  const { data } = await client.get(`/api/students/${studentId}/attendance`, {
    params: { year, month },
  })
  return data
}

export async function createAttendance(
  studentId: number,
  body: AttendanceRequest,
): Promise<Attendance> {
  const { data } = await client.post(`/api/students/${studentId}/attendance`, body)
  return data
}

export async function updateAttendance(
  studentId: number,
  attendanceId: number,
  body: AttendanceRequest,
): Promise<Attendance> {
  const { data } = await client.patch(
    `/api/students/${studentId}/attendance/${attendanceId}`,
    body,
  )
  return data
}

export async function deleteAttendance(
  studentId: number,
  attendanceId: number,
): Promise<void> {
  await client.delete(`/api/students/${studentId}/attendance/${attendanceId}`)
}
