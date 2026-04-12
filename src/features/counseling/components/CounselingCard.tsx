import type { Counseling, DeleteState } from '@/types'

interface CounselingCardProps {
  counseling: Counseling
  isMine: boolean
  deleteState: DeleteState
  isMutating: boolean
  onEdit: (id: number) => void
  onStartDelete: (id: number) => void
  onCancelDelete: () => void
  onConfirmDelete: () => void
  onToggleShare: (id: number, sharedWithTeachers: boolean) => void
}

export function CounselingCard({
  counseling: c,
  isMine,
  deleteState,
  isMutating,
  onEdit,
  onStartDelete,
  onCancelDelete,
  onConfirmDelete,
  onToggleShare,
}: CounselingCardProps) {
  if (deleteState.type === 'confirming' && deleteState.id === c.id) {
    return (
      <div className="bg-error/5 border border-error/20 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
        <p className="text-sm text-on-surface">이 상담 기록을 삭제할까요?</p>
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
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-on-surface">{c.counselingDate}</span>

          {isMine ? (
            <button
              type="button"
              onClick={() => onToggleShare(c.id, !c.sharedWithTeachers)}
              className={`px-2 py-0.5 text-xs font-medium rounded-full transition-colors ${
                c.sharedWithTeachers
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {c.sharedWithTeachers ? '교사공유' : '비공개'}
            </button>
          ) : (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
              교사공유
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!isMine && (
            <span className="text-xs text-on-surface-variant mr-1">{c.teacherName}</span>
          )}
          {isMine && (
            <>
              <button
                type="button"
                onClick={() => onEdit(c.id)}
                className="p-1 text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button
                type="button"
                onClick={() => onStartDelete(c.id)}
                className="p-1 text-on-surface-variant hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      <p className="text-sm text-on-surface whitespace-pre-wrap mb-3">{c.content}</p>

      {c.nextDate && (
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[14px]">event</span>
          <span>다음 상담 예정</span>
          <span className="font-medium text-on-surface">{c.nextDate}</span>
        </div>
      )}
    </div>
  )
}
