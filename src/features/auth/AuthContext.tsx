import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type {
  User,
  LoginRequest,
  LoginResponse,
  OAuthCompleteRequest,
  KakaoLoginResponse,
  KakaoRegisterRequest,
} from '@/types'
import {
  login as loginApi,
  logout as logoutApi,
  loginWithOAuthCode as loginWithOAuthCodeApi,
  completeOAuthSignup as completeOAuthSignupApi,
  oauthKakaoLogin as oauthKakaoLoginApi,
  oauthKakaoRegister as oauthKakaoRegisterApi,
} from '@/api/auth'
import { setAccessToken } from '@/api/client'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>
  loginWithOAuth: (authCode: string) => Promise<User>
  completeOAuth: (payload: OAuthCompleteRequest) => Promise<User>
  oauthLogin: (code: string) => Promise<KakaoLoginResponse>
  oauthRegister: (payload: KakaoRegisterRequest) => Promise<User>
  logout: () => Promise<void>
}

function userFromLoginResponse(res: LoginResponse): User {
  return {
    id: res.userId,
    email: res.email,
    name: res.name,
    role: res.role,
    ...(res.studentId != null ? { studentId: res.studentId } : {}),
    ...(res.children != null ? { children: res.children } : {}),
  }
}

const AuthContext = createContext<AuthContextValue | null>(null)

  export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(() => {
      const saved = localStorage.getItem('user')
      return {
        user: saved ? (JSON.parse(saved) as User) : null,
        isAuthenticated: !!saved,
      }
    })

  const applyLoginResponse = useCallback((res: LoginResponse) => {
    const user = userFromLoginResponse(res)
    setAccessToken(res.accessToken)
    localStorage.setItem('user', JSON.stringify(user))
    setState({ user, isAuthenticated: true })
    return user
  }, [])

  const login = useCallback(async (data: LoginRequest) => {
    const res = await loginApi(data)
    applyLoginResponse(res)
  }, [applyLoginResponse])

  const applyOAuthSession = useCallback((accessToken: string, user: User) => {
    setAccessToken(accessToken)
    localStorage.setItem('user', JSON.stringify(user))
    setState({ user, isAuthenticated: true })
  }, [])

  const loginWithOAuth = useCallback(async (authCode: string) => {
    const res = await loginWithOAuthCodeApi(authCode)
    applyOAuthSession(res.accessToken, res.user)
    return res.user
  }, [applyOAuthSession])

  const completeOAuth = useCallback(async (payload: OAuthCompleteRequest) => {
    const res = await completeOAuthSignupApi(payload)
    applyOAuthSession(res.accessToken, res.user)
    return res.user
  }, [applyOAuthSession])

  const oauthLogin = useCallback(async (code: string) => {
    const res = await oauthKakaoLoginApi(code)
    if (!res.isNewUser) {
      applyLoginResponse(res)
    }
    return res
  }, [applyLoginResponse])

  const oauthRegister = useCallback(async (payload: KakaoRegisterRequest) => {
    const res = await oauthKakaoRegisterApi(payload)
    return applyLoginResponse(res)
  }, [applyLoginResponse])

  const logout = useCallback(async () => {
    await logoutApi()
    setAccessToken(null)
    localStorage.removeItem('user')
    setState({ user: null, isAuthenticated: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithOAuth, completeOAuth, oauthLogin, oauthRegister, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
