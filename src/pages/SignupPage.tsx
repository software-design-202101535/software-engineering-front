import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { registerTeacher, registerStudent, registerParent } from '@/api/auth'
import { SCHOOLS, type SchoolType } from '@/types'

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

interface FormFields {
  name: string
  email: string
  password: string
  passwordConfirm: string
  school: SchoolType | ''
  schoolNumber: string
  grade: string
  classNum: string
  number: string
  childSchool: SchoolType | ''
  childSchoolNumber: string
}

const INITIAL_FIELDS: FormFields = {
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
  school: '',
  schoolNumber: '',
  grade: '',
  classNum: '',
  number: '',
  childSchool: '',
  childSchoolNumber: '',
}

export function SignupPage() {
  const { role = 'teacher' } = useParams<{ role: SignupRole }>()
  const activeRole = (role as SignupRole) || 'teacher'
  const navigate = useNavigate()

  const [fields, setFields] = useState<FormFields>(INITIAL_FIELDS)
  const [termsChecked, setTermsChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const setField = (key: keyof FormFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    if (fields.password !== fields.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsLoading(true)
    try {
      if (activeRole === 'teacher') {
        await registerTeacher({
          email: fields.email,
          password: fields.password,
          passwordConfirm: fields.passwordConfirm,
          name: fields.name,
          school: fields.school as SchoolType,
          schoolNumber: fields.schoolNumber,
          ...(fields.grade ? { grade: Number(fields.grade) } : {}),
          ...(fields.classNum ? { classNum: Number(fields.classNum) } : {}),
          termsAgreed: termsChecked,
          privacyAgreed: privacyChecked,
        })
      } else if (activeRole === 'student') {
        await registerStudent({
          email: fields.email,
          password: fields.password,
          passwordConfirm: fields.passwordConfirm,
          name: fields.name,
          school: fields.school as SchoolType,
          schoolNumber: fields.schoolNumber,
          ...(fields.grade ? { grade: Number(fields.grade) } : {}),
          ...(fields.classNum ? { classNum: Number(fields.classNum) } : {}),
          ...(fields.number ? { number: Number(fields.number) } : {}),
          termsAgreed: termsChecked,
          privacyAgreed: privacyChecked,
        })
      } else {
        await registerParent({
          email: fields.email,
          password: fields.password,
          passwordConfirm: fields.passwordConfirm,
          name: fields.name,
          childSchool: fields.childSchool as SchoolType,
          childSchoolNumber: fields.childSchoolNumber,
          termsAgreed: termsChecked,
          privacyAgreed: privacyChecked,
        })
      }
      navigate('/login')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string> } } }
      const data = axiosErr.response?.data
      if (data?.errors) {
        setFieldErrors(data.errors)
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

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {activeRole === 'teacher' && <TeacherForm fields={fields} setField={setField} fieldErrors={fieldErrors} />}
              {activeRole === 'student' && <StudentForm fields={fields} setField={setField} fieldErrors={fieldErrors} />}
              {activeRole === 'parent' && <ParentForm fields={fields} setField={setField} fieldErrors={fieldErrors} />}

              {/* Terms */}
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
                    <a href="#" className="text-xs font-semibold text-primary hover:underline underline-offset-2">보기</a>
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
                    <a href="#" className="text-xs font-semibold text-primary hover:underline underline-offset-2">보기</a>
                  </div>
                  <FieldError message={fieldErrors.privacyAgreed} />
                </div>
              </div>

              {error && <p className="text-sm text-error">{error}</p>}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dim text-on-primary font-bold py-4 rounded-xl transition-all duration-200 active:scale-[0.98] mt-4 text-base flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    처리 중...
                  </>
                ) : (
                  <>
                    가입 신청하기
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </>
                )}
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

function TeacherForm({ fields, setField, fieldErrors }: FormProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>성명</label>
          <input className={INPUT_CLASS} type="text" placeholder="홍길동" value={fields.name} onChange={setField('name')} />
          <FieldError message={fieldErrors.name} />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>소속 학교</label>
          <SchoolSelect value={fields.school} onChange={setField('school')} error={fieldErrors.school} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>이메일</label>
          <input className={INPUT_CLASS} type="text" placeholder="example@school.kr" autoComplete="email" value={fields.email} onChange={setField('email')} />
          <FieldError message={fieldErrors.email} />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>사번/교원번호</label>
          <input className={INPUT_CLASS} type="text" placeholder="예: T20240001" value={fields.schoolNumber} onChange={setField('schoolNumber')} />
          <FieldError message={fieldErrors.schoolNumber} />
        </div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>비밀번호</label>
          <input className={INPUT_CLASS} type="password" placeholder="8자 이상 입력" autoComplete="new-password" value={fields.password} onChange={setField('password')} />
          <FieldError message={fieldErrors.password} />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>비밀번호 확인</label>
          <input className={INPUT_CLASS} type="password" placeholder="비밀번호 재입력" autoComplete="new-password" value={fields.passwordConfirm} onChange={setField('passwordConfirm')} />
        </div>
      </div>
    </>
  )
}

function StudentForm({ fields, setField, fieldErrors }: FormProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>성명</label>
          <input className={INPUT_CLASS} type="text" placeholder="성명을 입력하세요" value={fields.name} onChange={setField('name')} />
          <FieldError message={fieldErrors.name} />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>소속 학교</label>
          <SchoolSelect value={fields.school} onChange={setField('school')} error={fieldErrors.school} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>이메일</label>
          <input className={INPUT_CLASS} type="text" placeholder="example@school.kr" autoComplete="email" value={fields.email} onChange={setField('email')} />
          <FieldError message={fieldErrors.email} />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>학번</label>
          <input className={INPUT_CLASS} type="text" placeholder="예: 202401001" value={fields.schoolNumber} onChange={setField('schoolNumber')} />
          <FieldError message={fieldErrors.schoolNumber} />
        </div>
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
          <label className={LABEL_CLASS}>비밀번호</label>
          <input className={INPUT_CLASS} type="password" placeholder="8자 이상 입력" autoComplete="new-password" value={fields.password} onChange={setField('password')} />
          <FieldError message={fieldErrors.password} />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>비밀번호 확인</label>
          <input className={INPUT_CLASS} type="password" placeholder="비밀번호 재입력" autoComplete="new-password" value={fields.passwordConfirm} onChange={setField('passwordConfirm')} />
        </div>
      </div>
    </>
  )
}

function ParentForm({ fields, setField, fieldErrors }: FormProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>성명</label>
          <input className={INPUT_CLASS} type="text" placeholder="홍길동" value={fields.name} onChange={setField('name')} />
          <FieldError message={fieldErrors.name} />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>이메일</label>
          <input className={INPUT_CLASS} type="text" placeholder="example@email.com" autoComplete="email" value={fields.email} onChange={setField('email')} />
          <FieldError message={fieldErrors.email} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>비밀번호</label>
          <input className={INPUT_CLASS} type="password" placeholder="••••••••" autoComplete="new-password" value={fields.password} onChange={setField('password')} />
          <FieldError message={fieldErrors.password} />
        </div>
        <div className="space-y-1">
          <label className={LABEL_CLASS}>비밀번호 확인</label>
          <input className={INPUT_CLASS} type="password" placeholder="••••••••" autoComplete="new-password" value={fields.passwordConfirm} onChange={setField('passwordConfirm')} />
        </div>
      </div>
      <div className="space-y-4 pt-2">
        <div>
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider ml-1">자녀 정보</p>
          <p className="text-xs text-on-surface-variant ml-1 mt-1">자녀의 학교와 학번을 입력하면 자동으로 연결됩니다.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className={LABEL_CLASS}>자녀 소속 학교</label>
            <SchoolSelect value={fields.childSchool} onChange={setField('childSchool')} error={fieldErrors.childSchool} />
          </div>
          <div className="space-y-1">
            <label className={LABEL_CLASS}>자녀 학번</label>
            <input className={INPUT_CLASS} type="text" placeholder="예: 202401001" value={fields.childSchoolNumber} onChange={setField('childSchoolNumber')} />
            <FieldError message={fieldErrors.childSchoolNumber} />
          </div>
        </div>
      </div>
    </>
  )
}
