import type { Counseling } from '@/types'

export const mockCounselings: Counseling[] = [
  {
    id: 1,
    studentId: 3,
    teacherId: 1,
    teacherName: '김선생',
    content: '학생이 수학 과목에 대한 어려움을 호소하였습니다. 방과 후 보충학습을 권유하였으며 학생도 긍정적으로 수용하였습니다.',
    nextPlan: '2주 후 성적 변화 확인 및 추가 면담 예정',
    counselingDate: '2026-03-05',
    isShared: false,
    createdAt: '2026-03-05T16:00:00',
  },
  {
    id: 2,
    studentId: 5,
    teacherId: 1,
    teacherName: '김선생',
    content: '지각 반복에 대해 면담을 진행하였습니다. 가정 내 어려움이 있는 것으로 파악되어 학교 상담사 연계를 권유하였습니다.',
    nextPlan: '학교 상담사 연계 후 결과 확인',
    counselingDate: '2026-03-10',
    isShared: true,
    createdAt: '2026-03-10T15:30:00',
  },
  {
    id: 3,
    studentId: 1,
    teacherId: 1,
    teacherName: '김선생',
    content: '진로 탐색을 위한 면담을 진행하였습니다. 이공계 진학 희망이 있으며 수학/과학 강화 학습 계획을 논의하였습니다.',
    nextPlan: '진로 체험 프로그램 안내 예정',
    counselingDate: '2026-03-15',
    isShared: false,
    createdAt: '2026-03-15T14:00:00',
  },
]
