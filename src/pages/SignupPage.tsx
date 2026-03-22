import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { MOCK_SCHOOLS } from '@/mocks'

type SignupRole = 'teacher' | 'student' | 'parent'

const ROLE_LABELS: Record<SignupRole, string> = {
  teacher: '교사',
  student: '학생',
  parent: '학부모',
}

const INPUT_CLASS =
  'w-full bg-surface-container-low border-0 border-b-2 border-primary-fixed-dim focus:ring-0 focus:border-primary px-4 py-3 text-sm transition-all outline-none rounded-t-lg placeholder:text-outline-variant/60'

const SELECT_CLASS =
  'w-full bg-surface-container-low border-0 border-b-2 border-primary-fixed-dim focus:ring-0 focus:border-primary px-4 py-3 text-sm transition-all outline-none rounded-t-lg appearance-none'

const LABEL_CLASS = 'block text-[0.75rem] font-semibold text-on-surface-variant uppercase tracking-wider ml-1'


export function SignupPage() {
  const { role = 'teacher' } = useParams<{ role: SignupRole }>()
  const activeRole = (role as SignupRole) || 'teacher'
  const navigate = useNavigate()
  const [termsChecked, setTermsChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 실제 서버 연동 시 API 호출로 교체
    alert('회원가입 신청이 완료되었습니다. 관리자 승인 후 로그인 가능합니다.')
    navigate('/login')
  }

  return (
    <AuthLayout>
      <main className="flex-grow flex items-center justify-center px-6 py-12 md:py-16">
        <div
          className="w-full max-w-lg overflow-hidden rounded-xl bg-surface-container-lowest"
          style={{ boxShadow: '0 32px 64px -12px rgba(40,52,57,0.06)' }}
        >
          {/* Role Tabs */}
          <div className="flex border-b border-outline-variant/20 bg-surface-container-low">
            {(['teacher', 'student', 'parent'] as SignupRole[]).map((r) => (
              <Link
                key={r}
                to={`/signup/${r}`}
                className={`flex-1 py-4 text-sm font-medium transition-colors border-b-2 text-center ${
                  activeRole === r
                    ? 'text-primary border-primary font-bold bg-surface-container-lowest'
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                {ROLE_LABELS[r]}
              </Link>
            ))}
          </div>

          <div className="p-8 md:p-10 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">
                {ROLE_LABELS[activeRole]} 회원가입
              </h2>
              {activeRole === 'parent' && (
                <p className="mt-2 text-sm text-on-surface-variant">자녀의 학습 정보를 실시간으로 확인하세요.</p>
              )}
              {activeRole === 'student' && (
                <p className="mt-2 text-sm text-on-surface-variant">학사 정보를 입력하여 서비스를 시작하세요.</p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeRole === 'teacher' && <TeacherForm />}
              {activeRole === 'student' && <StudentForm />}
              {activeRole === 'parent' && <ParentForm />}

              {/* Terms */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={termsChecked}
                      onChange={(e) => setTermsChecked(e.target.checked)}
                      className="h-4 w-4 rounded border-outline-variant/30 text-primary focus:ring-primary/20 cursor-pointer"
                      required
                    />
                    <span className="text-sm text-on-surface-variant">[필수] 이용약관에 동의합니다</span>
                  </label>
                  <a href="#" className="text-xs font-semibold text-primary hover:underline underline-offset-2">보기</a>
                </div>
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacyChecked}
                      onChange={(e) => setPrivacyChecked(e.target.checked)}
                      className="h-4 w-4 rounded border-outline-variant/30 text-primary focus:ring-primary/20 cursor-pointer"
                      required
                    />
                    <span className="text-sm text-on-surface-variant">[필수] 개인정보 처리방침에 동의합니다</span>
                  </label>
                  <a href="#" className="text-xs font-semibold text-primary hover:underline underline-offset-2">보기</a>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dim text-on-primary font-bold py-4 rounded-xl transition-all duration-200 active:scale-[0.98] mt-4 text-base flex items-center justify-center gap-2"
              >
                가입 신청하기
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </form>

            <div className="text-center pt-2">
              <p className="text-sm text-on-surface-variant">
                이미 계정이 있으신가요?{' '}
                <Link to="/login" className="text-primary font-bold hover:underline">로그인</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </AuthLayout>
  )
}

function TeacherForm() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>성명</label>
          <input className={INPUT_CLASS} type="text" placeholder="홍길동" required />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>소속 학교</label>
          <div className="relative">
            <select className={SELECT_CLASS} required defaultValue="">
              <option value="" disabled>학교를 선택하세요</option>
              {MOCK_SCHOOLS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline-variant text-lg">expand_more</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>아이디 (이메일)</label>
          <input className={INPUT_CLASS} type="email" placeholder="example@school.kr" required autoComplete="email" />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>사번/교원번호</label>
          <input className={INPUT_CLASS} type="text" placeholder="예: T20240001" required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>비밀번호</label>
          <input className={INPUT_CLASS} type="password" placeholder="8자 이상 입력" required autoComplete="new-password" />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>비밀번호 확인</label>
          <input className={INPUT_CLASS} type="password" placeholder="비밀번호 재입력" required autoComplete="new-password" />
        </div>
      </div>
    </>
  )
}

function StudentForm() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>성명</label>
          <input className={INPUT_CLASS} type="text" placeholder="성명을 입력하세요" required />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>소속 학교</label>
          <div className="relative">
            <select className={SELECT_CLASS} required defaultValue="">
              <option value="" disabled>학교를 선택하세요</option>
              {MOCK_SCHOOLS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline-variant text-lg">expand_more</span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>아이디 (이메일)</label>
          <input className={INPUT_CLASS} type="email" placeholder="example@school.kr" required autoComplete="email" />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>학번</label>
          <input className={INPUT_CLASS} type="text" placeholder="예: 202401001" required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>비밀번호</label>
          <input className={INPUT_CLASS} type="password" placeholder="8자 이상 입력" required autoComplete="new-password" />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>비밀번호 확인</label>
          <input className={INPUT_CLASS} type="password" placeholder="비밀번호 재입력" required autoComplete="new-password" />
        </div>
      </div>
    </>
  )
}

function ParentForm() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>성명</label>
          <input className={INPUT_CLASS} type="text" placeholder="홍길동" required />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>이메일 (아이디)</label>
          <input className={INPUT_CLASS} type="email" placeholder="example@email.com" required autoComplete="email" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>비밀번호</label>
          <input className={INPUT_CLASS} type="password" placeholder="••••••••" required autoComplete="new-password" />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>비밀번호 확인</label>
          <input className={INPUT_CLASS} type="password" placeholder="••••••••" required autoComplete="new-password" />
        </div>
      </div>

      {/* 자녀 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>자녀 소속 학교</label>
          <div className="relative">
            <select className={SELECT_CLASS} required defaultValue="">
              <option value="" disabled>학교를 선택하세요</option>
              {MOCK_SCHOOLS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-outline-variant text-lg">expand_more</span>
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>자녀 학번</label>
          <input className={INPUT_CLASS} type="text" placeholder="예: 202401001" required />
        </div>
      </div>
    </>
  )
}
