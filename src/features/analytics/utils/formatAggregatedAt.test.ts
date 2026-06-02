import { describe, it, expect } from 'vitest'
import { formatAggregatedAt } from './formatAggregatedAt'

describe('formatAggregatedAt', () => {
  it("'YYYY-MM-DDTHH:mm:ss'를 'YYYY-MM-DD HH:mm'으로 자른다", () => {
    expect(formatAggregatedAt('2026-06-01T09:00:00')).toBe('2026-06-01 09:00')
  })

  it('집계 전(null/undefined)이면 null을 반환해 표기를 생략시킨다', () => {
    expect(formatAggregatedAt(null)).toBeNull()
    expect(formatAggregatedAt(undefined)).toBeNull()
    expect(formatAggregatedAt('')).toBeNull()
  })
})
