import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getMessaging,
  getToken,
  onMessage,
  type Messaging,
  type MessagePayload,
} from 'firebase/messaging'

type FirebaseClientConfig = {
  apiKey: string
  authDomain: string
  projectId: string
  messagingSenderId: string
  appId: string
}

const VAPID_KEY: string | undefined = import.meta.env.VITE_FIREBASE_VAPID_KEY

function readClientConfig(): FirebaseClientConfig | null {
  const env = import.meta.env
  const cfg: FirebaseClientConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY ?? '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: env.VITE_FIREBASE_PROJECT_ID ?? '',
    messagingSenderId: env.VITE_FIREBASE_SENDER_ID ?? '',
    appId: env.VITE_FIREBASE_APP_ID ?? '',
  }
  return Object.values(cfg).every(Boolean) ? cfg : null
}

let app: FirebaseApp | null = null
let messaging: Messaging | null = null

function ensureMessaging(): Messaging | null {
  if (messaging) return messaging
  const cfg = readClientConfig()
  if (!cfg || !VAPID_KEY) return null
  app = initializeApp(cfg)
  messaging = getMessaging(app)
  return messaging
}

// SW에 env 값을 직접 박지 않기 위해 등록 시 쿼리로 전달
function buildSwUrl(cfg: FirebaseClientConfig): string {
  const params = new URLSearchParams(cfg as unknown as Record<string, string>)
  return `/firebase-messaging-sw.js?${params.toString()}`
}

export function isFcmConfigured(): boolean {
  return readClientConfig() !== null && Boolean(VAPID_KEY)
}

export async function requestFcmToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  if (!('Notification' in window) || !('serviceWorker' in navigator)) return null

  const cfg = readClientConfig()
  const m = ensureMessaging()
  if (!cfg || !m || !VAPID_KEY) return null

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const swReg = await navigator.serviceWorker.register(buildSwUrl(cfg))
  const token = await getToken(m, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: swReg,
  })
  return token || null
}

export function subscribeForegroundMessages(
  handler: (payload: MessagePayload) => void,
): () => void {
  const m = ensureMessaging()
  if (!m) return () => {}
  return onMessage(m, handler)
}
