import type { FeedbackCategory } from '@/types'

export const CATEGORY_FILTERS: Array<{ value: FeedbackCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'GRADE', label: '성적' },
  { value: 'BEHAVIOR', label: '행동' },
  { value: 'ATTITUDE', label: '태도' },
  { value: 'ATTENDANCE', label: '출결' },
  { value: 'OTHER', label: '기타' },
]

export const CATEGORY_BADGE: Record<FeedbackCategory, string> = {
  GRADE: 'bg-blue-100 text-blue-700',
  BEHAVIOR: 'bg-purple-100 text-purple-700',
  ATTITUDE: 'bg-green-100 text-green-700',
  ATTENDANCE: 'bg-orange-100 text-orange-700',
  OTHER: 'bg-surface-container text-on-surface-variant',
}

export const CATEGORY_LABEL: Record<FeedbackCategory, string> = {
  GRADE: '성적',
  BEHAVIOR: '행동',
  ATTITUDE: '태도',
  ATTENDANCE: '출결',
  OTHER: '기타',
}
