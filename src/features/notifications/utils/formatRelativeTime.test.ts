import { describe, it, expect } from 'vitest'
import { formatRelativeTime } from './formatRelativeTime'

const NOW = new Date('2026-05-26T12:00:00')

function ago(ms: number) {
  return new Date(NOW.getTime() - ms).toISOString()
}

const MIN = 60 * 1000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

describe('formatRelativeTime', () => {
  it('1분 미만은 "방금 전"', () => {
    expect(formatRelativeTime(ago(30 * 1000), NOW)).toBe('방금 전')
  })

  it('1시간 미만은 "N분 전"', () => {
    expect(formatRelativeTime(ago(5 * MIN), NOW)).toBe('5분 전')
  })

  it('1일 미만은 "N시간 전"', () => {
    expect(formatRelativeTime(ago(3 * HOUR), NOW)).toBe('3시간 전')
  })

  it('정확히 1일 전은 "어제"', () => {
    expect(formatRelativeTime(ago(DAY), NOW)).toBe('어제')
  })

  it('1주 미만은 "N일 전"', () => {
    expect(formatRelativeTime(ago(3 * DAY), NOW)).toBe('3일 전')
  })

  it('1주~1달은 "N주 전"', () => {
    expect(formatRelativeTime(ago(10 * DAY), NOW)).toBe('1주 전')
  })

  it('1달 이상은 절대 날짜 YYYY-MM-DD', () => {
    expect(formatRelativeTime('2026-01-15T10:00:00', NOW)).toBe('2026-01-15')
  })
})
