interface PlaceholderTabPageProps {
  tabName: string
}

export function PlaceholderTabPage({ tabName }: PlaceholderTabPageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">construction</span>
      <p className="font-headline text-base font-semibold text-on-surface mb-1">{tabName} 탭</p>
      <p className="text-sm text-on-surface-variant">준비 중입니다.</p>
    </div>
  )
}
