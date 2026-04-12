import { CATEGORY_BADGE, CATEGORY_LABEL } from '../constants'
import type { Feedback, DeleteState } from '@/types'

interface VisibilityBadgesProps {
  feedback: Feedback
  onToggleVisibility: (id: number, studentVisible: boolean, parentVisible: boolean) => void
}

function VisibilityBadges({ feedback: fb, onToggleVisibility }: VisibilityBadgesProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => onToggleVisibility(fb.id, !fb.studentVisible, fb.parentVisible)}
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
        onClick={() => onToggleVisibility(fb.id, fb.studentVisible, !fb.parentVisible)}
        className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${
          fb.parentVisible
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
        }`}
      >
        {fb.parentVisible ? '학부모공개' : '학부모비공개'}
      </button>
    </>
  )
}

interface FeedbackCardProps {
  feedback: Feedback
  isMine: boolean
  deleteState: DeleteState
  isMutating: boolean
  onEdit: (id: number) => void
  onStartDelete: (id: number) => void
  onCancelDelete: () => void
  onConfirmDelete: () => void
  onToggleVisibility: (id: number, studentVisible: boolean, parentVisible: boolean) => void
}

export function FeedbackCard({
  feedback: fb,
  isMine,
  deleteState,
  isMutating,
  onEdit,
  onStartDelete,
  onCancelDelete,
  onConfirmDelete,
  onToggleVisibility,
}: FeedbackCardProps) {
  if (deleteState.type === 'confirming' && deleteState.id === fb.id) {
    return (
      <div className="bg-error/5 border border-error/20 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
        <p className="text-sm text-on-surface">이 피드백을 삭제할까요?</p>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onCancelDelete}
            className="px-3 py-1.5 text-xs text-on-surface-variant border border-outline-variant rounded-lg hover:bg-surface-container transition-colors"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
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
    <div className="bg-surface-container-lowest border border-surface-container rounded-xl px-5 py-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${CATEGORY_BADGE[fb.category]}`}
          >
            {CATEGORY_LABEL[fb.category]}
          </span>
          <span className="text-xs text-on-surface-variant">{fb.date}</span>

          {isMine ? (
            <VisibilityBadges feedback={fb} onToggleVisibility={onToggleVisibility} />
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
          {!isMine && (
            <span className="text-xs text-on-surface-variant mr-1">{fb.teacherName}</span>
          )}
          {isMine && (
            <>
              <button
                type="button"
                onClick={() => onEdit(fb.id)}
                className="p-1 text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button
                type="button"
                onClick={() => onStartDelete(fb.id)}
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
}
