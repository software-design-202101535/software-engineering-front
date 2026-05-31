import { useMemo, useState } from 'react'
import { useSharedCounselings } from './useSharedCounselings'
import { groupCounselingsByClass } from '../utils/groupCounselingsByClass'

// 공유 상담 페이지의 화면 상태(연도/월/검색/선택 반)를 모은다.
// 이름 검색은 기존 상담 페이지와 동일하게 클라이언트에서 필터한다.
export function useSharedCounselingPage() {
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState<number>(currentYear)
  const [month, setMonth] = useState<number>(0) // 0 = 전체
  const [search, setSearch] = useState('')
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const { data = [], isLoading } = useSharedCounselings({ year, month })

  const filtered = useMemo(() => {
    const q = search.trim()
    return q ? data.filter((c) => c.studentName.includes(q)) : data
  }, [data, search])

  const groups = useMemo(() => groupCounselingsByClass(filtered), [filtered])

  // 선택했던 반이 필터로 사라지면 첫 번째 반으로 자동 선택 (effect 없이 파생값으로 처리)
  const activeKey =
    selectedKey && groups.some((g) => g.key === selectedKey)
      ? selectedKey
      : (groups[0]?.key ?? null)

  const activeGroup = groups.find((g) => g.key === activeKey) ?? null

  return {
    year,
    setYear,
    month,
    setMonth,
    search,
    setSearch,
    isLoading,
    groups,
    selectedKey: activeKey,
    onSelectClass: setSelectedKey,
    counselings: activeGroup?.counselings ?? [],
  }
}
