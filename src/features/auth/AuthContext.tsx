import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User, LoginRequest, OAuthCompleteRequest } from '@/types'
import {
  login as loginApi,
  logout as logoutApi,
  loginWithOAuthCode as loginWithOAuthCodeApi,
  completeOAuthSignup as completeOAuthSignupApi,
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
  logout: () => Promise<void>
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

  const login = useCallback(async (data: LoginRequest) => {
    const res = await loginApi(data)
    const user: User = {
      id: res.userId,
      email: res.email,
      name: res.name,
      role: res.role,
      ...(res.studentId != null ? { studentId: res.studentId } : {}),
      ...(res.children != null ? { children: res.children } : {}),
    }
    setAccessToken(res.accessToken)
    localStorage.setItem('user', JSON.stringify(user))
    setState({ user, isAuthenticated: true })
  }, [])

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

  const logout = useCallback(async () => {
    await logoutApi()
    setAccessToken(null)
    localStorage.removeItem('user')
    setState({ user: null, isAuthenticated: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, loginWithOAuth, completeOAuth, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
