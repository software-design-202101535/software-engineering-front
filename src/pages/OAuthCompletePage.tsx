import { useSearchParams, Link } from 'react-router-dom'
import {
  useOAuthCompleteForm,
  type OAuthFormFields,
  type SelectableRole,
} from '@/features/auth'
import { AuthLayout } from '@/layouts/AuthLayout'
import { SCHOOLS } from '@/types'

const ROLE_LABEL: Record<SelectableRole, string> = {
  TEACHER: '교사',
  STUDENT: '학생',
  PARENT: '학부모',
}

const INPUT_CLASS =
  'w-full bg-surface-container-low border-0 border-b-2 border-primary-fixed-dim focus:ring-0 focus:border-primary px-4 py-3 text-sm transition-all outline-none rounded-t-lg placeholder:text-outline-variant/60'

const SELECT_CLASS =
  'w-full bg-surface-container-low border-0 border-b-2 border-primary-fixed-dim focus:ring-0 focus:border-primary px-4 py-3 text-sm transition-all outline-none rounded-t-lg appearance-none'

const LABEL_CLASS =
  'block text-[0.75rem] font-semibold text-on-surface-variant uppercase tracking-wider ml-1'

export function OAuthCompletePage() {
  const [searchParams] = useSearchParams()
  const authCode = searchParams.get('authCode')
  const email = searchParams.get('email') ?? ''
  const name = searchParams.get('name') ?? ''

  if (!authCode) return <MissingAuthCode />

  return <OAuthCompleteForm authCode={authCode} email={email} name={name} />
}

function MissingAuthCode() {
  return (
    <AuthLayout>
      <main className="flex-grow flex items-center justify-center p-6">
        <div
          className="w-full max-w-md p-10 text-center space-y-4 bg-white rounded-xl"
          style={{ boxShadow: '0 16px 32px rgba(40,52,57,0.06)' }}
        >
          <span className="material-symbols-outlined text-error text-5xl">error</span>
          <h1 className="font-headline text-xl font-bold text-on-surface">인증 정보 없음</h1>
          <p className="text-sm text-on-surface-variant">
            인증 코드가 유실되었습니다. 로그인부터 다시 시도해 주세요.
          </p>
          <Link to="/login" className="inline-block w-full bg-primary text-white font-bold py-3 rounded-lg">
            로그인 화면으로
          </Link>
        </div>
      </main>
    </AuthLayout>
  )
}

interface FormProps {
  authCode: string
  email: string
  name: string
}

function OAuthCompleteForm({ authCode, email, name }: FormProps) {
  const {
    role,
    fields,
    termsChecked,
    privacyChecked,
    error,
    fieldErrors,
    isLoading,
    setRole,
    setField,
    setTermsChecked,
    setPrivacyChecked,
    handleSubmit,
  } = useOAuthCompleteForm(authCode)

  return (
    <AuthLayout>
      <main className="flex-grow flex items-center justify-center px-6 py-12 md:py-16">
        <div
          className="w-full max-w-lg overflow-hidden rounded-xl bg-surface-container-lowest"
          style={{ boxShadow: '0 32px 64px -12px rgba(40,52,57,0.06)' }}
        >
          <div className="p-8 md:p-10 space-y-8">
            <Heading email={email} name={name} />

            <RoleSelector role={role} onSelect={setRole} error={fieldErrors.role} />

            {role && (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                {role === 'TEACHER' && <TeacherFormFields fields={fields} setField={setField} fieldErrors={fieldErrors} />}
                {role === 'STUDENT' && <StudentFormFields fields={fields} setField={setField} fieldErrors={fieldErrors} />}
                {role === 'PARENT' && <ParentFormFields fields={fields} setField={setField} fieldErrors={fieldErrors} />}

                <TermsCheckboxes
                  termsChecked={termsChecked}
                  privacyChecked={privacyChecked}
                  termsError={fieldErrors.termsAgreed}
                  privacyError={fieldErrors.privacyAgreed}
                  onTermsChange={setTermsChecked}
                  onPrivacyChange={setPrivacyChecked}
                />

                {error && <p className="text-sm text-error">{error}</p>}

                <SubmitButton isLoading={isLoading} />
              </form>
            )}
          </div>
        </div>
      </main>
    </AuthLayout>
  )
}

function Heading({ email, name }: { email: string; name: string }) {
  return (
    <div className="text-center space-y-2">
      <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">추가 정보 입력</h2>
      <p className="text-sm text-on-surface-variant">
        {name && <span className="font-semibold text-on-surface">{name}</span>}
        {name && '님, '}카카오 인증이 완료되었습니다. 역할과 학교 정보를 입력해 주세요.
      </p>
      {email && <p className="text-xs text-on-surface-variant">연결된 이메일: {email}</p>}
    </div>
  )
}

function RoleSelector({
  role,
  onSelect,
  error,
}: {
  role: SelectableRole | null
  onSelect: (r: SelectableRole) => void
  error?: string
}) {
  return (
    <div className="space-y-2">
      <p className={LABEL_CLASS}>역할 선택</p>
      <div className="grid grid-cols-3 gap-3">
        {(['TEACHER', 'STUDENT', 'PARENT'] as SelectableRole[]).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onSelect(r)}
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
      <FieldError message={error} />
    </div>
  )
}

function TermsCheckboxes({
  termsChecked,
  privacyChecked,
  termsError,
  privacyError,
  onTermsChange,
  onPrivacyChange,
}: {
  termsChecked: boolean
  privacyChecked: boolean
  termsError?: string
  privacyError?: string
  onTermsChange: (v: boolean) => void
  onPrivacyChange: (v: boolean) => void
}) {
  return (
    <div className="space-y-3 pt-2">
      <TermsRow
        label="[필수] 이용약관에 동의합니다"
        checked={termsChecked}
        onChange={onTermsChange}
        error={termsError}
      />
      <TermsRow
        label="[필수] 개인정보 처리방침에 동의합니다"
        checked={privacyChecked}
        onChange={onPrivacyChange}
        error={privacyError}
      />
    </div>
  )
}

function TermsRow({
  label,
  checked,
  onChange,
  error,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  error?: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 rounded border-outline-variant/30 text-primary focus:ring-primary/20 cursor-pointer"
          />
          <span className="text-sm text-on-surface-variant">{label}</span>
        </label>
        <a href="#" className="text-xs font-semibold text-primary hover:underline">보기</a>
      </div>
      <FieldError message={error} />
    </div>
  )
}

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
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
  )
}

interface FieldsProps {
  fields: OAuthFormFields
  setField: (key: keyof OAuthFormFields) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
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

function TeacherFormFields({ fields, setField, fieldErrors }: FieldsProps) {
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

function StudentFormFields({ fields, setField, fieldErrors }: FieldsProps) {
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

function ParentFormFields({ fields, setField, fieldErrors }: FieldsProps) {
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
