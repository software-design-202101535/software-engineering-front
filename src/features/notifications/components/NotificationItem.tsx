import type { Notification } from '@/types'
import { formatRelativeTime } from '../utils/formatRelativeTime'

interface NotificationItemProps {
  notification: Notification
  messagePrefix: string
  onClick: () => void
}

export function NotificationItem({ notification, messagePrefix, onClick }: NotificationItemProps) {
  const isUnread = !notification.read

  const titleClass = isUnread
    ? 'font-semibold text-on-surface'
    : 'font-medium text-on-surface-variant'
  const messageClass = isUnread ? 'text-on-surface' : 'text-on-surface-variant'
  const rowClass = isUnread ? 'bg-surface-container-lowest' : 'bg-surface'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-surface-container ${rowClass}`}
    >
      <span
        className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${isUnread ? 'bg-primary' : 'bg-transparent'}`}
        aria-hidden
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className={`text-sm truncate ${titleClass}`}>{notification.title}</h3>
          <time className="text-xs text-on-surface-variant shrink-0">
            {formatRelativeTime(notification.createdAt)}
          </time>
        </div>
        <p className={`text-sm mt-0.5 ${messageClass}`}>
          {messagePrefix}{notification.message}
        </p>
      </div>
    </button>
  )
}
