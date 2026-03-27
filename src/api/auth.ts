import { client } from './client'
import type {
  LoginRequest,
  LoginResponse,
  TeacherRegisterRequest,
  StudentRegisterRequest,
  ParentRegisterRequest,
} from '@/types'

export async function loginBySchool(data: {
  school: string
  schoolNumber: string
  password: string
}): Promise<LoginResponse> {
  const res = await client.post<LoginResponse>('/api/auth/login/school', data)
  return res.data
}

export async function loginByEmail(data: {
  email: string
  password: string
}): Promise<LoginResponse> {
  const res = await client.post<LoginResponse>('/api/auth/login/email', data)
  return res.data
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  if (data.role === 'PARENT') {
    return loginByEmail({ email: data.email, password: data.password })
  }
  return loginBySchool({ school: data.school, schoolNumber: data.schoolNumber, password: data.password })
}

export async function logout(): Promise<void> {
  await client.post('/api/auth/logout')
}

export async function registerTeacher(data: TeacherRegisterRequest): Promise<void> {
  await client.post('/api/auth/register/teacher', data)
}

export async function registerStudent(data: StudentRegisterRequest): Promise<void> {
  await client.post('/api/auth/register/student', data)
}

export async function registerParent(data: ParentRegisterRequest): Promise<void> {
  await client.post('/api/auth/register/parent', data)
}
