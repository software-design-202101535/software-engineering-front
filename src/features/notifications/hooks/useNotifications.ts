import { useQuery } from '@tanstack/react-query'
import { fetchNotifications } from '@/api/notifications'
import { useAuth } from '@/features/auth'

export const NOTIFICATIONS_QUERY_KEY = ['notifications'] as const

export function useNotifications() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: fetchNotifications,
    enabled: isAuthenticated,
  })
}
