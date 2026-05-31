import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { SubjectSummary } from '@/types'
import { SUBJECT_LABEL } from '@/types'
import { GRADE_LEVELS, GRADE_COLORS } from '../constants'

interface GradeDistributionDonutProps {
  summary: SubjectSummary
}

export function GradeDistributionDonut({ summary }: GradeDistributionDonutProps) {
  const data = GRADE_LEVELS.map((level) => ({
    level,
    value: summary.distribution[level] ?? 0,
  })).filter((d) => d.value > 0)

  return (
    <div className="flex flex-col items-center">
      <p className="text-sm font-semibold text-on-surface mb-1">{SUBJECT_LABEL[summary.subject] ?? summary.subject}</p>
      <div className="relative w-full" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="level"
              innerRadius={58}
              outerRadius={86}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.level} fill={GRADE_COLORS[d.level]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-on-surface">{summary.studentCount}</span>
          <span className="text-xs text-on-surface-variant">명</span>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-3">
        {GRADE_LEVELS.map((level) => (
          <div key={level} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GRADE_COLORS[level] }} />
            <span className="text-xs text-on-surface-variant">
              {level} <span className="font-semibold text-on-surface">{summary.distribution[level] ?? 0}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
