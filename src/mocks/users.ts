import type { User } from '@/types'

export const mockUsers: User[] = [
  { id: 1, email: 'teacher@edu.com', name: '김선생', role: 'TEACHER', phone: '010-1234-5678', grade: 2, classNum: 3 },
  { id: 2, email: 'student@edu.com', name: '김민준', role: 'STUDENT', phone: '010-1111-2222', studentId: 1 },
  { id: 3, email: 'parent@edu.com', name: '이학부모', role: 'PARENT', phone: '010-3456-7890', childStudentIds: [1] },
  { id: 4, email: 'admin@edu.com', name: '관리자', role: 'ADMIN' },
]

// 로그인 시뮬레이션용 - email로 유저 찾기
export const findUserByEmail = (email: string): User | undefined =>
  mockUsers.find((u) => u.email === email)
