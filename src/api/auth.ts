import { client } from './client'
import type {
  LoginRequest,
  LoginResponse,
  OAuthTokenResponse,
  OAuthCompleteRequest,
  KakaoLoginResponse,
  KakaoRegisterRequest,
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

export async function completeOAuthSignup(payload: OAuthCompleteRequest): Promise<OAuthTokenResponse> {
  const res = await client.post<OAuthTokenResponse>('/api/auth/oauth/complete', payload)
  return res.data
}

export async function oauthKakaoLogin(code: string): Promise<KakaoLoginResponse> {
  const res = await client.post<KakaoLoginResponse>('/api/auth/oauth/kakao', { code })
  return res.data
}

export async function oauthKakaoRegister(payload: KakaoRegisterRequest): Promise<LoginResponse> {
  const res = await client.post<LoginResponse>('/api/auth/oauth/kakao/register', payload)
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
