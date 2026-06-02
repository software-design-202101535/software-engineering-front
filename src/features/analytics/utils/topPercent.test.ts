import { describe, it, expect } from 'vitest'
import { topPercent } from './topPercent'

describe('topPercent', () => {
  it('백분위 percentile을 "상위 X%" 위치로 뒤집는다', () => {
    // rank 27/30 → 백엔드 percentile 10 → 상위 90%
    expect(topPercent(10)).toBe(90)
    // rank 3/28 → 백엔드 percentile 89.3 → 상위 ~11%
    expect(topPercent(89.3)).toBe(11)
  })

  it('상위/하위 극단을 반전한다', () => {
    expect(topPercent(0)).toBe(100)
    expect(topPercent(100)).toBe(0)
  })
})
