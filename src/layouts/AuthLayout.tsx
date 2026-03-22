import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      <header className="bg-[#f7fafc] sticky top-0 z-50">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div className="text-xl font-bold text-[#283439] tracking-tight font-headline">
            EduManager
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="font-headline text-sm font-medium tracking-tight text-[#455f88] hover:bg-[#e7eff3] px-3 py-1 rounded-lg transition-colors duration-200"
            >
              도움말
            </a>
          </div>
        </div>
        <div className="bg-[#eff4f7] h-[1px] w-full" />
      </header>

      {children}

      <footer className="bg-[#f7fafc]">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 w-full max-w-7xl mx-auto py-8 gap-4">
          <div className="font-headline font-semibold text-[#455f88] text-sm">EduManager</div>
          <p className="text-xs text-[#283439] opacity-70">© 2025 EduManager. 모든 권리 보유.</p>
          <div className="flex gap-6">
            <a href="#" className="text-[#283439] opacity-70 text-xs hover:text-[#455f88] transition-colors">개인정보 처리방침</a>
            <a href="#" className="text-[#283439] opacity-70 text-xs hover:text-[#455f88] transition-colors">이용약관</a>
            <a href="#" className="text-[#283439] opacity-70 text-xs hover:text-[#455f88] transition-colors">고객지원</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
