import { useQuery } from '@tanstack/react-query'
import { fetchStudentRanks } from '@/api/analytics'

export function useStudentRanks(studentId: number, semester: string) {
  return useQuery({
    queryKey: ['analytics', 'ranks', studentId, semester],
    queryFn: () => fetchStudentRanks(studentId, semester),
    enabled: studentId > 0 && !!semester,
  })
}
