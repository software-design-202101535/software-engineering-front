import { useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { AuthLayout } from '@/layouts/AuthLayout'
import type { UserRole } from '@/types'

const ROLE_ROUTES: Record<UserRole, string> = {
  TEACHER: '/dashboard',
  STUDENT: '/student/grades',
  PARENT: '/parent/grades',
  ADMIN: '/admin',
}

function resolveErrorMessage(err: unknown): string {
  const axiosErr = err as { response?: { data?: { message?: string } } }
  return axiosErr?.response?.data?.message ?? '카카오 로그인에 실패했습니다.'
}

export function OAuthResultPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithOAuth } = useAuth()

  const authCode = searchParams.get('authCode')
  const needsInfo = searchParams.get('needsInfo') === 'true'

  const { mutate, isIdle, isError, error } = useMutation({
    mutationFn: (code: string) => loginWithOAuth(code),
    onSuccess: (user) => navigate(ROLE_ROUTES[user.role], { replace: true }),
  })

  useEffect(() => {
    if (authCode && needsInfo) {
      navigate(`/oauth/complete?${searchParams.toString()}`, { replace: true })
    }
  }, [authCode, needsInfo, navigate, searchParams])

  useEffect(() => {
    if (authCode && !needsInfo && isIdle) {
      mutate(authCode)
    }
  }, [authCode, needsInfo, isIdle, mutate])

  if (!authCode) return <Failure message="인증 정보가 없습니다. 다시 시도해 주세요." />
  if (isError) return <Failure message={resolveErrorMessage(error)} />
  return <Loading />
}

function Failure({ message }: { message: string }) {
  return (
    <AuthLayout>
      <main className="flex-grow flex items-center justify-center p-6">
        <div
          className="w-full max-w-md rounded-xl overflow-hidden bg-white"
          style={{ boxShadow: '0 16px 32px rgba(40,52,57,0.06)' }}
        >
          <div className="p-10 text-center space-y-6">
            <span className="material-symbols-outlined text-error text-5xl">error</span>
            <h1 className="font-headline text-xl font-bold text-on-surface">로그인 실패</h1>
            <p className="text-sm text-on-surface-variant">{message}</p>
            <Link
              to="/login"
              className="inline-block w-full bg-primary hover:bg-primary-dim text-white font-headline font-bold py-3 rounded-lg transition-all"
            >
              로그인 화면으로
            </Link>
          </div>
        </div>
      </main>
    </AuthLayout>
  )
}

function Loading() {
  return (
    <AuthLayout>
      <main className="flex-grow flex items-center justify-center p-6">
        <div
          className="w-full max-w-md rounded-xl overflow-hidden bg-white"
          style={{ boxShadow: '0 16px 32px rgba(40,52,57,0.06)' }}
        >
          <div className="p-10 text-center space-y-6">
            <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin inline-block" />
            <h1 className="font-headline text-xl font-bold text-on-surface">로그인 처리 중...</h1>
            <p className="text-sm text-on-surface-variant">잠시만 기다려 주세요.</p>
          </div>
        </div>
      </main>
    </AuthLayout>
  )
}
