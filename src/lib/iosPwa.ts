type IosNavigator = Navigator & { standalone?: boolean }

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) return true
  // iPadOS 13+는 데스크톱 macintosh로 보고됨 → maxTouchPoints로 구분
  return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
}

export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false
  const nav = navigator as IosNavigator
  if (nav.standalone) return true
  return window.matchMedia?.('(display-mode: standalone)').matches ?? false
}

// iOS Safari에서는 PWA로 설치된 상태(16.4+)에서만 Web Push가 동작한다.
// 일반 Safari 탭이라면 사용자에게 설치를 안내해야 한다.
export function shouldShowIosInstallHint(): boolean {
  return isIosDevice() && !isStandalonePwa()
}
