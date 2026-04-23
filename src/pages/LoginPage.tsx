import { Link } from 'react-router-dom'
import { useLoginForm } from '@/features/auth'
import type { LoginRole } from '@/features/auth'
import type { SchoolType } from '@/types'
import { AuthLayout } from '@/layouts/AuthLayout'
import { SCHOOLS } from '@/types'

const ROLE_LABELS: Record<LoginRole, string> = {
  TEACHER: '교사',
  STUDENT: '학생',
  PARENT: '학부모',
}

export function LoginPage() {
  const {
    activeRole,
    school,
    schoolNumber,
    email,
    password,
    showPassword,
    error,
    fieldErrors,
    isLoading,
    setSchool,
    setSchoolNumber,
    setEmail,
    setPassword,
    handleRoleChange,
    handleSubmit,
    toggleShowPassword,
  } = useLoginForm()

  return (
    <AuthLayout>
      <main className="flex-grow flex items-center justify-center p-6">
        <div
          className="w-full max-w-md rounded-xl overflow-hidden bg-white"
          style={{ boxShadow: '0 16px 32px rgba(40,52,57,0.06)' }}
        >
          {/* Role Tabs */}
          <div className="flex border-b border-surface-container">
            {(Object.keys(ROLE_LABELS) as LoginRole[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRoleChange(role)}
                className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 ${
                  activeRole === role
                    ? 'text-primary border-primary bg-surface-container-low/50'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                {ROLE_LABELS[role]}
              </button>
            ))}
          </div>

          <div className="p-10">
            <div className="mb-8 text-center">
              <h1 className="font-headline text-3xl font-bold text-on-surface">로그인</h1>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {activeRole !== 'PARENT' ? (
                <>
                  {/* 학교 선택 */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                      학교
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-outline-variant text-lg">school</span>
                      </div>
                      <select
                        value={school}
                        required
                        onChange={(e) => setSchool(e.target.value as SchoolType | '')}
                        className="w-full bg-surface-container-low border-0 border-b-2 border-primary-fixed-dim focus:ring-0 focus:border-primary pl-11 pr-4 py-3 text-sm text-on-surface transition-all rounded-t-lg appearance-none"
                      >
                        <option value="">학교를 선택하세요</option>
                        {SCHOOLS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-outline-variant text-lg">expand_more</span>
                      </div>
                    </div>
                  </div>
                  {fieldErrors.school && <p className="text-xs text-error mt-1 ml-1">{fieldErrors.school}</p>}

                  {/* 사번 / 학번 */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                      {activeRole === 'TEACHER' ? '사번' : '학번'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-outline-variant text-lg">badge</span>
                      </div>
                      <input
                        type="text"
                        placeholder={activeRole === 'TEACHER' ? '사번을 입력하세요' : '학번을 입력하세요'}
                        value={schoolNumber}
                        required
                        autoComplete="username"
                        onChange={(e) => setSchoolNumber(e.target.value)}
                        className="w-full bg-surface-container-low border-0 border-b-2 border-primary-fixed-dim focus:ring-0 focus:border-primary pl-11 pr-4 py-3 text-sm text-on-surface placeholder:text-outline-variant transition-all rounded-t-lg"
                      />
                    </div>
                    {fieldErrors.schoolNumber && <p className="text-xs text-error mt-1 ml-1">{fieldErrors.schoolNumber}</p>}
                  </div>
                </>
              ) : (
                /* 학부모: 이메일 */
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                    이메일
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="material-symbols-outlined text-outline-variant text-lg">mail</span>
                    </div>
                    <input
                      type="email"
                      placeholder="example@email.com"
                      value={email}
                      required
                      autoComplete="email"
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-surface-container-low border-0 border-b-2 border-primary-fixed-dim focus:ring-0 focus:border-primary pl-11 pr-4 py-3 text-sm text-on-surface placeholder:text-outline-variant transition-all rounded-t-lg"
                    />
                  </div>
                  {fieldErrors.email && <p className="text-xs text-error mt-1 ml-1">{fieldErrors.email}</p>}
                </div>
              )}

              {/* 비밀번호 */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-end">
                  <label className="block text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider">
                    비밀번호
                  </label>
                  <a href="#" className="text-[11px] text-primary font-bold hover:underline">비밀번호 찾기</a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="material-symbols-outlined text-outline-variant text-lg">lock</span>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    required
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface-container-low border-0 border-b-2 border-primary-fixed-dim focus:ring-0 focus:border-primary pl-11 pr-11 py-3 text-sm text-on-surface placeholder:text-outline-variant transition-all rounded-t-lg"
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
                {error && <p className="text-xs text-error mt-1 ml-1">{error}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dim text-white font-headline font-bold py-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    <span>로그인</span>
                    <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-6 border-t border-surface-container text-center">
              <p className="text-on-surface-variant text-xs">
                계정이 없으신가요?{' '}
                <Link to={`/signup/${activeRole.toLowerCase()}`} className="text-primary font-bold ml-1 hover:underline">
                  신규 회원가입
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </AuthLayout>
  )
}
