import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { AuthLayout } from '@/layouts/AuthLayout'
import { SCHOOLS, type SchoolType, type UserRole, type OAuthCompleteRequest } from '@/types'

type SelectableRole = 'TEACHER' | 'STUDENT' | 'PARENT'

const ROLE_LABEL: Record<SelectableRole, string> = {
  TEACHER: '교사',
  STUDENT: '학생',
  PARENT: '학부모',
}

const ROLE_ROUTES: Record<UserRole, string> = {
  TEACHER: '/dashboard',
  STUDENT: '/student/grades',
  PARENT: '/parent/grades',
  ADMIN: '/admin',
}

const INPUT_CLASS =
  'w-full bg-surface-container-low border-0 border-b-2 border-primary-fixed-dim focus:ring-0 focus:border-primary px-4 py-3 text-sm transition-all outline-none rounded-t-lg placeholder:text-outline-variant/60'

const SELECT_CLASS =
  'w-full bg-surface-container-low border-0 border-b-2 border-primary-fixed-dim focus:ring-0 focus:border-primary px-4 py-3 text-sm transition-all outline-none rounded-t-lg appearance-none'

const LABEL_CLASS = 'block text-[0.75rem] font-semibold text-on-surface-variant uppercase tracking-wider ml-1'

interface FormFields {
  school: SchoolType | ''
  grade: string
  classNum: string
  number: string
  birthDate: string
  phone: string
  parentPhone: string
  address: string
  childInfo: string
}

const INITIAL_FIELDS: FormFields = {
  school: '',
  grade: '',
  classNum: '',
  number: '',
  birthDate: '',
  phone: '',
  parentPhone: '',
  address: '',
  childInfo: '',
}

export function OAuthCompletePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { completeOAuth } = useAuth()

  const authCode = searchParams.get('authCode')
  const email = searchParams.get('email') ?? ''
  const name = searchParams.get('name') ?? ''

  const [role, setRole] = useState<SelectableRole | null>(null)
  const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS)
  const [termsChecked, setTermsChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  if (!authCode) {
    return (
      <AuthLayout>
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="w-full max-w-md p-10 text-center space-y-4 bg-white rounded-xl" style={{ boxShadow: '0 16px 32px rgba(40,52,57,0.06)' }}>
            <span className="material-symbols-outlined text-error text-5xl">error</span>
            <h1 className="font-headline text-xl font-bold text-on-surface">인증 정보 없음</h1>
            <p className="text-sm text-on-surface-variant">인증 코드가 유실되었습니다. 로그인부터 다시 시도해 주세요.</p>
            <Link to="/login" className="inline-block w-full bg-primary text-white font-bold py-3 rounded-lg">로그인 화면으로</Link>
          </div>
        </main>
      </AuthLayout>
    )
  }

  const setField = (key: keyof FormFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const buildPayload = (): OAuthCompleteRequest | null => {
    if (!role) return null
    const base = {
      authCode,
      role,
      termsAgreed: termsChecked,
      privacyAgreed: privacyChecked,
    }
    if (role === 'TEACHER') {
      return {
        ...base,
        teacherInfo: {
          school: fields.school as SchoolType,
          ...(fields.grade ? { grade: Number(fields.grade) } : {}),
          ...(fields.classNum ? { classNum: Number(fields.classNum) } : {}),
        },
      }
    }
    if (role === 'STUDENT') {
      return {
        ...base,
        studentInfo: {
          school: fields.school as SchoolType,
          ...(fields.grade ? { grade: Number(fields.grade) } : {}),
          ...(fields.classNum ? { classNum: Number(fields.classNum) } : {}),
          ...(fields.number ? { number: Number(fields.number) } : {}),
          ...(fields.birthDate ? { birthDate: fields.birthDate } : {}),
          ...(fields.phone ? { phone: fields.phone } : {}),
          ...(fields.parentPhone ? { parentPhone: fields.parentPhone } : {}),
          ...(fields.address ? { address: fields.address } : {}),
        },
      }
    }
    return {
      ...base,
      parentInfo: { childInfo: fields.childInfo },
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    const payload = buildPayload()
    if (!payload) {
      setError('역할을 선택해 주세요.')
      return
    }
    setIsLoading(true)
    try {
      const user = await completeOAuth(payload)
      navigate(ROLE_ROUTES[user.role], { replace: true })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string>; code?: string } } }
      const data = axiosErr.response?.data
      if (data?.errors) {
        setFieldErrors(data.errors)
      } else if (data?.code === 'EMAIL_ALREADY_EXISTS') {
        setError('이미 가입된 이메일입니다. 일반 로그인으로 시도해 주세요.')
      } else if (data?.code === 'OAUTH_INVALID_AUTHCODE') {
        setError('인증 코드가 만료되었습니다. 다시 로그인해 주세요.')
      } else {
        setError(data?.message ?? '회원가입에 실패했습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <main className="flex-grow flex items-center justify-center px-6 py-12 md:py-16">
        <div
          className="w-full max-w-lg overflow-hidden rounded-xl bg-surface-container-lowest"
          style={{ boxShadow: '0 32px 64px -12px rgba(40,52,57,0.06)' }}
        >
          <div className="p-8 md:p-10 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">추가 정보 입력</h2>
              <p className="text-sm text-on-surface-variant">
                {name && <span className="font-semibold text-on-surface">{name}</span>}
                {name && '님, '}카카오 인증이 완료되었습니다. 역할과 학교 정보를 입력해 주세요.
              </p>
              {email && (
                <p className="text-xs text-on-surface-variant">연결된 이메일: {email}</p>
              )}
            </div>

            {/* Role 선택 */}
            <div className="space-y-2">
              <p className={LABEL_CLASS}>역할 선택</p>
              <div className="grid grid-cols-3 gap-3">
                {(['TEACHER', 'STUDENT', 'PARENT'] as SelectableRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`py-4 rounded-lg border-2 text-sm font-bold transition-all ${
                      role === r
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-surface-container text-on-surface-variant hover:border-primary/40'
                    }`}
                  >
                    {ROLE_LABEL[r]}
                  </button>
                ))}
              </div>
              <FieldError message={fieldErrors.role} />
            </div>

            {role && (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {role === 'TEACHER' && <TeacherFormFields fields={fields} setField={setField} fieldErrors={fieldErrors} />}
                {role === 'STUDENT' && <StudentFormFields fields={fields} setField={setField} fieldErrors={fieldErrors} />}
                {role === 'PARENT' && <ParentFormFields fields={fields} setField={setField} fieldErrors={fieldErrors} />}

                {/* 약관 */}
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={termsChecked}
                          onChange={(e) => setTermsChecked(e.target.checked)}
                          className="h-4 w-4 rounded border-outline-variant/30 text-primary focus:ring-primary/20 cursor-pointer"
                        />
                        <span className="text-sm text-on-surface-variant">[필수] 이용약관에 동의합니다</span>
                      </label>
                      <a href="#" className="text-xs font-semibold text-primary hover:underline">보기</a>
                    </div>
                    <FieldError message={fieldErrors.termsAgreed} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacyChecked}
                          onChange={(e) => setPrivacyChecked(e.target.checked)}
                          className="h-4 w-4 rounded border-outline-variant/30 text-primary focus:ring-primary/20 cursor-pointer"
                        />
                        <span className="text-sm text-on-surface-variant">[필수] 개인정보 처리방침에 동의합니다</span>
                      </label>
                      <a href="#" className="text-xs font-semibold text-primary hover:underline">보기</a>
                    </div>
                    <FieldError message={fieldErrors.privacyAgreed} />
                  </div>
                </div>

                {error && <p className="text-sm text-error">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary-dim text-on-primary font-bold py-4 rounded-xl transition-all duration-200 active:scale-[0.98] text-base flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    <>
                      가입 완료하기
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </AuthLayout>
  )
}

interface FormProps {
  fields: FormFields
  setField: (key: keyof FormFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  fieldErrors: Record<string, string>
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-error mt-1 ml-1">{message}</p>
}

function SchoolSelect({
  value,
  onChange,
  error,
}: {
  value: string
  onChange: React.ChangeEventHandler<HTMLSelectElement>
  error?: string
}) {
  return (
    <div className="relative">
      <select className={SELECT_CLASS} value={value} onChange={onChange}>
        <option value="" disabled>학교를 선택하세요</option>
        {SCHOOLS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span className="material-symbols-outlined text-outline-variant text-lg">expand_more</span>
      </div>
      <FieldError message={error} />
    </div>
  )
}

function TeacherFormFields({ fields, setField, fieldErrors }: FormProps) {
  return (
    <>
      <div className="space-y-1">
        <label className={LABEL_CLASS}>소속 학교</label>
        <SchoolSelect value={fields.school} onChange={setField('school')} error={fieldErrors.school} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>담임 학년 <span className="normal-case font-normal">(선택)</span></label>
          <input className={INPUT_CLASS} type="number" placeholder="예: 2" min={1} max={3} value={fields.grade} onChange={setField('grade')} />
          <FieldError message={fieldErrors.grade} />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>담임 반 <span className="normal-case font-normal">(선택)</span></label>
          <input className={INPUT_CLASS} type="number" placeholder="예: 3" min={1} value={fields.classNum} onChange={setField('classNum')} />
          <FieldError message={fieldErrors.classNum} />
        </div>
      </div>
    </>
  )
}

function StudentFormFields({ fields, setField, fieldErrors }: FormProps) {
  return (
    <>
      <div className="space-y-1">
        <label className={LABEL_CLASS}>소속 학교</label>
        <SchoolSelect value={fields.school} onChange={setField('school')} error={fieldErrors.school} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>학년 <span className="normal-case font-normal">(선택)</span></label>
          <input className={INPUT_CLASS} type="number" placeholder="예: 2" min={1} max={3} value={fields.grade} onChange={setField('grade')} />
          <FieldError message={fieldErrors.grade} />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>반 <span className="normal-case font-normal">(선택)</span></label>
          <input className={INPUT_CLASS} type="number" placeholder="예: 3" min={1} value={fields.classNum} onChange={setField('classNum')} />
          <FieldError message={fieldErrors.classNum} />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>번호 <span className="normal-case font-normal">(선택)</span></label>
          <input className={INPUT_CLASS} type="number" placeholder="예: 15" min={1} value={fields.number} onChange={setField('number')} />
          <FieldError message={fieldErrors.number} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>생년월일 <span className="normal-case font-normal">(선택)</span></label>
          <input className={INPUT_CLASS} type="date" value={fields.birthDate} onChange={setField('birthDate')} />
          <FieldError message={fieldErrors.birthDate} />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>연락처 <span className="normal-case font-normal">(선택)</span></label>
          <input className={INPUT_CLASS} type="tel" placeholder="010-1234-5678" value={fields.phone} onChange={setField('phone')} />
          <FieldError message={fieldErrors.phone} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>학부모 연락처 <span className="normal-case font-normal">(선택)</span></label>
          <input className={INPUT_CLASS} type="tel" placeholder="010-1234-5678" value={fields.parentPhone} onChange={setField('parentPhone')} />
          <FieldError message={fieldErrors.parentPhone} />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>주소 <span className="normal-case font-normal">(선택)</span></label>
          <input className={INPUT_CLASS} type="text" placeholder="서울특별시 ..." value={fields.address} onChange={setField('address')} />
          <FieldError message={fieldErrors.address} />
        </div>
      </div>
    </>
  )
}

function ParentFormFields({ fields, setField, fieldErrors }: FormProps) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1">자녀 정보</p>
        <p className="text-xs text-on-surface-variant ml-1 mt-1">자녀의 이메일을 입력하면 자동으로 연결됩니다.</p>
      </div>
      <div className="space-y-1">
        <label className={LABEL_CLASS}>자녀 이메일</label>
        <input className={INPUT_CLASS} type="text" placeholder="자녀 계정 이메일" value={fields.childInfo} onChange={setField('childInfo')} />
        <FieldError message={fieldErrors.childInfo} />
      </div>
    </div>
  )
}
