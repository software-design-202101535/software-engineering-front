import { useNotesPage } from '@/features/records'
import { NoteModal } from '@/features/records'
import type { NoteCategory } from '@/types'

const CATEGORY_FILTERS: Array<{ value: NoteCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: '전체' },
  { value: 'ACHIEVEMENT', label: '성취' },
  { value: 'SPECIAL', label: '특기' },
  { value: 'VOLUNTEER', label: '봉사' },
  { value: 'CAREER', label: '진로' },
  { value: 'OTHER', label: '기타' },
]

const CATEGORY_BADGE: Record<NoteCategory, string> = {
  ACHIEVEMENT: 'bg-blue-100 text-blue-700',
  SPECIAL: 'bg-purple-100 text-purple-700',
  VOLUNTEER: 'bg-green-100 text-green-700',
  CAREER: 'bg-orange-100 text-orange-700',
  OTHER: 'bg-surface-container text-on-surface-variant',
}

const CATEGORY_LABEL: Record<NoteCategory, string> = {
  ACHIEVEMENT: '성취',
  SPECIAL: '특기',
  VOLUNTEER: '봉사',
  CAREER: '진로',
  OTHER: '기타',
}

export function RecordsTabPage() {
  const {
    notes,
    isLoading,
    categoryFilter,
    setCategoryFilter,
    modalMode,
    deleteState,
    form,
    isMutating,
    handleOpenAdd,
    handleOpenEdit,
    handleCloseModal,
    handleModalSave,
    handleFormChange,
    handleStartDelete,
    handleCancelDelete,
    handleConfirmDelete,
  } = useNotesPage()

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* 카테고리 필터 + 추가 버튼 */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1 bg-surface-container rounded-lg p-0.5">
          {CATEGORY_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategoryFilter(value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                categoryFilter === value
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="ml-auto flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          항목 추가
        </button>
      </div>

      {/* 카드 리스트 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <span className="text-on-surface-variant text-sm">불러오는 중...</span>
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">description</span>
          <p className="text-sm text-on-surface-variant">등록된 특기사항이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notes.map((note) => {
            if (deleteState.type === 'confirming' && deleteState.id === note.id) {
              return (
                <div key={note.id} className="bg-error/5 border border-error/20 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                  <p className="text-sm text-on-surface">이 항목을 삭제할까요?</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCancelDelete}
                      className="px-3 py-1.5 text-xs text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
                    >
                      취소
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmDelete}
                      disabled={isMutating}
                      className="px-3 py-1.5 text-xs text-on-error bg-error rounded-lg hover:bg-error/80 transition-colors disabled:opacity-50"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              )
            }

            return (
              <div key={note.id} className="bg-surface-container-lowest border border-surface-container rounded-xl px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${CATEGORY_BADGE[note.category]}`}>
                      {CATEGORY_LABEL[note.category]}
                    </span>
                    <span className="text-xs text-on-surface-variant">{note.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(note.id)}
                      className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartDelete(note.id)}
                      className="p-1 text-on-surface-variant hover:text-error transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-on-surface whitespace-pre-wrap">{note.content}</p>
              </div>
            )
          })}
        </div>
      )}

      {/* 모달 */}
      {modalMode.type !== 'closed' && (
        <NoteModal
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
