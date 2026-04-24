import { useFeedbackPage, FeedbackModal, FeedbackCard } from '@/features/feedback'
import { CATEGORY_FILTERS } from '@/features/feedback/constants'

export function FeedbackTabPage() {
  const {
    feedbacks,
    isLoading,
    categoryFilter,
    setCategoryFilter,
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
    handleToggleVisibility,
  } = useFeedbackPage()

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* 카테고리 필터 + 작성 버튼 */}
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
          피드백 작성
        </button>
      </div>

      {/* 카드 리스트 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <span className="text-on-surface-variant text-sm">불러오는 중...</span>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <span className="material-symbols-outlined text-[48px] text-outline-variant mb-4">
            feedback
          </span>
          <p className="text-sm text-on-surface-variant">등록된 피드백이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {feedbacks.map((fb) => (
            <FeedbackCard
              key={fb.id}
              feedback={fb}
              isMine={isOwner(fb.teacherId)}
              deleteState={deleteState}
              isMutating={isMutating}
              onEdit={handleOpenEdit}
              onStartDelete={handleStartDelete}
              onCancelDelete={handleCancelDelete}
              onConfirmDelete={handleConfirmDelete}
              onToggleVisibility={handleToggleVisibility}
            />
          ))}
        </div>
      )}

      {/* 모달 */}
      {modalMode.type !== 'closed' && (
        <FeedbackModal
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
