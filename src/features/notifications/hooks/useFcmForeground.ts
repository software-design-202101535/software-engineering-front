import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { subscribeForegroundMessages } from '@/lib/firebase'
import { useAuth } from '@/features/auth'
import { NOTIFICATIONS_QUERY_KEY } from './useNotifications'

// 포어그라운드 푸시 수신 시 알림 목록 캐시를 무효화한다.
// (백엔드는 푸시 발송과 동시에 DB insert를 보장하므로 invalidate만으로 충분)
export function useFcmForeground(): void {
  const { isAuthenticated } = useAuth()
  const qc = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated) return
    const unsubscribe = subscribeForegroundMessages(() => {
      void qc.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY })
    })
    return () => unsubscribe()
  }, [isAuthenticated, qc])
}
