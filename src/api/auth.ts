import { client } from './client'
import type {
  LoginRequest,
  LoginResponse,
  KakaoLoginResponse,
  KakaoRegisterRequest,
  TeacherRegisterRequest,
  StudentRegisterRequest,
  ParentRegisterRequest,
} from '@/types'

// 백엔드의 실제 응답 모양 (프론트 내부 타입 `KakaoLoginResponse`와 키/형태가 다름)
type KakaoLoginApiResponse =
  | { newUser: false; loginData: LoginResponse }
  | { newUser: true; tempToken: string; email: string | null; name: string | null }

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await client.post<LoginResponse>('/api/auth/login/email', data)
  return res.data
}

export async function oauthKakaoLogin(code: string): Promise<KakaoLoginResponse> {
  const { data } = await client.post<KakaoLoginApiResponse>('/api/auth/oauth/kakao', { code })
  if (data.newUser) {
    return { isNewUser: true, tempToken: data.tempToken, email: data.email, name: data.name }
  }
  return { isNewUser: false, ...data.loginData }
}

export async function oauthKakaoRegister(payload: KakaoRegisterRequest): Promise<LoginResponse> {
  const { data } = await client.post<LoginResponse | { loginData: LoginResponse }>(
    '/api/auth/oauth/kakao/register',
    payload,
  )
  return 'loginData' in data ? data.loginData : data
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
