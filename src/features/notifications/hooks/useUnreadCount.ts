import { useQuery } from '@tanstack/react-query'
import { fetchNotifications } from '@/api/notifications'
import { useAuth } from '@/features/auth'
import { NOTIFICATIONS_QUERY_KEY } from './useNotifications'

export function useUnreadCount(): number {
  const { isAuthenticated } = useAuth()
  const { data } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: fetchNotifications,
    enabled: isAuthenticated,
    select: (notifications) => notifications.filter((n) => !n.read).length,
  })
  return data ?? 0
}
