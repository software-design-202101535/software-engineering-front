import { client } from './client'

export async function registerDeviceToken(token: string): Promise<void> {
  await client.post('/api/devices/tokens', { token })
}

export async function unregisterDeviceToken(token: string): Promise<void> {
  await client.delete(`/api/devices/tokens/${encodeURIComponent(token)}`)
}
