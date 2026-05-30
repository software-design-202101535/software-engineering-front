import type { SharedCounseling } from '@/types'

export interface ClassGroup {
  key: string // `${grade}-${classNum}`
  grade: number
  classNum: number
  label: string // `${grade}학년 ${classNum}반`
  counselings: SharedCounseling[]
}

// 공유 상담을 학년/반으로 묶고 학년·반 오름차순으로 정렬한다.
// 그룹 내 상담 순서는 입력 순서(백엔드가 counselingDate 내림차순으로 내려줌)를 보존.
export function groupCounselingsByClass(items: SharedCounseling[]): ClassGroup[] {
  const groups = new Map<string, ClassGroup>()

  for (const item of items) {
    const key = `${item.grade}-${item.classNum}`
    const existing = groups.get(key)
    if (existing) {
      existing.counselings.push(item)
      continue
    }
    groups.set(key, {
      key,
      grade: item.grade,
      classNum: item.classNum,
      label: `${item.grade}학년 ${item.classNum}반`,
      counselings: [item],
    })
  }

  return [...groups.values()].sort((a, b) => a.grade - b.grade || a.classNum - b.classNum)
}
