import { useNavigate, useParams, NavLink, Outlet } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { fetchStudent } from '@/api/students'

const TABS = [
  { path: 'info', label: '기본정보' },
  { path: 'grades', label: '성적' },
  { path: 'attendance', label: '출결' },
  { path: 'records', label: '학생부' },
  { path: 'feedback', label: '피드백' },
  { path: 'counseling', label: '상담' },
]

export function StudentDetailLayout() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const { data: student, isLoading } = useQuery({
    queryKey: ['student', Number(studentId)],
    queryFn: () => fetchStudent(Number(studentId)),
    enabled: !!studentId,
  })

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 h-16 bg-surface-container-lowest border-b border-surface-container px-6 flex items-center justify-between shrink-0">
        <span className="font-headline font-bold text-primary text-lg tracking-tight">EduManager</span>
        <div className="flex items-center gap-4">
          <button className="relative text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              2
            </span>
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-colors">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold"
            title="로그아웃"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      </header>

      {/* 학생 정보 바 */}
      <div className="bg-surface-container-lowest border-b border-surface-container px-6 py-3 flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/students')}
          className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          학생 목록
        </button>
        <span className="text-outline-variant">·</span>
        {isLoading ? (
          <span className="text-sm text-on-surface-variant">로딩 중...</span>
        ) : student ? (
          <span className="text-sm font-semibold text-on-surface">
            {student.name}
            <span className="ml-2 font-normal text-on-surface-variant">
              {student.grade}학년 {student.classNum}반 {student.number}번
            </span>
          </span>
        ) : null}
      </div>

      {/* 탭 바 */}
      <div className="bg-surface-container-lowest border-b border-surface-container px-6 flex gap-0">
        {TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={`/students/${studentId}/${tab.path}`}
            className={({ isActive }) =>
              `px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                isActive
                  ? 'border-primary text-primary'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`
            }
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      {/* 탭 콘텐츠 */}
      <main className="flex-1 overflow-y-auto bg-surface">
        <Outlet />
      </main>
    </div>
  )
}
