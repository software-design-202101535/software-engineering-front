import { useQuery } from '@tanstack/react-query'
import { fetchClassSummary } from '@/api/analytics'
import type { ClassSummaryParams } from '@/types'

export function useClassSummary(params: ClassSummaryParams) {
  return useQuery({
    queryKey: [
      'analytics',
      'class-summary',
      params.school,
      params.grade,
      params.classNum ?? null,
      params.semester,
      params.subject ?? null,
    ],
    queryFn: () => fetchClassSummary(params),
    enabled: !!params.school && params.grade > 0 && !!params.semester,
  })
}
