import type { RankScope, SubjectRank, SubjectCode } from '@/types'

export interface MergedSubjectRank {
  subject: SubjectCode
  classRank: SubjectRank | undefined
  gradeRank: SubjectRank | undefined
}

// 반/전교 과목별 석차를 과목 코드로 머지한다.
// 순서: 반 과목 순서를 먼저 따르고, 반에 없고 전교에만 있는 과목을 뒤에 붙인다.
export function mergeSubjectRanks(
  classScope: RankScope | null,
  gradeScope: RankScope | null,
): MergedSubjectRank[] {
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
