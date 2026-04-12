import { useFeedbackPage, FeedbackModal } from '@/features/feedback'
import { CATEGORY_FILTERS, CATEGORY_BADGE, CATEGORY_LABEL } from '@/features/feedback/constants'

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
    <div className="p-6 max-w-3xl">
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
          {feedbacks.map((fb) => {
            const mine = isOwner(fb.teacherId)

            if (deleteState.type === 'confirming' && deleteState.id === fb.id) {
              return (
                <div
                  key={fb.id}
                  className="bg-error/5 border border-error/20 rounded-xl px-5 py-4 flex items-center justify-between gap-4"
                >
                  <p className="text-sm text-on-surface">이 피드백을 삭제할까요?</p>
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
              <div
                key={fb.id}
                className="bg-surface-container-lowest border border-surface-container rounded-xl px-5 py-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* 카테고리 뱃지 */}
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${CATEGORY_BADGE[fb.category]}`}
                    >
                      {CATEGORY_LABEL[fb.category]}
                    </span>

                    {/* 날짜 */}
                    <span className="text-xs text-on-surface-variant">{fb.date}</span>

                    {/* 공개 뱃지 (본인: 클릭 토글 / 타인: 정적) */}
                    {mine ? (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleVisibility(fb.id, !fb.studentVisible, fb.parentVisible)
                          }
                          className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${
                            fb.studentVisible
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          {fb.studentVisible ? '학생공개' : '학생비공개'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleToggleVisibility(fb.id, fb.studentVisible, !fb.parentVisible)
                          }
                          className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${
                            fb.parentVisible
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          }`}
                        >
                          {fb.parentVisible ? '학부모공개' : '학부모비공개'}
                        </button>
                      </>
                    ) : (
                      <>
                        {fb.studentVisible && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            학생공개
                          </span>
                        )}
                        {fb.parentVisible && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-700">
                            학부모공개
                          </span>
                        )}
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* 타인 작성: 교사 이름 */}
                    {!mine && (
                      <span className="text-xs text-on-surface-variant mr-1">
                        {fb.teacherName}
                      </span>
                    )}
                    {/* 본인 작성: 수정/삭제 */}
                    {mine && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(fb.id)}
                          className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartDelete(fb.id)}
                          className="p-1 text-on-surface-variant hover:text-error transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-sm text-on-surface whitespace-pre-wrap">{fb.content}</p>
              </div>
            )
          })}
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
