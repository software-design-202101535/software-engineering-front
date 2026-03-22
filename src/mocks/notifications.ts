import type { Notification } from '@/types'

export const mockNotifications: Notification[] = [
  {
    id: 1,
    userId: 1,
    type: 'GRADE',
    title: '성적 입력 완료',
    message: '2학년 3반 2026년 1학기 성적 입력이 완료되었습니다.',
    isRead: false,
    createdAt: '2026-03-20T09:00:00',
  },
  {
    id: 2,
    userId: 1,
    type: 'COUNSELING',
    title: '상담 기록 공유',
    message: '박지호 학생의 상담 기록이 학년부장 선생님께 공유되었습니다.',
    isRead: false,
    createdAt: '2026-03-18T14:30:00',
  },
  {
    id: 3,
    userId: 1,
    type: 'FEEDBACK',
    title: '피드백 작성 알림',
    message: '정도윤 학생의 피드백 작성 후 7일이 경과하였습니다.',
    isRead: true,
    createdAt: '2026-03-15T10:00:00',
  },
  {
    id: 4,
    userId: 1,
    type: 'SYSTEM',
    title: '학기말 성적 마감 안내',
    message: '2026년 1학기 중간고사 성적 입력 마감일은 2026-04-15입니다.',
    isRead: true,
    createdAt: '2026-03-10T08:00:00',
  },
]
