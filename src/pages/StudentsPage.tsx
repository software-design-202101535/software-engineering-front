import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { useClassStudents } from '@/features/students'
import type { StudentSummary } from '@/types'

function StudentCard({ student, onClick }: { student: StudentSummary; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-surface-container-lowest rounded-xl p-4 hover:shadow-md hover:border-primary/30 border border-surface-container transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-primary">{student.number}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
            {student.name}
          </p>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {student.number}번
          </p>
        </div>
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary transition-colors">
          chevron_right
        </span>
      </div>
    </button>
  )
}

export function StudentsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: students = [], isLoading } = useClassStudents()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-on-surface-variant text-sm">불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">학생 관리</h1>
        <p className="text-sm text-on-surface-variant mt-1">
          {user?.grade}학년 {user?.classNum}반 · {students.length}명
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {[...students].sort((a, b) => a.number - b.number).map((s) => (
          <StudentCard
            key={s.id}
            student={s}
            onClick={() => navigate(`/students/${s.id}/grades`)}
          />
        ))}
      </div>
    </div>
  )
}
