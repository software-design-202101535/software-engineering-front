import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchStudent, updateStudent } from '@/api/students'
import type { UpdateStudentRequest } from '@/types'

type Mode = 'read' | 'edit'

type AxiosErrorShape = {
  response?: { data?: { errors?: Record<string, string>; message?: string } }
}

export function useStudentInfo() {
  const { studentId } = useParams<{ studentId: string }>()
  const sid = Number(studentId)
  const queryClient = useQueryClient()

  const [mode, setMode] = useState<Mode>('read')
  const [form, setForm] = useState<UpdateStudentRequest>({ name: '' })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', sid],
    queryFn: () => fetchStudent(sid),
    enabled: !!sid,
  })

  const mutation = useMutation({
    mutationFn: (body: UpdateStudentRequest) => updateStudent(sid, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(['student', sid], updated)
      setFieldErrors({})
      setMode('read')
    },
    onError: (err: unknown) => {
      const data = (err as AxiosErrorShape).response?.data
      if (data?.errors) {
        setFieldErrors(data.errors)
      } else {
        setFieldErrors({ _global: data?.message ?? '저장에 실패했습니다. 다시 시도해 주세요.' })
      }
    },
  })

  const handleEdit = () => {
    if (!student) return
    setForm({
      name: student.name,
      birthDate: student.birthDate ?? '',
      phone: student.phone ?? '',
      parentPhone: student.parentPhone ?? '',
      address: student.address ?? '',
    })
    setFieldErrors({})
    setMode('edit')
  }

  const handleCancel = () => {
    setFieldErrors({})
    setMode('read')
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    mutation.mutate(form)
  }

  const handleChange = (field: keyof UpdateStudentRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  return {
    student,
    isLoading,
    mode,
    form,
    isSaving: mutation.isPending,
    fieldErrors,
    handleEdit,
    handleCancel,
    handleSave,
    handleChange,
  }
}
