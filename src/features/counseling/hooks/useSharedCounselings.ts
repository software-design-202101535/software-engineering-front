import { useQuery } from '@tanstack/react-query'
import { fetchSharedCounselings } from '@/api/counseling'

export interface SharedCounselingFilters {
  year: number
  month: number // 0 = 전체
  name?: string
}

// 다른 교사가 공유한 상담 목록 조회.
// month는 기존 상담 API와 동일하게 0(전체)이면 전송하지 않는다.
export function useSharedCounselings({ year, month, name }: SharedCounselingFilters) {
  const trimmedName = name?.trim() ?? ''
  return useQuery({
    queryKey: ['counselings', 'shared', year, month, trimmedName],
    queryFn: () =>
      fetchSharedCounselings({
        year,
        ...(month > 0 ? { month } : {}),
        ...(trimmedName ? { name: trimmedName } : {}),
      }),
  })
}
