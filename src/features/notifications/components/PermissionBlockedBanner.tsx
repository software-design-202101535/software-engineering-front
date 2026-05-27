export function PermissionBlockedBanner() {
  return (
    <div className="mb-4 px-4 py-3 rounded-lg bg-error-container/30 border border-error/40 text-on-surface">
      <div className="flex items-start gap-3">
        <span className="material-symbols-outlined text-error">notifications_off</span>
        <div className="flex-1 text-sm">
          <p className="font-semibold">브라우저 알림이 차단되어 있습니다.</p>
          <p className="mt-0.5 text-on-surface-variant">
            새 알림 실시간 푸시를 받으려면 주소창 옆 자물쇠 아이콘 → 알림 권한을 허용으로 바꿔주세요.
          </p>
        </div>
      </div>
    </div>
  )
}
