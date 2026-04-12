import { useOutletContext } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchCounselings } from '@/api/counseling'
import { fetchStudent } from '@/api/students'

export function ParentCounselingPage() {
  const { selectedChildId } = useOutletContext<{ selectedChildId: number }>()

  const { data: child } = useQuery({
    queryKey: ['student', selectedChildId],
    queryFn: () => fetchStudent(selectedChildId),
    enabled: selectedChildId > 0,
  })

  const { data: counselings = [], isLoading } = useQuery({
    queryKey: ['counselings', 'parent', selectedChildId],
    queryFn: () => fetchCounselings(selectedChildId),
    enabled: selectedChildId > 0,
  })

  const nextCounseling = counselings.find((c) => c.nextDate)

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">자녀 상담</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          자녀의 상담 일정과 이력을 확인할 수 있습니다.
        </p>
      </div>

      {child && (
        <div className="flex items-center gap-2 mb-4 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-[16px]">person</span>
          <span className="font-medium text-on-surface">{child.name}</span>
          <span>·</span>
          <span>
            {child.grade}학년 {child.classNum}반 {child.number}번
          </span>
        </div>
      )}

      {/* 다음 상담 예정 카드 */}
      <div className="bg-surface-container-lowest border border-surface-container rounded-xl px-5 py-4 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[18px] text-primary">event</span>
          <span className="text-sm font-semibold text-on-surface">다음 상담 예정</span>
        </div>
        {isLoading ? (
          <p className="text-sm text-on-surface-variant">불러오는 중...</p>
        ) : nextCounseling?.nextDate ? (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-bold text-primary">{nextCounseling.nextDate}</span>
            <span className="text-sm text-on-surface-variant">{nextCounseling.teacherName} 선생님</span>
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant mt-1">예정된 상담이 없습니다.</p>
        )}
      </div>

      {/* 상담 이력 */}
      <h2 className="text-sm font-semibold text-on-surface mb-3">상담 이력</h2>
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <span className="text-on-surface-variant text-sm">불러오는 중...</span>
        </div>
      ) : counselings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">forum</span>
          <p className="text-sm text-on-surface-variant">상담 이력이 없습니다.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest border border-surface-container rounded-xl overflow-hidden">
          {counselings.map((c, idx) => (
            <div
              key={c.id}
              className={`flex items-center justify-between px-5 py-3 ${
                idx < counselings.length - 1 ? 'border-b border-surface-container' : ''
              }`}
            >
              <span className="text-sm text-on-surface">{c.counselingDate}</span>
              <span className="text-sm text-on-surface-variant">{c.teacherName} 선생님</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
