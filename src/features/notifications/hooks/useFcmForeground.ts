import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { subscribeForegroundMessages } from '@/lib/firebase'
import { useAuth } from '@/features/auth'
import type { UserRole } from '@/types'
import { NOTIFICATIONS_QUERY_KEY } from './useNotifications'

const NOTIFICATIONS_PATH: Partial<Record<UserRole, string>> = {
  STUDENT: '/student/notifications',
  PARENT: '/parent/notifications',
}

// 포어그라운드 푸시 수신 시:
//  1) 화면 내 토스트로 알림 표시 (백엔드가 OS 알림을 못 띄우는 시점)
//  2) 알림 목록 캐시 무효화로 헤더 뱃지/리스트 즉시 갱신
export function useFcmForeground(): void {
  const { user, isAuthenticated } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) return
    const notificationsPath = user?.role ? NOTIFICATIONS_PATH[user.role] : undefined

    const unsubscribe = subscribeForegroundMessages((payload) => {
      const notif = payload.notification
      const title = notif?.title ?? '새 알림'
      const description = notif?.body

      toast(title, {
        ...(description ? { description } : {}),
        ...(notificationsPath
          ? { action: { label: '보기', onClick: () => navigate(notificationsPath) } }
          : {}),
      })

      void qc.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    })

    return () => unsubscribe()
  }, [isAuthenticated, qc, navigate, user?.role])
}
