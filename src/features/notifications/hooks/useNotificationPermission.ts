import { useEffect, useState } from 'react'
import { getNotificationPermission, type PermissionState } from '@/lib/notificationPermission'

// 사용자가 브라우저 설정에서 권한을 바꾸고 돌아오면 자동 반영하도록
// visibility/focus 이벤트마다 재확인한다.
export function useNotificationPermission(): PermissionState {
  const [permission, setPermission] = useState<PermissionState>(getNotificationPermission)

  useEffect(() => {
    const refresh = () => setPermission(getNotificationPermission())
    document.addEventListener('visibilitychange', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      document.removeEventListener('visibilitychange', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  return permission
}
