import type { Notification, UserRole } from '@/types'

// 알림 클릭 시 이동할 경로를 계산한다.
// - 교사는 현 명세상 수신자가 아니므로 항상 null
// - 학부모는 ?childId=로 자녀 컨텍스트를 URL에 영속화
// - 피드백은 목록 페이지 + #feedback-{id} hash로 anchor 스크롤
export function resolveNotificationLink(
  n: Notification,
  role: UserRole,
): string | null {
  if (role !== 'STUDENT' && role !== 'PARENT') return null

  const basePrefix = role === 'STUDENT' ? '/student' : '/parent'
  const childQuery = role === 'PARENT' ? `?childId=${n.referenceStudentId}` : ''

  switch (n.referenceType) {
    case 'GRADE':
      return `${basePrefix}/grades${childQuery}`
    case 'FEEDBACK':
      return `${basePrefix}/feedback${childQuery}#feedback-${n.referenceId}`
    default:
      return null
  }
}
