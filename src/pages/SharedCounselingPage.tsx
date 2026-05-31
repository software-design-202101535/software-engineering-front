import {
  useSharedCounselingPage,
  ClassGroupNav,
  SharedCounselingList,
} from '@/features/counseling'

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
const MONTHS = [
  { value: 0, label: '전체' },
  ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}월` })),
]

const SELECT_CLASS =
  'px-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-primary'

export function SharedCounselingPage() {
  const {
    year,
    setYear,
    month,
    setMonth,
    search,
    setSearch,
    isLoading,
    groups,
    selectedKey,
    onSelectClass,
    counselings,
  } = useSharedCounselingPage()

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-bold text-on-surface">공유 상담</h1>
        <p className="text-sm text-on-surface-variant mt-1">다른 선생님이 공유한 상담 기록</p>
      </div>

      {/* 검색 + 기간 필터 */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="학생 이름 검색"
            className="w-full pl-9 pr-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={SELECT_CLASS}>
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </select>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={SELECT_CLASS}>
          {MONTHS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <span className="text-on-surface-variant text-sm">불러오는 중...</span>
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">forum</span>
          <p className="text-sm text-on-surface-variant">공유된 상담 기록이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
          <aside className="md:border-r md:border-surface-container md:pr-4">
            <ClassGroupNav groups={groups} selectedKey={selectedKey} onSelect={onSelectClass} />
          </aside>
          <div className="min-w-0">
            <SharedCounselingList counselings={counselings} />
          </div>
        </div>
      )}
    </div>
  )
}
