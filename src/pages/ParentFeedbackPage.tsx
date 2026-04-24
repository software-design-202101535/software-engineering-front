import { useOutletContext } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchStudent } from '@/api/students'
import { FeedbackList } from '@/features/feedback'

export function ParentFeedbackPage() {
  const { selectedChildId } = useOutletContext<{ selectedChildId: number }>()

  const { data: child } = useQuery({
    queryKey: ['student', selectedChildId],
    queryFn: () => fetchStudent(selectedChildId),
    enabled: selectedChildId > 0,
  })

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">자녀 피드백</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          선생님이 공유한 자녀의 피드백을 확인할 수 있습니다.
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

      <FeedbackList studentId={selectedChildId} queryKey={['feedbacks', 'parent', selectedChildId]} />
    </div>
  )
}
