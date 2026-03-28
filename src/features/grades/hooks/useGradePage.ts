import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchStudent } from '@/api/students'
import { batchGrades } from '@/api/grades'
import { useGrades, useClassStudents } from './useGrades'
import { calculateAverage } from '@/utils/gradeUtils'
import type { ExamType, SubjectCode, Student } from '@/types'
import { SUBJECT_LABEL } from '@/types'
import type { TableMode } from '../components/GradeTable'

type SubTab = 'list' | 'chart'
type BulkTarget = 'class' | 'selected'

function buildUpdateItems(
  editedScores: Record<number, string>,
  grades: { id: number; subject: SubjectCode }[],
) {
  return Object.entries(editedScores)
    .filter(([, val]) => val.trim() !== '' && !isNaN(Number(val)))
    .map(([idStr, val]) => {
      const grade = grades.find((g) => g.id === Number(idStr))!
      return { id: Number(idStr), subject: grade.subject, score: Number(val) }
    })
}

export function useGradePage() {
  const { studentId } = useParams<{ studentId: string }>()
  const sid = Number(studentId)
  const queryClient = useQueryClient()

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
  const [isSaving, setIsSaving] = useState(false)

  const { data: student } = useQuery({
    queryKey: ['student', sid],
    queryFn: () => fetchStudent(sid),
    enabled: sid > 0,
  })

  const { data: grades = [] } = useGrades(sid, { semester, examType })
  const { data: classStudents = [] } = useClassStudents(student?.grade ?? 0, student?.classNum ?? 0)

  const avg = calculateAverage(grades)
  const radarData = grades.map((g) => ({ subject: SUBJECT_LABEL[g.subject] ?? g.subject, score: g.score }))

  const handleSemesterChange = (v: string) => {
    setSemester(v)
    setTableMode('read')
  }

  const handleExamTypeChange = (v: ExamType) => {
    setExamType(v)
    setTableMode('read')
  }

  const handleEdit = () => {
    setEditedScores({})
    setTableMode('edit')
  }

  const handleSave = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      const update = buildUpdateItems(editedScores, grades)
      if (update.length > 0) {
        await batchGrades(sid, { semester, examType, update })
      }
      await queryClient.invalidateQueries({ queryKey: ['grades', sid] })
      setTableMode('read')
      setEditedScores({})
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setTableMode('read')
    setEditedScores({})
    setNewSubject('')
    setNewScore('')
  }

  const handleDelete = async (id: number) => {
    await batchGrades(sid, { semester, examType, delete: [id] })
    await queryClient.invalidateQueries({ queryKey: ['grades', sid] })
  }

  const handleScoreChange = (id: number, val: string) => {
    setEditedScores((prev) => ({ ...prev, [id]: val }))
  }

  const handleConfirmAdd = async () => {
    if (!newSubject.trim() || !newScore) return
    await batchGrades(sid, {
      semester,
      examType,
      create: [{ subject: newSubject as SubjectCode, score: Number(newScore) }],
    })
    await queryClient.invalidateQueries({ queryKey: ['grades', sid] })
    setNewSubject('')
    setNewScore('')
  }

  const handleCancelAdd = () => {
    setNewSubject('')
    setNewScore('')
    setTableMode('edit')
  }

  const handleBulkConfirm = async (subjects: string[]) => {
    const targets = bulkTarget === 'class'
      ? classStudents.map((s: Student) => s.id)
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
    grades,
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
    isSaving,
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
