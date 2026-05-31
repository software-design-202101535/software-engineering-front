interface AnalyticsEmptyProps {
  message?: string
}

// 배치 집계 전이거나 데이터가 없을 때 (에러 아님)
export function AnalyticsEmpty({ message = '집계 준비 중입니다.' }: AnalyticsEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="material-symbols-outlined text-[40px] text-outline-variant mb-2">bar_chart</span>
      <p className="text-sm text-on-surface-variant">{message}</p>
      <p className="text-xs text-on-surface-variant mt-1">데이터는 매일 새벽 집계됩니다.</p>
    </div>
  )
}
