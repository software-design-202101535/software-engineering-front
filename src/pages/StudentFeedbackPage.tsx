import { useAuth } from '@/features/auth'
import { FeedbackList } from '@/features/feedback'

export function StudentFeedbackPage() {
  const { user } = useAuth()
  const studentId = user?.studentId ?? 0

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">내 피드백</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          선생님이 공유한 피드백을 확인할 수 있습니다.
        </p>
      </div>

      <FeedbackList studentId={studentId} queryKey={['feedbacks', 'student', studentId]} />
    </div>
  )
}
