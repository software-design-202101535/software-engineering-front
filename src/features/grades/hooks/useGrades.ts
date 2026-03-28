import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchGrades, batchGrades } from '@/api/grades'
import { fetchStudents } from '@/api/students'
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['grades', studentId, variables.semester, variables.examType],
      })
    },
  })
}

export function useClassStudents(grade: number, classNum: number) {
  return useQuery({
    queryKey: ['students', grade, classNum],
    queryFn: () => fetchStudents({ grade, classNum }),
    enabled: grade > 0 && classNum > 0,
  })
}
