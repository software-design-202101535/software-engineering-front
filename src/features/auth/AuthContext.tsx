import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type {
  User,
  LoginRequest,
  LoginResponse,
  KakaoLoginResponse,
  KakaoRegisterRequest,
} from '@/types'
import {
  login as loginApi,
  logout as logoutApi,
  oauthKakaoLogin as oauthKakaoLoginApi,
  oauthKakaoRegister as oauthKakaoRegisterApi,
} from '@/api/auth'
import { setAccessToken } from '@/api/client'
import { syncFcmTokenOnLogin, syncFcmTokenOnLogout } from '@/lib/fcmSync'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>
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
  const fcmTokenRef = useRef<string | null>(null)
  const queryClient = useQueryClient()

  const applyLoginResponse = useCallback((res: LoginResponse) => {
    const user = userFromLoginResponse(res)
    // 이전 사용자의 React Query 캐시를 제거. 안 하면 계정 전환 시 이전 교사 데이터가 보임.
    queryClient.clear()
    setAccessToken(res.accessToken)
    localStorage.setItem('user', JSON.stringify(user))
    setState({ user, isAuthenticated: true })
    return user
  }, [queryClient])

  // 인증 상태가 true가 되면(로그인/새로고침) FCM 토큰 등록 시도. 실패는 swallow.
  useEffect(() => {
    if (!state.isAuthenticated) return
    let cancelled = false
    void syncFcmTokenOnLogin().then((token) => {
      if (!cancelled) fcmTokenRef.current = token
    })
    return () => {
      cancelled = true
    }
  }, [state.isAuthenticated])

  const login = useCallback(async (data: LoginRequest) => {
    const res = await loginApi(data)
    applyLoginResponse(res)
  }, [applyLoginResponse])

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
    await syncFcmTokenOnLogout(fcmTokenRef.current)
    fcmTokenRef.current = null
    await logoutApi()
    setAccessToken(null)
    localStorage.removeItem('user')
    setState({ user: null, isAuthenticated: false })
    queryClient.clear()
  }, [queryClient])

  return (
    <AuthContext.Provider value={{ ...state, login, oauthLogin, oauthRegister, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
