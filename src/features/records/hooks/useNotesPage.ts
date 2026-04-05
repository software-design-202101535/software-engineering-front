import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchNotes, createNote, updateNote, deleteNote } from '@/api/notes'
import type { NoteCategory, NoteRequest } from '@/types'

type ModalMode =
  | { type: 'closed' }
  | { type: 'adding' }
  | { type: 'editing'; id: number }

type DeleteState = { type: 'idle' } | { type: 'confirming'; id: number }

const EMPTY_FORM: NoteRequest = { category: 'ACHIEVEMENT', content: '', date: '' }

export function useNotesPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const sid = Number(studentId)
  const queryClient = useQueryClient()

  const [categoryFilter, setCategoryFilter] = useState<NoteCategory | 'ALL'>('ALL')
  const [modalMode, setModalMode] = useState<ModalMode>({ type: 'closed' })
  const [deleteState, setDeleteState] = useState<DeleteState>({ type: 'idle' })
  const [form, setForm] = useState<NoteRequest>(EMPTY_FORM)

  const queryKey = ['notes', sid, categoryFilter]

  const { data: notes = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchNotes(sid, categoryFilter === 'ALL' ? undefined : categoryFilter),
    enabled: !!sid,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['notes', sid] })

  const createMutation = useMutation({
    mutationFn: (body: NoteRequest) => createNote(sid, body),
    onSuccess: () => { invalidate(); setModalMode({ type: 'closed' }) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: NoteRequest }) => updateNote(sid, id, body),
    onSuccess: () => { invalidate(); setModalMode({ type: 'closed' }) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteNote(sid, id),
    onSuccess: () => { invalidate(); setDeleteState({ type: 'idle' }) },
  })

  const handleOpenAdd = () => {
    setForm(EMPTY_FORM)
    setModalMode({ type: 'adding' })
  }

  const handleOpenEdit = (id: number) => {
    const note = notes.find((n) => n.id === id)
    if (!note) return
    setForm({ category: note.category, content: note.content, date: note.date })
    setModalMode({ type: 'editing', id })
  }

  const handleCloseModal = () => {
    setModalMode({ type: 'closed' })
  }

  const handleModalSave = () => {
    if (!form.category || !form.content.trim() || !form.date) return
    if (modalMode.type === 'adding') {
      createMutation.mutate(form)
    } else if (modalMode.type === 'editing') {
      updateMutation.mutate({ id: modalMode.id, body: form })
    }
  }

  const handleFormChange = (field: keyof NoteRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleStartDelete = (id: number) => {
    setDeleteState({ type: 'confirming', id })
  }

  const handleCancelDelete = () => {
    setDeleteState({ type: 'idle' })
  }

  const handleConfirmDelete = () => {
    if (deleteState.type !== 'confirming') return
    deleteMutation.mutate(deleteState.id)
  }

  const isMutating =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  return {
    notes,
    isLoading,
    categoryFilter,
    setCategoryFilter,
    modalMode,
    deleteState,
    form,
    isMutating,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    handleModalSave,
    handleFormChange,
    handleStartDelete,
    handleCancelDelete,
    handleConfirmDelete,
  }
}
