import { client } from './client'
import type {
  LoginRequest,
  LoginResponse,
  OAuthTokenResponse,
  TeacherRegisterRequest,
  StudentRegisterRequest,
  ParentRegisterRequest,
} from '@/types'

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await client.post<LoginResponse>('/api/auth/login/email', data)
  return res.data
}

export async function loginWithOAuthCode(authCode: string): Promise<OAuthTokenResponse> {
  const res = await client.post<OAuthTokenResponse>('/api/auth/oauth/token', { authCode })
  return res.data
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
