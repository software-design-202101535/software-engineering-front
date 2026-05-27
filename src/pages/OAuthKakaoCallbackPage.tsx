import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  const axiosErr = err as { response?: { data?: { message?: string; code?: string } } }
  const data = axiosErr?.response?.data
  if (data?.code === 'OAUTH_PROVIDER_ERROR') return '카카오 인증 서버와의 통신에 실패했습니다.'
  return data?.message ?? '카카오 로그인에 실패했습니다.'
}

export function OAuthKakaoCallbackPage() {
  const navigate = useNavigate()
  const { oauthLogin } = useAuth()

  // URL 쿼리는 첫 마운트 시점에 한 번만 읽어 state로 잡아둔다.
  // 라우터의 useSearchParams는 리렌더마다 현재 URL을 다시 읽기 때문에,
  // 어떤 이유로든 URL이 바뀌면 code가 사라져 "인증 코드가 없습니다"가 잘못 뜰 수 있음.
  const [params] = useState(() => {
    const sp = new URLSearchParams(window.location.search)
    // eslint-disable-next-line no-console
    console.log('[OAuth callback] mount:', {
      href: window.location.href,
      search: window.location.search,
      code: sp.get('code'),
      error: sp.get('error'),
    })
    return {
      code: sp.get('code'),
      error: sp.get('error'),
      errorDescription: sp.get('error_description'),
    }
  })
  const { code, error: kakaoError, errorDescription: kakaoErrorDescription } = params

  const { mutate, isIdle, isError, error } = useMutation({
    mutationFn: (kakaoCode: string) => oauthLogin(kakaoCode),
    onSuccess: (res) => {
      if (res.isNewUser) {
        const params = new URLSearchParams({ tempToken: res.tempToken })
        if (res.email) params.set('email', res.email)
        if (res.name) params.set('name', res.name)
        navigate(`/oauth/complete?${params.toString()}`, { replace: true })
      } else {
        navigate(ROLE_ROUTES[res.role], { replace: true })
      }
    },
  })

  useEffect(() => {
    if (code && isIdle) mutate(code)
  }, [code, isIdle, mutate])

  if (kakaoError) {
    return (
      <Failure
        message={`카카오 인증 실패: ${kakaoErrorDescription ?? kakaoError}`}
        debug={window.location.search}
      />
    )
  }
  if (!code) {
    return (
      <Failure
        message="인증 코드가 전달되지 않았습니다. 카카오 로그인부터 다시 시도해 주세요."
        debug={window.location.search || '(URL에 쿼리스트링이 비어있음)'}
      />
    )
  }
  if (isError) {
    return (
      <Failure
        message={resolveErrorMessage(error)}
        debug={`code 길이: ${code.length}, search: ${window.location.search}`}
      />
    )
  }
  return <Loading />
}

function Failure({ message, debug }: { message: string; debug?: string }) {
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
            {debug && (
              <pre className="text-[10px] text-left text-on-surface-variant bg-surface-container p-3 rounded-md break-all whitespace-pre-wrap">
                {debug}
              </pre>
            )}
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
