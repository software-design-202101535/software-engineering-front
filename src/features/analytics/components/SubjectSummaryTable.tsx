import type { SubjectSummary, SubjectCode } from '@/types'
import { SUBJECT_LABEL } from '@/types'
import { GRADE_LEVELS, GRADE_COLORS } from '../constants'

interface SubjectSummaryTableProps {
  subjects: SubjectSummary[]
  selectedSubject: SubjectCode | null
  onSelectSubject: (subject: SubjectCode) => void
}

export function SubjectSummaryTable({
  subjects,
  selectedSubject,
  onSelectSubject,
}: SubjectSummaryTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-on-surface-variant border-b border-surface-container">
            <th className="text-left font-medium py-2.5 px-3">과목</th>
            <th className="text-right font-medium py-2.5 px-3">평균</th>
            <th className="text-right font-medium py-2.5 px-3">최고</th>
            <th className="text-right font-medium py-2.5 px-3">최저</th>
            <th className="text-right font-medium py-2.5 px-3">인원</th>
            {GRADE_LEVELS.map((level) => (
              <th key={level} className="text-right font-medium py-2.5 px-3 w-12">{level}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subjects.map((s) => {
            const isSelected = selectedSubject === s.subject
            return (
              <tr
                key={s.subject}
                onClick={() => onSelectSubject(s.subject)}
                className={`border-b border-surface-container cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary/8' : 'hover:bg-surface-container'
                }`}
              >
                <td className="py-2.5 px-3 font-medium text-on-surface">{SUBJECT_LABEL[s.subject] ?? s.subject}</td>
                <td className="py-2.5 px-3 text-right font-semibold text-primary">{s.avgScore}</td>
                <td className="py-2.5 px-3 text-right text-on-surface-variant">{s.maxScore}</td>
                <td className="py-2.5 px-3 text-right text-on-surface-variant">{s.minScore}</td>
                <td className="py-2.5 px-3 text-right text-on-surface-variant">{s.studentCount}</td>
                {GRADE_LEVELS.map((level) => (
                  <td key={level} className="py-2.5 px-3 text-right">
                    <span style={{ color: GRADE_COLORS[level] }} className="font-semibold">
                      {s.distribution[level] ?? 0}
                    </span>
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
