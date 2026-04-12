import { useCounselingPage, CounselingModal, CounselingCard } from '@/features/counseling'

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)
const MONTHS = [
  { value: 0, label: '전체' },
  ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}월` })),
]

export function CounselingTabPage() {
  const {
    counselings,
    isLoading,
    year,
    setYear,
    month,
    setMonth,
    search,
    setSearch,
    modalMode,
    deleteState,
    form,
    isMutating,
    isOwner,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    handleFormChange,
    handleModalSave,
    handleStartDelete,
    handleCancelDelete,
    handleConfirmDelete,
    handleToggleShare,
  } = useCounselingPage()

  return (
    <div className="p-6 max-w-3xl">
      {/* 검색 + 필터 + 추가 버튼 */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <span className="material-symbols-outlined text-[18px] text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="상담 내용 검색"
            className="w-full pl-9 pr-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="px-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}년
            </option>
          ))}
        </select>
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="px-3 py-2 text-sm bg-surface-container border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
        >
          {MONTHS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          상담 기록
        </button>
      </div>

      {/* 검색 결과 건수 */}
      {search.trim() && (
        <p className="text-xs text-on-surface-variant mb-3">결과 {counselings.length}건</p>
      )}

      {/* 카드 리스트 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <span className="text-on-surface-variant text-sm">불러오는 중...</span>
        </div>
      ) : counselings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">
            forum
          </span>
          <p className="text-sm text-on-surface-variant">등록된 상담 기록이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {counselings.map((c) => (
            <CounselingCard
              key={c.id}
              counseling={c}
              isMine={isOwner(c.teacherId)}
              deleteState={deleteState}
              isMutating={isMutating}
              onEdit={handleOpenEdit}
              onStartDelete={handleStartDelete}
              onCancelDelete={handleCancelDelete}
              onConfirmDelete={handleConfirmDelete}
              onToggleShare={handleToggleShare}
            />
          ))}
        </div>
      )}

      {/* 모달 */}
      {modalMode.type !== 'closed' && (
        <CounselingModal
          mode={modalMode.type}
          form={form}
          isMutating={isMutating}
          onFormChange={handleFormChange}
          onSave={handleModalSave}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}
