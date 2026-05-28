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
  subject: SubjectCode | ''
  score: number | null
}

export function buildUpdateItems(
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

  const newTempId = () => tempIdRef.current--

  const [semester, setSemester] = useState('2026-1')
  const [examType, setExamType] = useState<ExamType>('MIDTERM')
  const [subTab, setSubTab] = useState<SubTab>('list')
  const [tableMode, setTableMode] = useState<TableMode>('read')
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [editedScores, setEditedScores] = useState<Record<number, string>>({})
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
      subject: (c.subject || '') as SubjectCode,
      score: c.score,
      grade: null as Grade['grade'],
    })),
  ]

  // 평균 계산 시 빈 과목(아직 선택 안된 trailing draft)은 제외
  const avg = calculateAverage(
    displayGrades.filter((g) => g.subject !== ('' as SubjectCode)),
  )
  const radarData = displayGrades
    .filter((g) => g.subject !== ('' as SubjectCode))
    .map((g) => ({ subject: SUBJECT_LABEL[g.subject] ?? g.subject, score: g.score }))

  const usedSubjects = new Set<SubjectCode>([
    ...grades.filter((g) => !pendingDeletes.includes(g.id)).map((g) => g.subject),
    ...pendingCreates
      .map((c) => c.subject)
      .filter((s): s is SubjectCode => s !== ''),
  ])

  const resetPendingState = () => {
    setEditedScores({})
    setPendingDeletes([])
    setPendingCreates([])
  }

  const initEditDrafts = () => {
    setPendingCreates([{ tempId: newTempId(), subject: '', score: null }])
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
    initEditDrafts()
    setTableMode('edit')
  }

  const handleSave = async () => {
    if (batchMutation.isPending) return
    const update = buildUpdateItems(editedScores, grades)
    const create = pendingCreates
      .filter((c) => c.subject !== '')
      .map((c) => ({ subject: c.subject as SubjectCode, score: c.score }))
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
      setPendingCreates((prev) => {
        const next = prev.filter((c) => c.tempId !== id)
        // 마지막 줄이 비어있지 않으면 새 trailing empty 행 추가
        if (next.length === 0 || next[next.length - 1].subject !== '') {
          next.push({ tempId: newTempId(), subject: '', score: null })
        }
        return next
      })
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

  const handleDraftSubjectChange = (tempId: number, subject: SubjectCode | '') => {
    setPendingCreates((prev) => {
      const next = prev.map((c) => c.tempId === tempId ? { ...c, subject } : c)
      // 인변량: 마지막 행은 항상 빈 행. 아니면 새 trailing empty 추가
      const last = next[next.length - 1]
      if (!last || last.subject !== '') {
        next.push({ tempId: newTempId(), subject: '', score: null })
      }
      return next
    })
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
    usedSubjects,
    bulkTarget,
    isApplyOpen,
    isSaving: batchMutation.isPending,
    setSubTab,
    setTableMode,
    setBulkTarget,
    setIsApplyOpen,
    handleSemesterChange,
    handleExamTypeChange,
    handleEdit,
    handleSave,
    handleCancel,
    handleDelete,
    handleScoreChange,
    handleDraftSubjectChange,
    handleBulkConfirm,
    handleToggleSelect,
    handleToggleSelecting,
  }
}
