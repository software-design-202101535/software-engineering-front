// 집계 시각(updatedAt) 표시용 포맷. 'YYYY-MM-DDTHH:mm:ss' → 'YYYY-MM-DD HH:mm'.
// 집계 전이면 백엔드가 null을 주므로 null을 반환해 호출부가 표기를 생략하게 한다.
export function formatAggregatedAt(updatedAt: string | null | undefined): string | null {
  if (!updatedAt) return null
  return updatedAt.slice(0, 16).replace('T', ' ')
}
