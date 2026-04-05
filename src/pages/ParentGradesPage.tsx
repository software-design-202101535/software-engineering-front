import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useGrades, SemesterSelector, GradeTable, RadarChart } from '@/features/grades'
import { fetchStudent } from '@/api/students'
import { calculateAverage } from '@/utils/gradeUtils'
import type { ExamType } from '@/types'
import { SUBJECT_LABEL } from '@/types'

type SubTab = 'list' | 'chart'

export function ParentGradesPage() {
  const { selectedChildId } = useOutletContext<{ selectedChildId: number }>()

  const [semester, setSemester] = useState('2026-1')
  const [examType, setExamType] = useState<ExamType>('MIDTERM')
  const [subTab, setSubTab] = useState<SubTab>('list')

  const { data: child } = useQuery({
    queryKey: ['student', selectedChildId],
    queryFn: () => fetchStudent(selectedChildId),
    enabled: selectedChildId > 0,
  })

  const { data: grades = [], isLoading } = useGrades(selectedChildId, { semester, examType })

  const avg = calculateAverage(grades)
  const radarData = grades.map((g) => ({ subject: SUBJECT_LABEL[g.subject] ?? g.subject, score: g.score }))

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">자녀 성적</h1>
        <p className="text-sm text-on-surface-variant mt-1">자녀의 과목별 성적을 확인할 수 있습니다.</p>
      </div>

      {child && (
        <div className="flex items-center gap-2 mb-4 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">person</span>
          <span className="font-medium text-on-surface">{child.name}</span>
          <span>·</span>
          <span>{child.grade}학년 {child.classNum}반 {child.number}번</span>
        </div>
      )}

      {/* 컨트롤 */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <SemesterSelector
          semester={semester}
          examType={examType}
          onSemesterChange={setSemester}
          onExamTypeChange={setExamType}
        />
        <div className="ml-auto flex items-center gap-1 bg-surface-container rounded-lg p-0.5">
          {(['list', 'chart'] as SubTab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setSubTab(t)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                subTab === t
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t === 'list' ? '목록' : '시각화'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 text-center text-on-surface-variant text-sm">불러오는 중...</div>
      ) : subTab === 'list' ? (
        <div className="bg-surface-container-lowest rounded-xl border border-surface-container">
          <div className="px-6 py-4 flex items-center justify-between border-b border-surface-container">
            <h3 className="font-headline text-base font-semibold text-on-surface">성적 목록</h3>
            {grades.length > 0 && (
              <span className="text-sm text-on-surface-variant">
                평균 <span className="font-semibold text-primary">{avg}점</span>
              </span>
            )}
          </div>
          <GradeTable grades={grades} mode="read" />
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-surface-container p-8">
          <h3 className="font-headline text-base font-semibold text-on-surface mb-6">성적 시각화</h3>
          {radarData.length === 0 ? (
            <p className="text-center text-on-surface-variant text-sm py-16">등록된 성적이 없습니다.</p>
          ) : (
            <RadarChart data={radarData} />
          )}
        </div>
      )}
    </div>
  )
}
