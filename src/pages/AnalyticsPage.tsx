import { useState } from 'react'
import { useAuth } from '@/features/auth'
import {
  useClassSummary,
  ClassAverageBarChart,
  GradeDistributionDonut,
  SubjectSummaryTable,
  AnalyticsEmpty,
} from '@/features/analytics'
import type { SchoolType, SubjectCode } from '@/types'
import { SCHOOLS } from '@/types'

type Scope = 'class' | 'grade'

const GRADES = [1, 2, 3]
const CLASS_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const SEMESTERS = ['2026-1', '2026-2', '2025-1', '2025-2']
const SEMESTER_LABEL: Record<string, string> = {
  '2026-1': '2026년 1학기',
  '2026-2': '2026년 2학기',
  '2025-1': '2025년 1학기',
  '2025-2': '2025년 2학기',
}

const SELECT_CLASS =
  'appearance-none bg-surface-container-low border-0 border-b-2 border-primary-fixed-dim focus:border-primary focus:ring-0 pl-3 pr-8 py-1.5 text-sm font-medium text-on-surface rounded-t-lg cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed'

function Select<T extends string | number>({
  value,
  options,
  labelOf,
  onChange,
  disabled,
}: {
  value: T
  options: T[]
  labelOf: (v: T) => string
  onChange: (v: T) => void
  disabled?: boolean
}) {
  return (
    <div className="relative">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange((typeof value === 'number' ? Number(e.target.value) : e.target.value) as T)}
        className={SELECT_CLASS}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{labelOf(opt)}</option>
        ))}
      </select>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-on-surface-variant pointer-events-none">
        expand_more
      </span>
    </div>
  )
}

export function AnalyticsPage() {
  const { user } = useAuth()

  const [school, setSchool] = useState<SchoolType>('SUNRIN_HIGH_SCHOOL')
  const [grade, setGrade] = useState<number>(user?.grade ?? 1)
  const [classNum, setClassNum] = useState<number>(user?.classNum ?? 1)
  const [scope, setScope] = useState<Scope>('class')
  const [semester, setSemester] = useState('2026-1')
  const [selectedSubject, setSelectedSubject] = useState<SubjectCode | null>(null)

  const { data, isLoading } = useClassSummary({
    school,
    grade,
    classNum: scope === 'class' ? classNum : undefined,
    semester,
  })

  const subjects = data?.subjects ?? []
  const activeSummary =
    subjects.find((s) => s.subject === selectedSubject) ?? subjects[0]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">반 성적 통계</h1>
          <p className="text-sm text-on-surface-variant mt-1">반·학년의 과목별 평균과 등급 분포를 확인합니다.</p>
        </div>
        {data && (
          <span className="text-xs text-on-surface-variant mt-2">
            집계: {data.updatedAt.slice(0, 16).replace('T', ' ')}
          </span>
        )}
      </div>

      {/* 컨트롤 */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Select
          value={school}
          options={SCHOOLS.map((s) => s.value)}
          labelOf={(v) => SCHOOLS.find((s) => s.value === v)?.label ?? v}
          onChange={setSchool}
        />
        <Select value={grade} options={GRADES} labelOf={(v) => `${v}학년`} onChange={setGrade} />
        <Select
          value={classNum}
          options={CLASS_NUMS}
          labelOf={(v) => `${v}반`}
          onChange={setClassNum}
          disabled={scope === 'grade'}
        />
        <Select
          value={semester}
          options={SEMESTERS}
          labelOf={(v) => SEMESTER_LABEL[v] ?? v}
          onChange={setSemester}
        />
        <div className="ml-auto flex items-center gap-1 bg-surface-container rounded-lg p-0.5">
          {(['class', 'grade'] as Scope[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                scope === s
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {s === 'class' ? '반' : '학년 전체'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-on-surface-variant text-sm">불러오는 중...</div>
      ) : subjects.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-xl border border-surface-container">
          <AnalyticsEmpty />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-surface-container p-6">
              <h3 className="font-headline text-base font-semibold text-on-surface mb-4">과목별 평균</h3>
              <ClassAverageBarChart
                subjects={subjects}
                selectedSubject={activeSummary?.subject ?? null}
                onSelectSubject={setSelectedSubject}
              />
            </div>
            <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6">
              <h3 className="font-headline text-base font-semibold text-on-surface mb-4">등급 분포</h3>
              {activeSummary && <GradeDistributionDonut summary={activeSummary} />}
            </div>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-6">
            <h3 className="font-headline text-base font-semibold text-on-surface mb-4">과목 상세</h3>
            <SubjectSummaryTable
              subjects={subjects}
              selectedSubject={activeSummary?.subject ?? null}
              onSelectSubject={setSelectedSubject}
            />
          </div>
        </div>
      )}
    </div>
  )
}
