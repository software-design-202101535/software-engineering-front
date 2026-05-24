import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import type { SchoolType, UserRole, OAuthCompleteRequest } from '@/types'

export type SelectableRole = 'TEACHER' | 'STUDENT' | 'PARENT'

const ROLE_ROUTES: Record<UserRole, string> = {
  TEACHER: '/dashboard',
  STUDENT: '/student/grades',
  PARENT: '/parent/grades',
  ADMIN: '/admin',
}

export interface OAuthFormFields {
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

const INITIAL_FIELDS: OAuthFormFields = {
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

function buildPayload(
  authCode: string,
  role: SelectableRole,
  fields: OAuthFormFields,
  termsAgreed: boolean,
  privacyAgreed: boolean,
): OAuthCompleteRequest {
  const base = { authCode, role, termsAgreed, privacyAgreed }
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

function resolveErrorMessage(data?: { code?: string; message?: string }): string {
  if (data?.code === 'EMAIL_ALREADY_EXISTS') return '이미 가입된 이메일입니다. 일반 로그인으로 시도해 주세요.'
  if (data?.code === 'OAUTH_INVALID_AUTHCODE') return '인증 코드가 만료되었습니다. 다시 로그인해 주세요.'
  return data?.message ?? '회원가입에 실패했습니다.'
}

export function useOAuthCompleteForm(authCode: string) {
  const navigate = useNavigate()
  const { completeOAuth } = useAuth()

  const [role, setRole] = useState<SelectableRole | null>(null)
  const [fields, setFields] = useState<OAuthFormFields>(INITIAL_FIELDS)
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
      const payload = buildPayload(authCode, role, fields, termsChecked, privacyChecked)
      const user = await completeOAuth(payload)
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
