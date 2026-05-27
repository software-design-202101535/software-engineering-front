import { describe, it, expect } from 'vitest'
import { resolveNotificationLink } from './resolveNotificationLink'
import type { Notification } from '@/types'

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 1,
    type: 'GRADE_UPDATED',
    title: 't',
    message: 'm',
    read: false,
    referenceId: 7,
    referenceType: 'GRADE',
    referenceStudentId: 42,
    referenceStudentName: '홍길동',
    createdAt: '2026-05-26T11:00:00',
    ...overrides,
  }
}

describe('resolveNotificationLink', () => {
  it('교사는 어떤 알림이든 null 반환 (수신자가 아님)', () => {
    expect(resolveNotificationLink(makeNotification(), 'TEACHER')).toBeNull()
  })

  it('ADMIN 같은 미지원 role도 null', () => {
    expect(resolveNotificationLink(makeNotification(), 'ADMIN')).toBeNull()
  })

  it('학생 + GRADE → /student/grades', () => {
    const n = makeNotification({ type: 'GRADE_UPDATED', referenceType: 'GRADE' })
    expect(resolveNotificationLink(n, 'STUDENT')).toBe('/student/grades')
  })

  it('학생 + FEEDBACK → /student/feedback#feedback-{id}', () => {
    const n = makeNotification({
      type: 'FEEDBACK_SHARED',
      referenceType: 'FEEDBACK',
      referenceId: 35,
    })
    expect(resolveNotificationLink(n, 'STUDENT')).toBe('/student/feedback#feedback-35')
  })

  it('학부모 + GRADE → ?childId={referenceStudentId} 동봉', () => {
    const n = makeNotification({ referenceType: 'GRADE', referenceStudentId: 42 })
    expect(resolveNotificationLink(n, 'PARENT')).toBe('/parent/grades?childId=42')
  })

  it('학부모 + FEEDBACK → ?childId 와 #feedback-{id} 모두 포함', () => {
    const n = makeNotification({
      type: 'FEEDBACK_SHARED',
      referenceType: 'FEEDBACK',
      referenceId: 35,
      referenceStudentId: 42,
    })
    expect(resolveNotificationLink(n, 'PARENT')).toBe('/parent/feedback?childId=42#feedback-35')
  })
})
