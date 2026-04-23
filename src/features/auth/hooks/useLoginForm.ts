import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import type { UserRole, SchoolType } from '@/types'

export type LoginRole = 'TEACHER' | 'STUDENT' | 'PARENT'

export function useLoginForm() {
  const [activeRole, setActiveRole] = useState<LoginRole>('TEACHER')
  const [school, setSchool] = useState<SchoolType | ''>('')
  const [schoolNumber, setSchoolNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleRoleChange = (role: LoginRole) => {
    setActiveRole(role)
    setSchool('')
    setSchoolNumber('')
    setEmail('')
    setPassword('')
    setError('')
    setShowPassword(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setIsLoading(true)
    try {
      if (activeRole === 'PARENT') {
        await login({ role: 'PARENT', email, password })
      } else {
        await login({ role: activeRole, school: school as SchoolType, schoolNumber, password })
      }
      const saved = localStorage.getItem('user')
      const user = saved ? (JSON.parse(saved) as { role: UserRole }) : null
      const roleRoutes: Record<UserRole, string> = {
        TEACHER: '/dashboard',
        STUDENT: '/student/grades',
        PARENT: '/parent/grades',
        ADMIN: '/admin',
      }
      navigate(user ? roleRoutes[user.role] : '/dashboard')
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string> } } }
      const data = axiosErr.response?.data
      if (data?.errors) {
        setFieldErrors(data.errors)
      } else {
        setError(data?.message ?? '로그인에 실패하였습니다.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return {
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
    toggleShowPassword: () => setShowPassword((v) => !v),
  }
}
