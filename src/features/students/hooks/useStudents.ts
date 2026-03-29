import { useQuery } from '@tanstack/react-query'
import { fetchStudents } from '@/api/students'

export function useClassStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => fetchStudents(),
  })
}
