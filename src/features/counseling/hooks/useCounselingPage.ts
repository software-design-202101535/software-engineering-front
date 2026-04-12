import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import {
  fetchCounselings,
  createCounseling,
  updateCounseling,
  deleteCounseling,
  patchCounselingShare,
} from '@/api/counseling'
import type { CounselingRequest, Counseling, ModalMode, DeleteState } from '@/types'

function toCounselingRequest(c: Counseling): CounselingRequest {
  return {
    counselingDate: c.counselingDate,
    content: c.content,
    nextDate: c.nextDate ?? '',
    sharedWithTeachers: c.sharedWithTeachers,
  }
}

const INITIAL_FORM: CounselingRequest = {
  counselingDate: new Date().toISOString().slice(0, 10),
  content: '',
  nextDate: '',
  sharedWithTeachers: false,
}

export function useCounselingPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const id = Number(studentId)
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState<number>(currentYear)
  const [month, setMonth] = useState<number>(0) // 0 = 전체
  const [search, setSearch] = useState('')
  const [modalMode, setModalMode] = useState<ModalMode>({ type: 'closed' })
  const [deleteState, setDeleteState] = useState<DeleteState>({ type: 'idle' })
  const [form, setForm] = useState<CounselingRequest>(INITIAL_FORM)

  const { data: allCounselings = [], isLoading } = useQuery({
    queryKey: ['counselings', id, year, month],
    queryFn: () =>
      fetchCounselings(id, {
        year,
        ...(month > 0 ? { month } : {}),
      }),
    enabled: !!id,
  })

  const counselings = search.trim()
    ? allCounselings.filter((c) => c.content.includes(search.trim()))
    : allCounselings

  const createMutation = useMutation({
    mutationFn: (body: CounselingRequest) => createCounseling(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselings', id] })
      setModalMode({ type: 'closed' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ counselingId, body }: { counselingId: number; body: CounselingRequest }) =>
      updateCounseling(id, counselingId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselings', id] })
      setModalMode({ type: 'closed' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (counselingId: number) => deleteCounseling(id, counselingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselings', id] })
      setDeleteState({ type: 'idle' })
    },
  })

  const shareMutation = useMutation({
    mutationFn: ({
      counselingId,
      sharedWithTeachers,
    }: {
      counselingId: number
      sharedWithTeachers: boolean
    }) => patchCounselingShare(id, counselingId, { sharedWithTeachers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['counselings', id] })
    },
  })

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    shareMutation.isPending

  const isOwner = (teacherId: number) => user?.id === teacherId

  const handleOpenAdd = () => {
    setForm({ ...INITIAL_FORM, counselingDate: new Date().toISOString().slice(0, 10) })
    setModalMode({ type: 'adding' })
  }

  const handleOpenEdit = (counselingId: number) => {
    const c = allCounselings.find((item) => item.id === counselingId)
    if (!c) return
    setForm(toCounselingRequest(c))
    setModalMode({ type: 'editing', id: counselingId })
  }

  const handleCloseModal = () => setModalMode({ type: 'closed' })

  const handleFormChange = (field: keyof CounselingRequest, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleModalSave = () => {
    const body: CounselingRequest = {
      ...form,
      nextDate: form.nextDate || undefined,
    }
    if (modalMode.type === 'adding') {
      createMutation.mutate(body)
    } else if (modalMode.type === 'editing') {
      updateMutation.mutate({ counselingId: modalMode.id, body })
    }
  }

  const handleStartDelete = (counselingId: number) =>
    setDeleteState({ type: 'confirming', id: counselingId })

  const handleCancelDelete = () => setDeleteState({ type: 'idle' })

  const handleConfirmDelete = () => {
    if (deleteState.type !== 'confirming') return
    deleteMutation.mutate(deleteState.id)
  }

  const handleToggleShare = (counselingId: number, sharedWithTeachers: boolean) => {
    shareMutation.mutate({ counselingId, sharedWithTeachers })
  }

  return {
    counselings,
    isLoading,
    year,
    setYear,
    month,
    setMonth,
    search,
    setSearch,
    modalMode,
    deleteState,
    form,
    isMutating,
    isOwner,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    handleFormChange,
    handleModalSave,
    handleStartDelete,
    handleCancelDelete,
    handleConfirmDelete,
    handleToggleShare,
  }
}
