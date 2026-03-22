import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { User, LoginRequest } from '@/types'
import { login as loginApi, logout as logoutApi } from '@/api/auth'
import { setAccessToken } from '@/api/client'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>
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
    setAccessToken(res.accessToken)
    localStorage.setItem('refreshToken', res.refreshToken)
    localStorage.setItem('user', JSON.stringify(res.user))
    setState({ user: res.user, isAuthenticated: true })
  }, [])

  const logout = useCallback(async () => {
    await logoutApi()
    setAccessToken(null)
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setState({ user: null, isAuthenticated: false })
  }, [])

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
