// 백엔드 percentile은 백분위(자기보다 아래에 있는 비율, 높을수록 상위)다.
// 예: rank 3/28 → percentile 89.3. 화면은 "상위 X%"(위에서의 위치)로 보여주므로 보수를 취한다.
// rank 27/30 → percentile 10 → 상위 90%.
export function topPercent(percentile: number): number {
  return Math.round(100 - percentile)
}
