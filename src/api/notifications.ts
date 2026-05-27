import { client } from './client'
import type { Notification } from '@/types'

export async function fetchNotifications(): Promise<Notification[]> {
  const { data } = await client.get<Notification[]>('/api/notifications')
  return data
}

export async function markAsRead(id: number): Promise<void> {
  await client.patch(`/api/notifications/${id}/read`)
}

export async function markAllAsRead(): Promise<void> {
  await client.patch('/api/notifications/read-all')
}
