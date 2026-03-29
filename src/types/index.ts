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


// API spec 기준 enum (백엔드 전송 값)
export type ExamType = 'MIDTERM' | 'FINAL' | 'QUIZ'
export type SubjectCode =
  | 'KOREAN' | 'MATH' | 'ENGLISH' | 'SCIENCE' | 'SOCIAL' | 'HISTORY'
  | 'PHYSICS' | 'CHEMISTRY' | 'BIOLOGY' | 'EARTH_SCIENCE'
  | 'PHYSICAL_EDUCATION' | 'MUSIC' | 'ART' | 'ETHICS'
  | 'TECHNOLOGY' | 'CHINESE_CHARACTERS' | 'SECOND_FOREIGN_LANGUAGE'

// 표시용 한국어 레이블
export const EXAM_TYPE_LABEL: Record<ExamType, string> = {
  MIDTERM: '중간고사',
  FINAL: '기말고사',
  QUIZ: '수시',
}

export const SUBJECT_LABEL: Record<SubjectCode, string> = {
  KOREAN: '국어', MATH: '수학', ENGLISH: '영어',
  SCIENCE: '과학', SOCIAL: '사회', HISTORY: '역사',
  PHYSICS: '물리', CHEMISTRY: '화학', BIOLOGY: '생물', EARTH_SCIENCE: '지구과학',
  PHYSICAL_EDUCATION: '체육', MUSIC: '음악', ART: '미술', ETHICS: '도덕',
  TECHNOLOGY: '기술', CHINESE_CHARACTERS: '한문', SECOND_FOREIGN_LANGUAGE: '제2외국어',
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

export interface StudentSummary {
  id: number
  name: string
  grade: number
  classNum: number
  number: number
}

export interface Student {
  id: number
  name: string
  grade: number
  classNum: number
  number: number
  birthDate: string
  phone?: string
  parentPhone?: string
  address?: string
  userId?: number
}

export interface Grade {
  id: number
  subject: SubjectCode
  score: number | null       // null = 미입력
  grade: 'A' | 'B' | 'C' | 'D' | 'F' | null  // null = score 없을 때
}

export interface BatchGradeRequest {
  semester: string
  examType: ExamType
  create?: Array<{ subject: SubjectCode; score?: number | null }>
  update?: Array<{ id: number; subject: SubjectCode; score?: number | null }>
  delete?: number[]
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
