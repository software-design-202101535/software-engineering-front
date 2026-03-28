import type { ExamType } from '@/types'
import { EXAM_TYPE_LABEL } from '@/types'

interface SemesterSelectorProps {
  semester: string       // "2026-1", "2026-2" 형식
  examType: ExamType
  onSemesterChange: (v: string) => void
  onExamTypeChange: (v: ExamType) => void
}

// 현재 기준 선택 가능한 학기 목록 (최근 2년)
const AVAILABLE_SEMESTERS = ['2026-1', '2026-2', '2025-1', '2025-2']
const SEMESTER_DISPLAY: Record<string, string> = {
  '2026-1': '2026년 1학기',
  '2026-2': '2026년 2학기',
  '2025-1': '2025년 1학기',
  '2025-2': '2025년 2학기',
}

const EXAM_TYPES: ExamType[] = ['MIDTERM', 'FINAL', 'QUIZ']

function SelectDropdown<T extends string>({
  value,
  options,
  labelMap,
  onChange,
}: {
  value: T
  options: T[]
  labelMap: Record<string, string>
  onChange: (v: T) => void
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="appearance-none bg-surface-container-low border-0 border-b-2 border-primary-fixed-dim focus:border-primary focus:ring-0 pl-3 pr-8 py-1.5 text-sm font-medium text-on-surface rounded-t-lg cursor-pointer transition-colors"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {labelMap[opt] ?? opt}
          </option>
        ))}
      </select>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-on-surface-variant pointer-events-none">
        expand_more
      </span>
    </div>
  )
}

export function SemesterSelector({
  semester,
  examType,
  onSemesterChange,
  onExamTypeChange,
}: SemesterSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <SelectDropdown
        value={semester}
        options={AVAILABLE_SEMESTERS}
        labelMap={SEMESTER_DISPLAY}
        onChange={onSemesterChange}
      />
      <SelectDropdown
        value={examType}
        options={EXAM_TYPES}
        labelMap={EXAM_TYPE_LABEL}
        onChange={onExamTypeChange}
      />
    </div>
  )
}
