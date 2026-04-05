import { useNavigate } from 'react-router-dom'
import type { StudentSummary } from '@/types'

interface ClassStudentPanelProps {
  students: StudentSummary[]
  currentStudentId: number
  isSelecting: boolean
  selectedIds: number[]
  onToggleSelecting: () => void
  onToggleSelect: (id: number) => void
}

export function ClassStudentPanel({
  students,
  currentStudentId,
  isSelecting,
  selectedIds,
  onToggleSelecting,
  onToggleSelect,
}: ClassStudentPanelProps) {
  const navigate = useNavigate()

  const classLabel =
    students.length > 0
      ? `${students[0].grade}학년 ${students[0].classNum}반`
      : ''

  const handleStudentClick = (s: StudentSummary) => {
    if (isSelecting) {
      onToggleSelect(s.id)
    } else {
      navigate(`/students/${s.id}/grades`)
    }
  }

  return (
    <div className="w-52 shrink-0 flex flex-col border-r border-surface-container bg-surface-container-low">
      {/* 패널 헤더 */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-surface-container">
        <div>
          <p className="text-xs font-semibold text-on-surface">{classLabel}</p>
          <p className="text-xs text-on-surface-variant">{students.length}명</p>
        </div>
        <button
          type="button"
          onClick={onToggleSelecting}
          className={`text-xs font-medium px-2 py-1 rounded-lg transition-colors ${
            isSelecting
              ? 'bg-primary text-on-primary'
              : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
          }`}
        >
          {isSelecting ? '선택 중' : '선택'}
        </button>
      </div>

      {/* 학생 목록 */}
      <div className="flex-1 overflow-y-auto py-1">
        {students.map((s) => {
          const isActive = s.id === currentStudentId
          const isSelected = selectedIds.includes(s.id)

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleStudentClick(s)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors ${
                isActive
                  ? 'bg-primary text-on-primary border-l-[3px] border-primary-dim'
                  : 'text-on-surface hover:bg-surface-container'
              }`}
            >
              {isSelecting && (
                <span
                  className={`w-4 h-4 rounded shrink-0 border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-primary border-primary'
                      : isActive
                        ? 'border-on-primary/50'
                        : 'border-outline-variant'
                  }`}
                >
                  {isSelected && (
                    <span className="material-symbols-outlined text-[12px] text-white">check</span>
                  )}
                </span>
              )}
              <span className={`text-xs shrink-0 ${isActive ? 'text-on-primary/70' : 'text-on-surface-variant'}`}>
                {s.number}번
              </span>
              <span className="text-sm font-medium truncate">{s.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
