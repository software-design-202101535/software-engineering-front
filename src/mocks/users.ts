import type { User } from '@/types'

export const mockUsers: User[] = [
  { id: 1, email: 'teacher@edu.com', name: '김선생', role: 'TEACHER', phone: '010-1234-5678' },
  { id: 2, email: 'student@edu.com', name: '박학생', role: 'STUDENT', phone: '010-2345-6789' },
  { id: 3, email: 'parent@edu.com', name: '이학부모', role: 'PARENT', phone: '010-3456-7890' },
  { id: 4, email: 'admin@edu.com', name: '관리자', role: 'ADMIN' },
]

// 로그인 시뮬레이션용 - email로 유저 찾기
export const findUserByEmail = (email: string): User | undefined =>
  mockUsers.find((u) => u.email === email)
