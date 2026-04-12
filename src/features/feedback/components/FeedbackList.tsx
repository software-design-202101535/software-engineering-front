import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchFeedbacks } from '@/api/feedback'
import { CATEGORY_FILTERS, CATEGORY_BADGE, CATEGORY_LABEL } from '../constants'
import type { FeedbackCategory } from '@/types'

interface FeedbackListProps {
  studentId: number
  queryKey: unknown[]
}

export function FeedbackList({ studentId, queryKey }: FeedbackListProps) {
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | 'ALL'>('ALL')

  const { data: allFeedbacks = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => fetchFeedbacks(studentId),
    enabled: studentId > 0,
  })

  const feedbacks =
    categoryFilter === 'ALL'
      ? allFeedbacks
      : allFeedbacks.filter((f) => f.category === categoryFilter)

  return (
    <>
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
    </>
  )
}
