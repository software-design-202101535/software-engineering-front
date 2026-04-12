import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchStudent, updateStudent } from '@/api/students'
import type { UpdateStudentRequest } from '@/types'

type Mode = 'read' | 'edit'

export function useStudentInfo() {
  const { studentId } = useParams<{ studentId: string }>()
  const sid = Number(studentId)
  const queryClient = useQueryClient()

  const [mode, setMode] = useState<Mode>('read')
  const [form, setForm] = useState<UpdateStudentRequest>({ name: '' })

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', sid],
    queryFn: () => fetchStudent(sid),
    enabled: !!sid,
  })

  const mutation = useMutation({
    mutationFn: (body: UpdateStudentRequest) => updateStudent(sid, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(['student', sid], updated)
      setMode('read')
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
    setMode('edit')
  }

  const handleCancel = () => {
    setMode('read')
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    mutation.mutate(form)
  }

  const handleChange = (field: keyof UpdateStudentRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return {
    student,
    isLoading,
    mode,
    form,
    isSaving: mutation.isPending,
    handleEdit,
    handleCancel,
    handleSave,
    handleChange,
  }
}
