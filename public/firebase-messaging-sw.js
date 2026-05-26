importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

// firebase config는 SW URL 쿼리로 전달받는다 (src/lib/firebase.ts: buildSwUrl)
const params = new URLSearchParams(self.location.search)
const config = {
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain'),
  projectId: params.get('projectId'),
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
}

if (Object.values(config).every(Boolean)) {
  firebase.initializeApp(config)
  firebase.messaging()
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const data = event.notification?.data ?? {}
  const url =
    (data.FCM_MSG && data.FCM_MSG.data && data.FCM_MSG.data.url) ||
    data.url ||
    '/notifications'
  event.waitUntil(clients.openWindow(url))
})
