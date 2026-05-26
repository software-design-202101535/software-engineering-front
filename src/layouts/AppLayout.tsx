import { useState } from 'react'
import { NavLink, Outlet, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/features/auth'
import { useFcmForeground, useUnreadCount } from '@/features/notifications'
import type { UserRole, ChildSummary } from '@/types'

interface NavItem {
  to: string
  label: string
  icon: string
}

// 교사는 현 명세상 알림 수신자가 아니므로 알림 메뉴를 두지 않는다
const NAV_ITEMS: Partial<Record<UserRole, NavItem[]>> = {
  TEACHER: [
    { to: '/students', label: '학생 관리', icon: 'group' },
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

const NOTIFICATIONS_PATH: Partial<Record<UserRole, string>> = {
  STUDENT: '/student/notifications',
  PARENT: '/parent/notifications',
}

function ChildDropdown({
  children,
  selectedChildId,
  onSelect,
}: {
  children: ChildSummary[]
  selectedChildId: number
  onSelect: (id: number) => void
}) {
  return (
    <div className="px-3 pt-2 pb-3 border-b border-surface-container">
      <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1.5">자녀 선택</p>
      <select
        value={selectedChildId}
        onChange={(e) => onSelect(Number(e.target.value))}
        className="w-full px-3 py-2 text-sm rounded-lg bg-surface-container border border-outline-variant text-on-surface focus:outline-none focus:border-primary"
      >
        {children.map((child) => (
          <option key={child.studentId} value={child.studentId}>{child.name}</option>
        ))}
      </select>
    </div>
  )
}

function NotificationBellButton({ path, unreadCount }: { path: string; unreadCount: number }) {
  const navigate = useNavigate()
  return (
    <button
      type="button"
      onClick={() => navigate(path)}
      className="relative text-on-surface-variant hover:text-primary transition-colors"
      aria-label="알림"
    >
      <span className="material-symbols-outlined">notifications</span>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useFcmForeground()
  const unreadCount = useUnreadCount()

  const children = user?.role === 'PARENT' ? (user?.children ?? []) : []
  const firstChildId = children[0]?.studentId ?? 0
  const childIdFromQuery = Number(searchParams.get('childId'))
  const selectedChildId =
    childIdFromQuery && children.some((c) => c.studentId === childIdFromQuery)
      ? childIdFromQuery
      : firstChildId

  const navItems = (user?.role ? NAV_ITEMS[user.role] : undefined) ?? []
  const notificationsPath = user?.role ? NOTIFICATIONS_PATH[user.role] : undefined

  const handleSelectChild = (id: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('childId', String(id))
      return next
    })
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleNavClick = () => {
    if (window.innerWidth < 768) setIsSidebarOpen(false)
  }

  const sidebarClass = [
    'fixed inset-y-0 left-0 z-40 w-60 bg-surface-container-low flex flex-col transition-all duration-200 shrink-0',
    isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
    'md:relative md:inset-auto md:z-auto md:translate-x-0',
    isSidebarOpen ? 'md:w-60' : 'md:w-16',
  ].join(' ')

  return (
    <div className="min-h-screen bg-surface flex">
      {/* 모바일 백드롭 */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClass}>
        {/* Brand */}
        <div className="h-16 flex items-center px-4 gap-3">
          <button
            type="button"
            onClick={() => setIsSidebarOpen((v) => !v)}
            className="hidden md:block text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          {isSidebarOpen && (
            <span className="font-headline font-bold text-primary text-lg tracking-tight">EduManager</span>
          )}
        </div>

        {/* 학부모 자녀 선택 */}
        {user?.role === 'PARENT' && children.length > 1 && isSidebarOpen && (
          <ChildDropdown
            children={children}
            selectedChildId={selectedChildId}
            onSelect={handleSelectChild}
          />
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
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
          <button
            type="button"
            onClick={() => setIsSidebarOpen((v) => !v)}
            className="md:hidden text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-4">
            {notificationsPath && (
              <NotificationBellButton path={notificationsPath} unreadCount={unreadCount} />
            )}
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
