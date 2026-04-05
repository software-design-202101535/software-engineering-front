import { useState } from 'react'
import { useGrades, SemesterSelector, GradeTable, RadarChart } from '@/features/grades'
import { useAuth } from '@/features/auth'
import { calculateAverage } from '@/utils/gradeUtils'
import type { ExamType } from '@/types'
import { SUBJECT_LABEL } from '@/types'

type SubTab = 'list' | 'chart'

export function StudentGradesPage() {
  const { user } = useAuth()
  const studentId = user?.studentId ?? 0

  const [semester, setSemester] = useState('2026-1')
  const [examType, setExamType] = useState<ExamType>('MIDTERM')
  const [subTab, setSubTab] = useState<SubTab>('list')

  const { data: grades = [], isLoading } = useGrades(studentId, { semester, examType })

  const avg = calculateAverage(grades)
  const radarData = grades.map((g) => ({ subject: SUBJECT_LABEL[g.subject] ?? g.subject, score: g.score }))

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">내 성적</h1>
        <p className="text-sm text-on-surface-variant mt-1">과목별 성적을 확인하고 분석할 수 있습니다.</p>
      </div>

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
