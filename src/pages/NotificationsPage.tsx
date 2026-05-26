import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import {
  useNotifications,
  useMarkRead,
  useMarkAllRead,
  useNotificationPermission,
  NotificationList,
  PermissionBlockedBanner,
  resolveNotificationLink,
} from '@/features/notifications'
import type { Notification } from '@/types'

export function NotificationsPage() {
  const { user } = useAuth()
  const { data, isLoading, error } = useNotifications()
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const navigate = useNavigate()

  const permission = useNotificationPermission()
  const role = user?.role
  const showStudentPrefix = role === 'PARENT'
  const unreadCount = data?.filter((n) => !n.read).length ?? 0

  const handleItemClick = (n: Notification) => {
    if (!n.read) markRead.mutate(n.id)
    if (!role) return
    const link = resolveNotificationLink(n, role)
    if (link) navigate(link)
  }

  const handleMarkAll = () => {
    if (unreadCount === 0) return
    markAllRead.mutate()
  }

  return (
    <div className="max-w-2xl mx-auto">
      {permission === 'denied' && <PermissionBlockedBanner />}
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-on-surface">알림</h1>
        <button
          type="button"
          onClick={handleMarkAll}
          disabled={unreadCount === 0}
          className="text-sm text-primary disabled:text-on-surface-variant disabled:cursor-not-allowed"
        >
          모두 읽음
        </button>
      </header>
      <div className="bg-surface-container-lowest rounded-lg overflow-hidden border border-surface-container">
        <NotificationList
          notifications={data}
          isLoading={isLoading}
          error={error}
          showStudentPrefix={showStudentPrefix}
          onItemClick={handleItemClick}
        />
      </div>
    </div>
  )
}
