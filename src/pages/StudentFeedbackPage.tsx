import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { fetchFeedbacks } from '@/api/feedback'
import type { FeedbackCategory } from '@/types'

const CATEGORY_FILTERS: Array<{ value: FeedbackCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'GRADE', label: '성적' },
  { value: 'BEHAVIOR', label: '행동' },
  { value: 'ATTITUDE', label: '태도' },
  { value: 'ATTENDANCE', label: '출결' },
  { value: 'OTHER', label: '기타' },
]

const CATEGORY_BADGE: Record<FeedbackCategory, string> = {
  GRADE: 'bg-blue-100 text-blue-700',
  BEHAVIOR: 'bg-purple-100 text-purple-700',
  ATTITUDE: 'bg-green-100 text-green-700',
  ATTENDANCE: 'bg-orange-100 text-orange-700',
  OTHER: 'bg-surface-container text-on-surface-variant',
}

const CATEGORY_LABEL: Record<FeedbackCategory, string> = {
  GRADE: '성적',
  BEHAVIOR: '행동',
  ATTITUDE: '태도',
  ATTENDANCE: '출결',
  OTHER: '기타',
}

export function StudentFeedbackPage() {
  const { user } = useAuth()
  const studentId = user?.studentId ?? 0

  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | 'ALL'>('ALL')

  const { data: allFeedbacks = [], isLoading } = useQuery({
    queryKey: ['feedbacks', 'student', studentId],
    queryFn: () => fetchFeedbacks(studentId),
    enabled: !!studentId,
  })

  const feedbacks =
    categoryFilter === 'ALL'
      ? allFeedbacks
      : allFeedbacks.filter((f) => f.category === categoryFilter)

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">내 피드백</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          선생님이 공유한 피드백을 확인할 수 있습니다.
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex items-center gap-1 bg-surface-container rounded-lg p-0.5 mb-4 w-fit">
        {CATEGORY_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setCategoryFilter(value)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              categoryFilter === value
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 카드 리스트 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <span className="text-on-surface-variant text-sm">불러오는 중...</span>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">
            feedback
          </span>
          <p className="text-sm text-on-surface-variant">공유된 피드백이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="bg-surface-container-lowest border border-surface-container rounded-xl px-5 py-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded-full ${CATEGORY_BADGE[fb.category]}`}
                >
                  {CATEGORY_LABEL[fb.category]}
                </span>
                <span className="text-xs text-on-surface-variant">{fb.date}</span>
                <span className="ml-auto text-xs text-on-surface-variant">{fb.teacherName}</span>
              </div>
              <p className="text-sm text-on-surface whitespace-pre-wrap">{fb.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
