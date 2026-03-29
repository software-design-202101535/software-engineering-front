import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchGrades, batchGrades } from '@/api/grades'
import type { ExamType, BatchGradeRequest } from '@/types'

export function useGrades(
  studentId: number,
  params: { semester: string; examType: ExamType },
) {
  return useQuery({
    queryKey: ['grades', studentId, params.semester, params.examType],
    queryFn: () => fetchGrades(studentId, params),
    enabled: studentId > 0 && !!params.semester && !!params.examType,
  })
}

export function useBatchGrades(studentId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: BatchGradeRequest) => batchGrades(studentId, req),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['grades', studentId],
      })
    },
  })
}

