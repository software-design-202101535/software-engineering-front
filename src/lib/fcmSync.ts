import { requestFcmToken } from './firebase'
import { registerDeviceToken, unregisterDeviceToken } from '@/api/devices'

export async function syncFcmTokenOnLogin(): Promise<string | null> {
  try {
    const token = await requestFcmToken()
    if (!token) return null
    await registerDeviceToken(token)
    return token
  } catch {
    return null
  }
}

export async function syncFcmTokenOnLogout(token: string | null): Promise<void> {
  if (!token) return
  try {
    await unregisterDeviceToken(token)
  } catch {
    // 로그아웃 흐름은 FCM 해제 실패로 막지 않는다
  }
}
