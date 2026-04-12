import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import {
  fetchFeedbacks,
  createFeedback,
  updateFeedback,
  deleteFeedback,
  patchFeedbackVisibility,
} from '@/api/feedback'
import type { FeedbackCategory, FeedbackRequest, Feedback, ModalMode, DeleteState } from '@/types'

type CategoryFilter = FeedbackCategory | 'ALL'

function toFeedbackRequest(fb: Feedback): FeedbackRequest {
  return {
    category: fb.category,
    date: fb.date,
    content: fb.content,
    studentVisible: fb.studentVisible,
    parentVisible: fb.parentVisible,
  }
}

const INITIAL_FORM: FeedbackRequest = {
  category: 'GRADE',
  date: new Date().toISOString().slice(0, 10),
  content: '',
  studentVisible: false,
  parentVisible: false,
}

export function useFeedbackPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const id = Number(studentId)
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL')
  const [modalMode, setModalMode] = useState<ModalMode>({ type: 'closed' })
  const [deleteState, setDeleteState] = useState<DeleteState>({ type: 'idle' })
  const [form, setForm] = useState<FeedbackRequest>(INITIAL_FORM)

  const { data: allFeedbacks = [], isLoading } = useQuery({
    queryKey: ['feedbacks', id],
    queryFn: () => fetchFeedbacks(id),
    enabled: !!id,
  })

  const feedbacks =
    categoryFilter === 'ALL'
      ? allFeedbacks
      : allFeedbacks.filter((f) => f.category === categoryFilter)

  const createMutation = useMutation({
    mutationFn: (body: FeedbackRequest) => createFeedback(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks', id] })
      setModalMode({ type: 'closed' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ feedbackId, body }: { feedbackId: number; body: FeedbackRequest }) =>
      updateFeedback(id, feedbackId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks', id] })
      setModalMode({ type: 'closed' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (feedbackId: number) => deleteFeedback(id, feedbackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks', id] })
      setDeleteState({ type: 'idle' })
    },
  })

  const visibilityMutation = useMutation({
    mutationFn: ({
      feedbackId,
      studentVisible,
      parentVisible,
    }: {
      feedbackId: number
      studentVisible: boolean
      parentVisible: boolean
    }) => patchFeedbackVisibility(id, feedbackId, { studentVisible, parentVisible }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks', id] })
    },
  })

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending ||
    visibilityMutation.isPending

  const isOwner = (teacherId: number) => user?.id === teacherId

  const handleOpenAdd = () => {
    setForm({ ...INITIAL_FORM, date: new Date().toISOString().slice(0, 10) })
    setModalMode({ type: 'adding' })
  }

  const handleOpenEdit = (feedbackId: number) => {
    const fb = allFeedbacks.find((f) => f.id === feedbackId)
    if (!fb) return
    setForm(toFeedbackRequest(fb))
    setModalMode({ type: 'editing', id: feedbackId })
  }

  const handleCloseModal = () => setModalMode({ type: 'closed' })

  const handleFormChange = (field: keyof FeedbackRequest, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleModalSave = () => {
    if (modalMode.type === 'adding') {
      createMutation.mutate(form)
    } else if (modalMode.type === 'editing') {
      updateMutation.mutate({ feedbackId: modalMode.id, body: form })
    }
  }

  const handleStartDelete = (feedbackId: number) =>
    setDeleteState({ type: 'confirming', id: feedbackId })

  const handleCancelDelete = () => setDeleteState({ type: 'idle' })

  const handleConfirmDelete = () => {
    if (deleteState.type !== 'confirming') return
    deleteMutation.mutate(deleteState.id)
  }

  const handleToggleVisibility = (
    feedbackId: number,
    studentVisible: boolean,
    parentVisible: boolean,
  ) => {
    visibilityMutation.mutate({ feedbackId, studentVisible, parentVisible })
  }

  return {
    feedbacks,
    isLoading,
    categoryFilter,
    setCategoryFilter,
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
    handleToggleVisibility,
  }
}
