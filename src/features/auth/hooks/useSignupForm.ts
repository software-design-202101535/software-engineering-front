import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerTeacher, registerStudent, registerParent } from '@/api/auth'
import type { SchoolType } from '@/types'

export type SignupRole = 'teacher' | 'student' | 'parent'

export interface SignupFormFields {
  name: string
  email: string
  password: string
  passwordConfirm: string
  school: SchoolType | ''
  grade: string
  classNum: string
  number: string
  childEmails: string[]
}

const INITIAL_FIELDS: SignupFormFields = {
  name: '',
  email: '',
  password: '',
  passwordConfirm: '',
  school: '',
  grade: '',
  classNum: '',
  number: '',
  childEmails: [''],
}

async function submitByRole(
  role: SignupRole,
  fields: SignupFormFields,
  termsAgreed: boolean,
  privacyAgreed: boolean,
) {
  const base = {
    email: fields.email,
    password: fields.password,
    passwordConfirm: fields.passwordConfirm,
    name: fields.name,
    termsAgreed,
    privacyAgreed,
  }
  if (role === 'teacher') {
    return registerTeacher({
      ...base,
      school: fields.school as SchoolType,
      ...(fields.grade ? { grade: Number(fields.grade) } : {}),
      ...(fields.classNum ? { classNum: Number(fields.classNum) } : {}),
    })
  }
  if (role === 'student') {
    return registerStudent({
      ...base,
      school: fields.school as SchoolType,
      ...(fields.grade ? { grade: Number(fields.grade) } : {}),
      ...(fields.classNum ? { classNum: Number(fields.classNum) } : {}),
      ...(fields.number ? { number: Number(fields.number) } : {}),
    })
  }
  return registerParent({
    ...base,
    childEmails: fields.childEmails.map((s) => s.trim()).filter(Boolean),
  })
}

export function useSignupForm(role: SignupRole) {
  const navigate = useNavigate()
  const [fields, setFields] = useState<SignupFormFields>(INITIAL_FIELDS)
  const [termsChecked, setTermsChecked] = useState(false)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const setField =
    (key: Exclude<keyof SignupFormFields, 'childEmails'>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFields((prev) => ({ ...prev, [key]: e.target.value }))
    }

  const setChildEmailAt = (index: number, value: string) => {
    setFields((prev) => {
      const next = [...prev.childEmails]
      next[index] = value
      return { ...prev, childEmails: next }
    })
  }

  const addChildEmail = () => {
    setFields((prev) => ({ ...prev, childEmails: [...prev.childEmails, ''] }))
  }

  const removeChildEmailAt = (index: number) => {
    setFields((prev) => {
      if (prev.childEmails.length <= 1) return prev
      return { ...prev, childEmails: prev.childEmails.filter((_, i) => i !== index) }
    })
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
      await submitByRole(role, fields, termsChecked, privacyChecked)
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

  return {
    fields,
    termsChecked,
    privacyChecked,
    error,
    fieldErrors,
    isLoading,
    setField,
    setChildEmailAt,
    addChildEmail,
    removeChildEmailAt,
    setTermsChecked,
    setPrivacyChecked,
    handleSubmit,
  }
}
