import type { ClassGroup } from '../utils/groupCounselingsByClass'

interface ClassGroupNavProps {
  groups: ClassGroup[]
  selectedKey: string | null
  onSelect: (key: string) => void
}

// 좌측 학년/반 네비. 학년 헤더 아래 반 목록을 보여주고, 선택된 반을 강조한다.
export function ClassGroupNav({ groups, selectedKey, onSelect }: ClassGroupNavProps) {
  const grades = [...new Set(groups.map((g) => g.grade))]

  return (
    <nav className="flex flex-col gap-4">
      {grades.map((grade) => (
        <div key={grade}>
          <p className="px-2 mb-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            {grade}학년
          </p>
          <ul className="flex flex-col gap-0.5">
            {groups
              .filter((g) => g.grade === grade)
              .map((g) => {
                const isSelected = g.key === selectedKey
                return (
                  <li key={g.key}>
                    <button
                      type="button"
                      onClick={() => onSelect(g.key)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isSelected
                          ? 'bg-primary text-on-primary'
                          : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                      }`}
                    >
                      <span>{g.classNum}반</span>
                      <span className={`text-xs ${isSelected ? 'text-on-primary/80' : 'text-on-surface-variant'}`}>
                        {g.counselings.length}
                      </span>
                    </button>
                  </li>
                )
              })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
