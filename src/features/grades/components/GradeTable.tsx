import type { Grade, SubjectCode } from '@/types'
import { SUBJECT_LABEL } from '@/types'
import { ALL_SUBJECTS } from '../constants'

export type TableMode = 'read' | 'edit' | 'adding'

export interface EditState {
  editedScores: Record<number, string>
  newSubject: SubjectCode | ''
  newScore: string
  onScoreChange: (id: number, value: string) => void
  onDelete: (id: number) => void
  onNewSubjectChange: (v: SubjectCode | '') => void
  onNewScoreChange: (v: string) => void
  onConfirmAdd: () => void
  onCancelAdd: () => void
}

interface GradeTableProps {
  grades: Grade[]
  mode: TableMode
  editState?: EditState
}

const GRADE_LABELS: Record<string, string> = {
  A: 'A (수)', B: 'B (우)', C: 'C (미)', D: 'D (양)', F: 'F (가)',
}
const GRADE_COLORS: Record<string, string> = {
  A: 'text-primary font-semibold',
  B: 'text-[#5d7a9b] font-semibold',
  C: 'text-on-surface-variant',
  D: 'text-on-surface-variant',
  F: 'text-error font-semibold',
}

function calcGrade(score: number): Grade['grade'] {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

export function GradeTable({ grades, mode, editState }: GradeTableProps) {
  if (grades.length === 0 && mode === 'read') {
    return (
      <div className="py-16 text-center text-on-surface-variant text-sm">
        등록된 성적이 없습니다.
      </div>
    )
  }

  const isEditing = (mode === 'edit' || mode === 'adding') && editState !== undefined

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-surface-container">
          <th className="text-left py-2.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider w-1/3">
            과목
          </th>
          <th className="text-right py-2.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider w-1/4">
            점수
          </th>
          <th className="text-center py-2.5 px-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider w-1/4">
            등급
          </th>
          {isEditing && <th className="w-10" />}
        </tr>
      </thead>
      <tbody>
        {grades.map((g) => {
          const editVal = editState?.editedScores[g.id]
          const displayScore = editVal !== undefined ? editVal : (g.score !== null ? String(g.score) : '')
          const liveScore = editVal !== undefined ? Number(editVal) : g.score
          const liveGrade =
            liveScore !== null && !isNaN(liveScore as number) && liveScore !== 0
              ? calcGrade(liveScore as number)
              : editVal !== undefined
                ? null
                : g.grade

          return (
            <tr
              key={g.id}
              className="border-b border-surface-container hover:bg-surface-container-low/50 transition-colors"
            >
              <td className="py-3 px-4 font-medium text-on-surface">
                {SUBJECT_LABEL[g.subject] ?? g.subject}
              </td>
              <td className="py-3 px-4 text-right">
                {isEditing ? (
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="-"
                    value={displayScore}
                    onChange={(e) => editState!.onScoreChange(g.id, e.target.value)}
                    className="w-20 text-right bg-surface-container-low border-0 border-b-2 border-primary-fixed-dim focus:border-primary focus:ring-0 px-2 py-1 text-sm text-on-surface rounded-t-lg"
                  />
                ) : (
                  <span className="font-medium text-on-surface">
                    {g.score !== null ? g.score : <span className="text-on-surface-variant">-</span>}
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-center">
                {liveGrade ? (
                  <span className={GRADE_COLORS[liveGrade]}>{GRADE_LABELS[liveGrade]}</span>
                ) : (
                  <span className="text-on-surface-variant">-</span>
                )}
              </td>
              {isEditing && (
                <td className="py-3 px-2">
                  <button
                    type="button"
                    onClick={() => editState!.onDelete(g.id)}
                    className="text-on-surface-variant hover:text-error transition-colors p-1"
                    title="삭제"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </td>
              )}
            </tr>
          )
        })}

        {/* 과목 추가 행 (adding 모드) */}
        {mode === 'adding' && editState && (
          <tr className="border-b border-primary/30 bg-surface-container-low/30">
            <td className="py-3 px-4">
              <select
                value={editState.newSubject}
                onChange={(e) => editState.onNewSubjectChange(e.target.value as SubjectCode | '')}
                className="w-full bg-surface-container-low border-0 border-b-2 border-primary-fixed-dim focus:border-primary focus:ring-0 px-2 py-1 text-sm text-on-surface rounded-t-lg"
                autoFocus
              >
                <option value="">과목 선택</option>
                {ALL_SUBJECTS.map((code) => (
                  <option key={code} value={code}>
                    {SUBJECT_LABEL[code]}
                  </option>
                ))}
              </select>
            </td>
            <td className="py-3 px-4 text-right">
              <input
                type="number"
                min="0"
                max="100"
                placeholder="0~100"
                value={editState.newScore}
                onChange={(e) => editState.onNewScoreChange(e.target.value)}
                className="w-20 text-right bg-surface-container-low border-0 border-b-2 border-primary-fixed-dim focus:border-primary focus:ring-0 px-2 py-1 text-sm text-on-surface rounded-t-lg"
              />
            </td>
            <td className="py-3 px-4 text-center">
              <span className="text-xs text-on-surface-variant">
                {editState.newScore ? GRADE_LABELS[calcGrade(Number(editState.newScore)) ?? ''] ?? '-' : '-'}
              </span>
            </td>
            <td className="py-3 px-2">
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={editState.onConfirmAdd}
                  disabled={!editState.newSubject || !editState.newScore}
                  className="text-primary hover:text-primary-dim transition-colors p-1 disabled:opacity-40"
                  title="추가 확인"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </button>
                <button
                  type="button"
                  onClick={editState.onCancelAdd}
                  className="text-on-surface-variant hover:text-error transition-colors p-1"
                  title="추가 닫기"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
