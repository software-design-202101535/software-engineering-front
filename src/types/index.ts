export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT'

export type SchoolType =
  | 'SUNRIN_HIGH_SCHOOL'
  | 'HANGUK_MIDDLE_SCHOOL'
  | 'SEOUL_HIGH_SCHOOL'
  | 'INCHEON_MIDDLE_SCHOOL'
  | 'BUSAN_HIGH_SCHOOL'

export const SCHOOL_LABEL: Record<SchoolType, string> = {
  SUNRIN_HIGH_SCHOOL: '선린고등학교',
  HANGUK_MIDDLE_SCHOOL: '한국중학교',
  SEOUL_HIGH_SCHOOL: '서울고등학교',
  INCHEON_MIDDLE_SCHOOL: '인천중학교',
  BUSAN_HIGH_SCHOOL: '부산고등학교',
}


export interface User {
  id: number
  email: string
  name: string
  role: UserRole
  phone?: string
  grade?: number              // TEACHER 역할: 담당 학년
  classNum?: number           // TEACHER 역할: 담당 반
  studentId?: number          // STUDENT 역할: 본인 학생 레코드 ID
  childStudentIds?: number[]  // PARENT 역할: 자녀 학생 레코드 ID 목록
}

export type LoginRequest =
  | { role: 'TEACHER' | 'STUDENT'; school: SchoolType; schoolNumber: string; password: string }
  | { role: 'PARENT'; email: string; password: string }

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface TeacherRegisterRequest {
  email: string
  password: string
  name: string
  school: SchoolType
  schoolNumber: string
  grade?: number
  classNum?: number
  termsAgreed: boolean
  privacyAgreed: boolean
}

export interface StudentRegisterRequest {
  email: string
  password: string
  name: string
  school: SchoolType
  schoolNumber: string
  grade?: number
  classNum?: number
  number?: number
  termsAgreed: boolean
  privacyAgreed: boolean
}

export interface ParentRegisterRequest {
  email: string
  password: string
  name: string
  childSchool: SchoolType
  childSchoolNumber: string
  termsAgreed: boolean
  privacyAgreed: boolean
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
