import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from '@/api/attendance'
import type { AttendanceRequest } from '@/types'

type InlineMode =
  | { type: 'idle' }
  | { type: 'adding' }
  | { type: 'editing'; id: number }
  | { type: 'deleting'; id: number }

const now = new Date()

export function useAttendancePage() {
  const { studentId } = useParams<{ studentId: string }>()
  const sid = Number(studentId)
  const queryClient = useQueryClient()

  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [inlineMode, setInlineMode] = useState<InlineMode>({ type: 'idle' })
  const [form, setForm] = useState<AttendanceRequest>({ date: '', status: 'ABSENT' })

  const queryKey = ['attendance', sid, year, month]

  const { data: records = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchAttendance(sid, year, month),
    enabled: !!sid,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey })

  const createMutation = useMutation({
    mutationFn: (body: AttendanceRequest) => createAttendance(sid, body),
    onSuccess: () => { invalidate(); setInlineMode({ type: 'idle' }) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: AttendanceRequest }) =>
      updateAttendance(sid, id, body),
    onSuccess: () => { invalidate(); setInlineMode({ type: 'idle' }) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAttendance(sid, id),
    onSuccess: () => { invalidate(); setInlineMode({ type: 'idle' }) },
  })

  const summary = {
    absent: records.filter((r) => r.status === 'ABSENT').length,
    late: records.filter((r) => r.status === 'LATE').length,
    earlyLeave: records.filter((r) => r.status === 'EARLY_LEAVE').length,
    sick: records.filter((r) => r.status === 'SICK').length,
  }

  const handleStartAdd = () => {
    setForm({ date: '', status: 'ABSENT' })
    setInlineMode({ type: 'adding' })
  }

  const handleStartEdit = (id: number) => {
    const record = records.find((r) => r.id === id)
    if (!record) return
    setForm({ date: record.date, status: record.status as AttendanceRequest['status'], reason: record.reason })
    setInlineMode({ type: 'editing', id })
  }

  const handleStartDelete = (id: number) => {
    setInlineMode({ type: 'deleting', id })
  }

  const handleCancel = () => {
    setInlineMode({ type: 'idle' })
  }

  const handleSave = () => {
    if (!form.date || !form.status) return
    if (inlineMode.type === 'adding') {
      createMutation.mutate(form)
    } else if (inlineMode.type === 'editing') {
      updateMutation.mutate({ id: inlineMode.id, body: form })
    }
  }

  const handleConfirmDelete = () => {
    if (inlineMode.type !== 'deleting') return
    deleteMutation.mutate(inlineMode.id)
  }

  const handleFormChange = (field: keyof AttendanceRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const isMutating =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return {
    records,
    isLoading,
    year,
    month,
    summary,
    inlineMode,
    form,
    isMutating,
    setYear,
    setMonth,
    handleStartAdd,
    handleStartEdit,
    handleStartDelete,
    handleCancel,
    handleSave,
    handleConfirmDelete,
    handleFormChange,
  }
}
