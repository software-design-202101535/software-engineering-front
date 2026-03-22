import type { Notification } from '@/types'
import { mockNotifications } from '@/mocks'

let localNotifications = [...mockNotifications]

export async function fetchNotifications(userId: number): Promise<Notification[]> {
  await new Promise((r) => setTimeout(r, 200))
  return localNotifications.filter((n) => n.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function markAsRead(id: number): Promise<void> {
  await new Promise((r) => setTimeout(r, 200))
  const notification = localNotifications.find((n) => n.id === id)
  if (notification) notification.isRead = true
}

export async function markAllAsRead(userId: number): Promise<void> {
  await new Promise((r) => setTimeout(r, 200))
  localNotifications.filter((n) => n.userId === userId).forEach((n) => { n.isRead = true })
}
