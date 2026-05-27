import type { Notification } from '@/types'
import { NotificationItem } from './NotificationItem'

interface NotificationListProps {
  notifications: Notification[] | undefined
  isLoading: boolean
  error: unknown
  showStudentPrefix: boolean
  onItemClick: (n: Notification) => void
}

export function NotificationList({
  notifications,
  isLoading,
  error,
  showStudentPrefix,
  onItemClick,
}: NotificationListProps) {
  if (isLoading) {
    return <p className="p-8 text-center text-on-surface-variant">불러오는 중...</p>
  }
  if (error) {
    return <p className="p-8 text-center text-error">알림을 불러오지 못했습니다.</p>
  }
  if (!notifications || notifications.length === 0) {
    return <p className="p-8 text-center text-on-surface-variant">받은 알림이 없습니다.</p>
  }

  return (
    <ul className="divide-y divide-surface-container">
      {notifications.map((n) => (
        <li key={n.id}>
          <NotificationItem
            notification={n}
            messagePrefix={showStudentPrefix ? `${n.referenceStudentName} 학생: ` : ''}
            onClick={() => onItemClick(n)}
          />
        </li>
      ))}
    </ul>
  )
}
