import { useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { batchGrades } from '@/api/grades'
import { useGrades, useBatchGrades } from './useGrades'
import { useClassStudents } from '@/features/students'
import { calculateAverage } from '@/utils/gradeUtils'
import type { ExamType, SubjectCode, StudentSummary, Grade } from '@/types'
import { SUBJECT_LABEL } from '@/types'
import type { TableMode } from '../components/GradeTable'

type SubTab = 'list' | 'chart'
type BulkTarget = 'class' | 'selected'

type PendingCreate = {
  tempId: number
  subject: SubjectCode
  score: number | null
}

function buildUpdateItems(
  editedScores: Record<number, string>,
  grades: Grade[],
) {
  return Object.entries(editedScores)
    .filter(([idStr, val]) => Number(idStr) > 0 && val.trim() !== '' && !isNaN(Number(val)))
    .map(([idStr, val]) => {
      const grade = grades.find((g) => g.id === Number(idStr))!
      return { id: Number(idStr), subject: grade.subject, score: Number(val) }
    })
}

export function useGradePage() {
  const { studentId } = useParams<{ studentId: string }>()
  const sid = Number(studentId)
  const queryClient = useQueryClient()
  const tempIdRef = useRef(-1)

  const [semester, setSemester] = useState('2026-1')
  const [examType, setExamType] = useState<ExamType>('MIDTERM')
  const [subTab, setSubTab] = useState<SubTab>('list')
  const [tableMode, setTableMode] = useState<TableMode>('read')
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [editedScores, setEditedScores] = useState<Record<number, string>>({})
  const [newSubject, setNewSubject] = useState<SubjectCode | ''>('')
  const [newScore, setNewScore] = useState('')
  const [bulkTarget, setBulkTarget] = useState<BulkTarget | null>(null)
  const [isApplyOpen, setIsApplyOpen] = useState(false)
  const [pendingDeletes, setPendingDeletes] = useState<number[]>([])
  const [pendingCreates, setPendingCreates] = useState<PendingCreate[]>([])

  const batchMutation = useBatchGrades(sid)

  const { data: grades = [] } = useGrades(sid, { semester, examType })
  const { data: classStudents = [] } = useClassStudents()
  const student = classStudents.find((s) => s.id === sid)

  const displayGrades: Grade[] = [
    ...grades.filter((g) => !pendingDeletes.includes(g.id)),
    ...pendingCreates.map((c) => ({
      id: c.tempId,
      subject: c.subject,
      score: c.score,
      grade: null as Grade['grade'],
    })),
  ]

  const avg = calculateAverage(displayGrades)
  const radarData = displayGrades.map((g) => ({ subject: SUBJECT_LABEL[g.subject] ?? g.subject, score: g.score }))

  const resetPendingState = () => {
    setEditedScores({})
    setPendingDeletes([])
    setPendingCreates([])
    setNewSubject('')
    setNewScore('')
  }

  const handleSemesterChange = (v: string) => {
    setSemester(v)
    setTableMode('read')
    resetPendingState()
  }

  const handleExamTypeChange = (v: ExamType) => {
    setExamType(v)
    setTableMode('read')
    resetPendingState()
  }

  const handleEdit = () => {
    resetPendingState()
    setTableMode('edit')
  }

  const handleSave = async () => {
    if (batchMutation.isPending) return
    const update = buildUpdateItems(editedScores, grades)
    const create = pendingCreates.map((c) => ({ subject: c.subject, score: c.score }))
    const del = pendingDeletes

    if (update.length > 0 || create.length > 0 || del.length > 0) {
      await batchMutation.mutateAsync({
        semester,
        examType,
        ...(update.length > 0 && { update }),
        ...(create.length > 0 && { create }),
        ...(del.length > 0 && { delete: del }),
      })
    }
    setTableMode('read')
    resetPendingState()
  }

  const handleCancel = () => {
    setTableMode('read')
    resetPendingState()
  }

  const handleDelete = (id: number) => {
    if (id < 0) {
      setPendingCreates((prev) => prev.filter((c) => c.tempId !== id))
    } else {
      setPendingDeletes((prev) => [...prev, id])
    }
  }

  const handleScoreChange = (id: number, val: string) => {
    if (id < 0) {
      setPendingCreates((prev) =>
        prev.map((c) => c.tempId === id ? { ...c, score: val === '' ? null : Number(val) } : c),
      )
    } else {
      setEditedScores((prev) => ({ ...prev, [id]: val }))
    }
  }

  const handleConfirmAdd = () => {
    if (!newSubject.trim() || !newScore) return
    const tempId = tempIdRef.current--
    setPendingCreates((prev) => [
      ...prev,
      { tempId, subject: newSubject as SubjectCode, score: Number(newScore) },
    ])
    setNewSubject('')
    setNewScore('')
    setTableMode('edit')
  }

  const handleCancelAdd = () => {
    setNewSubject('')
    setNewScore('')
    setTableMode('edit')
  }

  const handleBulkConfirm = async (subjects: string[]) => {
    const targets = bulkTarget === 'class'
      ? classStudents.map((s: StudentSummary) => s.id)
      : selectedIds

    await Promise.all(
      targets.map((targetStudentId) =>
        batchGrades(targetStudentId, {
          semester,
          examType,
          create: subjects.map((subject) => ({ subject: subject as SubjectCode, score: null })),
        }),
      ),
    )
    await queryClient.invalidateQueries({ queryKey: ['grades'] })
    setBulkTarget(null)
    setIsSelecting(false)
    setSelectedIds([])
  }

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }


  const handleToggleSelecting = () => {
    setIsSelecting((v) => !v)
    setSelectedIds([])
  }

  return {
    sid,
    student,
    grades: displayGrades,
    classStudents,
    avg,
    radarData,
    semester,
    examType,
    subTab,
    tableMode,
    isSelecting,
    selectedIds,
    editedScores,
    newSubject,
    newScore,
    bulkTarget,
    isApplyOpen,
    isSaving: batchMutation.isPending,
    setSubTab,
    setTableMode,
    setBulkTarget,
    setIsApplyOpen,
    setNewSubject,
    setNewScore,
    handleSemesterChange,
    handleExamTypeChange,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleScoreChange,
    handleConfirmAdd,
    handleCancelAdd,
    handleBulkConfirm,
    handleToggleSelect,
    handleToggleSelecting,
  }
}
