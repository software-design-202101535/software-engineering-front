import type { SharedCounseling } from '@/types'
import { SharedCounselingCard } from './SharedCounselingCard'

interface SharedCounselingListProps {
  counselings: SharedCounseling[]
}

// 선택된 반의 공유 상담 카드 목록. 비어 있으면 빈 상태를 보여준다.
export function SharedCounselingList({ counselings }: SharedCounselingListProps) {
  if (counselings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">forum</span>
        <p className="text-sm text-on-surface-variant">공유된 상담 기록이 없습니다.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {counselings.map((c) => (
        <SharedCounselingCard key={c.id} counseling={c} />
      ))}
    </div>
  )
}
