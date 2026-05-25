import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import type { SchoolType, UserRole, KakaoRegisterRequest } from '@/types'

export type SelectableRole = 'TEACHER' | 'STUDENT' | 'PARENT'

const ROLE_ROUTES: Record<UserRole, string> = {
  TEACHER: '/dashboard',
  STUDENT: '/student/grades',
  PARENT: '/parent/grades',
  ADMIN: '/admin',
}

export interface OAuthFormFields {
  email: string
  school: SchoolType | ''
  grade: string
  classNum: string
  number: string
  childEmail: string
}

const INITIAL_FIELDS_BASE: Omit<OAuthFormFields, 'email'> = {
  school: '',
  grade: '',
  classNum: '',
  number: '',
  childEmail: '',
}

function buildPayload(
  tempToken: string,
  role: SelectableRole,
  fields: OAuthFormFields,
  termsAgreed: boolean,
  privacyAgreed: boolean,
): KakaoRegisterRequest {
  const base: KakaoRegisterRequest = {
    tempToken,
    role,
    termsAgreed,
    privacyAgreed,
    ...(fields.email ? { email: fields.email } : {}),
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
      },
    }
  }
  return {
    ...base,
    parentInfo: { childEmail: fields.childEmail },
  }
}

function resolveErrorMessage(data?: { code?: string; message?: string }): string {
  if (data?.code === 'DUPLICATED_USER') return '이미 가입된 계정입니다. 일반 로그인으로 시도해 주세요.'
  if (data?.code === 'INVALID_TEMP_TOKEN') return '인증 정보가 만료되었습니다. 다시 로그인해 주세요.'
  if (data?.code === 'OAUTH_EMAIL_REQUIRED') return '이메일을 입력해 주세요.'
  if (data?.code === 'OAUTH_ROLE_INFO_REQUIRED') return '역할에 해당하는 정보를 모두 입력해 주세요.'
  return data?.message ?? '회원가입에 실패했습니다.'
}

export function useOAuthCompleteForm(tempToken: string, initialEmail = '') {
  const navigate = useNavigate()
  const { oauthRegister } = useAuth()

  const [role, setRole] = useState<SelectableRole | null>(null)
  const [fields, setFields] = useState<OAuthFormFields>({
    ...INITIAL_FIELDS_BASE,
    email: initialEmail,
  })
  const [termsChecked, setTermsChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const setField =
    (key: keyof OAuthFormFields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    if (!role) {
      setError('역할을 선택해 주세요.')
      return
    }
    setIsLoading(true)
    try {
      const payload = buildPayload(tempToken, role, fields, termsChecked, privacyChecked)
      const user = await oauthRegister(payload)
      navigate(ROLE_ROUTES[user.role], { replace: true })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string>; code?: string } } }
      const data = axiosErr.response?.data
      if (data?.errors) {
        setFieldErrors(data.errors)
      } else {
        setError(resolveErrorMessage(data))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
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
  }
}
