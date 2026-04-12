import { client } from './client'
import type { Notification } from '@/types'

export async function fetchNotifications(userId: number): Promise<Notification[]> {
  const { data } = await client.get<Notification[]>('/api/notifications', { params: { userId } })
  return data
}

export async function markAsRead(id: number): Promise<void> {
  await client.patch(`/api/notifications/${id}/read`)
}

export async function markAllAsRead(userId: number): Promise<void> {
  await client.patch('/api/notifications/read-all', { userId })
}
