export function IosInstallBanner() {
  return (
    <div className="mb-4 px-4 py-3 rounded-lg bg-surface-container-low border border-outline-variant">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-primary">ios_share</span>
        <div className="flex-1 text-sm">
          <p className="font-semibold text-on-surface">
            iPhone/iPad에서는 PWA 설치가 필요합니다.
          </p>
          <p className="mt-0.5 text-on-surface-variant">
            Safari 하단의 공유 버튼 → "홈 화면에 추가"로 EduManager를 설치하면 푸시 알림을 받을 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}
