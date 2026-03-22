import type { Grade } from '@/types'

const scoreToGrade = (score: number): Grade['grade'] => {
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  if (score >= 60) return 'D'
  return 'F'
}

const makeGrade = (
  id: number,
  studentId: number,
  subject: string,
  score: number,
  year = 2026,
  semester = '1학기',
): Grade => ({
  id,
  studentId,
  subject,
  score,
  grade: scoreToGrade(score),
  semester,
  year,
  teacherId: 1,
  createdAt: '2026-03-15T09:00:00',
  updatedAt: '2026-03-15T09:00:00',
})

export const mockGrades: Grade[] = [
  // 김민준 (id: 1)
  makeGrade(1, 1, '국어', 88),
  makeGrade(2, 1, '수학', 92),
  makeGrade(3, 1, '영어', 85),
  makeGrade(4, 1, '과학', 78),
  makeGrade(5, 1, '사회', 90),
  makeGrade(6, 1, '역사', 83),

  // 이서연 (id: 2)
  makeGrade(7, 2, '국어', 95),
  makeGrade(8, 2, '수학', 88),
  makeGrade(9, 2, '영어', 91),
  makeGrade(10, 2, '과학', 86),
  makeGrade(11, 2, '사회', 93),
  makeGrade(12, 2, '역사', 89),

  // 박지호 (id: 3)
  makeGrade(13, 3, '국어', 72),
  makeGrade(14, 3, '수학', 65),
  makeGrade(15, 3, '영어', 70),
  makeGrade(16, 3, '과학', 68),
  makeGrade(17, 3, '사회', 75),
  makeGrade(18, 3, '역사', 71),

  // 최아영 (id: 4)
  makeGrade(19, 4, '국어', 80),
  makeGrade(20, 4, '수학', 76),
  makeGrade(21, 4, '영어', 83),
  makeGrade(22, 4, '과학', 79),
  makeGrade(23, 4, '사회', 82),
  makeGrade(24, 4, '역사', 77),

  // 정도윤 (id: 5)
  makeGrade(25, 5, '국어', 55),
  makeGrade(26, 5, '수학', 48),
  makeGrade(27, 5, '영어', 62),
  makeGrade(28, 5, '과학', 58),
  makeGrade(29, 5, '사회', 60),
  makeGrade(30, 5, '역사', 53),

  // 강수빈 (id: 6)
  makeGrade(31, 6, '국어', 91),
  makeGrade(32, 6, '수학', 94),
  makeGrade(33, 6, '영어', 89),
  makeGrade(34, 6, '과학', 96),
  makeGrade(35, 6, '사회', 88),
  makeGrade(36, 6, '역사', 92),

  // 조현우 (id: 7)
  makeGrade(37, 7, '국어', 74),
  makeGrade(38, 7, '수학', 81),
  makeGrade(39, 7, '영어', 77),
  makeGrade(40, 7, '과학', 83),
  makeGrade(41, 7, '사회', 79),
  makeGrade(42, 7, '역사', 76),

  // 윤채원 (id: 8)
  makeGrade(43, 8, '국어', 86),
  makeGrade(44, 8, '수학', 79),
  makeGrade(45, 8, '영어', 88),
  makeGrade(46, 8, '과학', 82),
  makeGrade(47, 8, '사회', 85),
  makeGrade(48, 8, '역사', 80),
]
