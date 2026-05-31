import type { SharedCounseling } from '@/types'

interface SharedCounselingCardProps {
  counseling: SharedCounseling
}

// 다른 교사가 공유한 상담을 읽기 전용으로 표시. 수정/삭제/공유토글 없음.
export function SharedCounselingCard({ counseling: c }: SharedCounselingCardProps) {
  return (
    <div className="bg-surface-container-lowest border border-surface-container rounded-xl px-5 py-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-on-surface truncate">
            {c.studentName}
            <span className="ml-1 font-normal text-on-surface-variant">{c.number}번</span>
          </span>
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700 shrink-0">
            교사공유
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-on-surface-variant">{c.counselingDate}</span>
          <span className="text-outline-variant">·</span>
          <span className="text-xs text-on-surface-variant">{c.teacherName}</span>
        </div>
      </div>

      <p className="text-sm text-on-surface whitespace-pre-wrap mb-3">{c.content}</p>

      {(c.nextDate || c.nextPlan) && (
        <div className="flex flex-col gap-1 pt-3 border-t border-surface-container">
          {c.nextDate && (
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px]">event</span>
              <span>다음 상담 예정</span>
              <span className="font-medium text-on-surface">{c.nextDate}</span>
            </div>
          )}
          {c.nextPlan && (
            <p className="text-xs text-on-surface-variant whitespace-pre-wrap">{c.nextPlan}</p>
          )}
        </div>
      )}
    </div>
  )
}
