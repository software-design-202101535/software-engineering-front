export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'

export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  phone?: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export type LoginRequest =
  | { role: 'TEACHER'; school: string; identifier: string; password: string }
  | { role: 'STUDENT'; school: string; identifier: string; password: string }
  | { role: 'PARENT'; email: string; password: string }

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface Student {
  id: number
  name: string
  grade: number
  classNum: number
  number: number
  gender: 'M' | 'F'
  birthDate: string
  phone?: string
  parentPhone?: string
  address?: string
  userId?: number
}

export interface Grade {
  id: number
  studentId: number
  subject: string
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  semester: string
  year: number
  teacherId: number
  createdAt: string
  updatedAt: string
}

export interface GradeStats {
  average: number
  total: number
  rank?: number
  subjectGrades: Grade[]
}

export type FeedbackCategory = 'ACADEMIC' | 'BEHAVIOR' | 'ATTITUDE' | 'ATTENDANCE' | 'OTHER'

export interface Feedback {
  id: number
  studentId: number
  teacherId: number
  teacherName: string
  category: FeedbackCategory
  content: string
  isShared: boolean
  createdAt: string
  updatedAt: string
}

export interface Counseling {
  id: number
  studentId: number
  teacherId: number
  teacherName: string
  content: string
  nextPlan?: string
  counselingDate: string
  isShared: boolean
  createdAt: string
}

export type NoteCategory = 'ACHIEVEMENT' | 'SPECIAL' | 'VOLUNTEER' | 'CAREER' | 'OTHER'

export interface Note {
  id: number
  studentId: number
  teacherId: number
  category: NoteCategory
  content: string
  date: string
  createdAt: string
}

export interface Attendance {
  id: number
  studentId: number
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EARLY_LEAVE'
  reason?: string
}

export type NotificationType = 'GRADE' | 'FEEDBACK' | 'COUNSELING' | 'SYSTEM'

export interface Notification {
  id: number
  userId: number
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export interface GradeReport {
  student: Student
  grades: Grade[]
  stats: GradeStats
  period: string
}

export interface CounselingReport {
  student: Student
  counselings: Counseling[]
  period: string
}

export interface FeedbackReport {
  student: Student
  feedbacks: Feedback[]
  period: string
}
