export type PermissionState = 'default' | 'granted' | 'denied' | 'unsupported'

export function getNotificationPermission(): PermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported'
  return Notification.permission as PermissionState
}
