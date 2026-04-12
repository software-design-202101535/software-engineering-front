import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useQueries } from '@tanstack/react-query'
import { useAuth } from '@/features/auth'
import { fetchStudent } from '@/api/students'
import type { UserRole } from '@/types'

interface NavItem {
  to: string
  label: string
  icon: string
}

const NAV_ITEMS: Partial<Record<UserRole, NavItem[]>> = {
  TEACHER: [
    { to: '/students', label: '학생 관리', icon: 'group' },
    { to: '/notifications', label: '알림', icon: 'notifications' },
  ],
  STUDENT: [
    { to: '/student/grades', label: '성적', icon: 'grade' },
    { to: '/student/records', label: '학생부', icon: 'description' },
    { to: '/student/feedback', label: '피드백', icon: 'feedback' },
    { to: '/student/notifications', label: '알림', icon: 'notifications' },
  ],
  PARENT: [
    { to: '/parent/grades', label: '성적', icon: 'grade' },
    { to: '/parent/records', label: '학생부', icon: 'description' },
    { to: '/parent/feedback', label: '피드백', icon: 'feedback' },
    { to: '/parent/notifications', label: '알림', icon: 'notifications' },
  ],
}

function ChildDropdown({
  childIds,
  selectedChildId,
  onSelect,
}: {
  childIds: number[]
  selectedChildId: number
  onSelect: (id: number) => void
}) {
  const results = useQueries({
    queries: childIds.map((id) => ({
      queryKey: ['student', id],
      queryFn: () => fetchStudent(id),
    })),
  })
  const names = results.map((r, i) => r.data?.name ?? `자녀 ${childIds[i]}`)

  return (
    <div className="px-3 pt-2 pb-3 border-b border-surface-container">
      <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">자녀 선택</p>
      <select
        value={selectedChildId}
        onChange={(e) => onSelect(Number(e.target.value))}
        className="w-full px-3 py-2 text-sm rounded-lg bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:border-primary"
      >
        {childIds.map((id, i) => (
          <option key={id} value={id}>{names[i]}</option>
        ))}
      </select>
    </div>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const childIds = user?.role === 'PARENT' ? (user?.childStudentIds ?? []) : []
  const [selectedChildId, setSelectedChildId] = useState<number>(childIds[0] ?? 0)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = (user?.role ? NAV_ITEMS[user.role] : undefined) ?? []

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <aside
        className={`${isSidebarOpen ? 'w-60' : 'w-16'} bg-surface-container-low flex flex-col transition-all duration-200 shrink-0`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-4 gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen((v) => !v)}
            className="text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          {isSidebarOpen && (
            <span className="font-headline font-bold text-primary text-lg tracking-tight">EduManager</span>
          )}
        </div>

        {/* 학부모 자녀 선택 */}
        {user?.role === 'PARENT' && childIds.length > 1 && isSidebarOpen && (
          <ChildDropdown
            childIds={childIds}
            selectedChildId={selectedChildId}
            onSelect={setSelectedChildId}
          />
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-on-primary'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className={`p-4 border-t border-surface-container ${isSidebarOpen ? '' : 'flex justify-center'}`}>
          {isSidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold shrink-0">
                {user?.name?.[0] ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">{user?.name}</p>
                <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="text-on-surface-variant hover:text-error transition-colors"
                title="로그아웃"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="text-on-surface-variant hover:text-error transition-colors"
              title="로그아웃"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-surface-container-lowest border-b border-surface-container px-6 flex items-center justify-between shrink-0">
          <div />
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
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-sm font-bold">
              {user?.name?.[0] ?? '?'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-surface">
          <Outlet context={{ selectedChildId }} />
        </main>
      </div>
    </div>
  )
}
