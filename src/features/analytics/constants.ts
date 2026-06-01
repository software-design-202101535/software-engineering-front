import type { GradeLevel } from '@/types'

export const GRADE_LEVELS: GradeLevel[] = ['A', 'B', 'C', 'D', 'F']

// RadarChart와 동일 팔레트 (등급 시각화 일관성)
export const GRADE_COLORS: Record<GradeLevel, string> = {
  A: '#455f88',
  B: '#5d7a9b',
  C: '#8fa8c2',
  D: '#bfd5ff',
  F: '#fe8983',
}

export const BAR_COLOR = '#455f88'
export const BAR_COLOR_SELECTED = '#2d4263'
