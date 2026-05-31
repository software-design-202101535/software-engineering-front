import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { SubjectSummary, SubjectCode } from '@/types'
import { SUBJECT_LABEL } from '@/types'
import { BAR_COLOR, BAR_COLOR_SELECTED } from '../constants'

interface ClassAverageBarChartProps {
  subjects: SubjectSummary[]
  selectedSubject: SubjectCode | null
  onSelectSubject: (subject: SubjectCode) => void
}

interface BarTooltipProps {
  active?: boolean
  payload?: { payload: { label: string; avgScore: number } }[]
}

function BarTooltip({ active, payload }: BarTooltipProps) {
  if (!active || !payload?.length) return null
  const { label, avgScore } = payload[0].payload
  return (
    <div className="bg-surface-container-lowest border border-surface-container rounded-lg px-3 py-2 shadow-sm">
      <p className="text-xs text-on-surface-variant">{label}</p>
      <p className="text-sm font-semibold text-primary">평균 {avgScore}점</p>
    </div>
  )
}

export function ClassAverageBarChart({
  subjects,
  selectedSubject,
  onSelectSubject,
}: ClassAverageBarChartProps) {
  const data = subjects.map((s) => ({
    subject: s.subject,
    label: SUBJECT_LABEL[s.subject] ?? s.subject,
    avgScore: s.avgScore,
  }))

  const handleBarClick = (_: unknown, index: number) => {
    onSelectSubject(data[index].subject)
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e7eff3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#546166' }} interval={0} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#546166' }} tickLine={false} axisLine={false} />
        <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(69,95,136,0.06)' }} />
        <Bar dataKey="avgScore" radius={[4, 4, 0, 0]} onClick={handleBarClick} cursor="pointer">
          {data.map((d) => (
            <Cell key={d.subject} fill={selectedSubject === d.subject ? BAR_COLOR_SELECTED : BAR_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
