import { useEffect, useRef, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { AuthLayout } from '@/layouts/AuthLayout'
import type { UserRole } from '@/types'

const ROLE_ROUTES: Record<UserRole, string> = {
  TEACHER: '/dashboard',
  STUDENT: '/student/grades',
  PARENT: '/parent/grades',
  ADMIN: '/admin',
}

export function OAuthResultPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithOAuth } = useAuth()
  const [error, setError] = useState('')
  const hasRunRef = useRef(false)

  const authCode = searchParams.get('authCode')
  const needsInfo = searchParams.get('needsInfo') === 'true'

  useEffect(() => {
    if (hasRunRef.current) return
    hasRunRef.current = true

    if (!authCode) {
      setError('인증 정보가 없습니다. 다시 시도해 주세요.')
      return
    }

    if (needsInfo) {
      // TODO: Commit 2 — 신규 유저 역할 선택/정보 입력 페이지로 이동
      // navigate(`/oauth/complete?${searchParams.toString()}`)
      setError('신규 회원가입 흐름은 아직 준비 중입니다.')
      return
    }

    loginWithOAuth(authCode)
      .then((user) => navigate(ROLE_ROUTES[user.role], { replace: true }))
      .catch((err: unknown) => {
        const axiosErr = err as { response?: { data?: { message?: string } } }
        setError(axiosErr.response?.data?.message ?? '카카오 로그인에 실패했습니다.')
      })
  }, [authCode, needsInfo, loginWithOAuth, navigate])

  return (
    <AuthLayout>
      <main className="flex-grow flex items-center justify-center p-6">
        <div
          className="w-full max-w-md rounded-xl overflow-hidden bg-white"
          style={{ boxShadow: '0 16px 32px rgba(40,52,57,0.06)' }}
        >
          <div className="p-10 text-center space-y-6">
            {error ? (
              <>
                <span className="material-symbols-outlined text-error text-5xl">error</span>
                <h1 className="font-headline text-xl font-bold text-on-surface">로그인 실패</h1>
                <p className="text-sm text-on-surface-variant">{error}</p>
                <Link
                  to="/login"
                  className="inline-block w-full bg-primary hover:bg-primary-dim text-white font-headline font-bold py-3 rounded-lg transition-all"
                >
                  로그인 화면으로
                </Link>
              </>
            ) : (
              <>
                <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block" />
                <h1 className="font-headline text-xl font-bold text-on-surface">로그인 처리 중...</h1>
                <p className="text-sm text-on-surface-variant">잠시만 기다려 주세요.</p>
              </>
            )}
          </div>
        </div>
      </main>
    </AuthLayout>
  )
}
