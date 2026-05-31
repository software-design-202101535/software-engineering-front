import { useStudentRanks } from '../hooks/useStudentRanks'
import type { RankDetail, RankScope, SubjectRank, SubjectCode } from '@/types'
import { SUBJECT_LABEL } from '@/types'
import { GRADE_COLORS } from '../constants'
import { AnalyticsEmpty } from './AnalyticsEmpty'

interface RankViewProps {
  studentId: number
  semester: string
}

function RankSummaryCard({ title, detail }: { title: string; detail: RankDetail | undefined }) {
  return (
    <div className="flex-1 bg-surface-container-low rounded-xl p-5">
      <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">{title}</p>
      {detail ? (
        <>
          <p className="text-on-surface">
            <span className="text-3xl font-bold">{detail.rank}</span>
            <span className="text-base text-on-surface-variant"> / {detail.totalCount}등</span>
          </p>
          <div className="flex items-center gap-3 mt-2 text-sm text-on-surface-variant">
            <span>상위 {detail.percentile}%</span>
            <span className="text-outline-variant">·</span>
            <span>평균 {detail.avgScore}점</span>
          </div>
        </>
      ) : (
        <p className="text-sm text-on-surface-variant py-2">집계 준비 중</p>
      )}
    </div>
  )
}

// class/grade 과목별 석차를 과목 키로 머지
function mergeSubjectRanks(
  classScope: RankScope | null,
  gradeScope: RankScope | null,
): { subject: SubjectCode; classRank: SubjectRank | undefined; gradeRank: SubjectRank | undefined }[] {
  const classMap = new Map(classScope?.subjects.map((s) => [s.subject, s]) ?? [])
  const gradeMap = new Map(gradeScope?.subjects.map((s) => [s.subject, s]) ?? [])
  const order: SubjectCode[] = []
  for (const s of classScope?.subjects ?? []) order.push(s.subject)
  for (const s of gradeScope?.subjects ?? []) if (!classMap.has(s.subject)) order.push(s.subject)
  return order.map((subject) => ({
    subject,
    classRank: classMap.get(subject),
    gradeRank: gradeMap.get(subject),
  }))
}

function RankCell({ rank }: { rank: SubjectRank | undefined }) {
  if (!rank) return <span className="text-outline-variant">-</span>
  return (
    <span className="text-on-surface">
      {rank.rank}
      <span className="text-on-surface-variant"> / {rank.totalCount}</span>
    </span>
  )
}

export function RankView({ studentId, semester }: RankViewProps) {
  const { data, isLoading } = useStudentRanks(studentId, semester)

  if (isLoading) {
    return <div className="py-16 text-center text-on-surface-variant text-sm">불러오는 중...</div>
  }
  if (!data || (!data.class && !data.grade)) {
    return <AnalyticsEmpty message="아직 석차 집계가 없습니다." />
  }

  const merged = mergeSubjectRanks(data.class, data.grade)
  const gradeLevelOf = (subject: SubjectCode) =>
    data.class?.subjects.find((s) => s.subject === subject)?.gradeLevel ??
    data.grade?.subjects.find((s) => s.subject === subject)?.gradeLevel ??
    null

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <RankSummaryCard title="반 석차 (종합)" detail={data.class?.overall} />
        <RankSummaryCard title="전교 석차 (종합)" detail={data.grade?.overall} />
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-container">
          <h3 className="font-headline text-base font-semibold text-on-surface">과목별 석차</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-on-surface-variant border-b border-surface-container">
                <th className="text-left font-medium py-2.5 px-6">과목</th>
                <th className="text-right font-medium py-2.5 px-3">반 석차</th>
                <th className="text-right font-medium py-2.5 px-3">전교 석차</th>
                <th className="text-center font-medium py-2.5 px-6">등급</th>
              </tr>
            </thead>
            <tbody>
              {merged.map(({ subject, classRank, gradeRank }) => {
                const level = gradeLevelOf(subject)
                return (
                  <tr key={subject} className="border-b border-surface-container last:border-0">
                    <td className="py-2.5 px-6 font-medium text-on-surface">{SUBJECT_LABEL[subject] ?? subject}</td>
                    <td className="py-2.5 px-3 text-right"><RankCell rank={classRank} /></td>
                    <td className="py-2.5 px-3 text-right"><RankCell rank={gradeRank} /></td>
                    <td className="py-2.5 px-6 text-center">
                      {level ? (
                        <span
                          className="inline-block w-7 text-xs font-bold py-0.5 rounded-full"
                          style={{ backgroundColor: `${GRADE_COLORS[level]}20`, color: GRADE_COLORS[level] }}
                        >
                          {level}
                        </span>
                      ) : (
                        <span className="text-outline-variant">-</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-on-surface-variant text-right">
        집계: {data.updatedAt.slice(0, 16).replace('T', ' ')}
      </p>
    </div>
  )
}
